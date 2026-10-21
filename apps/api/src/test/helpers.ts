import request from 'supertest'
import { app } from '../app'

/** Token de un usuario del seed (contraseña abarrotes123). */
export async function tokenDe(usuario: string): Promise<string> {
  const res = await request(app).post('/api/auth/login').send({ usuario, password: 'abarrotes123' })
  if (res.status !== 200) throw new Error(`No se pudo iniciar sesión como ${usuario}: ${res.body.error}`)
  return res.body.token
}
