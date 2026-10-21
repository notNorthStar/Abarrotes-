import type { Rol } from './api/tipos'

/** A dónde va cada rol al iniciar sesión (HU-01 CA2). */
export const rutaInicial = (rol: Rol) => (rol === 'CAJERO' ? '/venta' : '/inventario')
