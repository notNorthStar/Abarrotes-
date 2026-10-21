import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { app } from '../../app'
import { tokenDe } from '../../test/helpers'

describe('auth (base T-00)', () => {
  it('inicia sesión con credenciales válidas y devuelve rol', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ usuario: 'cajero1', password: 'abarrotes123' })
    expect(res.status).toBe(200)
    expect(res.body.token).toBeTruthy()
    expect(res.body.usuario.rol).toBe('CAJERO')
  })

  it('rechaza contraseña incorrecta con mensaje genérico', async () => {
    const res = await request(app).post('/api/auth/login').send({ usuario: 'cajero1', password: 'mal' })
    expect(res.status).toBe(401)
    expect(res.body.error).toBe('Usuario o contraseña incorrectos')
  })

  it('/me requiere sesión', async () => {
    expect((await request(app).get('/api/auth/me')).status).toBe(401)
    const token = await tokenDe('admin.centro')
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`)
    expect(res.body.usuario).toBe('admin.centro')
  })
})
