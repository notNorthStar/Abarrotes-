import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import type { Rol } from '@prisma/client'
import { env } from '../lib/env'
import { AppError } from '../lib/AppError'
import { prisma } from '../lib/prisma'
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

/** Exige sesión y rol mínimo. false omite solo la selección del jefe en rutas globales;
 * el bloqueo de los usuarios de sucursales inactivas se verifica siempre. */
export function requireRol(minimo: Rol, validarSucursalElegida = true) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    const usuario = autenticar(req)
    if (NIVEL[usuario.rol] < NIVEL[minimo])
      throw new AppError(403, 'No tienes permiso para esta acción')
    // HU-14 CA4: la sucursal que indica el jefe debe existir.
    if (validarSucursalElegida && usuario.rol === 'JEFE' && req.query.sucursalId !== undefined) {
      const id = Number(req.query.sucursalId)
      const valido = Number.isInteger(id) && id > 0 && id <= 2147483647
      const sucursal =
        valido &&
        (await prisma.sucursal.findFirst({
          where: { id, estado: { not: 'ELIMINADO' } },
          select: { id: true },
        }))
      if (!sucursal) throw new AppError(404, 'Sucursal no encontrada')
    }
    // Consultar el estado actual impide usar un JWT emitido antes de una suspensión:
    // la de la cuenta (HU-12, HU-15) o la de su sucursal (HU-16).
    const cuenta = await prisma.usuario.findUnique({
      where: { id: usuario.id },
      select: { estado: true, sucursal: { select: { estado: true } } },
    })
    if (!cuenta || cuenta.estado !== 'ACTIVO') {
      throw new AppError(401, 'Tu cuenta ya no está activa. Inicia sesión de nuevo.')
    }
    if (usuario.sucursalId !== null && cuenta.sucursal?.estado !== 'ACTIVO') {
      throw new AppError(403, 'Tu sucursal no está activa. Contacta al jefe.')
    }
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
