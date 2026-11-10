import { z } from 'zod'

// Validación de visitas de proveedores (HU-07). Dueño: Gonzalo.

const FECHA_ISO = /^(\d{4})-(\d{2})-(\d{2})(?:T.*)?$/

export function esFechaValida(valor: string): boolean {
  const match = FECHA_ISO.exec(valor)
  if (!match) return false
  const anio = Number(match[1])
  const mes = Number(match[2])
  const dia = Number(match[3])
  if (mes < 1 || mes > 12 || dia < 1 || dia > 31) return false
  const fecha = new Date(Date.UTC(anio, mes - 1, dia, 12, 0, 0))
  return (
    !Number.isNaN(fecha.getTime()) &&
    fecha.getUTCFullYear() === anio &&
    fecha.getUTCMonth() === mes - 1 &&
    fecha.getUTCDate() === dia
  )
}

export function normalizarFechaVisita(valor: string): Date {
  const match = FECHA_ISO.exec(valor)!
  const anio = Number(match[1])
  const mes = Number(match[2])
  const dia = Number(match[3])
  // Se guarda a las 12:00 UTC para conservar el mismo día calendario en huso horario de México.
  return new Date(Date.UTC(anio, mes - 1, dia, 12, 0, 0))
}

export const crearVisitaSchema = z.object({
  proveedor: z
    .string({
      required_error: 'El proveedor es obligatorio',
      invalid_type_error: 'El proveedor es obligatorio',
    })
    .trim()
    .min(1, 'El proveedor es obligatorio')
    .max(80, 'El proveedor no puede exceder 80 caracteres'),
  fecha: z
    .string({
      required_error: 'La fecha es obligatoria',
      invalid_type_error: 'La fecha es obligatoria',
    })
    .trim()
    .min(1, 'La fecha es obligatoria')
    .refine(esFechaValida, 'La fecha debe tener formato válido (AAAA-MM-DD)'),
  nota: z
    .string({ invalid_type_error: 'La nota debe ser texto' })
    .trim()
    .max(200, 'La nota no puede exceder 200 caracteres')
    .optional(),
})

export type CrearVisita = z.infer<typeof crearVisitaSchema>
