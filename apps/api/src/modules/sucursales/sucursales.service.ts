import { prisma } from '../../lib/prisma'
import { AppError } from '../../lib/AppError'
import type { CrearSucursal, EstadoSucursal } from './sucursales.schemas'

// HU-16: solo se modifica la sucursal; no se borran ni alteran sus datos relacionados.
export function listar(estado?: EstadoSucursal) {
  return prisma.sucursal.findMany({
    where: { estado: estado ?? { not: 'ELIMINADO' } },
    orderBy: [{ nombre: 'asc' }, { id: 'asc' }],
  })
}
export function crear(datos: CrearSucursal) {
  return prisma.sucursal.create({
    data: { nombre: datos.nombre, direccion: datos.direccion || null },
  })
}
export async function cambiarEstado(id: number, estado: EstadoSucursal) {
  return prisma.$transaction(async (tx) => {
    const resultado = await tx.sucursal.updateMany({
      where: { id, estado: { not: 'ELIMINADO' } },
      data: { estado },
    })
    if (!resultado.count) throw new AppError(404, 'Sucursal no encontrada')
    return tx.sucursal.findUniqueOrThrow({ where: { id } })
  })
}
export async function eliminar(id: number) {
  const resultado = await prisma.sucursal.updateMany({
    where: { id, estado: { not: 'ELIMINADO' } },
    data: { estado: 'ELIMINADO' },
  })
  if (!resultado.count) throw new AppError(404, 'Sucursal no encontrada')
}
