import { z } from 'zod'

const fechaValida = (v: string) => {
  const anio = Number(v.slice(0, 4))
  if (anio < 1000 || anio > 9998) return false
  const fecha = new Date(`${v}T12:00:00Z`)
  return Number.isFinite(fecha.getTime()) && fecha.toISOString().slice(0, 10) === v
}

export const reporteSchema = z.object({
  fecha: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'La fecha debe tener formato AAAA-MM-DD')
    .refine(fechaValida, 'La fecha no es válida')
    .optional(),
})
