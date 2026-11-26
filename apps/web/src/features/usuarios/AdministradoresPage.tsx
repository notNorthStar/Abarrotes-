import { GestionCuentas } from './UsuariosPage'

// HU-15 (Sosa): el jefe gestiona los administradores de la sucursal elegida en la barra superior (HU-14).

export function AdministradoresPage() {
  return <GestionCuentas ruta="/administradores" singular="administrador" plural="administradores" ambito="la sucursal" />
}
