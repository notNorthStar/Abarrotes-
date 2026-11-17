import request from 'supertest'
import { beforeAll, describe, expect, it } from 'vitest'
import { app } from '../../app'
import { prisma } from '../../lib/prisma'
import { tokenDe } from '../../test/helpers'

// HU-15: el jefe gestiona cuentas de administrador. Cada prueba crea sus propios administradores
// (prefijo hu15.) para no alterar los usuarios del seed que usan otras pruebas.

const auth = (token: string) => ({ Authorization: `Bearer ${token}` })
const login = (usuario: string, password: string) =>
  request(app).post('/api/auth/login').send({ usuario, password })

describe('administradores (HU-15 · el jefe gestiona cuentas de administrador)', () => {
  let jefe: string
  let idCentro: number
  let idNorte: number

  beforeAll(async () => {
    jefe = await tokenDe('jefe')
    idCentro = (await prisma.sucursal.findFirstOrThrow({ where: { nombre: 'Centro' } })).id
    idNorte = (await prisma.sucursal.findFirstOrThrow({ where: { nombre: 'Norte' } })).id
  })

  const ruta = (sucursalId: number, extra = '') => `/api/administradores${extra}?sucursalId=${sucursalId}`

  async function crearAdmin(usuario: string, sucursalId = idNorte) {
    const res = await request(app)
      .post(ruta(sucursalId))
      .set(auth(jefe))
      .send({ nombre: `Prueba ${usuario}`, usuario, password: 'secreto1' })
    expect(res.status).toBe(201)
    return res.body as { id: number; usuario: string; rol: string; estado: string }
  }

  describe('CA1 · solo el jefe, y cada administrador ligado a una sucursal', () => {
    it('crea un administrador en la sucursal elegida, que puede iniciar sesión', async () => {
      const a = await crearAdmin('hu15.norte')
      expect(a).toMatchObject({ usuario: 'hu15.norte', rol: 'ADMIN', estado: 'ACTIVO' })
      expect(a).not.toHaveProperty('passwordHash')
      const enBd = await prisma.usuario.findUniqueOrThrow({ where: { id: a.id } })
      expect(enBd.sucursalId).toBe(idNorte)
      const sesion = await login('hu15.norte', 'secreto1')
      expect(sesion.status).toBe(200)
    })

    it('lista solo los administradores de la sucursal indicada', async () => {
      await crearAdmin('hu15.lista')
      const res = await request(app).get(ruta(idNorte)).set(auth(jefe))
      expect(res.status).toBe(200)
      const usuarios = res.body.map((u: { usuario: string }) => u.usuario)
      expect(usuarios).toContain('hu15.lista')
      expect(usuarios).not.toContain('admin.centro')
      expect(usuarios).not.toContain('cajero.norte')
      expect(res.body.every((u: { rol: string }) => u.rol === 'ADMIN')).toBe(true)
    })

    it('lista las sucursales activas para elegir', async () => {
      const res = await request(app).get('/api/administradores/sucursales').set(auth(jefe))
      expect(res.status).toBe(200)
      expect(res.body.map((s: { id: number }) => s.id)).toEqual(expect.arrayContaining([idCentro, idNorte]))
    })

    it('exige indicar sucursal y que exista', async () => {
      const sin = await request(app).get('/api/administradores').set(auth(jefe))
      expect(sin.status).toBe(400)
      const inexistente = await request(app)
        .post(ruta(999999))
        .set(auth(jefe))
        .send({ nombre: 'Nadie', usuario: 'hu15.nadie', password: 'secreto1' })
      expect(inexistente.status).toBe(404)
    })

    it('un administrador o un cajero no pueden gestionar administradores → 403', async () => {
      for (const usuario of ['admin.centro', 'cajero1']) {
        const token = await tokenDe(usuario)
        expect((await request(app).get(ruta(idCentro)).set(auth(token))).status).toBe(403)
        expect((await request(app).get('/api/administradores/sucursales').set(auth(token))).status).toBe(403)
      }
      expect((await request(app).get(ruta(idCentro))).status).toBe(401)
    })

    it('no gestiona cajeros ni administradores de otra sucursal → 404', async () => {
      const cajero = await prisma.usuario.findUniqueOrThrow({ where: { usuario: 'cajero.norte' } })
      const res = await request(app).patch(ruta(idNorte, `/${cajero.id}`)).set(auth(jefe)).send({ nombre: 'X' })
      expect(res.status).toBe(404)
      const a = await crearAdmin('hu15.otra')
      const otra = await request(app).patch(ruta(idCentro, `/${a.id}`)).set(auth(jefe)).send({ nombre: 'X' })
      expect(otra.status).toBe(404)
    })
  })

  describe('CA2 · suspender bloquea el inicio de sesión y se puede reactivar', () => {
    it('suspende y reactiva', async () => {
      const a = await crearAdmin('hu15.susp')
      const susp = await request(app).patch(ruta(idNorte, `/${a.id}`)).set(auth(jefe)).send({ estado: 'SUSPENDIDO' })
      expect(susp.body.estado).toBe('SUSPENDIDO')
      expect([401, 403]).toContain((await login('hu15.susp', 'secreto1')).status)

      const react = await request(app).patch(ruta(idNorte, `/${a.id}`)).set(auth(jefe)).send({ estado: 'ACTIVO' })
      expect(react.body.estado).toBe('ACTIVO')
      expect((await login('hu15.susp', 'secreto1')).status).toBe(200)
    })
  })

  describe('CA3 · eliminar es lógico', () => {
    it('desaparece de la lista y del inicio de sesión, pero conserva sus operaciones', async () => {
      const a = await crearAdmin('hu15.elim')
      const turno = await prisma.turnoCaja.create({
        data: { usuarioId: a.id, sucursalId: idNorte, montoInicial: '100' },
      })

      const res = await request(app).delete(ruta(idNorte, `/${a.id}`)).set(auth(jefe))
      expect(res.status).toBe(200)

      const lista = await request(app).get(ruta(idNorte)).set(auth(jefe))
      expect(lista.body.map((u: { id: number }) => u.id)).not.toContain(a.id)
      expect((await prisma.usuario.findUniqueOrThrow({ where: { id: a.id } })).estado).toBe('ELIMINADO')
      expect(await prisma.turnoCaja.findUnique({ where: { id: turno.id } })).not.toBeNull()
      expect([401, 403]).toContain((await login('hu15.elim', 'secreto1')).status)
      expect((await request(app).patch(ruta(idNorte, `/${a.id}`)).set(auth(jefe)).send({ nombre: 'X' })).status).toBe(404)
    })
  })

  it('CA4 · la gestión de cajeros del administrador sigue igual', async () => {
    const admin = await tokenDe('admin.centro')
    const res = await request(app).get('/api/usuarios').set(auth(admin))
    expect(res.status).toBe(200)
    expect(res.body.every((u: { rol: string }) => u.rol === 'CAJERO')).toBe(true)
  })
})
