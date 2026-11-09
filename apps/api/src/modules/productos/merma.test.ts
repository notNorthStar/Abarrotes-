import request from 'supertest'
import { beforeAll, describe, expect, it } from 'vitest'
import type { UnidadVenta } from '@prisma/client'
import { app } from '../../app'
import { prisma } from '../../lib/prisma'
import { tokenDe } from '../../test/helpers'
import { registrarMerma } from './productos.service'

describe('HU-10 · productos caducados o dañados', () => {
  let cajero: string
  let norte: string
  let admin: string
  let jefe: string
  let sucursalId: number
  let usuarioId: number
  let secuencia = 0

  beforeAll(async () => {
    const base = await prisma.usuario.findUniqueOrThrow({ where: { usuario: 'cajero1' } })
    sucursalId = base.sucursalId!
    const propio = await prisma.usuario.create({
      data: {
        usuario: 'hu10.mermas',
        nombre: 'Cajero de mermas',
        passwordHash: base.passwordHash,
        rol: 'CAJERO',
        sucursalId,
      },
    })
    usuarioId = propio.id
    ;[cajero, norte, admin, jefe] = await Promise.all([
      tokenDe('hu10.mermas'),
      tokenDe('cajero.norte'),
      tokenDe('admin.centro'),
      tokenDe('jefe'),
    ])
  })

  const producto = (unidad: UnidadVenta = 'PIEZA', existencia = '10') =>
    prisma.producto.create({
      data: {
        codigoBarras: `HU10-${++secuencia}`,
        nombre: 'HU10 Producto de prueba',
        unidad,
        existencia,
        precio: '20.50',
        sucursalId,
      },
    })
  const post = (id: number | string, datos: unknown, token = cajero, query = '') =>
    request(app)
      .post(`/api/productos/${id}/mermas${query}`)
      .set('Authorization', `Bearer ${token}`)
      .send(datos)
  const valido = { cantidad: '2', motivo: 'CADUCADO', comentario: 'Revisión del anaquel' }

  it('CA1–CA3 · el cajero registra sin aprobación, descuenta y conserva motivo, usuario y fecha', async () => {
    const p = await producto()
    const inicio = new Date()
    const res = await post(p.id, valido)
    expect(res.status).toBe(201)
    expect(res.body.existencia).toBe('8')
    const movimiento = await prisma.movimientoInventario.findFirstOrThrow({
      where: { productoId: p.id },
    })
    expect(movimiento.tipo).toBe('MERMA')
    expect(movimiento.cantidad.toString()).toBe('-2')
    expect(movimiento.motivo).toBe('CADUCADO')
    expect(movimiento.comentario).toBe(valido.comentario)
    expect(movimiento.usuarioId).toBe(usuarioId)
    expect(movimiento.creadoEn.getTime()).toBeGreaterThanOrEqual(inicio.getTime() - 1000)
  })

  it('CA1 · admite dañado y comentario opcional', async () => {
    const p = await producto()
    expect((await post(p.id, { cantidad: '1', motivo: 'DANADO' })).status).toBe(201)
    expect(
      (await prisma.movimientoInventario.findFirstOrThrow({ where: { productoId: p.id } })).motivo,
    ).toBe('DANADO')
  })

  it.each([
    ['sin motivo', { cantidad: '1' }],
    ['motivo vacío', { cantidad: '1', motivo: '' }],
    ['motivo desconocido', { cantidad: '1', motivo: 'OTRO' }],
    ['cero', { ...valido, cantidad: '0' }],
    ['negativo', { ...valido, cantidad: '-1' }],
    ['no numérico', { ...valido, cantidad: 'abc' }],
    ['sin cantidad', { motivo: 'CADUCADO' }],
    ['número en lugar de texto decimal', { ...valido, cantidad: 2 }],
    ['más de tres decimales', { ...valido, cantidad: '0.0001' }],
    ['fuera de la precisión de la base', { ...valido, cantidad: '10000000' }],
    ['comentario demasiado largo', { ...valido, comentario: 'a'.repeat(201) }],
  ])('rechaza %s sin descontar ni crear movimiento', async (_caso, datos) => {
    const p = await producto('KILO')
    expect((await post(p.id, datos)).status).toBe(400)
    expect(
      (await prisma.producto.findUniqueOrThrow({ where: { id: p.id } })).existencia.toString(),
    ).toBe('10')
    expect(await prisma.movimientoInventario.count({ where: { productoId: p.id } })).toBe(0)
  })

  it('CA5 · por pieza rechaza fracciones', async () => {
    const p = await producto()
    const res = await post(p.id, { ...valido, cantidad: '1.5' })
    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/enteras/)
    expect(await prisma.movimientoInventario.count({ where: { productoId: p.id } })).toBe(0)
  })

  it('CA5 · por kilo descuenta exactamente tres decimales y permite agotar la existencia', async () => {
    const p = await producto('KILO', '1.125')
    const res = await post(p.id, { ...valido, cantidad: '1.125' })
    expect(res.status).toBe(201)
    expect(res.body.existencia).toBe('0')
    expect(
      (
        await prisma.movimientoInventario.findFirstOrThrow({ where: { productoId: p.id } })
      ).cantidad.toString(),
    ).toBe('-1.125')
  })

  it('rechaza existencia insuficiente sin cambios parciales', async () => {
    const p = await producto('PIEZA', '1')
    expect((await post(p.id, valido)).status).toBe(409)
    expect(
      (await prisma.producto.findUniqueOrThrow({ where: { id: p.id } })).existencia.toString(),
    ).toBe('1')
    expect(await prisma.movimientoInventario.count({ where: { productoId: p.id } })).toBe(0)
  })

  it('dos mermas simultáneas no consumen la misma existencia', async () => {
    const p = await producto()
    const resultados = await Promise.all([
      post(p.id, { ...valido, cantidad: '7' }),
      post(p.id, { ...valido, cantidad: '7' }),
    ])
    expect(resultados.map((r) => r.status).sort()).toEqual([201, 409])
    expect(
      (await prisma.producto.findUniqueOrThrow({ where: { id: p.id } })).existencia.toString(),
    ).toBe('3')
    expect(await prisma.movimientoInventario.count({ where: { productoId: p.id } })).toBe(1)
  })

  it('revierte el descuento si falla el registro del movimiento', async () => {
    const p = await producto()
    await expect(
      registrarMerma(sucursalId, 2147483647, p.id, {
        cantidad: '2',
        motivo: 'CADUCADO',
      }),
    ).rejects.toThrow()
    expect(
      (await prisma.producto.findUniqueOrThrow({ where: { id: p.id } })).existencia.toString(),
    ).toBe('10')
    expect(await prisma.movimientoInventario.count({ where: { productoId: p.id } })).toBe(0)
  })

  it('CA4 · no requiere caja abierta y no modifica el efectivo esperado cuando hay turno', async () => {
    const p = await producto()
    expect((await post(p.id, valido)).status).toBe(201)
    expect(await prisma.turnoCaja.count({ where: { usuarioId } })).toBe(0)
    const abrir = await request(app)
      .post('/api/caja/abrir')
      .set('Authorization', `Bearer ${cajero}`)
      .send({ montoInicial: '123.45' })
    expect(abrir.status).toBe(201)
    const corte = () =>
      request(app).get('/api/caja/actual/corte').set('Authorization', `Bearer ${cajero}`)
    const antes = await corte()
    expect(antes.status).toBe(200)
    expect((await post(p.id, valido)).status).toBe(201)
    expect((await corte()).body).toEqual(antes.body)
  })

  it('aísla sucursales aunque el cajero envíe otra por query o body', async () => {
    const p = await producto()
    expect(
      (await post(p.id, { ...valido, sucursalId }, norte, `?sucursalId=${sucursalId}`)).status,
    ).toBe(404)
    expect(
      (await prisma.producto.findUniqueOrThrow({ where: { id: p.id } })).existencia.toString(),
    ).toBe('10')
  })

  it.each(['SUSPENDIDO', 'ELIMINADO'] as const)('rechaza producto %s', async (estado) => {
    const p = await producto()
    await prisma.producto.update({ where: { id: p.id }, data: { estado } })
    expect((await post(p.id, valido)).status).toBe(404)
  })

  it('requiere sesión, id válido y producto existente', async () => {
    const p = await producto()
    expect((await request(app).post(`/api/productos/${p.id}/mermas`).send(valido)).status).toBe(401)
    expect((await post('abc', valido)).status).toBe(400)
    expect((await post(2147483647, valido)).status).toBe(404)
  })

  it('administrador y jefe heredan el permiso; jefe indica sucursal', async () => {
    const p = await producto()
    expect((await post(p.id, valido, admin)).status).toBe(201)
    expect((await post(p.id, valido, jefe)).status).toBe(400)
    expect((await post(p.id, valido, jefe, `?sucursalId=${sucursalId}`)).status).toBe(201)
  })
})
