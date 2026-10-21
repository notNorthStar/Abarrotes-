import bcrypt from 'bcryptjs'
import type { Usuario } from '@prisma/client'
import { prisma } from '../../lib/prisma'
import { AppError } from '../../lib/AppError'
import { firmarToken } from '../../middleware/auth'

// T-00: login base para desbloquear al equipo.
// HU-01 (Sosa): bloquear usuarios suspendidos/eliminados y de sucursal suspendida, más pruebas.
export async function login(usuario: string, password: string) {
  const u = await prisma.usuario.findUnique({ where: { usuario } })
  const valido = u && (await bcrypt.compare(password, u.passwordHash))
  if (!u || !valido) throw new AppError(401, 'Usuario o contraseña incorrectos')

  const token = firmarToken({ id: u.id, rol: u.rol, sucursalId: u.sucursalId })
  return { token, usuario: perfil(u) }
}

export async function yo(id: number) {
  const u = await prisma.usuario.findUnique({ where: { id } })
  if (!u) throw new AppError(401, 'Sesión inválida')
  return perfil(u)
}

function perfil(u: Usuario) {
  return { id: u.id, nombre: u.nombre, usuario: u.usuario, rol: u.rol, sucursalId: u.sucursalId }
}
