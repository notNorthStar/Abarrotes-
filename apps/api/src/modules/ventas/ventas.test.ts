import request from 'supertest'
import { beforeAll, describe, expect, it } from 'vitest'
import { app } from '../../app'
import { prisma } from '../../lib/prisma'
import { tokenDe } from '../../test/helpers'

const COCA = '7501000000011' // Coca-Cola 600 ml $18.50 PIEZA
const JITOMATE = '2000000000015' // Jitomate saladet $28.90 KILO

describe('POST /ventas (HU-06)', () => {
  let cajero: string
  let coca: number
  let jitomate: number
  let cocaNorte: number

  const vender = (body: unknown, token = cajero) =>
    request(app).post('/api/ventas').set('Authorization', `Bearer ${token}`).send(body)

  beforeAll(async () => {
    cajero = await tokenDe('cajero1')
    const centro = await prisma.sucursal.findFirstOrThrow({ where: { nombre: 'Centro' } })
    const norte = await prisma.sucursal.findFirstOrThrow({ where: { nombre: 'Norte' } })
    const cajero1 = await prisma.usuario.findUniqueOrThrow({ where: { usuario: 'cajero1' } })
    await prisma.turnoCaja.create({ data: { usuarioId: cajero1.id, sucursalId: centro.id, montoInicial: '500.00' } })

    const porCodigo = async (sucursalId: number, codigoBarras: string) =>
      (await prisma.producto.findUniqueOrThrow({ where: { sucursalId_codigoBarras: { sucursalId, codigoBarras } } })).id
    coca = await porCodigo(centro.id, COCA)
    jitomate = await porCodigo(centro.id, JITOMATE)
    cocaNorte = await porCodigo(norte.id, COCA)
  })

  it('CA1/CA4: efectivo exacto → cambio 0', async () => {
    const res = await vender({
      renglones: [{ productoId: coca, cantidad: '1' }],
      pagos: [{ metodo: 'EFECTIVO', monto: '18.50' }],
    })
    expect(res.status).toBe(201)
    expect(res.body.total).toBe('18.50')
    expect(res.body.cambio).toBe('0.00')
    expect(res.body.renglones[0]).toMatchObject({ nombre: 'Coca-Cola 600 ml', precioUnitario: '18.50', subtotal: '18.50' })
  })

  it('CA4: efectivo con cambio (2 cocas = 37.00, paga 50 → 13.00)', async () => {
    const res = await vender({
      renglones: [{ productoId: coca, cantidad: '2' }],
      pagos: [{ metodo: 'EFECTIVO', monto: '50' }],
    })
    expect(res.status).toBe(201)
    expect(res.body.total).toBe('37.00')
    expect(res.body.cambio).toBe('13.00')
  })

  it('renglones repetidos del mismo producto se suman', async () => {
    const res = await vender({
      renglones: [
        { productoId: coca, cantidad: '1' },
        { productoId: coca, cantidad: '1' },
      ],
      pagos: [{ metodo: 'EFECTIVO', monto: '37.00' }],
    })
    expect(res.status).toBe(201)
    expect(res.body.renglones).toHaveLength(1)
    expect(res.body.renglones[0].cantidad).toBe('2.000')
  })

  it('CA2/CA3: pago mixto tarjeta + efectivo con referencia', async () => {
    const res = await vender({
      renglones: [{ productoId: coca, cantidad: '2' }],
      pagos: [
        { metodo: 'TARJETA', monto: '20.00', referencia: '4821' },
        { metodo: 'EFECTIVO', monto: '20.00' },
      ],
    })
    expect(res.status).toBe(201)
    expect(res.body.cambio).toBe('3.00')
    expect(res.body.pagos).toEqual([
      expect.objectContaining({ metodo: 'TARJETA', monto: '20.00', referencia: '4821' }),
      expect.objectContaining({ metodo: 'EFECTIVO', monto: '20.00', referencia: null }),
    ])
  })

  it('CA1: transferencia exacta', async () => {
    const res = await vender({
      renglones: [{ productoId: coca, cantidad: '1' }],
      pagos: [{ metodo: 'TRANSFERENCIA', monto: '18.50', referencia: 'SPEI-998877' }],
    })
    expect(res.status).toBe(201)
    expect(res.body.cambio).toBe('0.00')
  })

  it('granel: 0.750 kg de jitomate → subtotal 21.68 (half-up)', async () => {
    const res = await vender({
      renglones: [{ productoId: jitomate, cantidad: '0.750' }],
      pagos: [{ metodo: 'EFECTIVO', monto: '21.68' }],
    })
    expect(res.status).toBe(201)
    expect(res.body.renglones[0].subtotal).toBe('21.68')
    expect(res.body.total).toBe('21.68')
  })

  it('el servidor ignora precios del cliente y usa los de la BD', async () => {
    const res = await vender({
      renglones: [{ productoId: coca, cantidad: '1', precio: '1.00' }],
      pagos: [{ metodo: 'EFECTIVO', monto: '1.00' }],
    })
    expect(res.status).toBe(400)
    expect(res.body.error).toBe('Pago insuficiente: faltan $17.50')
  })

  it('CA5: pago insuficiente → 400 con el monto faltante', async () => {
    const res = await vender({
      renglones: [{ productoId: coca, cantidad: '2' }],
      pagos: [{ metodo: 'EFECTIVO', monto: '30.00' }],
    })
    expect(res.status).toBe(400)
    expect(res.body.error).toBe('Pago insuficiente: faltan $7.00')
  })

  it('CA5: tarjeta que excede el total → 400', async () => {
    const res = await vender({
      renglones: [{ productoId: coca, cantidad: '1' }],
      pagos: [{ metodo: 'TARJETA', monto: '20.00', referencia: '1234' }],
    })
    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/no pueden exceder el total/)
  })

  it('CA3: tarjeta sin referencia → 400', async () => {
    const res = await vender({
      renglones: [{ productoId: coca, cantidad: '1' }],
      pagos: [{ metodo: 'TARJETA', monto: '18.50' }],
    })
    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/referencia es obligatorio/)
  })

  it('validación: sin renglones, monto con 3 decimales o cantidad 0 → 400', async () => {
    const sinRenglones = await vender({ renglones: [], pagos: [{ metodo: 'EFECTIVO', monto: '10' }] })
    expect(sinRenglones.status).toBe(400)
    const montoMal = await vender({
      renglones: [{ productoId: coca, cantidad: '1' }],
      pagos: [{ metodo: 'EFECTIVO', monto: '18.505' }],
    })
    expect(montoMal.status).toBe(400)
    const cantidadCero = await vender({
      renglones: [{ productoId: coca, cantidad: '0' }],
      pagos: [{ metodo: 'EFECTIVO', monto: '10' }],
    })
    expect(cantidadCero.status).toBe(400)
  })

  it('cantidad decimal en producto por PIEZA → 400', async () => {
    const res = await vender({
      renglones: [{ productoId: coca, cantidad: '1.5' }],
      pagos: [{ metodo: 'EFECTIVO', monto: '100' }],
    })
    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/por pieza/)
  })

  it('producto de otra sucursal → 400 "Producto no disponible"', async () => {
    const res = await vender({
      renglones: [{ productoId: cocaNorte, cantidad: '1' }],
      pagos: [{ metodo: 'EFECTIVO', monto: '100' }],
    })
    expect(res.status).toBe(400)
    expect(res.body.error).toBe('Producto no disponible')
  })

  it('sin turno abierto → 409', async () => {
    const cajero2 = await tokenDe('cajero2')
    const res = await vender(
      { renglones: [{ productoId: coca, cantidad: '1' }], pagos: [{ metodo: 'EFECTIVO', monto: '20' }] },
      cajero2,
    )
    expect(res.status).toBe(409)
    expect(res.body.error).toBe('Abre tu caja antes de cobrar')
  })

  it('CA6: descuenta existencia y registra MovimientoInventario VENTA', async () => {
    const antesCoca = await prisma.producto.findUniqueOrThrow({ where: { id: coca } })
    const antesJitomate = await prisma.producto.findUniqueOrThrow({ where: { id: jitomate } })
    const res = await vender({
      renglones: [
        { productoId: coca, cantidad: '3' },
        { productoId: jitomate, cantidad: '1.250' },
      ],
      pagos: [{ metodo: 'EFECTIVO', monto: '100' }],
    })
    expect(res.status).toBe(201)
    const despuesCoca = await prisma.producto.findUniqueOrThrow({ where: { id: coca } })
    const despuesJitomate = await prisma.producto.findUniqueOrThrow({ where: { id: jitomate } })
    expect(antesCoca.existencia.minus(despuesCoca.existencia).toString()).toBe('3')
    expect(antesJitomate.existencia.minus(despuesJitomate.existencia).toString()).toBe('1.25')

    const movimientos = await prisma.movimientoInventario.findMany({
      where: { tipo: 'VENTA', comentario: `Venta #${res.body.id}` },
      orderBy: { productoId: 'asc' },
    })
    expect(movimientos.map((m) => [m.productoId, m.cantidad.toString()])).toEqual(
      [
        [coca, '-3'],
        [jitomate, '-1.25'],
      ].sort((a, b) => Number(a[0]) - Number(b[0])),
    )
  })

  it('una venta rechazada no descuenta existencia (transacción)', async () => {
    const antes = await prisma.producto.findUniqueOrThrow({ where: { id: coca } })
    const res = await vender({
      renglones: [{ productoId: coca, cantidad: '1' }],
      pagos: [{ metodo: 'EFECTIVO', monto: '1' }],
    })
    expect(res.status).toBe(400)
    const despues = await prisma.producto.findUniqueOrThrow({ where: { id: coca } })
    expect(despues.existencia.toString()).toBe(antes.existencia.toString())
  })

  it('sin sesión → 401', async () => {
    expect((await request(app).post('/api/ventas').send({})).status).toBe(401)
  })
})
