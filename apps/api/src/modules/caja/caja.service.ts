import type { Prisma, TurnoCaja } from '@prisma/client'
import { prisma } from '../../lib/prisma'
import { AppError } from '../../lib/AppError'
import { D, round2, sumar } from '../../lib/dinero'
import { turnoAbiertoDe } from '../ventas/ventas.service'
import type { CerrarCaja, PagoProveedor } from './caja.schemas'

// Caja: abrir turno y corte (HU-05), pagos a proveedor (HU-09). Dueño: Sosa (reasignada de Gonzalo el 28 oct).

type Db = Prisma.TransactionClient | typeof prisma

async function exigirTurnoAbierto(usuarioId: number, tx: Db = prisma) {
  const turno = await turnoAbiertoDe(usuarioId, tx)
  if (!turno) throw new AppError(409, 'No tienes una caja abierta. Abre tu caja primero.')
  return turno
}

/** HU-05 CA1: una caja (turno) abierta por cajero, con su monto inicial. */
export async function abrir(usuarioId: number, sucursalId: number, montoInicial: string) {
  return prisma.$transaction(async (tx) => {
    if (await turnoAbiertoDe(usuarioId, tx)) throw new AppError(409, 'Ya tienes una caja abierta')
    return tx.turnoCaja.create({ data: { usuarioId, sucursalId, montoInicial } })
  })
}

export function actual(usuarioId: number) {
  return turnoAbiertoDe(usuarioId)
}

export function proveedores() {
  return prisma.proveedor.findMany({ orderBy: { nombre: 'asc' } })
}

/** HU-09: registra un pago a proveedor ligado al turno abierto. El proveedor se crea si no existe. */
export async function registrarPagoProveedor(usuarioId: number, datos: PagoProveedor) {
  return prisma.$transaction(async (tx) => {
    const turno = await exigirTurnoAbierto(usuarioId, tx)
    const proveedor = await tx.proveedor.upsert({
      where: { nombre: datos.proveedor },
      update: {},
      create: { nombre: datos.proveedor },
    })
    return tx.pagoProveedor.create({
      data: {
        turnoId: turno.id,
        proveedorId: proveedor.id,
        monto: datos.monto,
        metodo: datos.metodo,
        comentario: datos.comentario || null,
      },
      include: { proveedor: true },
    })
  })
}

/**
 * HU-05 CA2–CA3: totales del turno por forma de pago y efectivo esperado.
 * efectivo esperado = monto inicial + ventas en efectivo (neto de cambio) − pagos a proveedor en efectivo
 */
export async function calcularCorte(turno: TurnoCaja, tx: Db = prisma) {
  const [ventas, pagosVenta, pagosProveedor] = await Promise.all([
    tx.venta.findMany({ where: { turnoId: turno.id }, select: { total: true, cambio: true } }),
    tx.pagoVenta.findMany({
      where: { venta: { turnoId: turno.id } },
      select: { metodo: true, monto: true },
    }),
    tx.pagoProveedor.findMany({
      where: { turnoId: turno.id },
      include: { proveedor: { select: { nombre: true } } },
      orderBy: { id: 'asc' },
    }),
  ])

  const porMetodo = (metodo: string) =>
    sumar(...pagosVenta.filter((p) => p.metodo === metodo).map((p) => p.monto))
  const cambioEntregado = sumar(...ventas.map((v) => v.cambio))
  const ventasEfectivo = porMetodo('EFECTIVO').minus(cambioEntregado)
  const proveedorPor = (metodo: string) =>
    sumar(...pagosProveedor.filter((p) => p.metodo === metodo).map((p) => p.monto))
  const proveedorEfectivo = proveedorPor('EFECTIVO')

  const efectivoEsperado = round2(
    D(turno.montoInicial).plus(ventasEfectivo).minus(proveedorEfectivo),
  )

  return {
    turnoId: turno.id,
    abiertoEn: turno.abiertoEn,
    montoInicial: round2(turno.montoInicial).toFixed(2),
    numeroVentas: ventas.length,
    totalVendido: round2(sumar(...ventas.map((v) => v.total))).toFixed(2),
    ventasPorMetodo: {
      EFECTIVO: round2(ventasEfectivo).toFixed(2),
      TARJETA: round2(porMetodo('TARJETA')).toFixed(2),
      TRANSFERENCIA: round2(porMetodo('TRANSFERENCIA')).toFixed(2),
    },
    pagosProveedor: {
      EFECTIVO: round2(proveedorEfectivo).toFixed(2),
      TRANSFERENCIA: round2(proveedorPor('TRANSFERENCIA')).toFixed(2),
      detalle: pagosProveedor.map((p) => ({
        id: p.id,
        proveedor: p.proveedor.nombre,
        metodo: p.metodo,
        monto: round2(p.monto).toFixed(2),
        comentario: p.comentario,
        creadoEn: p.creadoEn,
      })),
    },
    efectivoEsperado: efectivoEsperado.toFixed(2),
  }
}

export async function corteActual(usuarioId: number) {
  return calcularCorte(await exigirTurnoAbierto(usuarioId))
}

/**
 * HU-05 CA4–CA5: cierra la caja con el efectivo contado y guarda la diferencia (+ sobrante, − faltante).
 * El comentario es obligatorio cuando hay diferencia (interpretación documentada en el backlog).
 */
export async function cerrar(usuarioId: number, datos: CerrarCaja) {
  return prisma.$transaction(async (tx) => {
    const turno = await exigirTurnoAbierto(usuarioId, tx)
    const corte = await calcularCorte(turno, tx)
    const diferencia = round2(D(datos.efectivoContado).minus(corte.efectivoEsperado))
    if (!diferencia.isZero() && !datos.comentario) {
      throw new AppError(
        400,
        'Hay una diferencia en el efectivo: explica el motivo en el comentario',
      )
    }
    const cerrado = await tx.turnoCaja.update({
      where: { id: turno.id },
      data: {
        cerradoEn: new Date(),
        efectivoEsperado: corte.efectivoEsperado,
        efectivoContado: datos.efectivoContado,
        diferencia,
        comentario: datos.comentario || null,
      },
    })
    return {
      ...corte,
      cerradoEn: cerrado.cerradoEn,
      efectivoContado: round2(datos.efectivoContado).toFixed(2),
      diferencia: diferencia.toFixed(2),
      comentario: cerrado.comentario,
    }
  })
}
