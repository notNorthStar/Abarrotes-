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

/** Imagen guardada en la API: se muestra con urlImagen(id). */
export type ImagenRef = { id: string }

/** GET /api/logos-proveedores */
export type ProveedorLogo = { id: number; nombre: string; logoId: string | null }

export type Producto = {
  id: number
  codigoBarras: string
  nombre: string
  precio: string
  unidad: UnidadVenta
  existencia: string
  sucursalId: number
  /** La principal va primero. */
  imagenes?: ImagenRef[]
}

export type EstadoCuenta = 'ACTIVO' | 'SUSPENDIDO' | 'ELIMINADO'

/** Sucursal activa para el selector del jefe (HU-15). GET /api/administradores/sucursales */
export type Sucursal = { id: number; nombre: string }

/** Cuenta gestionada en HU-12 (cajeros, GET /api/usuarios) y HU-15 (administradores, GET /api/administradores). */
export type CuentaUsuario = {
  id: number
  nombre: string
  usuario: string
  rol: Rol
  estado: EstadoCuenta
  creadoEn: string
}
