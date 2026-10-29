// Aritmética de dinero y cantidades con Decimal. Nunca usar number para sumar dinero.
import { Prisma } from '@prisma/client'

export type Decimal = Prisma.Decimal
export type ValorDecimal = Prisma.Decimal.Value

export const D = (v: ValorDecimal): Decimal => new Prisma.Decimal(v)

/** Redondeo half-up a 2 decimales (dinero). */
export const round2 = (v: ValorDecimal): Decimal =>
  D(v).toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP)

/** Redondeo half-up a 3 decimales (cantidades a granel, kg). */
export const round3 = (v: ValorDecimal): Decimal =>
  D(v).toDecimalPlaces(3, Prisma.Decimal.ROUND_HALF_UP)

export const sumar = (...valores: ValorDecimal[]): Decimal =>
  valores.reduce<Decimal>((acc, v) => acc.plus(v), D(0))

/** cantidad × precio, redondeado a centavos. */
export const subtotal = (cantidad: ValorDecimal, precio: ValorDecimal): Decimal =>
  round2(D(cantidad).times(precio))
