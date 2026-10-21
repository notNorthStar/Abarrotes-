import { prisma } from '../../lib/prisma'
import { AppError } from '../../lib/AppError'

// Lectura de productos (T-00). Dueño del módulo: Miguel (HU-03, HU-04, HU-08).

export function buscar(sucursalId: number, q?: string) {
  const texto = q?.trim()
  return prisma.producto.findMany({
    where: {
      sucursalId,
      estado: 'ACTIVO',
      ...(texto && {
        OR: [
          { nombre: { contains: texto, mode: 'insensitive' as const } },
          { codigoBarras: { startsWith: texto } },
        ],
      }),
    },
    orderBy: { nombre: 'asc' },
    take: 50,
  })
}

/** Usado por el escaneo (HU-02). */
export async function porCodigo(sucursalId: number, codigoBarras: string) {
  const producto = await prisma.producto.findUnique({
    where: { sucursalId_codigoBarras: { sucursalId, codigoBarras } },
  })
  if (!producto || producto.estado !== 'ACTIVO') throw new AppError(404, 'Producto no encontrado')
  return producto
}
