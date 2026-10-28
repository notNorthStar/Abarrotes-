import request from 'supertest'
import { beforeAll, describe, expect, it } from 'vitest'
import { app } from '../../app'
import { prisma } from '../../lib/prisma'
import { tokenDe } from '../../test/helpers'

// HU-03: prueba el contrato de granel al confirmar una venta real.
// Productos exclusivos y cajero Norte para no alterar los escenarios de HU-06.
describe('HU-03 · cantidades a granel en la API', () => {
  let cajero: string
  let usuarioId: number
  let kilo: number
  let pieza: number

  const vender = (productoId: number, cantidad: unknown, extra: Record<string, unknown> = {}) =>
    request(app)
      .post('/api/ventas')
      .set('Authorization', `Bearer ${cajero}`)
      .send({
        renglones: [{ productoId, cantidad, ...extra }],
        pagos: [{ metodo: 'EFECTIVO', monto: '10.00' }],
      })

  beforeAll(async () => {
    cajero = await tokenDe('cajero.norte')
    const usuario = await prisma.usuario.findUniqueOrThrow({ where: { usuario: 'cajero.norte' } })
    usuarioId = usuario.id
    const sucursalId = usuario.sucursalId!
    await prisma.turnoCaja.create({ data: { usuarioId, sucursalId, montoInicial: '100.00' } })
    const granel = await prisma.producto.create({
      data: {
        codigoBarras: 'HU03-GRANEL',
        nombre: 'HU03 Granel de prueba',
        unidad: 'KILO',
        precio: '1.01',
        existencia: '10.000',
        sucursalId,
      },
    })
    const entero = await prisma.producto.create({
      data: {
        codigoBarras: 'HU03-PIEZA',
        nombre: 'HU03 Pieza de prueba',
        unidad: 'PIEZA',
        precio: '1.00',
        existencia: '10',
        sucursalId,
      },
    })
    kilo = granel.id
    pieza = entero.id
  })

  it.each(['0', '-0.001', '0.0001', 'texto'])(
    'CA5: rechaza peso inválido %s sin descontar inventario',
    async (peso) => {
      const antes = await prisma.producto.findUniqueOrThrow({ where: { id: kilo } })
      const res = await vender(kilo, peso)
      expect(res.status).toBe(400)
      const despues = await prisma.producto.findUniqueOrThrow({ where: { id: kilo } })
      expect(despues.existencia.equals(antes.existencia)).toBe(true)
    },
  )

  it('CA5: un producto por pieza rechaza cantidad fraccionaria sin registrar la venta', async () => {
    const ventasAntes = await prisma.venta.count({ where: { usuarioId } })
    const res = await vender(pieza, '0.5')
    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/por pieza/)
    expect(await prisma.venta.count({ where: { usuarioId } })).toBe(ventasAntes)
    const producto = await prisma.producto.findUniqueOrThrow({ where: { id: pieza } })
    expect(producto.existencia.toString()).toBe('10')
  })

  it('CA3/CA4/CA6: conserva peso, recalcula precio half-up y descuenta exactamente los kilos vendidos', async () => {
    const antes = await prisma.producto.findUniqueOrThrow({ where: { id: kilo } })
    // 0.500 kg × $1.01/kg = $0.505 → $0.51, aunque el cliente intente enviar otro precio.
    const res = await vender(kilo, '0.500', { precio: '0.01', subtotal: '0.01' })
    expect(res.status).toBe(201)
    expect(res.body.total).toBe('0.51')
    expect(res.body.renglones).toEqual([
      expect.objectContaining({
        productoId: kilo,
        unidad: 'KILO',
        cantidad: '0.500',
        precioUnitario: '1.01',
        subtotal: '0.51',
      }),
    ])
    const despues = await prisma.producto.findUniqueOrThrow({ where: { id: kilo } })
    expect(antes.existencia.minus(despues.existencia).toFixed(3)).toBe('0.500')
    const movimiento = await prisma.movimientoInventario.findFirstOrThrow({
      where: { productoId: kilo, tipo: 'VENTA', comentario: `Venta #${res.body.id}` },
    })
    expect(movimiento.cantidad.toFixed(3)).toBe('-0.500')
    expect(movimiento.usuarioId).toBe(usuarioId)
  })
})
