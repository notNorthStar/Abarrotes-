import { z } from 'zod'

// Validación de alta de productos y entradas de existencias (HU-08). Montos y cantidades llegan como texto decimal.

const decimal = (maxDecimales: number, nombre: string) =>
  z
    .string({ required_error: `${nombre} es obligatorio`, invalid_type_error: `${nombre} debe ser texto decimal` })
    .trim()
    .regex(
      new RegExp(`^\\d+(\\.\\d{1,${maxDecimales}})?$`),
      `${nombre} debe ser un número con máximo ${maxDecimales} decimales`,
    )

export const crearProductoSchema = z.object({
  codigoBarras: z
    .string({ required_error: 'El código de barras es obligatorio' })
    .trim()
    .regex(/^[0-9A-Za-z-]{1,50}$/, 'El código de barras solo admite letras, números y guiones (máx. 50)'),
  nombre: z.string({ required_error: 'El nombre es obligatorio' }).trim().min(1, 'El nombre es obligatorio').max(120),
  precio: decimal(2, 'El precio').refine((v) => Number(v) > 0, 'El precio debe ser mayor a 0'),
  unidad: z.enum(['PIEZA', 'KILO'], { errorMap: () => ({ message: 'La unidad debe ser PIEZA o KILO' }) }),
  cantidad: decimal(3, 'La cantidad'),
})

export const entradaSchema = z.object({
  cantidad: decimal(3, 'La cantidad').refine((v) => Number(v) > 0, 'La cantidad debe ser mayor a 0'),
  comentario: z.string().trim().max(200).optional(),
})

export const idSchema = z.coerce
  .number({ invalid_type_error: 'Id inválido' })
  .int('Id inválido')
  .positive('Id inválido')

export type CrearProducto = z.infer<typeof crearProductoSchema>
export type Entrada = z.infer<typeof entradaSchema>
