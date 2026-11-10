import bcrypt from 'bcryptjs'
import request from 'supertest'
import { beforeAll, describe, expect, it } from 'vitest'
import { app } from '../../app'
import { prisma } from '../../lib/prisma'
import { tokenDe } from '../../test/helpers'

// HU-11 · Operaciones de cajero para el administrador.
// Usuarios propios (prefijo hu11.) para que sus turnos no choquen con los de otras pruebas.

describe('HU-11 · el administrador opera como cajero', () => {
  const token: Record<string, string> = {}
  const id: Record<string, number> = {}
  let centro: number
  let coca: number // $18.50 por pieza (Centro)

  beforeAll(async () => {
    centro = (await prisma.sucursal.findFirstOrThrow({ where: { nombre: 'Centro' } })).id
    const passwordHash = await bcrypt.hash('abarrotes123', 10)
    for (const [usuario, rol] of [
      ['hu11.admin', 'ADMIN'],
      ['hu11.cajero', 'CAJERO'],
    ] as const) {
      id[usuario] = (
        await prisma.usuario.create({ data: { nombre: usuario, usuario, passwordHash, rol, sucursalId: centro } })
      ).id
      token[usuario] = await tokenDe(usuario)
    }
    coca = (await prisma.producto.findFirstOrThrow({ where: { sucursalId: centro, codigoBarras: '7501000000011' } })).id
  })

  const auth = (u: string) => ({ Authorization: `Bearer ${token[u]}` })
  const post = (u: string, ruta: string, body: unknown) => request(app).post(`/api${ruta}`).set(auth(u)).send(body)
  const get = (u: string, ruta: string) => request(app).get(`/api${ruta}`).set(auth(u))

  it('CA2: el administrador abre su propia caja, y solo una', async () => {
    const res = await post('hu11.admin', '/caja/abrir', { montoInicial: '500' })
    expect(res.status).toBe(201)
    expect(res.body).toMatchObject({ usuarioId: id['hu11.admin'], sucursalId: centro, cerradoEn: null })
    expect((await post('hu11.admin', '/caja/abrir', { montoInicial: '100' })).status).toBe(409)
  })

  it('CA2: un cajero de la misma sucursal abre otra caja al mismo tiempo', async () => {
    const res = await post('hu11.cajero', '/caja/abrir', { montoInicial: '200' })
    expect(res.status).toBe(201)
    const admin = (await get('hu11.admin', '/caja/actual')).body.turno
    expect(res.body.id).not.toBe(admin.id)
  })

  it('CA1: vende y cobra en su caja', async () => {
    const res = await post('hu11.admin', '/ventas', {
      renglones: [{ productoId: coca, cantidad: '2' }],
      pagos: [{ metodo: 'EFECTIVO', monto: '50' }],
    })
    expect(res.status).toBe(201)
    const venta = await prisma.venta.findUniqueOrThrow({ where: { id: res.body.id }, include: { turno: true } })
    expect(venta.usuarioId).toBe(id['hu11.admin'])
    expect(venta.turno.usuarioId).toBe(id['hu11.admin'])
  })

  it('CA1: registra un pago a proveedor', async () => {
    const res = await post('hu11.admin', '/caja/actual/pagos-proveedor', {
      proveedor: 'Bimbo',
      monto: '20',
      metodo: 'EFECTIVO',
    })
    expect(res.status).toBe(201)
  })

  it('CA1: consulta el inventario y agrega productos y existencias', async () => {
    const inventario = await get('hu11.admin', '/productos?q=Coca')
    expect(inventario.status).toBe(200)
    expect(inventario.body.map((p: { id: number }) => p.id)).toContain(coca)

    const alta = await post('hu11.admin', '/productos', {
      codigoBarras: 'HU11-001',
      nombre: 'HU11 Producto',
      precio: '12.00',
      unidad: 'PIEZA',
      cantidad: '6',
    })
    expect(alta.status).toBe(201)
    expect(alta.body.sucursalId).toBe(centro)
    expect((await post('hu11.admin', `/productos/${coca}/entradas`, { cantidad: '5' })).status).toBe(200)
  })

  it('CA3: el corte de cada persona solo incluye sus propias operaciones', async () => {
    const venta = await post('hu11.cajero', '/ventas', {
      renglones: [{ productoId: coca, cantidad: '1' }],
      pagos: [{ metodo: 'EFECTIVO', monto: '18.50' }],
    })
    expect(venta.status).toBe(201)

    const admin = await get('hu11.admin', '/caja/actual/corte')
    expect(admin.body).toMatchObject({ numeroVentas: 1, totalVendido: '37.00', efectivoEsperado: '517.00' })
    expect(admin.body.pagosProveedor.detalle).toHaveLength(1)

    const cajero = await get('hu11.cajero', '/caja/actual/corte')
    expect(cajero.body).toMatchObject({ numeroVentas: 1, totalVendido: '18.50', efectivoEsperado: '218.50' })
    expect(cajero.body.pagosProveedor.detalle).toHaveLength(0)
  })

  it('CA3: cerrar la caja del administrador no cierra la del cajero', async () => {
    const cierre = await post('hu11.admin', '/caja/actual/cerrar', { efectivoContado: '517.00' })
    expect(cierre.status).toBe(200)
    expect(cierre.body.diferencia).toBe('0.00')
    expect((await get('hu11.admin', '/caja/actual')).body.turno).toBeNull()
    expect((await get('hu11.cajero', '/caja/actual')).body.turno).not.toBeNull()
  })
})
