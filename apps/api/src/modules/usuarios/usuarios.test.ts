import bcrypt from 'bcryptjs'
import request from 'supertest'
import { beforeAll, describe, expect, it } from 'vitest'
import { app } from '../../app'
import { prisma } from '../../lib/prisma'
import { tokenDe } from '../../test/helpers'

// HU-12: gestión de cuentas de cajero. Cada prueba crea sus propios cajeros (prefijo hu12.)
// para no alterar los usuarios del seed que usan otras pruebas.

type CajeroRespuesta = { id: number; nombre: string; usuario: string; rol: string; estado: string }

const auth = (token: string) => ({ Authorization: `Bearer ${token}` })
const login = (usuario: string, password: string) =>
  request(app).post('/api/auth/login').send({ usuario, password })

describe('usuarios (HU-12 · cuentas de cajero)', () => {
  let admin: string
  let jefe: string
  let idCentro: number
  let idNorte: number
  let idCajeroNorte: number
  let idAdminCentro: number
  /** HU-01 (otra rama) es la que bloquea el login de suspendidos; se detecta si ya está integrada. */
  let loginBloqueaSuspendidos: boolean

  beforeAll(async () => {
    admin = await tokenDe('admin.centro')
    jefe = await tokenDe('jefe')
    idCentro = (await prisma.sucursal.findFirstOrThrow({ where: { nombre: 'Centro' } })).id
    idNorte = (await prisma.sucursal.findFirstOrThrow({ where: { nombre: 'Norte' } })).id
    idCajeroNorte = (await prisma.usuario.findUniqueOrThrow({ where: { usuario: 'cajero.norte' } }))
      .id
    idAdminCentro = (await prisma.usuario.findUniqueOrThrow({ where: { usuario: 'admin.centro' } }))
      .id
    loginBloqueaSuspendidos = (await login('suspendido', 'abarrotes123')).status !== 200
  })

  async function crearCajero(usuario: string, password = 'secreto1'): Promise<CajeroRespuesta> {
    const res = await request(app)
      .post('/api/usuarios')
      .set(auth(admin))
      .send({ nombre: `Prueba ${usuario}`, usuario, password })
    expect(res.status).toBe(201)
    return res.body
  }

  describe('CA1 · crear cajeros en su sucursal', () => {
    it('crea un cajero con rol CAJERO, en la sucursal del admin y con hash bcrypt', async () => {
      const res = await request(app)
        .post('/api/usuarios')
        .set(auth(admin))
        .send({ nombre: 'Ana Prueba', usuario: 'hu12.ana', password: 'secreto1', rol: 'ADMIN' })
      expect(res.status).toBe(201)
      expect(res.body).toMatchObject({
        nombre: 'Ana Prueba',
        usuario: 'hu12.ana',
        rol: 'CAJERO',
        estado: 'ACTIVO',
      })
      expect(res.body.passwordHash).toBeUndefined()

      const guardado = await prisma.usuario.findUniqueOrThrow({ where: { usuario: 'hu12.ana' } })
      expect(guardado.sucursalId).toBe(idCentro)
      expect(guardado.rol).toBe('CAJERO')
      expect(guardado.passwordHash).not.toBe('secreto1')
      expect(await bcrypt.compare('secreto1', guardado.passwordHash)).toBe(true)

      expect((await login('hu12.ana', 'secreto1')).status).toBe(200)
    })

    it('usuario duplicado → 409', async () => {
      const res = await request(app)
        .post('/api/usuarios')
        .set(auth(admin))
        .send({ nombre: 'Otro', usuario: 'cajero1', password: 'secreto1' })
      expect(res.status).toBe(409)
      expect(res.body.error).toBe('Ese nombre de usuario ya existe')
    })

    it('contraseña de menos de 6 caracteres → 400', async () => {
      const res = await request(app)
        .post('/api/usuarios')
        .set(auth(admin))
        .send({ nombre: 'Corta', usuario: 'hu12.corta', password: '12345' })
      expect(res.status).toBe(400)
      expect(res.body.error).toContain('al menos 6 caracteres')
    })

    it('faltan datos → 400', async () => {
      const res = await request(app)
        .post('/api/usuarios')
        .set(auth(admin))
        .send({ usuario: 'hu12.sin' })
      expect(res.status).toBe(400)
    })
  })

  describe('permisos', () => {
    it('un cajero no puede usar estas rutas → 403', async () => {
      const cajero = await tokenDe('cajero1')
      expect((await request(app).get('/api/usuarios').set(auth(cajero))).status).toBe(403)
      const post = await request(app)
        .post('/api/usuarios')
        .set(auth(cajero))
        .send({ nombre: 'X', usuario: 'hu12.x', password: 'secreto1' })
      expect(post.status).toBe(403)
      expect(
        (await request(app).delete(`/api/usuarios/${idCajeroNorte}`).set(auth(cajero))).status,
      ).toBe(403)
    })

    it('sin sesión → 401', async () => {
      expect((await request(app).get('/api/usuarios')).status).toBe(401)
    })

    it('el jefe debe indicar sucursal y con ella ve sus cajeros', async () => {
      expect((await request(app).get('/api/usuarios').set(auth(jefe))).status).toBe(400)
      const res = await request(app).get(`/api/usuarios?sucursalId=${idNorte}`).set(auth(jefe))
      expect(res.status).toBe(200)
      expect(res.body.map((u: CajeroRespuesta) => u.usuario)).toEqual(['cajero.norte'])
    })
  })

  describe('CA4 · solo su sucursal y solo cajeros', () => {
    it('la lista trae solo cajeros de su sucursal, ordenados por nombre y sin passwordHash', async () => {
      const res = await request(app).get('/api/usuarios').set(auth(admin))
      expect(res.status).toBe(200)
      const usuarios = res.body.map((u: CajeroRespuesta) => u.usuario)
      expect(usuarios).toContain('cajero1')
      expect(usuarios).toContain('cajero2')
      expect(usuarios).not.toContain('cajero.norte')
      expect(usuarios).not.toContain('admin.centro')
      expect(usuarios).not.toContain('jefe')
      for (const u of res.body) {
        expect(u.rol).toBe('CAJERO')
        expect(u).not.toHaveProperty('passwordHash')
        expect(Object.keys(u).sort()).toEqual([
          'creadoEn',
          'estado',
          'id',
          'nombre',
          'rol',
          'usuario',
        ])
      }
      const nombres = res.body.map((u: CajeroRespuesta) => u.nombre)
      expect(nombres).toEqual([...nombres].sort((a, b) => a.localeCompare(b)))
    })

    it('no puede editar ni eliminar a un cajero de otra sucursal → 404', async () => {
      const patch = await request(app)
        .patch(`/api/usuarios/${idCajeroNorte}`)
        .set(auth(admin))
        .send({ estado: 'SUSPENDIDO' })
      expect(patch.status).toBe(404)
      expect(patch.body.error).toBe('Cajero no encontrado')
      expect(
        (await request(app).delete(`/api/usuarios/${idCajeroNorte}`).set(auth(admin))).status,
      ).toBe(404)

      const norte = await prisma.usuario.findUniqueOrThrow({ where: { id: idCajeroNorte } })
      expect(norte.estado).toBe('ACTIVO')
    })

    it('no puede gestionar administradores (ni a sí mismo) → 404', async () => {
      const patch = await request(app)
        .patch(`/api/usuarios/${idAdminCentro}`)
        .set(auth(admin))
        .send({ estado: 'SUSPENDIDO' })
      expect(patch.status).toBe(404)
      expect(
        (await request(app).delete(`/api/usuarios/${idAdminCentro}`).set(auth(admin))).status,
      ).toBe(404)
    })
  })

  describe('CA2 · suspender y reactivar', () => {
    it('suspende y reactiva; sigue en la lista con su estado', async () => {
      const c = await crearCajero('hu12.susp')

      const susp = await request(app)
        .patch(`/api/usuarios/${c.id}`)
        .set(auth(admin))
        .send({ estado: 'SUSPENDIDO' })
      expect(susp.status).toBe(200)
      expect(susp.body.estado).toBe('SUSPENDIDO')
      const lista = await request(app).get('/api/usuarios').set(auth(admin))
      expect(lista.body.find((u: CajeroRespuesta) => u.id === c.id)?.estado).toBe('SUSPENDIDO')

      const react = await request(app)
        .patch(`/api/usuarios/${c.id}`)
        .set(auth(admin))
        .send({ estado: 'ACTIVO' })
      expect(react.status).toBe(200)
      expect(react.body.estado).toBe('ACTIVO')
      expect((await login('hu12.susp', 'secreto1')).status).toBe(200)
    })

    it('un cajero suspendido ya no puede iniciar sesión (requiere HU-01 integrada)', async (ctx) => {
      // El rechazo del login vive en HU-01 (otra rama). Mientras no esté en develop se omite.
      if (!loginBloqueaSuspendidos) ctx.skip()
      const c = await crearCajero('hu12.susplogin')
      await request(app)
        .patch(`/api/usuarios/${c.id}`)
        .set(auth(admin))
        .send({ estado: 'SUSPENDIDO' })
      expect([401, 403]).toContain((await login('hu12.susplogin', 'secreto1')).status)
    })

    it('no acepta ELIMINADO como estado en PATCH → 400', async () => {
      const c = await crearCajero('hu12.estado')
      const res = await request(app)
        .patch(`/api/usuarios/${c.id}`)
        .set(auth(admin))
        .send({ estado: 'ELIMINADO' })
      expect(res.status).toBe(400)
    })

    it('PATCH sin cambios → 400', async () => {
      const c = await crearCajero('hu12.vacio')
      expect(
        (await request(app).patch(`/api/usuarios/${c.id}`).set(auth(admin)).send({})).status,
      ).toBe(400)
    })

    it('permite cambiar el nombre', async () => {
      const c = await crearCajero('hu12.nombre')
      const res = await request(app)
        .patch(`/api/usuarios/${c.id}`)
        .set(auth(admin))
        .send({ nombre: 'Nuevo Nombre' })
      expect(res.status).toBe(200)
      expect(res.body.nombre).toBe('Nuevo Nombre')
    })
  })

  describe('CA5 · restablecer contraseña', () => {
    it('la nueva contraseña funciona y la anterior ya no', async () => {
      const c = await crearCajero('hu12.reset')
      const res = await request(app)
        .patch(`/api/usuarios/${c.id}`)
        .set(auth(admin))
        .send({ password: 'nueva123' })
      expect(res.status).toBe(200)
      expect(res.body).not.toHaveProperty('passwordHash')
      expect((await login('hu12.reset', 'nueva123')).status).toBe(200)
      expect((await login('hu12.reset', 'secreto1')).status).toBe(401)
    })

    it('rechaza una contraseña nueva corta → 400', async () => {
      const c = await crearCajero('hu12.resetcorta')
      const res = await request(app)
        .patch(`/api/usuarios/${c.id}`)
        .set(auth(admin))
        .send({ password: '123' })
      expect(res.status).toBe(400)
    })
  })

  describe('CA3 · eliminar es lógico', () => {
    it('desaparece de la lista, se conserva en la BD y ya no se puede editar', async () => {
      const c = await crearCajero('hu12.elim')

      const del = await request(app).delete(`/api/usuarios/${c.id}`).set(auth(admin))
      expect(del.status).toBe(200)
      expect(del.body).toEqual({ ok: true })

      const lista = await request(app).get('/api/usuarios').set(auth(admin))
      expect(lista.body.map((u: CajeroRespuesta) => u.id)).not.toContain(c.id)

      const enBd = await prisma.usuario.findUnique({ where: { id: c.id } })
      expect(enBd?.estado).toBe('ELIMINADO')

      const patch = await request(app)
        .patch(`/api/usuarios/${c.id}`)
        .set(auth(admin))
        .send({ estado: 'ACTIVO' })
      expect(patch.status).toBe(404)
      expect((await request(app).delete(`/api/usuarios/${c.id}`).set(auth(admin))).status).toBe(404)
    })

    it('id inválido → 400', async () => {
      expect((await request(app).delete('/api/usuarios/abc').set(auth(admin))).status).toBe(400)
    })
  })
})
