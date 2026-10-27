import bcrypt from 'bcryptjs'
import { Prisma, type Rol } from '@prisma/client'
import { prisma } from '../../lib/prisma'
import { AppError } from '../../lib/AppError'
import type { CrearUsuario, EditarUsuario } from './usuarios.schemas'

// HU-12 (Sosa): gestión de cuentas de cajero.
// Reutilizable: cada función recibe el rol objetivo, así HU-15 (jefe gestiona admins) usa 'ADMIN'.

const COSTO_BCRYPT = 10

/** Campos públicos: nunca se expone passwordHash. */
const publico = {
  id: true,
  nombre: true,
  usuario: true,
  rol: true,
  estado: true,
  creadoEn: true,
} satisfies Prisma.UsuarioSelect

const nombreRol: Record<Rol, string> = { CAJERO: 'Cajero', ADMIN: 'Administrador', JEFE: 'Jefe' }

export function listar(sucursalId: number, rol: Rol) {
  return prisma.usuario.findMany({
    where: { sucursalId, rol, estado: { not: 'ELIMINADO' } },
    select: publico,
    orderBy: { nombre: 'asc' },
  })
}

export async function crear(sucursalId: number, rol: Rol, datos: CrearUsuario) {
  const passwordHash = await bcrypt.hash(datos.password, COSTO_BCRYPT)
  try {
    return await prisma.usuario.create({
      data: { nombre: datos.nombre, usuario: datos.usuario, passwordHash, rol, sucursalId },
      select: publico,
    })
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      throw new AppError(409, 'Ese nombre de usuario ya existe')
    }
    throw e
  }
}

export async function editar(sucursalId: number, rol: Rol, id: number, cambios: EditarUsuario) {
  await buscarGestionable(sucursalId, rol, id)
  return prisma.usuario.update({
    where: { id },
    data: {
      nombre: cambios.nombre,
      estado: cambios.estado,
      ...(cambios.password !== undefined && {
        passwordHash: await bcrypt.hash(cambios.password, COSTO_BCRYPT),
      }),
    },
    select: publico,
  })
}

/** Borrado lógico (CA3): conserva ventas, turnos y movimientos ligados al usuario. */
export async function eliminar(sucursalId: number, rol: Rol, id: number) {
  await buscarGestionable(sucursalId, rol, id)
  await prisma.usuario.update({ where: { id }, data: { estado: 'ELIMINADO' } })
}

/** Solo usuarios del rol objetivo, de la sucursal indicada y no eliminados (CA3, CA4). */
async function buscarGestionable(sucursalId: number, rol: Rol, id: number) {
  const u = await prisma.usuario.findFirst({
    where: { id, sucursalId, rol, estado: { not: 'ELIMINADO' } },
    select: { id: true },
  })
  if (!u) throw new AppError(404, `${nombreRol[rol]} no encontrado`)
  return u
}
