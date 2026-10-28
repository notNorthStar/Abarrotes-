import bcrypt from 'bcryptjs'
import request from 'supertest'
import { beforeAll, describe, expect, it } from 'vitest'
import { app } from '../../app'
import { prisma } from '../../lib/prisma'
import { tokenDe } from '../../test/helpers'

// HU-05 (abrir caja y corte) y HU-09 (pagos a proveedor).
// Cajeros propios (prefijo hu05.) para no chocar con los turnos que abren otras pruebas.

const CAJEROS = ['hu05.turno', 'hu05.diferencia', 'hu05.sincaja', 'hu05.abrir']

describe('caja · HU-05 y HU-09', () => {
  const token: Record<string, string> = {}
  let coca: number // $18.50 por pieza (Centro)

  beforeAll(async () => {
    const centro = await prisma.sucursal.findFirstOrThrow({ where: { nombre: 'Centro' } })
    const passwordHash = await bcrypt.hash('abarrotes123', 10)
    await prisma.usuario.createMany({
      data: CAJEROS.map((usuario) => ({
        nombre: usuario,
        usuario,
        passwordHash,
        rol: 'CAJERO' as const,
        sucursalId: centro.id,
      })),
    })
    for (const u of CAJEROS) token[u] = await tokenDe(u)
    coca = (
      await prisma.producto.findFirstOrThrow({
        where: { sucursalId: centro.id, codigoBarras: '7501000000011' },
      })
    ).id
  })

  const auth = (u: string) => ({ Authorization: `Bearer ${token[u]}` })
  const post = (u: string, ruta: string, body: unknown) =>
    request(app).post(`/api${ruta}`).set(auth(u)).send(body)
  const get = (u: string, ruta: string) => request(app).get(`/api${ruta}`).set(auth(u))

  describe('HU-05 CA1 · abrir caja', () => {
    it('sin caja abierta, /caja/actual devuelve turno null', async () => {
      const res = await get('hu05.abrir', '/caja/actual')
      expect(res.status).toBe(200)
      expect(res.body.turno).toBeNull()
    })

    it('abre la caja con su monto inicial', async () => {
      const res = await post('hu05.abrir', '/caja/abrir', { montoInicial: '300.00' })
      expect(res.status).toBe(201)
      expect(res.body.montoInicial).toBe('300')
      expect(res.body.cerradoEn).toBeNull()
      expect((await get('hu05.abrir', '/caja/actual')).body.turno.id).toBe(res.body.id)
    })

    it('no permite abrir una segunda caja', async () => {
      const res = await post('hu05.abrir', '/caja/abrir', { montoInicial: '100' })
      expect(res.status).toBe(409)
    })

    it.each([['-5'], ['10.555'], ['abc']])(
      'rechaza monto inicial inválido %s',
      async (montoInicial) => {
        const res = await post('hu05.sincaja', '/caja/abrir', { montoInicial })
        expect(res.status).toBe(400)
      },
    )
  })

  describe('sin caja abierta', () => {
    it('no se puede registrar pago a proveedor ni ver el corte', async () => {
      const pago = await post('hu05.sincaja', '/caja/actual/pagos-proveedor', {
        proveedor: 'Bimbo',
        monto: '10',
        metodo: 'EFECTIVO',
      })
      expect(pago.status).toBe(409)
      expect((await get('hu05.sincaja', '/caja/actual/corte')).status).toBe(409)
      expect(
        (await post('hu05.sincaja', '/caja/actual/cerrar', { efectivoContado: '0' })).status,
      ).toBe(409)
    })

    it('no se puede vender (lo exige HU-06)', async () => {
      const res = await post('hu05.sincaja', '/ventas', {
        renglones: [{ productoId: coca, cantidad: '1' }],
        pagos: [{ metodo: 'EFECTIVO', monto: '20' }],
      })
      expect(res.status).toBe(409)
    })
  })

  describe('turno completo: ventas, pagos a proveedor, corte y cierre', () => {
    beforeAll(async () => {
      await post('hu05.turno', '/caja/abrir', { montoInicial: '500.00' })
      // Venta 1: 2 cocas = 37.00, paga 50 en efectivo → cambio 13.00 (efectivo neto 37.00)
      await post('hu05.turno', '/ventas', {
        renglones: [{ productoId: coca, cantidad: '2' }],
        pagos: [{ metodo: 'EFECTIVO', monto: '50.00' }],
      })
      // Venta 2: 1 coca = 18.50 con tarjeta
      await post('hu05.turno', '/ventas', {
        renglones: [{ productoId: coca, cantidad: '1' }],
        pagos: [{ metodo: 'TARJETA', monto: '18.50', referencia: '4321' }],
      })
    })

    it('HU-09 CA1/CA4: registra pago a proveedor en efectivo ligado al turno', async () => {
      const res = await post('hu05.turno', '/caja/actual/pagos-proveedor', {
        proveedor: 'Bimbo',
        monto: '20.00',
        metodo: 'EFECTIVO',
        comentario: 'Pan del día',
      })
      expect(res.status).toBe(201)
      expect(res.body).toMatchObject({ metodo: 'EFECTIVO', monto: '20', comentario: 'Pan del día' })
      expect(res.body.proveedor.nombre).toBe('Bimbo')
    })

    it('HU-09: un proveedor nuevo se registra automáticamente', async () => {
      const res = await post('hu05.turno', '/caja/actual/pagos-proveedor', {
        proveedor: 'HU05 Distribuidora Nueva',
        monto: '100.00',
        metodo: 'TRANSFERENCIA',
      })
      expect(res.status).toBe(201)
      const lista = await get('hu05.turno', '/caja/proveedores')
      expect(lista.body.map((p: { nombre: string }) => p.nombre)).toContain(
        'HU05 Distribuidora Nueva',
      )
    })

    it('HU-09: rechaza tarjeta, monto en cero y proveedor vacío', async () => {
      const base = { proveedor: 'Bimbo', monto: '10', metodo: 'EFECTIVO' }
      expect(
        (await post('hu05.turno', '/caja/actual/pagos-proveedor', { ...base, metodo: 'TARJETA' }))
          .status,
      ).toBe(400)
      expect(
        (await post('hu05.turno', '/caja/actual/pagos-proveedor', { ...base, monto: '0' })).status,
      ).toBe(400)
      expect(
        (await post('hu05.turno', '/caja/actual/pagos-proveedor', { ...base, proveedor: ' ' }))
          .status,
      ).toBe(400)
    })

    it('HU-05 CA2/CA3 · HU-09 CA2/CA3: corte por forma de pago y efectivo esperado', async () => {
      const res = await get('hu05.turno', '/caja/actual/corte')
      expect(res.status).toBe(200)
      expect(res.body).toMatchObject({
        montoInicial: '500.00',
        numeroVentas: 2,
        totalVendido: '55.50',
        ventasPorMetodo: { EFECTIVO: '37.00', TARJETA: '18.50', TRANSFERENCIA: '0.00' },
        pagosProveedor: { EFECTIVO: '20.00', TRANSFERENCIA: '100.00' },
        // 500 + 37 (efectivo neto de cambio) − 20 (proveedor en efectivo); la transferencia no afecta
        efectivoEsperado: '517.00',
      })
      expect(res.body.pagosProveedor.detalle).toHaveLength(2)
    })

    it('HU-05 CA4: cierra sin diferencia y sin comentario', async () => {
      const res = await post('hu05.turno', '/caja/actual/cerrar', { efectivoContado: '517.00' })
      expect(res.status).toBe(200)
      expect(res.body).toMatchObject({
        efectivoEsperado: '517.00',
        efectivoContado: '517.00',
        diferencia: '0.00',
      })
      expect(res.body.cerradoEn).toBeTruthy()
    })

    it('después de cerrar ya no hay caja abierta y no se puede vender', async () => {
      expect((await get('hu05.turno', '/caja/actual')).body.turno).toBeNull()
      const venta = await post('hu05.turno', '/ventas', {
        renglones: [{ productoId: coca, cantidad: '1' }],
        pagos: [{ metodo: 'EFECTIVO', monto: '20' }],
      })
      expect(venta.status).toBe(409)
    })

    it('se puede abrir una caja nueva después de cerrar', async () => {
      expect((await post('hu05.turno', '/caja/abrir', { montoInicial: '0' })).status).toBe(201)
    })
  })

  describe('HU-05 CA4/CA5 · cierre con diferencia', () => {
    beforeAll(async () => {
      await post('hu05.diferencia', '/caja/abrir', { montoInicial: '200.00' })
    })

    it('si hay diferencia, el comentario es obligatorio', async () => {
      const res = await post('hu05.diferencia', '/caja/actual/cerrar', {
        efectivoContado: '193.00',
      })
      expect(res.status).toBe(400)
      expect(res.body.error).toMatch(/comentario/)
    })

    it('registra el faltante con su comentario', async () => {
      const res = await post('hu05.diferencia', '/caja/actual/cerrar', {
        efectivoContado: '193.00',
        comentario: 'Faltan 7 pesos, se revisará con el admin',
      })
      expect(res.status).toBe(200)
      expect(res.body).toMatchObject({ efectivoEsperado: '200.00', diferencia: '-7.00' })
      const turno = await prisma.turnoCaja.findFirstOrThrow({
        where: { usuario: { usuario: 'hu05.diferencia' } },
      })
      expect(turno.diferencia?.toFixed(2)).toBe('-7.00')
      expect(turno.comentario).toMatch(/Faltan 7/)
    })
  })

  describe('actividad del turno (Inicio)', () => {
    it('lista ventas y pagos a proveedor del turno abierto, más recientes primero', async () => {
      await post('hu05.abrir', '/ventas', {
        renglones: [{ productoId: coca, cantidad: '1' }],
        pagos: [{ metodo: 'EFECTIVO', monto: '20.00' }],
      })
      await post('hu05.abrir', '/caja/actual/pagos-proveedor', { proveedor: 'Bimbo', monto: '5.00', metodo: 'EFECTIVO' })
      const res = await get('hu05.abrir', '/caja/actual/actividad')
      expect(res.status).toBe(200)
      expect(res.body.map((a: { tipo: string }) => a.tipo)).toEqual(['PAGO_PROVEEDOR', 'VENTA'])
      expect(res.body[0]).toMatchObject({ titulo: 'Pago a Bimbo', monto: '5.00', metodos: ['EFECTIVO'] })
      expect(res.body[1]).toMatchObject({ monto: '18.50', metodos: ['EFECTIVO'] })
    })

    it('sin caja abierta → 409', async () => {
      expect((await get('hu05.sincaja', '/caja/actual/actividad')).status).toBe(409)
    })
  })

  it('sin sesión → 401', async () => {
    expect((await request(app).get('/api/caja/actual')).status).toBe(401)
  })
})
