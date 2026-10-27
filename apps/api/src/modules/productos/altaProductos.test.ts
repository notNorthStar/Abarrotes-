import request from 'supertest'
import { beforeAll, describe, expect, it } from 'vitest'
import { app } from '../../app'
import { prisma } from '../../lib/prisma'
import { tokenDe } from '../../test/helpers'

// HU-08 · Agregar productos. Los productos de esta prueba usan el prefijo HU08 para no chocar con otras pruebas.

const nuevo = (codigo: string, extra: Record<string, unknown> = {}) => ({
  codigoBarras: codigo,
  nombre: `HU08 Producto ${codigo}`,
  precio: '25.50',
  unidad: 'PIEZA',
  cantidad: '10',
  ...extra,
})

describe('HU-08 agregar productos', () => {
  let cajero: string
  let admin: string
  let cajeroNorte: string
  beforeAll(async () => {
    ;[cajero, admin, cajeroNorte] = await Promise.all([
      tokenDe('cajero1'),
      tokenDe('admin.centro'),
      tokenDe('cajero.norte'),
    ])
  })

  const post = (token: string, ruta: string, body: unknown) =>
    request(app).post(`/api/productos${ruta}`).set('Authorization', `Bearer ${token}`).send(body)

  describe('CA1 · alta de producto nuevo', () => {
    it('un cajero da de alta un producto en su sucursal con su existencia inicial', async () => {
      const res = await post(cajero, '', nuevo('HU08-001'))
      expect(res.status).toBe(201)
      expect(res.body).toMatchObject({ codigoBarras: 'HU08-001', precio: '25.5', unidad: 'PIEZA', existencia: '10' })
      const yo = await prisma.usuario.findUniqueOrThrow({ where: { usuario: 'cajero1' } })
      expect(res.body.sucursalId).toBe(yo.sucursalId)
    })

    it('un administrador también puede dar de alta (jerarquía de roles)', async () => {
      const res = await post(admin, '', nuevo('HU08-002'))
      expect(res.status).toBe(201)
    })

    it('producto por kilo acepta existencia con 3 decimales', async () => {
      const res = await post(cajero, '', nuevo('HU08-003', { unidad: 'KILO', precio: '42.00', cantidad: '12.750' }))
      expect(res.status).toBe(201)
      expect(res.body.existencia).toBe('12.75')
    })

    it('el producto nuevo se puede escanear de inmediato', async () => {
      await post(cajero, '', nuevo('HU08-004'))
      const res = await request(app).get('/api/productos/codigo/HU08-004').set('Authorization', `Bearer ${cajero}`)
      expect(res.status).toBe(200)
      expect(res.body.nombre).toBe('HU08 Producto HU08-004')
    })

    it.each([
      ['precio en cero', { precio: '0' }],
      ['precio con 3 decimales', { precio: '10.555' }],
      ['unidad inválida', { unidad: 'CAJA' }],
      ['sin nombre', { nombre: '' }],
      ['código con espacios', { codigoBarras: '75 01' }],
      ['cantidad negativa', { cantidad: '-1' }],
    ])('rechaza %s con 400', async (_caso, extra) => {
      const res = await post(cajero, '', nuevo('HU08-INV', extra))
      expect(res.status).toBe(400)
    })

    it('por pieza no acepta cantidades decimales', async () => {
      const res = await post(cajero, '', nuevo('HU08-005', { cantidad: '2.5' }))
      expect(res.status).toBe(400)
      expect(res.body.error).toMatch(/enteras/)
    })
  })

  describe('CA3 · código único por sucursal', () => {
    it('no permite repetir el código en la misma sucursal', async () => {
      const res = await post(cajero, '', nuevo('7501000000011'))
      expect(res.status).toBe(409)
      expect(res.body.error).toMatch(/Ya existe/)
    })

    it('el mismo código sí se puede dar de alta en otra sucursal', async () => {
      await post(cajero, '', nuevo('HU08-006'))
      const res = await post(cajeroNorte, '', nuevo('HU08-006'))
      expect(res.status).toBe(201)
    })
  })

  describe('CA2 · entrada de existencias', () => {
    it('suma la cantidad a un producto existente', async () => {
      const creado = await post(cajero, '', nuevo('HU08-007', { cantidad: '5' }))
      const res = await post(cajero, `/${creado.body.id}/entradas`, { cantidad: '12', comentario: 'Visita de proveedor' })
      expect(res.status).toBe(200)
      expect(res.body.existencia).toBe('17')
    })

    it('rechaza cantidad en cero o decimal en producto por pieza', async () => {
      const creado = await post(cajero, '', nuevo('HU08-008'))
      expect((await post(cajero, `/${creado.body.id}/entradas`, { cantidad: '0' })).status).toBe(400)
      expect((await post(cajero, `/${creado.body.id}/entradas`, { cantidad: '1.5' })).status).toBe(400)
    })

    it('no permite registrar entradas a productos de otra sucursal', async () => {
      const creado = await post(cajero, '', nuevo('HU08-009'))
      const res = await post(cajeroNorte, `/${creado.body.id}/entradas`, { cantidad: '3' })
      expect(res.status).toBe(404)
    })
  })

  describe('CA5 · registro de quién y cuándo', () => {
    it('guarda un movimiento ALTA y uno ENTRADA con el usuario que los hizo', async () => {
      const creado = await post(admin, '', nuevo('HU08-010', { cantidad: '4' }))
      await post(cajero, `/${creado.body.id}/entradas`, { cantidad: '6' })

      const movimientos = await prisma.movimientoInventario.findMany({
        where: { productoId: creado.body.id },
        include: { usuario: { select: { usuario: true } } },
        orderBy: { id: 'asc' },
      })
      expect(movimientos.map((m) => [m.tipo, m.cantidad.toString(), m.usuario.usuario])).toEqual([
        ['ALTA', '4', 'admin.centro'],
        ['ENTRADA', '6', 'cajero1'],
      ])
      expect(movimientos[0].creadoEn).toBeInstanceOf(Date)
    })
  })

  describe('permisos', () => {
    it('sin sesión → 401', async () => {
      expect((await request(app).post('/api/productos').send(nuevo('HU08-011'))).status).toBe(401)
    })

    it('el jefe debe indicar sucursal', async () => {
      const jefe = await tokenDe('jefe')
      expect((await post(jefe, '', nuevo('HU08-012'))).status).toBe(400)
    })
  })
})
