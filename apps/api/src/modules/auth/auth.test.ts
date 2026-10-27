import bcrypt from 'bcryptjs'
import request from 'supertest'
import { beforeAll, describe, expect, it } from 'vitest'
import { app } from '../../app'
import { prisma } from '../../lib/prisma'
import { tokenDe } from '../../test/helpers'

const login = (usuario: string, password = 'abarrotes123') =>
  request(app).post('/api/auth/login').send({ usuario, password })

describe('HU-01 inicio de sesión', () => {
  beforeAll(async () => {
    // Usuarios propios de esta prueba para no alterar los del seed
    const passwordHash = await bcrypt.hash('abarrotes123', 10)
    const pausada = await prisma.sucursal.create({ data: { nombre: 'Pausada', estado: 'SUSPENDIDO' } })
    await prisma.usuario.createMany({
      data: [
        { nombre: 'Eliminado', usuario: 'hu01.eliminado', passwordHash, rol: 'CAJERO', estado: 'ELIMINADO' },
        { nombre: 'De pausada', usuario: 'hu01.pausada', passwordHash, rol: 'CAJERO', sucursalId: pausada.id },
        { nombre: 'Se suspende', usuario: 'hu01.sesuspende', passwordHash, rol: 'CAJERO' },
      ],
    })
  })

  it.each([
    ['cajero1', 'CAJERO'],
    ['admin.centro', 'ADMIN'],
    ['jefe', 'JEFE'],
  ])('CA1/CA2: %s inicia sesión y recibe su rol %s', async (usuario, rol) => {
    const res = await login(usuario)
    expect(res.status).toBe(200)
    expect(res.body.token).toBeTruthy()
    expect(res.body.usuario.rol).toBe(rol)
    expect(res.body.usuario.passwordHash).toBeUndefined()
  })

  it('CA3: contraseña incorrecta → mensaje genérico', async () => {
    const res = await login('cajero1', 'mal')
    expect(res.status).toBe(401)
    expect(res.body.error).toBe('Usuario o contraseña incorrectos')
  })

  it('CA3: usuario inexistente → el mismo mensaje genérico', async () => {
    const res = await login('noexiste')
    expect(res.status).toBe(401)
    expect(res.body.error).toBe('Usuario o contraseña incorrectos')
  })

  it('CA4: usuario suspendido no puede entrar', async () => {
    const res = await login('suspendido')
    expect(res.status).toBe(403)
    expect(res.body.error).toMatch(/suspendida/)
  })

  it('CA4: usuario eliminado se trata como inexistente', async () => {
    const res = await login('hu01.eliminado')
    expect(res.status).toBe(401)
    expect(res.body.error).toBe('Usuario o contraseña incorrectos')
  })

  it('CA4: usuario de sucursal suspendida no puede entrar', async () => {
    const res = await login('hu01.pausada')
    expect(res.status).toBe(403)
    expect(res.body.error).toMatch(/sucursal/)
  })

  it('campos vacíos → 400', async () => {
    const res = await request(app).post('/api/auth/login').send({ usuario: '', password: '' })
    expect(res.status).toBe(400)
  })

  it('/me devuelve el perfil y exige sesión', async () => {
    expect((await request(app).get('/api/auth/me')).status).toBe(401)
    const token = await tokenDe('admin.centro')
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`)
    expect(res.body.usuario).toBe('admin.centro')
  })

  it('/me invalida la sesión si la cuenta se suspende después del login', async () => {
    const token = await tokenDe('hu01.sesuspende')
    await prisma.usuario.update({ where: { usuario: 'hu01.sesuspende' }, data: { estado: 'SUSPENDIDO' } })
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(401)
  })
})
