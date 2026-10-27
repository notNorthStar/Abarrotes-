import { Prisma, type UnidadVenta } from '@prisma/client'
import { prisma } from '../../lib/prisma'
import { AppError } from '../../lib/AppError'
import { D } from '../../lib/dinero'
import type { CrearProducto, Entrada } from './productos.schemas'

// Lectura (T-00, HU-03/HU-04: Miguel) y alta/entradas (HU-08: Sosa).

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

/** Usado por el escaneo (HU-02) y por la entrada de existencias (HU-08). */
export async function porCodigo(sucursalId: number, codigoBarras: string) {
  const producto = await prisma.producto.findUnique({
    where: { sucursalId_codigoBarras: { sucursalId, codigoBarras } },
  })
  if (!producto || producto.estado !== 'ACTIVO') throw new AppError(404, 'Producto no encontrado')
  return producto
}

/** Por pieza solo se aceptan cantidades enteras; por kilo, hasta 3 decimales (ya validado por Zod). */
function validarCantidad(unidad: UnidadVenta, cantidad: string) {
  if (unidad === 'PIEZA' && !D(cantidad).isInteger()) {
    throw new AppError(400, 'Los productos por pieza solo aceptan cantidades enteras')
  }
}

/** HU-08 CA1, CA3, CA5: alta de producto nuevo con su existencia inicial y registro de quién lo dio de alta. */
export async function crear(sucursalId: number, usuarioId: number, datos: CrearProducto) {
  validarCantidad(datos.unidad, datos.cantidad)
  try {
    return await prisma.producto.create({
      data: {
        codigoBarras: datos.codigoBarras,
        nombre: datos.nombre,
        precio: datos.precio,
        unidad: datos.unidad,
        existencia: datos.cantidad,
        sucursalId,
        movimientos: { create: { tipo: 'ALTA', cantidad: datos.cantidad, usuarioId } },
      },
    })
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      throw new AppError(409, 'Ya existe un producto con ese código de barras en esta sucursal')
    }
    throw e
  }
}

/** HU-08 CA2, CA5: suma existencias a un producto de la sucursal y registra la entrada. */
export async function registrarEntrada(sucursalId: number, usuarioId: number, productoId: number, datos: Entrada) {
  return prisma.$transaction(async (tx) => {
    const producto = await tx.producto.findFirst({ where: { id: productoId, sucursalId, estado: 'ACTIVO' } })
    if (!producto) throw new AppError(404, 'Producto no encontrado')
    validarCantidad(producto.unidad, datos.cantidad)

    await tx.movimientoInventario.create({
      data: { tipo: 'ENTRADA', cantidad: datos.cantidad, comentario: datos.comentario, productoId, usuarioId },
    })
    return tx.producto.update({
      where: { id: productoId },
      data: { existencia: { increment: datos.cantidad } },
    })
  })
}
