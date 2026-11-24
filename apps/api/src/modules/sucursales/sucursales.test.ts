import request from 'supertest'
import { beforeAll, describe, expect, it } from 'vitest'
import { app } from '../../app'
import { prisma } from '../../lib/prisma'
import { tokenDe } from '../../test/helpers'

const login = (usuario: string) =>
  request(app).post('/api/auth/login').send({ usuario, password: 'abarrotes123' })
describe('HU-16 gestión de sucursales', () => {
  let jefe: string
  let admin: string
  let cajero: string
  let secuencia = 0
  beforeAll(async () => {
    ;[jefe, admin, cajero] = await Promise.all([
      tokenDe('jefe'),
      tokenDe('admin.centro'),
      tokenDe('cajero1'),
    ])
  })
  const api = (token = jefe) => ({ Authorization: `Bearer ${token}` })
  const nueva = () =>
    prisma.sucursal.create({
      data: { nombre: `HU16 ${++secuencia}`, direccion: 'Calle de prueba' },
    })
  const cambiar = (id: number, estado: string) =>
    request(app).patch(`/api/sucursales/${id}`).set(api()).send({ estado })

  it('CA1: el jefe crea una sucursal activa con nombre y dirección normalizados', async () => {
    const res = await request(app)
      .post('/api/sucursales')
      .set(api())
      .send({ nombre: '  HU16 Sur  ', direccion: ' Calle 1 ' })
    expect(res.status).toBe(201)
    expect(res.body).toMatchObject({ nombre: 'HU16 Sur', direccion: 'Calle 1', estado: 'ACTIVO' })
    expect((await prisma.sucursal.findUniqueOrThrow({ where: { id: res.body.id } })).nombre).toBe(
      'HU16 Sur',
    )
    const sinDireccion = await request(app)
      .post('/api/sucursales')
      .set(api())
      .send({ nombre: 'HU16 Sin dirección' })
    expect(sinDireccion.status).toBe(201)
    expect(sinDireccion.body.direccion).toBeNull()
  })
  it.each([
    {},
    { nombre: '' },
    { nombre: '  ' },
    { nombre: 123 },
    { nombre: 'x'.repeat(121) },
    { nombre: 'A', direccion: 1 },
    { nombre: 'A', direccion: 'x'.repeat(251) },
    { nombre: 'A', estado: 'ELIMINADO' },
  ])('rechaza un alta inválida %j sin crear filas', async (body) => {
    const antes = await prisma.sucursal.count()
    expect((await request(app).post('/api/sucursales').set(api()).send(body)).status).toBe(400)
    expect(await prisma.sucursal.count()).toBe(antes)
  })
  it('CA1/CA4: lista con estado, filtra activas y excluye eliminadas', async () => {
    const p = await nueva()
    const e = await nueva()
    await cambiar(p.id, 'SUSPENDIDO')
    expect((await request(app).delete(`/api/sucursales/${e.id}`).set(api())).status).toBe(200)
    const lista = await request(app).get('/api/sucursales').set(api())
    expect(lista.status).toBe(200)
    expect(lista.body).toContainEqual(expect.objectContaining({ id: p.id, estado: 'SUSPENDIDO' }))
    expect(lista.body.some((s: { id: number }) => s.id === e.id)).toBe(false)
    const activas = await request(app).get('/api/sucursales?estado=ACTIVO').set(api())
    expect(activas.body.every((s: { estado: string }) => s.estado === 'ACTIVO')).toBe(true)
    expect(activas.body.some((s: { id: number }) => s.id === p.id || s.id === e.id)).toBe(false)
    const selector = await request(app).get('/api/administradores/sucursales').set(api())
    expect(selector.body.some((s: { id: number }) => s.id === p.id || s.id === e.id)).toBe(false)
    expect((await request(app).get('/api/sucursales?estado=ELIMINADO').set(api())).status).toBe(400)
  })
  it.each(['admin', 'cajero', 'anonimo'])('CA1: %s no puede gestionar sucursales', async (rol) => {
    const p = await nueva()
    const headers = rol === 'anonimo' ? {} : api(rol === 'admin' ? admin : cajero)
    const esperado = rol === 'anonimo' ? 401 : 403
    expect((await request(app).get('/api/sucursales').set(headers)).status).toBe(esperado)
    expect(
      (await request(app).post('/api/sucursales').set(headers).send({ nombre: 'No permitido' }))
        .status,
    ).toBe(esperado)
    expect(
      (
        await request(app)
          .patch(`/api/sucursales/${p.id}`)
          .set(headers)
          .send({ estado: 'SUSPENDIDO' })
      ).status,
    ).toBe(esperado)
    expect((await request(app).delete(`/api/sucursales/${p.id}`).set(headers)).status).toBe(
      esperado,
    )
    expect((await prisma.sucursal.findUniqueOrThrow({ where: { id: p.id } })).estado).toBe('ACTIVO')
  })
  it('CA2: permite suspender y reactivar, sin modificar nombre ni dirección', async () => {
    const p = await nueva()
    expect((await cambiar(p.id, 'SUSPENDIDO')).body.estado).toBe('SUSPENDIDO')
    expect((await cambiar(p.id, 'ACTIVO')).body).toMatchObject({
      nombre: p.nombre,
      direccion: p.direccion,
      estado: 'ACTIVO',
    })
  })
  it.each(['0', '-1', 'x', '1.5', '2147483648'])('rechaza id inválido %s', async (id) => {
    expect((await cambiar(Number(id), 'ACTIVO')).status).toBe(400)
    expect((await request(app).delete(`/api/sucursales/${id}`).set(api())).status).toBe(400)
  })
  it('no permite estado eliminado por PATCH ni campos ajenos', async () => {
    const p = await nueva()
    expect((await cambiar(p.id, 'ELIMINADO')).status).toBe(400)
    expect(
      (
        await request(app)
          .patch(`/api/sucursales/${p.id}`)
          .set(api())
          .send({ estado: 'ACTIVO', nombre: 'Cambio ajeno' })
      ).status,
    ).toBe(400)
    expect((await request(app).patch(`/api/sucursales/${p.id}`).set(api()).send({})).status).toBe(
      400,
    )
  })
  it('CA4: el borrado es lógico, definitivo y no admite reactivación', async () => {
    const p = await nueva()
    expect((await request(app).delete(`/api/sucursales/${p.id}`).set(api())).body).toEqual({
      ok: true,
    })
    expect((await prisma.sucursal.findUniqueOrThrow({ where: { id: p.id } })).estado).toBe(
      'ELIMINADO',
    )
    expect((await cambiar(p.id, 'ACTIVO')).status).toBe(404)
    expect((await request(app).delete(`/api/sucursales/${p.id}`).set(api())).status).toBe(404)
    expect((await cambiar(2147483647, 'ACTIVO')).status).toBe(404)
  })

  it.each(['SUSPENDIDO', 'ELIMINADO'] as const)(
    'CA2–CA4/T29: %s bloquea login y JWT previo; conserva cajas e historial',
    async (estado) => {
      const s = await nueva()
      const base = await prisma.usuario.findUniqueOrThrow({ where: { usuario: 'cajero1' } })
      const u = await prisma.usuario.create({
        data: {
          nombre: 'HU16 Cajero',
          usuario: `hu16.${s.id}`,
          passwordHash: base.passwordHash,
          rol: 'CAJERO',
          sucursalId: s.id,
        },
      })
      const a = await prisma.usuario.create({
        data: {
          nombre: 'HU16 Admin',
          usuario: `hu16.admin.${s.id}`,
          passwordHash: base.passwordHash,
          rol: 'ADMIN',
          sucursalId: s.id,
        },
      })
      const token = (await login(u.usuario)).body.token as string
      const tokenAdmin = (await login(a.usuario)).body.token as string
      const t = await prisma.turnoCaja.create({
        data: { usuarioId: u.id, sucursalId: s.id, montoInicial: '100' },
      })
      const p = await prisma.producto.create({
        data: {
          nombre: 'HU16 Producto',
          codigoBarras: `HU16-${s.id}`,
          precio: '10',
          existencia: '9',
          sucursalId: s.id,
        },
      })
      const m = await prisma.movimientoInventario.create({
        data: { usuarioId: u.id, productoId: p.id, tipo: 'ALTA', cantidad: '9' },
      })
      const v = await prisma.venta.create({
        data: {
          usuarioId: u.id,
          turnoId: t.id,
          total: '10',
          pagos: { create: { metodo: 'EFECTIVO', monto: '10' } },
          renglones: {
            create: { productoId: p.id, cantidad: '1', precioUnitario: '10', subtotal: '10' },
          },
        },
      })
      const proveedor = await prisma.proveedor.findFirstOrThrow()
      const pago = await prisma.pagoProveedor.create({
        data: { turnoId: t.id, proveedorId: proveedor.id, metodo: 'EFECTIVO', monto: '5' },
      })
      const snapshot = async () =>
        JSON.stringify(
          await Promise.all([
            prisma.usuario.findUnique({ where: { id: u.id } }),
            prisma.usuario.findUnique({ where: { id: a.id } }),
            prisma.producto.findUnique({ where: { id: p.id } }),
            prisma.turnoCaja.findUnique({ where: { id: t.id } }),
            prisma.movimientoInventario.findUnique({ where: { id: m.id } }),
            prisma.venta.findUnique({
              where: { id: v.id },
              include: { pagos: true, renglones: true },
            }),
            prisma.pagoProveedor.findUnique({ where: { id: pago.id } }),
          ]),
        )
      const antes = await snapshot()
      const respuesta =
        estado === 'ELIMINADO'
          ? await request(app).delete(`/api/sucursales/${s.id}`).set(api())
          : await cambiar(s.id, estado)
      expect(respuesta.status).toBe(200)
      expect(await snapshot()).toBe(antes)
      expect((await login(u.usuario)).status).toBe(403)
      expect((await login(a.usuario)).status).toBe(403)
      const h = api(token)
      expect((await request(app).get('/api/auth/me').set(h)).status).toBe(403)
      expect((await request(app).get('/api/productos?sucursalId=1').set(h)).status).toBe(403)
      expect((await request(app).get('/api/caja/actual').set(h)).status).toBe(403)
      expect(
        (await request(app).post(`/api/productos/${p.id}/entradas`).set(h).send({ cantidad: '1' }))
          .status,
      ).toBe(403)
      expect((await request(app).get('/api/reportes/semanal').set(api(tokenAdmin))).status).toBe(
        403,
      )
      expect(
        (await request(app).get('/api/reportes/semanal/pdf').set(api(tokenAdmin))).status,
      ).toBe(403)
      expect(await snapshot()).toBe(antes)
      expect((await request(app).get('/api/productos').set(api(cajero))).status).toBe(200)
      expect((await request(app).get('/api/sucursales').set(api())).status).toBe(200)
      if (estado === 'SUSPENDIDO') {
        await cambiar(s.id, 'ACTIVO')
        expect((await login(u.usuario)).status).toBe(200)
        expect((await request(app).get('/api/productos').set(h)).status).toBe(200)
        expect(await snapshot()).toBe(antes)
      }
    },
    20000,
  )
})
