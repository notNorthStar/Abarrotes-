import type { Rol } from './api/tipos'

/** A dónde va cada rol al iniciar sesión (HU-01 CA2): el cajero directo a cobrar; admin y jefe al panel de Inicio. */
export const rutaInicial = (rol: Rol) => (rol === 'CAJERO' ? '/venta' : '/')
