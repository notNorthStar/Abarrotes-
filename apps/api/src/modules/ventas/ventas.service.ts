import type { Prisma } from '@prisma/client'
import { prisma } from '../../lib/prisma'
import { AppError } from '../../lib/AppError'
import { D, round2, sumar, subtotal, type Decimal } from '../../lib/dinero'
import type { CrearVenta } from './ventas.schemas'

// Cobro de ventas (HU-06). Dueño: Sosa.

type Db = Prisma.TransactionClient | typeof prisma

/** Turno de caja abierto del usuario (o null). Reutilizable por HU-05/HU-09. */
export function turnoAbiertoDe(usuarioId: number, tx: Db = prisma) {
  return tx.turnoCaja.findFirst({
    where: { usuarioId, cerradoEn: null },
    orderBy: { abiertoEn: 'desc' },
  })
}

/** Junta renglones repetidos del mismo producto sumando sus cantidades. */
function agruparRenglones(renglones: CrearVenta['renglones']): Map<number, Decimal> {
  const porProducto = new Map<number, Decimal>()
  for (const r of renglones) {
    porProducto.set(r.productoId, (porProducto.get(r.productoId) ?? D(0)).plus(r.cantidad))
  }
  return porProducto
}

/**
 * Valida pagos contra el total y calcula el cambio (CA4, CA5).
 * - Σ pagos < total → 400 con lo que falta.
 * - Tarjeta + transferencia no pueden exceder el total (solo el efectivo genera cambio).
 */
export function calcularCambio(total: Decimal, pagos: CrearVenta['pagos']): Decimal {
  const pagado = sumar(...pagos.map((p) => p.monto))
  if (pagado.lessThan(total)) {
    throw new AppError(400, `Pago insuficiente: faltan $${round2(total.minus(pagado)).toFixed(2)}`)
  }
  const noEfectivo = sumar(...pagos.filter((p) => p.metodo !== 'EFECTIVO').map((p) => p.monto))
  if (noEfectivo.greaterThan(total)) {
    throw new AppError(400, 'Tarjeta y transferencia no pueden exceder el total de la venta')
  }
  return round2(pagado.minus(total))
}

export async function crearVenta(usuarioId: number, sucursalId: number, datos: CrearVenta) {
  const cantidades = agruparRenglones(datos.renglones)

  const venta = await prisma.$transaction(async (tx) => {
    const turno = await turnoAbiertoDe(usuarioId, tx)
    if (!turno) throw new AppError(409, 'Abre tu caja antes de cobrar')

    // El servidor recalcula con precios de la BD (nunca confía en el cliente).
    const productos = await tx.producto.findMany({
      where: { id: { in: [...cantidades.keys()] }, sucursalId, estado: 'ACTIVO' },
    })
    if (productos.length !== cantidades.size) throw new AppError(400, 'Producto no disponible')

    const renglones = productos.map((p) => {
      const cantidad = cantidades.get(p.id)!
      if (p.unidad === 'PIEZA' && !cantidad.isInteger()) {
        throw new AppError(400, `${p.nombre} se vende por pieza: la cantidad debe ser entera`)
      }
      return { productoId: p.id, cantidad, precioUnitario: p.precio, subtotal: subtotal(cantidad, p.precio) }
    })

    const total = sumar(...renglones.map((r) => r.subtotal))
    const cambio = calcularCambio(total, datos.pagos)

    const creada = await tx.venta.create({
      data: {
        turnoId: turno.id,
        usuarioId,
        total,
        cambio,
        renglones: { create: renglones },
        pagos: {
          create: datos.pagos.map((p) => ({
            metodo: p.metodo,
            monto: round2(p.monto),
            referencia: p.metodo === 'EFECTIVO' ? null : p.referencia,
          })),
        },
      },
    })

    // CA6: descuenta existencia y deja rastro en MovimientoInventario (no bloquea si queda negativa).
    for (const r of renglones) {
      await tx.producto.update({ where: { id: r.productoId }, data: { existencia: { decrement: r.cantidad } } })
      await tx.movimientoInventario.create({
        data: {
          tipo: 'VENTA',
          cantidad: r.cantidad.negated(),
          productoId: r.productoId,
          usuarioId,
          comentario: `Venta #${creada.id}`,
        },
      })
    }

    return tx.venta.findUniqueOrThrow({
      where: { id: creada.id },
      include: {
        renglones: { include: { producto: { select: { nombre: true, unidad: true } } }, orderBy: { id: 'asc' } },
        pagos: { orderBy: { id: 'asc' } },
      },
    })
  })

  return {
    id: venta.id,
    turnoId: venta.turnoId,
    usuarioId: venta.usuarioId,
    creadoEn: venta.creadoEn,
    total: venta.total.toFixed(2),
    cambio: venta.cambio.toFixed(2),
    renglones: venta.renglones.map((r) => ({
      id: r.id,
      productoId: r.productoId,
      nombre: r.producto.nombre,
      unidad: r.producto.unidad,
      cantidad: r.cantidad.toFixed(3),
      precioUnitario: r.precioUnitario.toFixed(2),
      subtotal: r.subtotal.toFixed(2),
    })),
    pagos: venta.pagos.map((p) => ({
      id: p.id,
      metodo: p.metodo,
      monto: p.monto.toFixed(2),
      referencia: p.referencia,
    })),
  }
}
