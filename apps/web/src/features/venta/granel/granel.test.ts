import { beforeEach, describe, expect, it } from 'vitest'
import { cantidadValida, precioGranel } from './calculosGranel'
import { useCarrito } from '../carrito/store'
import type { Producto } from '../../../api/tipos'

describe('HU-03 · captura manual y cálculo de granel', () => {
  it('convierte gramos a kilos sin perder precisión', () => {
    expect(cantidadValida('750', 'KILO', 'g')).toBe('0.750')
    expect(cantidadValida('1', 'KILO', 'g')).toBe('0.001')
    expect(cantidadValida('1250', 'KILO', 'g')).toBe('1.250')
  })
  it('acepta hasta 3 decimales y separador decimal español', () => {
    expect(cantidadValida(' 0,750 ', 'KILO')).toBe('0.750')
    expect(cantidadValida('1', 'KILO')).toBe('1.000')
  })
  it.each(['', ' ', '0', '-1', 'texto', 'NaN', 'Infinity', '1e3', '0.0001', '0.7500'])(
    'rechaza el peso inválido %j',
    (peso) => {
      expect(() => cantidadValida(peso, 'KILO')).toThrow()
    },
  )
  it('rechaza fracciones de gramo que exceden la precisión en kilos', () => {
    expect(() => cantidadValida('750.5', 'KILO', 'g')).toThrow(/gramos enteros/)
  })
  it('por pieza solo acepta enteros positivos', () => {
    expect(cantidadValida('3', 'PIEZA')).toBe('3')
    expect(() => cantidadValida('0.5', 'PIEZA')).toThrow(/enteras/)
  })
  it('redondea half-up a dos decimales en casos límite', () => {
    expect(precioGranel('0.750', '28.90')).toBe('21.68')
    expect(precioGranel('0.500', '1.01')).toBe('0.51')
    expect(precioGranel('0.100', '0.10')).toBe('0.01')
  })
})

describe('HU-03 · integración con el contrato del carrito compartido', () => {
  const producto: Producto = {
    id: 7,
    nombre: 'Jitomate',
    codigoBarras: '2007',
    precio: '28.90',
    unidad: 'KILO',
    existencia: '20',
    sucursalId: 1,
  }
  beforeEach(() => useCarrito.getState().vaciar())
  it('integra peso convertido y acumula el mismo producto recalculando su subtotal', () => {
    const carrito = useCarrito.getState()
    carrito.agregarProducto(producto, cantidadValida('750', 'KILO', 'g'))
    expect(useCarrito.getState().renglones[0]).toMatchObject({
      cantidad: '0.750',
      subtotal: '21.68',
      precio: '28.90',
      unidad: 'KILO',
    })
    carrito.agregarProducto(producto, cantidadValida('250', 'KILO', 'g'))
    expect(useCarrito.getState().renglones).toHaveLength(1)
    expect(useCarrito.getState().renglones[0].cantidad).toBe('1')
    expect(useCarrito.getState().total()).toBe('28.90')
  })
  it('comparte una cuenta con productos por pieza', () => {
    const carrito = useCarrito.getState()
    carrito.agregarProducto(producto, cantidadValida('0.750', 'KILO'))
    carrito.agregarProducto(
      { ...producto, id: 8, nombre: 'Agua', unidad: 'PIEZA', precio: '12.00' },
      cantidadValida('2', 'PIEZA'),
    )
    expect(useCarrito.getState().total()).toBe('45.68')
  })
})
