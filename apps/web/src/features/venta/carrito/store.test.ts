import { beforeEach, describe, expect, it } from 'vitest'
import type { Producto } from '../../../api/tipos'
import { useCarrito } from './store'

const pieza: Producto = {
  id: 1,
  codigoBarras: '7501000000011',
  nombre: 'Coca-Cola',
  precio: '18.50',
  existencia: '50',
  sucursalId: 1,
  unidad: 'PIEZA',
}
const kilo: Producto = { ...pieza, id: 2, nombre: 'Jitomate', unidad: 'KILO', precio: '28.90' }

describe('HU-02 · carrito por código y edición de la cuenta', () => {
  beforeEach(() => useCarrito.getState().vaciar())
  it('agrega una pieza y suma cantidad al escanear de nuevo el mismo producto', () => {
    const carrito = useCarrito.getState()
    carrito.agregarProducto(pieza)
    carrito.agregarProducto(pieza)
    expect(useCarrito.getState().renglones).toHaveLength(1)
    expect(useCarrito.getState().renglones[0]).toMatchObject({ cantidad: '2', subtotal: '37.00' })
    expect(carrito.total()).toBe('37.00')
  })
  it('actualiza cantidades, subtotal y total de una cuenta con piezas y granel', () => {
    const carrito = useCarrito.getState()
    carrito.agregarProducto(pieza)
    carrito.agregarProducto(kilo, '0.750')
    expect(carrito.total()).toBe('40.18')
    carrito.cambiarCantidad(pieza.id, '3')
    carrito.cambiarCantidad(kilo.id, '0.500')
    expect(carrito.total()).toBe('69.95')
    expect(useCarrito.getState().renglones[1].subtotal).toBe('14.45')
  })
  it.each(['0', '-1', '1.5', '', 'NaN', '1e2'])(
    'rechaza cantidad inválida de piezas %j sin modificar la cuenta',
    (cantidad) => {
      const carrito = useCarrito.getState()
      carrito.agregarProducto(pieza)
      expect(() => carrito.cambiarCantidad(pieza.id, cantidad)).toThrow()
      expect(carrito.total()).toBe('18.50')
      expect(() => carrito.agregarProducto(pieza, cantidad)).toThrow()
      expect(useCarrito.getState().renglones[0].cantidad).toBe('1')
    },
  )
  it('rechaza peso con más de 3 decimales al editar y conserva el subtotal', () => {
    const carrito = useCarrito.getState()
    carrito.agregarProducto(kilo, '0.750')
    expect(() => carrito.cambiarCantidad(kilo.id, '0.0001')).toThrow()
    expect(carrito.total()).toBe('21.68')
  })
  it('quita solo el renglón elegido y recalcula hasta vaciar la cuenta', () => {
    const carrito = useCarrito.getState()
    carrito.agregarProducto(pieza)
    carrito.agregarProducto(kilo, '0.750')
    carrito.quitar(pieza.id)
    expect(carrito.total()).toBe('21.68')
    carrito.quitar(kilo.id)
    expect(useCarrito.getState().renglones).toEqual([])
    expect(carrito.total()).toBe('0.00')
  })
})
