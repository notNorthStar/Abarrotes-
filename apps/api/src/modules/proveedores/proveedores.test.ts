import request from 'supertest'
import { beforeAll, describe, expect, it } from 'vitest'
import { app } from '../../app'
import { prisma } from '../../lib/prisma'
import { tokenDe } from '../../test/helpers'

// HU-07 · Saber visitas de proveedores. Dueño: Gonzalo.

type Visita = {
  id: number
  proveedorId: number
  proveedor: string
  sucursalId: number
  fecha: string
  nota: string | null
}

const auth = (token: string) => ({ Authorization: `Bearer ${token}` })

describe('proveedores (HU-07 · visitas de proveedores)', () => {
  let adminCentro: string
  let cajeroCentro: string
  let cajeroNorte: string
  let jefe: string
  let idCentro: number
  let idNorte: number

  beforeAll(async () => {
    adminCentro = await tokenDe('admin.centro')
    cajeroCentro = await tokenDe('cajero1')
    cajeroNorte = await tokenDe('cajero.norte')
    jefe = await tokenDe('jefe')
    idCentro = (await prisma.sucursal.findFirstOrThrow({ where: { nombre: 'Centro' } })).id
    idNorte = (await prisma.sucursal.findFirstOrThrow({ where: { nombre: 'Norte' } })).id
    await prisma.visitaProveedor.deleteMany()
  })

  describe('CA1 · el administrador registra las visitas (proveedor, fecha y nota opcional)', () => {
    it('el admin registra una visita con nota y otra sin nota; crea proveedor si no existe', async () => {
      const conNota = await request(app)
        .post('/api/proveedores/visitas')
        .set(auth(adminCentro))
        .send({
          proveedor: 'Bimbo',
          fecha: '2026-11-12',
          nota: 'Revisar pan blanco y bollería',
        })
      expect(conNota.status).toBe(201)
      expect(conNota.body).toMatchObject({
        proveedor: 'Bimbo',
        sucursalId: idCentro,
        nota: 'Revisar pan blanco y bollería',
      })
      expect(conNota.body.fecha).toContain('2026-11-12')

      const sinNota = await request(app)
        .post('/api/proveedores')
        .set(auth(adminCentro))
        .send({
          proveedor: 'Sabritas Distribución',
          fecha: '2026-11-10',
        })
      expect(sinNota.status).toBe(201)
      expect(sinNota.body).toMatchObject({
        proveedor: 'Sabritas Distribución',
        sucursalId: idCentro,
        nota: null,
      })
      expect(sinNota.body.fecha).toContain('2026-11-10')
    })

    it('un cajero no puede registrar visitas → 403', async () => {
      const res = await request(app)
        .post('/api/proveedores/visitas')
        .set(auth(cajeroCentro))
        .send({ proveedor: 'Coca-Cola FEMSA', fecha: '2026-11-15' })
      expect(res.status).toBe(403)
      expect(res.body.error).toBe('No tienes permiso para esta acción')
    })

    it('sin sesión → 401', async () => {
      expect((await request(app).get('/api/proveedores/visitas')).status).toBe(401)
      expect(
        (await request(app).post('/api/proveedores/visitas').send({ proveedor: 'Bimbo', fecha: '2026-11-15' })).status,
      ).toBe(401)
    })

    it('valida proveedor y fecha obligatorios y formato de fecha real → 400', async () => {
      const sinProveedor = await request(app)
        .post('/api/proveedores/visitas')
        .set(auth(adminCentro))
        .send({ proveedor: '   ', fecha: '2026-11-15' })
      expect(sinProveedor.status).toBe(400)

      const sinFecha = await request(app)
        .post('/api/proveedores/visitas')
        .set(auth(adminCentro))
        .send({ proveedor: 'Bimbo', fecha: '' })
      expect(sinFecha.status).toBe(400)

      const fechaInvalida = await request(app)
        .post('/api/proveedores/visitas')
        .set(auth(adminCentro))
        .send({ proveedor: 'Bimbo', fecha: '2026-02-31' })
      expect(fechaInvalida.status).toBe(400)
    })
  })

  describe('CA2 · el cajero consulta las visitas en una lista por fecha y proveedor', () => {
    it('devuelve las visitas ordenadas por fecha ascendente y proveedor, y permite filtrar por proveedor', async () => {
      await request(app)
        .post('/api/proveedores/visitas')
        .set(auth(adminCentro))
        .send({
          proveedor: 'Coca-Cola FEMSA',
          fecha: '2026-11-10',
          nota: 'Pedir refresco de 600 ml y 2 L',
        })

      const res = await request(app).get('/api/proveedores/visitas').set(auth(cajeroCentro))
      expect(res.status).toBe(200)
      const lista = res.body as Visita[]
      expect(lista.map((v) => ({ fecha: v.fecha.slice(0, 10), proveedor: v.proveedor }))).toEqual([
        { fecha: '2026-11-10', proveedor: 'Coca-Cola FEMSA' },
        { fecha: '2026-11-10', proveedor: 'Sabritas Distribución' },
        { fecha: '2026-11-12', proveedor: 'Bimbo' },
      ])

      const filtrado = await request(app).get('/api/proveedores?q=coca').set(auth(cajeroCentro))
      expect(filtrado.status).toBe(200)
      expect(filtrado.body).toHaveLength(1)
      expect(filtrado.body[0].proveedor).toBe('Coca-Cola FEMSA')
    })

    it('el catálogo devuelve la lista de proveedores registrados ordenada alfabéticamente', async () => {
      const res = await request(app).get('/api/proveedores/catalogo').set(auth(cajeroCentro))
      expect(res.status).toBe(200)
      const nombres = (res.body as { id: number; nombre: string }[]).map((p) => p.nombre)
      expect(nombres).toContain('Bimbo')
      expect(nombres).toContain('Coca-Cola FEMSA')
      expect(nombres).toEqual([...nombres].sort((a, b) => a.localeCompare(b)))
    })
  })

  describe('CA3 · cada usuario ve solo las visitas de su sucursal', () => {
    it('el cajero de Norte no ve visitas de Centro y solo ve las de Norte', async () => {
      const vaciaNorte = await request(app).get('/api/proveedores/visitas').set(auth(cajeroNorte))
      expect(vaciaNorte.status).toBe(200)
      expect(vaciaNorte.body).toEqual([])

      // El jefe exige seleccionar sucursal y puede registrar en Norte
      expect(
        (await request(app).get('/api/proveedores/visitas').set(auth(jefe))).status,
      ).toBe(400)

      const altaNorte = await request(app)
        .post(`/api/proveedores/visitas?sucursalId=${idNorte}`)
        .set(auth(jefe))
        .send({
          proveedor: 'Lala',
          fecha: '2026-11-14',
          nota: 'Entrega de leche entera',
        })
      expect(altaNorte.status).toBe(201)
      expect(altaNorte.body.sucursalId).toBe(idNorte)

      const listaNorte = await request(app).get('/api/proveedores/visitas').set(auth(cajeroNorte))
      expect(listaNorte.status).toBe(200)
      expect(listaNorte.body).toHaveLength(1)
      expect(listaNorte.body[0]).toMatchObject({
        proveedor: 'Lala',
        sucursalId: idNorte,
        nota: 'Entrega de leche entera',
      })

      // Centro sigue sin ver la visita de Norte aunque pase ?sucursalId= en la URL
      const listaCentro = await request(app)
        .get(`/api/proveedores/visitas?sucursalId=${idNorte}`)
        .set(auth(cajeroCentro))
      expect(listaCentro.status).toBe(200)
      expect((listaCentro.body as Visita[]).every((v) => v.sucursalId === idCentro)).toBe(true)
    })
  })
})
