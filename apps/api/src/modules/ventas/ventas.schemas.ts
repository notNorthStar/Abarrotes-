import { z } from 'zod'

// Validación del body de POST /ventas (HU-06). Montos y cantidades llegan como texto decimal.

const decimalPositivo = (maxDecimales: number, nombre: string) =>
  z
    .string({ required_error: `${nombre} es obligatorio`, invalid_type_error: `${nombre} debe ser texto decimal` })
    .trim()
    .regex(
      new RegExp(`^\\d+(\\.\\d{1,${maxDecimales}})?$`),
      `${nombre} debe ser un número con máximo ${maxDecimales} decimales`,
    )
    .refine((v) => Number(v) > 0, `${nombre} debe ser mayor a 0`)

export const renglonSchema = z.object({
  productoId: z.number({ invalid_type_error: 'productoId inválido' }).int().positive('productoId inválido'),
  cantidad: decimalPositivo(3, 'La cantidad'),
})

export const pagoSchema = z
  .object({
    metodo: z.enum(['EFECTIVO', 'TARJETA', 'TRANSFERENCIA'], {
      errorMap: () => ({ message: 'Método de pago inválido' }),
    }),
    monto: decimalPositivo(2, 'El monto'),
    referencia: z.string().trim().optional(),
  })
  .refine((p) => p.metodo === 'EFECTIVO' || (p.referencia !== undefined && p.referencia.length > 0), {
    message: 'El número de referencia es obligatorio para tarjeta y transferencia',
  })

export const crearVentaSchema = z.object({
  renglones: z.array(renglonSchema).min(1, 'La venta debe tener al menos un producto'),
  pagos: z.array(pagoSchema).min(1, 'Registra al menos un pago'),
})

export type CrearVenta = z.infer<typeof crearVentaSchema>
