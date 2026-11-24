import type { Prisma } from '@prisma/client'
import { prisma } from '../../lib/prisma'
import { AppError } from '../../lib/AppError'

// T-34 (Sosa): fotos de productos y logotipos de proveedores, guardados en la base de datos.

export const MAX_IMAGENES_PRODUCTO = 5

/** Para incluir en las consultas de productos: ids de sus imágenes, la principal primero. */
export const imagenesActivas = {
  where: { estado: 'ACTIVO' },
  select: { id: true },
  orderBy: [{ creadoEn: 'asc' }, { id: 'asc' }],
} satisfies Prisma.ImagenFindManyArgs

/** Tipo real según los primeros bytes: no se confía en el Content-Type. SVG no se acepta (puede llevar scripts). */
export function tipoDeImagen(datos: Buffer): string | null {
  if (datos.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'image/png'
  if (datos.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))) return 'image/jpeg'
  if (datos.toString('latin1', 0, 4) === 'RIFF' && datos.toString('latin1', 8, 12) === 'WEBP') return 'image/webp'
  return null
}

function validar(datos: unknown) {
  if (!Buffer.isBuffer(datos) || datos.length === 0) throw new AppError(400, 'Envía una imagen')
  const tipo = tipoDeImagen(datos)
  if (!tipo) throw new AppError(400, 'La imagen debe ser PNG, JPG o WebP')
  return { datos, tipo }
}

export async function leer(id: string) {
  const imagen = await prisma.imagen.findFirst({ where: { id, estado: 'ACTIVO' }, select: { tipo: true, datos: true } })
  if (!imagen) throw new AppError(404, 'Imagen no encontrada')
  return imagen
}

export async function agregarAProducto(sucursalId: number, productoId: number, cuerpo: unknown) {
  const { datos, tipo } = validar(cuerpo)
  return prisma.$transaction(async (tx) => {
    // Bloquea el producto para que dos subidas simultáneas no rebasen el máximo.
    await tx.$queryRaw`SELECT id FROM "Producto" WHERE id = ${productoId} FOR UPDATE`
    const producto = await tx.producto.findFirst({
      where: { id: productoId, sucursalId, estado: 'ACTIVO' },
      include: { imagenes: imagenesActivas },
    })
    if (!producto) throw new AppError(404, 'Producto no encontrado')
    if (producto.imagenes.length >= MAX_IMAGENES_PRODUCTO) {
      throw new AppError(409, `Cada producto puede tener hasta ${MAX_IMAGENES_PRODUCTO} imágenes`)
    }
    return tx.imagen.create({ data: { datos, tipo, productoId }, select: { id: true } })
  })
}

/** Borrado lógico, solo de un producto de la sucursal. */
export async function quitarDeProducto(sucursalId: number, productoId: number, id: string) {
  const { count } = await prisma.imagen.updateMany({
    where: { id, productoId, estado: 'ACTIVO', producto: { sucursalId } },
    data: { estado: 'ELIMINADO' },
  })
  if (count === 0) throw new AppError(404, 'Imagen no encontrada')
}

/** El logotipo nuevo reemplaza al anterior, que queda como ELIMINADO. */
export async function cambiarLogo(proveedorId: number, cuerpo: unknown) {
  const { datos, tipo } = validar(cuerpo)
  return prisma.$transaction(async (tx) => {
    if (!(await tx.proveedor.findUnique({ where: { id: proveedorId } }))) throw new AppError(404, 'Proveedor no encontrado')
    await tx.imagen.updateMany({ where: { proveedorId, estado: 'ACTIVO' }, data: { estado: 'ELIMINADO' } })
    return tx.imagen.create({ data: { datos, tipo, proveedorId }, select: { id: true } })
  })
}

export async function quitarLogo(proveedorId: number) {
  const { count } = await prisma.imagen.updateMany({
    where: { proveedorId, estado: 'ACTIVO' },
    data: { estado: 'ELIMINADO' },
  })
  if (count === 0) throw new AppError(404, 'El proveedor no tiene logotipo')
}

export async function proveedoresConLogo() {
  const lista = await prisma.proveedor.findMany({ orderBy: { nombre: 'asc' }, include: { imagenes: imagenesActivas } })
  return lista.map(({ imagenes, ...p }) => ({ ...p, logoId: imagenes[0]?.id ?? null }))
}
