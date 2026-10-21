// Contrato del carrito (venta en curso). Dueño: Gonzalo (HU-02).
// Miguel (HU-03) agrega productos a granel con agregarProducto(p, peso).
// Sosa (HU-06) lee renglones y total() para cobrar.
// Los montos son string con Decimal; el servidor recalcula todo al confirmar la venta.
import Decimal from 'decimal.js'
import { create } from 'zustand'
import type { Producto, UnidadVenta } from '../../../api/tipos'

export type Renglon = {
  productoId: number
  nombre: string
  unidad: UnidadVenta
  precio: string
  cantidad: string
  subtotal: string
}

type Carrito = {
  renglones: Renglon[]
  /** Agrega o, si ya está, suma la cantidad (HU-02 CA2). */
  agregarProducto: (p: Producto, cantidad?: string) => void
  cambiarCantidad: (productoId: number, cantidad: string) => void
  quitar: (productoId: number) => void
  vaciar: () => void
  total: () => string
}

const calcularSubtotal = (cantidad: string, precio: string) =>
  new Decimal(cantidad).times(precio).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toFixed(2)

export const useCarrito = create<Carrito>((set, get) => ({
  renglones: [],

  agregarProducto: (p, cantidad = '1') =>
    set(({ renglones }) => {
      const existente = renglones.find((r) => r.productoId === p.id)
      if (existente) {
        const nueva = new Decimal(existente.cantidad).plus(cantidad).toString()
        return {
          renglones: renglones.map((r) =>
            r.productoId === p.id ? { ...r, cantidad: nueva, subtotal: calcularSubtotal(nueva, r.precio) } : r,
          ),
        }
      }
      const renglon: Renglon = {
        productoId: p.id,
        nombre: p.nombre,
        unidad: p.unidad,
        precio: p.precio,
        cantidad,
        subtotal: calcularSubtotal(cantidad, p.precio),
      }
      return { renglones: [...renglones, renglon] }
    }),

  cambiarCantidad: (productoId, cantidad) =>
    set(({ renglones }) => ({
      renglones: renglones.map((r) =>
        r.productoId === productoId ? { ...r, cantidad, subtotal: calcularSubtotal(cantidad, r.precio) } : r,
      ),
    })),

  quitar: (productoId) => set(({ renglones }) => ({ renglones: renglones.filter((r) => r.productoId !== productoId) })),

  vaciar: () => set({ renglones: [] }),

  total: () =>
    get()
      .renglones.reduce((acc, r) => acc.plus(r.subtotal), new Decimal(0))
      .toFixed(2),
}))
