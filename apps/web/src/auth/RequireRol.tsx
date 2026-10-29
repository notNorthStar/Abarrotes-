import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import type { Rol } from '../api/tipos'
import { useAuth } from './AuthContext'

// Roles jerárquicos: JEFE ⊃ ADMIN ⊃ CAJERO (igual que en la API)
const NIVEL: Record<Rol, number> = { CAJERO: 1, ADMIN: 2, JEFE: 3 }

export const tieneRol = (rol: Rol, minimo: Rol) => NIVEL[rol] >= NIVEL[minimo]

/** Protege una ruta: sin sesión → /login; rol insuficiente → inicio. */
export function RequireRol({ minimo, children }: { minimo: Rol; children: ReactNode }) {
  const { usuario, cargando } = useAuth()
  if (cargando)
    return (
      <div role="status" className="flex min-h-screen items-center justify-center bg-papel">
        <span className="sr-only">Cargando sesión</span>
        <span aria-hidden="true" className="esqueleto h-7 w-7 rounded-[7px]" />
      </div>
    )
  if (!usuario) return <Navigate to="/login" replace />
  if (!tieneRol(usuario.rol, minimo)) return <Navigate to="/" replace />
  return <>{children}</>
}
