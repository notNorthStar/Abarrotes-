import Decimal from 'decimal.js'
import type { UnidadVenta } from '../../../api/tipos'

export type UnidadPeso = 'kg' | 'g'

/** Conserva cantidades y dinero como texto decimal, sin pasar por flotantes. */
export function cantidadValida(
  texto: string,
  unidad: UnidadVenta,
  captura: UnidadPeso = 'kg',
): string {
  const valor = texto.trim().replace(',', '.')
  if (!/^\d+(\.\d+)?$/.test(valor)) throw new Error('Escribe una cantidad numérica válida.')
  const numero = new Decimal(valor)
  if (!numero.greaterThan(0)) throw new Error('La cantidad debe ser mayor a cero.')
  if (unidad === 'PIEZA') {
    if (!numero.isInteger())
      throw new Error('Los productos por pieza solo aceptan cantidades enteras.')
    return numero.toFixed(0)
  }
  if (captura === 'kg' && (valor.split('.')[1]?.length ?? 0) > 3) {
    throw new Error('El peso en kilos acepta hasta 3 decimales.')
  }
  const kilos = captura === 'g' ? numero.dividedBy(1000) : numero
  if (kilos.decimalPlaces() > 3)
    throw new Error('Captura gramos enteros; el peso en kilos acepta hasta 3 decimales.')
  return kilos.toFixed(3)
}

export function precioGranel(kilos: string, precioPorKilo: string): string {
  return new Decimal(kilos)
    .times(precioPorKilo)
    .toDecimalPlaces(2, Decimal.ROUND_HALF_UP)
    .toFixed(2)
}
