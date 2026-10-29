import { z } from 'zod'

// Validación de caja: abrir (HU-05), pagos a proveedor (HU-09) y cierre (HU-05). Montos como texto decimal.

const monto = (nombre: string) =>
  z
    .string({
      required_error: `${nombre} es obligatorio`,
      invalid_type_error: `${nombre} debe ser texto decimal`,
    })
    .trim()
    .regex(/^\d+(\.\d{1,2})?$/, `${nombre} debe ser un número con máximo 2 decimales`)

export const abrirCajaSchema = z.object({
  montoInicial: monto('El monto inicial'),
})

export const pagoProveedorSchema = z.object({
  proveedor: z
    .string({ required_error: 'El proveedor es obligatorio' })
    .trim()
    .min(1, 'El proveedor es obligatorio')
    .max(80),
  monto: monto('El monto').refine((v) => Number(v) > 0, 'El monto debe ser mayor a 0'),
  // Al proveedor se le paga en efectivo (sale de la caja) o por transferencia (solo se registra).
  metodo: z.enum(['EFECTIVO', 'TRANSFERENCIA'], {
    errorMap: () => ({ message: 'La forma de pago debe ser efectivo o transferencia' }),
  }),
  comentario: z.string().trim().max(200).optional(),
})

export const cerrarCajaSchema = z.object({
  efectivoContado: monto('El efectivo contado'),
  comentario: z.string().trim().max(300).optional(),
})

export type PagoProveedor = z.infer<typeof pagoProveedorSchema>
export type CerrarCaja = z.infer<typeof cerrarCajaSchema>
