import type { Rol } from '@prisma/client'

export type UsuarioToken = { id: number; rol: Rol; sucursalId: number | null }

declare global {
  namespace Express {
    interface Request {
      usuario?: UsuarioToken
    }
  }
}
