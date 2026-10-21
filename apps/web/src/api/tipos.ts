// Tipos que devuelve la API. Los Decimal llegan como string: no convertir a number para sumar dinero.

export type Rol = 'CAJERO' | 'ADMIN' | 'JEFE'
export type UnidadVenta = 'PIEZA' | 'KILO'

export type Usuario = {
  id: number
  nombre: string
  usuario: string
  rol: Rol
  sucursalId: number | null
}

export type Producto = {
  id: number
  codigoBarras: string
  nombre: string
  precio: string
  unidad: UnidadVenta
  existencia: string
  sucursalId: number
}
