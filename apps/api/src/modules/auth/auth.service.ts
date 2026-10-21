import bcrypt from 'bcryptjs'
import type { Usuario } from '@prisma/client'
import { prisma } from '../../lib/prisma'
import { AppError } from '../../lib/AppError'
import { firmarToken } from '../../middleware/auth'

const CREDENCIALES_INVALIDAS = 'Usuario o contraseña incorrectos'

// HU-01: login con usuario y contraseña; bloquea cuentas suspendidas/eliminadas y sucursales suspendidas.
export async function login(usuario: string, password: string) {
  const u = await prisma.usuario.findUnique({ where: { usuario }, include: { sucursal: true } })
  const valido = u && (await bcrypt.compare(password, u.passwordHash))
  // Una cuenta eliminada se trata como inexistente (CA3: mensaje genérico)
  if (!u || !valido || u.estado === 'ELIMINADO') throw new AppError(401, CREDENCIALES_INVALIDAS)
  if (u.estado === 'SUSPENDIDO') {
    throw new AppError(403, 'Tu cuenta está suspendida. Contacta a tu administrador.')
  }
  if (u.sucursal && u.sucursal.estado !== 'ACTIVO') {
    throw new AppError(403, 'Tu sucursal no está activa. Contacta al jefe.')
  }

  const token = firmarToken({ id: u.id, rol: u.rol, sucursalId: u.sucursalId })
  return { token, usuario: perfil(u) }
}

/** Perfil de la sesión actual. Si la cuenta se suspendió después del login, la sesión deja de ser válida. */
export async function yo(id: number) {
  const u = await prisma.usuario.findUnique({ where: { id } })
  if (!u || u.estado !== 'ACTIVO') throw new AppError(401, 'Tu sesión ya no es válida')
  return perfil(u)
}

function perfil(u: Usuario) {
  return { id: u.id, nombre: u.nombre, usuario: u.usuario, rol: u.rol, sucursalId: u.sucursalId }
}
