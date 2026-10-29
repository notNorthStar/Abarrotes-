import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import type { Rol } from '@prisma/client'
import { env } from '../lib/env'
import { AppError } from '../lib/AppError'
import type { UsuarioToken } from '../types/express'

// Roles jerárquicos: JEFE ⊃ ADMIN ⊃ CAJERO
const NIVEL: Record<Rol, number> = { CAJERO: 1, ADMIN: 2, JEFE: 3 }

export function firmarToken(usuario: UsuarioToken): string {
  return jwt.sign({ rol: usuario.rol, sucursalId: usuario.sucursalId }, env.jwtSecret, {
    subject: String(usuario.id),
    expiresIn: '12h',
  })
}

function autenticar(req: Request): UsuarioToken {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) throw new AppError(401, 'Sesión requerida')
  try {
    const payload = jwt.verify(header.slice(7), env.jwtSecret) as jwt.JwtPayload
    return { id: Number(payload.sub), rol: payload.rol, sucursalId: payload.sucursalId ?? null }
  } catch {
    throw new AppError(401, 'Sesión inválida o expirada')
  }
}

/** Exige sesión y un rol mínimo. Uso: router.get('/', requireRol('ADMIN'), handler) */
export function requireRol(minimo: Rol) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const usuario = autenticar(req)
    if (NIVEL[usuario.rol] < NIVEL[minimo]) throw new AppError(403, 'No tienes permiso para esta acción')
    req.usuario = usuario
    next()
  }
}

export const tieneRol = (rol: Rol, minimo: Rol) => NIVEL[rol] >= NIVEL[minimo]

/**
 * Sucursal sobre la que opera la petición. CAJERO/ADMIN: siempre la de su token.
 * JEFE: la que mande en ?sucursalId= (selector de sucursal, HU-14).
 */
export function sucursalDe(req: Request): number {
  const usuario = req.usuario
  if (!usuario) throw new AppError(401, 'Sesión requerida')
  if (usuario.rol !== 'JEFE') return usuario.sucursalId!
  const id = Number(req.query.sucursalId)
  if (!Number.isInteger(id) || id <= 0) throw new AppError(400, 'Selecciona una sucursal')
  return id
}
