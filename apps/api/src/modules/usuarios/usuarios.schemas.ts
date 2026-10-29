import { z } from 'zod'

const password = z.string().min(6, 'La contraseña debe tener al menos 6 caracteres')
const nombre = z.string().trim().min(1, 'El nombre es obligatorio')

export const crearUsuarioSchema = z.object({
  nombre,
  usuario: z.string().trim().min(1, 'El usuario es obligatorio'),
  password,
})

// Cualquiera de los campos; el estado ELIMINADO solo se asigna con DELETE.
export const editarUsuarioSchema = z
  .object({
    nombre: nombre.optional(),
    estado: z.enum(['ACTIVO', 'SUSPENDIDO'], { message: 'Estado inválido' }).optional(),
    password: password.optional(),
  })
  .refine((d) => d.nombre !== undefined || d.estado !== undefined || d.password !== undefined, {
    message: 'No hay cambios que guardar',
  })

export const idSchema = z.coerce.number().int().positive('Id inválido')

export type CrearUsuario = z.infer<typeof crearUsuarioSchema>
export type EditarUsuario = z.infer<typeof editarUsuarioSchema>
