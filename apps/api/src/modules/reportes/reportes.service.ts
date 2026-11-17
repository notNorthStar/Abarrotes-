import { Prisma } from '@prisma/client'
import { prisma } from '../../lib/prisma'
import { AppError } from '../../lib/AppError'
import { D } from '../../lib/dinero'

const zona = 'America/Mexico_City'
const formato = new Intl.DateTimeFormat('en-CA', {
  timeZone: zona,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})
export function fechaMexico(fecha = new Date()) {
  const partes = formato.formatToParts(fecha)
  const parte = (tipo: Intl.DateTimeFormatPartTypes) => partes.find((p) => p.type === tipo)!.value
  return `${parte('year')}-${parte('month')}-${parte('day')}`
}

/** Convierte medianoche civil de México a UTC, incluyendo las reglas históricas de la zona. */
function medianocheMexico(dia: string) {
  const base = new Date(`${dia}T00:00:00Z`).getTime()
  const reloj = new Intl.DateTimeFormat('en-CA', {
    timeZone: zona,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  })
  let utc = base
  for (let intento = 0; intento < 3; intento++) {
    const partes = reloj.formatToParts(new Date(utc))
    const p = (tipo: Intl.DateTimeFormatPartTypes) =>
      Number(partes.find((v) => v.type === tipo)!.value)
    const local = Date.UTC(p('year'), p('month') - 1, p('day'), p('hour'), p('minute'), p('second'))
    utc += base - local
  }
  return new Date(utc)
}

export function semanaDesde(fecha = fechaMexico()) {
  const lunes = new Date(`${fecha}T12:00:00Z`)
  lunes.setUTCDate(lunes.getUTCDate() - ((lunes.getUTCDay() + 6) % 7))
  const domingo = new Date(lunes)
  domingo.setUTCDate(domingo.getUTCDate() + 6)
  const siguiente = new Date(lunes)
  siguiente.setUTCDate(siguiente.getUTCDate() + 7)
  const inicio = lunes.toISOString().slice(0, 10)
  const fin = domingo.toISOString().slice(0, 10)
  return {
    inicio,
    fin,
    desde: medianocheMexico(inicio),
    hasta: medianocheMexico(siguiente.toISOString().slice(0, 10)),
  }
}

const actor = { id: true, nombre: true, usuario: true } as const
const producto = { id: true, nombre: true, codigoBarras: true, unidad: true } as const
const metodos = ['EFECTIVO', 'TARJETA', 'TRANSFERENCIA'] as const
const pagosCero = () => ({ EFECTIVO: D(0), TARJETA: D(0), TRANSFERENCIA: D(0) })
const textoPagos = (pagos: ReturnType<typeof pagosCero>) => ({
  EFECTIVO: pagos.EFECTIVO.toFixed(2),
  TARJETA: pagos.TARJETA.toFixed(2),
  TRANSFERENCIA: pagos.TRANSFERENCIA.toFixed(2),
})

/** Una sola instantánea: el PDF y la tabla comparten exactamente los mismos cálculos. */
export async function semanal(sucursalId: number, fecha?: string) {
  const semana = semanaDesde(fecha)
  const creadoEn = { gte: semana.desde, lt: semana.hasta }
  return prisma.$transaction(
    async (tx) => {
      const sucursal = await tx.sucursal.findUnique({
        where: { id: sucursalId },
        select: { id: true, nombre: true },
      })
      if (!sucursal) throw new AppError(404, 'Sucursal no encontrada')
      const [ventas, pagos, movimientos] = await Promise.all([
        tx.venta.findMany({
          where: { creadoEn, turno: { sucursalId } },
          include: { usuario: { select: actor }, pagos: true },
          orderBy: [{ creadoEn: 'asc' }, { id: 'asc' }],
        }),
        tx.pagoProveedor.findMany({
          where: { creadoEn, turno: { sucursalId } },
          include: {
            proveedor: { select: { nombre: true } },
            turno: { select: { usuario: { select: actor } } },
          },
          orderBy: [{ creadoEn: 'asc' }, { id: 'asc' }],
        }),
        tx.movimientoInventario.findMany({
          where: { creadoEn, tipo: { in: ['ALTA', 'ENTRADA', 'MERMA'] }, producto: { sucursalId } },
          include: { usuario: { select: actor }, producto: { select: producto } },
          orderBy: [{ creadoEn: 'asc' }, { id: 'asc' }],
        }),
      ])
      const ingresos = pagosCero()
      const detalleVentas = ventas.map((venta) => {
        const recibidos = pagosCero()
        for (const pago of venta.pagos)
          recibidos[pago.metodo] = recibidos[pago.metodo].plus(pago.monto)
        recibidos.EFECTIVO = recibidos.EFECTIVO.minus(venta.cambio)
        for (const metodo of metodos) ingresos[metodo] = ingresos[metodo].plus(recibidos[metodo])
        return {
          id: venta.id,
          fecha: venta.creadoEn.toISOString(),
          usuario: venta.usuario,
          total: venta.total.toFixed(2),
          pagos: textoPagos(recibidos),
        }
      })
      const detalleMovimiento = (mov: (typeof movimientos)[number]) => ({
        id: mov.id,
        fecha: mov.creadoEn.toISOString(),
        tipo: mov.tipo,
        producto: mov.producto,
        cantidad: mov.cantidad.abs().toString(),
        motivo: mov.motivo,
        comentario: mov.comentario,
        usuario: mov.usuario,
      })
      return {
        sucursal,
        semana: { inicio: semana.inicio, fin: semana.fin },
        ingresos: {
          ...textoPagos(ingresos),
          total: ingresos.EFECTIVO.plus(ingresos.TARJETA).plus(ingresos.TRANSFERENCIA).toFixed(2),
        },
        ventas: detalleVentas,
        pagosProveedor: pagos.map((pago) => ({
          id: pago.id,
          fecha: pago.creadoEn.toISOString(),
          proveedor: pago.proveedor.nombre,
          metodo: pago.metodo,
          monto: pago.monto.toFixed(2),
          comentario: pago.comentario,
          usuario: pago.turno.usuario,
        })),
        productosAgregados: movimientos
          .filter((m) => m.tipo === 'ALTA' || m.tipo === 'ENTRADA')
          .map(detalleMovimiento),
        mermas: movimientos.filter((m) => m.tipo === 'MERMA').map(detalleMovimiento),
      }
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead },
  )
}

export type ReporteSemanal = Awaited<ReturnType<typeof semanal>>
