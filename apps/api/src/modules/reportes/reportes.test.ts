import request from 'supertest'
import { beforeAll, describe, expect, it } from 'vitest'
import { app } from '../../app'
import { prisma } from '../../lib/prisma'
import { firmarToken } from '../../middleware/auth'
import { semanaDesde } from './reportes.service'
import { generarPdf } from './reportes.pdf'
import type { ReporteSemanal } from './reportes.service'

describe('HU-13 reporte semanal por sucursal', () => {
  let admin: string
  let cajero: string
  let jefe: string
  let sucursalId: number
  let usuarioId: number
  let productoId: number
  const fecha = '2026-11-12'
  const inicio = new Date('2026-11-09T06:00:00Z')
  const fin = new Date('2026-11-16T06:00:00Z')
  beforeAll(async () => {
    const sucursal = await prisma.sucursal.create({ data: { nombre: 'HU13 Centro' } })
    const otra = await prisma.sucursal.create({ data: { nombre: 'HU13 Otra' } })
    sucursalId = sucursal.id
    const usuario = await prisma.usuario.create({
      data: {
        nombre: 'HU13 Responsable',
        usuario: 'hu13-responsable',
        passwordHash: 'no-login',
        rol: 'ADMIN',
        sucursalId,
      },
    })
    usuarioId = usuario.id
    admin = firmarToken({ id: usuarioId, rol: 'ADMIN', sucursalId })
    cajero = firmarToken({ id: usuarioId, rol: 'CAJERO', sucursalId })
    jefe = firmarToken({ id: usuarioId, rol: 'JEFE', sucursalId: null })
    const turno = await prisma.turnoCaja.create({
      data: { usuarioId, sucursalId, montoInicial: '500' },
    })
    const ajeno = await prisma.turnoCaja.create({
      data: { usuarioId, sucursalId: otra.id, montoInicial: '500' },
    })
    const producto = await prisma.producto.create({
      data: {
        sucursalId,
        nombre: 'HU13 Producto',
        codigoBarras: 'HU13-1',
        precio: '10.10',
        existencia: '20.5',
        unidad: 'KILO',
      },
    })
    productoId = producto.id
    const fuera = await prisma.producto.create({
      data: { sucursalId: otra.id, nombre: 'HU13 Secreto', codigoBarras: 'HU13-2', precio: '1' },
    })
    const venta = (creadoEn: Date, turnoId: number, total: string) =>
      prisma.venta.create({
        data: {
          turnoId,
          usuarioId,
          total,
          creadoEn,
          pagos: { create: { metodo: 'EFECTIVO', monto: total } },
        },
      })
    await venta(new Date(inicio.getTime() - 1), turno.id, '999')
    await prisma.venta.create({
      data: {
        turnoId: turno.id,
        usuarioId,
        total: '100',
        cambio: '50',
        creadoEn: inicio,
        pagos: {
          create: [
            { metodo: 'EFECTIVO', monto: '100' },
            { metodo: 'TARJETA', monto: '30' },
            { metodo: 'TRANSFERENCIA', monto: '20' },
          ],
        },
      },
    })
    await venta(new Date(fin.getTime() - 1), turno.id, '10.10')
    await venta(fin, turno.id, '999')
    await venta(inicio, ajeno.id, '999')
    const proveedor = await prisma.proveedor.create({ data: { nombre: 'HU13 Proveedor' } })
    await prisma.pagoProveedor.create({
      data: {
        turnoId: turno.id,
        proveedorId: proveedor.id,
        metodo: 'EFECTIVO',
        monto: '25.10',
        comentario: 'Entrega semanal',
        creadoEn: inicio,
      },
    })
    await prisma.pagoProveedor.create({
      data: {
        turnoId: ajeno.id,
        proveedorId: proveedor.id,
        metodo: 'TRANSFERENCIA',
        monto: '999',
        creadoEn: inicio,
      },
    })
    await prisma.movimientoInventario.createMany({
      data: [
        { productoId, usuarioId, tipo: 'ALTA', cantidad: '20', creadoEn: inicio },
        { productoId, usuarioId, tipo: 'ENTRADA', cantidad: '1.125', creadoEn: inicio },
        {
          productoId,
          usuarioId,
          tipo: 'MERMA',
          cantidad: '-0.625',
          motivo: 'DANADO',
          comentario: 'Bolsa rota',
          creadoEn: inicio,
        },
        { productoId, usuarioId, tipo: 'MERMA', cantidad: '-1', motivo: 'CADUCADO', creadoEn: fin },
        {
          productoId: fuera.id,
          usuarioId,
          tipo: 'MERMA',
          cantidad: '-999',
          motivo: 'CADUCADO',
          creadoEn: inicio,
        },
      ],
    })
  })
  const get = (ruta = '', token = admin) =>
    request(app).get(`/api/reportes/semanal${ruta}`).set('Authorization', `Bearer ${token}`)

  it('normaliza la semana civil lunes-domingo en México, cruzando meses y años', () => {
    expect(semanaDesde(fecha)).toEqual({
      inicio: '2026-11-09',
      fin: '2026-11-15',
      desde: inicio,
      hasta: fin,
    })
    expect(semanaDesde('2027-01-01')).toMatchObject({ inicio: '2026-12-28', fin: '2027-01-03' })
    expect(semanaDesde('2026-11-15').inicio).toBe('2026-11-09')
  })
  it('CA1: respeta límites inclusivo/exclusivo locales y descuenta el cambio del efectivo', async () => {
    const res = await get(`?fecha=${fecha}`)
    expect(res.status).toBe(200)
    expect(res.body.semana).toEqual({ inicio: '2026-11-09', fin: '2026-11-15' })
    expect(res.body.ingresos).toEqual({
      EFECTIVO: '60.10',
      TARJETA: '30.00',
      TRANSFERENCIA: '20.00',
      total: '110.10',
    })
    expect(res.body.ventas).toHaveLength(2)
    expect(res.body.ventas[0].pagos.EFECTIVO).toBe('50.00')
  })
  it('CA1/CA2: incluye pagos, altas, entradas y mermas con su responsable', async () => {
    const { body } = await get(`?fecha=${fecha}`)
    expect(body.pagosProveedor).toHaveLength(1)
    expect(body.pagosProveedor[0]).toMatchObject({
      proveedor: 'HU13 Proveedor',
      monto: '25.10',
      usuario: { id: usuarioId, nombre: 'HU13 Responsable' },
    })
    expect(
      body.productosAgregados.map((m: { tipo: string; cantidad: string }) => [m.tipo, m.cantidad]),
    ).toEqual([
      ['ALTA', '20'],
      ['ENTRADA', '1.125'],
    ])
    expect(body.mermas).toHaveLength(1)
    expect(body.mermas[0]).toMatchObject({
      cantidad: '0.625',
      motivo: 'DANADO',
      producto: { id: productoId, unidad: 'KILO' },
      usuario: { id: usuarioId },
    })
    expect(body.ventas[0].usuario.id).toBe(usuarioId)
  })
  it('CA5: el administrador no puede cambiar su sucursal manipulando la consulta', async () => {
    const { body, status } = await get(`?fecha=${fecha}&sucursalId=1`)
    expect(status).toBe(200)
    expect(body.sucursal.id).toBe(sucursalId)
    expect(body.ingresos.total).toBe('110.10')
    expect(JSON.stringify(body)).not.toContain('HU13 Secreto')
  })
  it('exige sesión y rechaza cajeros tanto en tabla como PDF', async () => {
    expect((await request(app).get('/api/reportes/semanal')).status).toBe(401)
    expect((await get(`?fecha=${fecha}`, cajero)).status).toBe(403)
    expect((await get(`/pdf?fecha=${fecha}`, cajero)).status).toBe(403)
  })
  it('el jefe requiere sucursal explícita y obtiene la elegida', async () => {
    expect((await get(`?fecha=${fecha}`, jefe)).status).toBe(400)
    const res = await get(`?fecha=${fecha}&sucursalId=${sucursalId}`, jefe)
    expect(res.status).toBe(200)
    expect(res.body.sucursal.id).toBe(sucursalId)
    expect((await get(`?fecha=${fecha}&sucursalId=2147483647`, jefe)).status).toBe(404)
  })
  it.each(['2026-02-30', '12/11/2026', '2026-13-01', 'nada'])(
    'rechaza fecha inválida %s',
    async (valor) => {
      expect((await get(`?fecha=${valor}`)).status).toBe(400)
      expect((await get(`/pdf?fecha=${valor}`)).status).toBe(400)
    },
  )
  it('una semana vacía retorna ceros y listas vacías, también exportables', async () => {
    const res = await get('?fecha=2030-01-01')
    expect(res.status).toBe(200)
    expect(res.body.ingresos.total).toBe('0.00')
    expect(res.body.ventas).toEqual([])
    expect(res.body.mermas).toEqual([])
    const pdf = await get('/pdf?fecha=2030-01-01')
    expect(pdf.status).toBe(200)
    expect(pdf.body.toString('latin1').match(/\/Type \/Page\b/g)).toHaveLength(1)
  })
  it('CA3: exporta un PDF real con nombre de sucursal y semana', async () => {
    const res = await get(`/pdf?fecha=${fecha}`)
    expect(res.status).toBe(200)
    expect(res.headers['content-type']).toMatch(/application\/pdf/)
    expect(res.headers['content-disposition']).toContain(
      `reporte-sucursal-${sucursalId}-2026-11-09.pdf`,
    )
    expect(Buffer.isBuffer(res.body)).toBe(true)
    expect(res.body.subarray(0, 5).toString()).toBe('%PDF-')
  })
  it('el PDF pagina reportes extensos sin omitir filas', async () => {
    const res = await get(`?fecha=${fecha}`)
    const reporte = res.body as ReporteSemanal
    reporte.mermas = Array.from({ length: 100 }, (_, i) => ({
      ...reporte.mermas[0],
      id: i + 1,
      comentario:
        'Detalle extenso de la merma para verificar el ajuste de líneas y el salto de página.',
    }))
    const pdf = await generarPdf(reporte)
    const paginas = pdf.toString('latin1').match(/\/Type \/Page\b/g)
    expect(paginas!.length).toBeGreaterThan(4)
    expect(pdf.subarray(-6).toString()).toContain('%%EOF')
  })
})
