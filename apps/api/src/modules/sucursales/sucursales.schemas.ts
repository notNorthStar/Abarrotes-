import { z } from 'zod'

export const crearSucursalSchema = z
  .object({
    nombre: z
      .string({ required_error: 'El nombre es obligatorio' })
      .trim()
      .min(1, 'El nombre es obligatorio')
      .max(120),
    direccion: z.string().trim().max(250).optional(),
  })
  .strict()
export const estadoSucursalSchema = z
  .object({
    estado: z.enum(['ACTIVO', 'SUSPENDIDO'], {
      errorMap: () => ({ message: 'El estado debe ser ACTIVO o SUSPENDIDO' }),
    }),
  })
  .strict()
export const listarSucursalesSchema = z.object({
  estado: z.enum(['ACTIVO', 'SUSPENDIDO']).optional(),
})
export const idSucursalSchema = z.coerce
  .number()
  .int('Id inválido')
  .positive('Id inválido')
  .max(2147483647, 'Id inválido')
export type CrearSucursal = z.infer<typeof crearSucursalSchema>
export type EstadoSucursal = z.infer<typeof estadoSucursalSchema>['estado']
