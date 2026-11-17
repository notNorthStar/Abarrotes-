import { prisma } from '../../lib/prisma'
import { normalizarFechaVisita, type CrearVisita } from './proveedores.schemas'

// Visitas de proveedores (HU-07). Dueño: Gonzalo.

export type VisitaProveedorRespuesta = {
  id: number
  proveedorId: number
  proveedor: string
  sucursalId: number
  fecha: Date
  nota: string | null
}

/** Catálogo de proveedores registrados para autocompletar en formularios. */
export function listarProveedores() {
  return prisma.proveedor.findMany({ orderBy: { nombre: 'asc' } })
}

/**
 * HU-07 CA2–CA3: lista las visitas de proveedores de la sucursal del usuario,
 * ordenadas por fecha ascendente y nombre del proveedor.
 */
export async function listarVisitas(
  sucursalId: number,
  q?: string,
): Promise<VisitaProveedorRespuesta[]> {
  const texto = q?.trim()
  const visitas = await prisma.visitaProveedor.findMany({
    where: {
      sucursalId,
      ...(texto
        ? {
            proveedor: {
              nombre: { contains: texto, mode: 'insensitive' },
            },
          }
        : {}),
    },
    include: {
      proveedor: { select: { nombre: true } },
    },
    orderBy: [{ fecha: 'asc' }, { proveedor: { nombre: 'asc' } }, { id: 'asc' }],
  })

  return visitas.map((v) => ({
    id: v.id,
    proveedorId: v.proveedorId,
    proveedor: v.proveedor.nombre,
    sucursalId: v.sucursalId,
    fecha: v.fecha,
    nota: v.nota,
  }))
}

/**
 * HU-07 CA1 y CA3: el administrador registra una visita de proveedor en su sucursal
 * con proveedor, fecha y nota opcional. Si el proveedor no existe en el catálogo, se crea.
 */
export async function registrarVisita(
  sucursalId: number,
  datos: CrearVisita,
): Promise<VisitaProveedorRespuesta> {
  return prisma.$transaction(async (tx) => {
    const proveedor = await tx.proveedor.upsert({
      where: { nombre: datos.proveedor },
      update: {},
      create: { nombre: datos.proveedor },
    })

    const visita = await tx.visitaProveedor.create({
      data: {
        proveedorId: proveedor.id,
        sucursalId,
        fecha: normalizarFechaVisita(datos.fecha),
        nota: datos.nota || null,
      },
      include: {
        proveedor: { select: { nombre: true } },
      },
    })

    return {
      id: visita.id,
      proveedorId: visita.proveedorId,
      proveedor: visita.proveedor.nombre,
      sucursalId: visita.sucursalId,
      fecha: visita.fecha,
      nota: visita.nota,
    }
  })
}
