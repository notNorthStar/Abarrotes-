import request from 'supertest'
import { beforeAll, describe, expect, it } from 'vitest'
import { app } from '../../app'
import { prisma } from '../../lib/prisma'
import { tokenDe } from '../../test/helpers'

const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64',
)
const SVG = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>')

describe('T-34 · imágenes de productos y logotipos de proveedores', () => {
  let cajero: string
  let cajeroNorte: string
  let admin: string
  let producto: number
  let proveedor: number

  beforeAll(async () => {
    ;[cajero, cajeroNorte, admin] = await Promise.all(['cajero1', 'cajero.norte', 'admin.centro'].map(tokenDe))
    const alta = await request(app)
      .post('/api/productos')
      .set('Authorization', `Bearer ${cajero}`)
      .send({ codigoBarras: 'T34-001', nombre: 'T34 Producto', precio: '10', unidad: 'PIEZA', cantidad: '1' })
    producto = alta.body.id
    proveedor = (await prisma.proveedor.create({ data: { nombre: 'T34 Proveedor' } })).id
  })

  const subir = (ruta: string, token: string, datos: Buffer) =>
    request(app).post(`/api${ruta}`).set('Authorization', `Bearer ${token}`).set('Content-Type', 'image/png').send(datos)
  const borrar = (ruta: string, token: string) =>
    request(app).delete(`/api${ruta}`).set('Authorization', `Bearer ${token}`)
  const leer = async (id: string) => request(app).get(`/api/imagenes/${id}`)

  it('sube una foto, aparece en el producto y se puede ver sin sesión', async () => {
    const res = await subir(`/productos/${producto}/imagenes`, cajero, PNG)
    expect(res.status).toBe(201)
    const p = await request(app).get('/api/productos/codigo/T34-001').set('Authorization', `Bearer ${cajero}`)
    expect(p.body.imagenes).toEqual([{ id: res.body.id }])
    const imagen = await leer(res.body.id)
    expect(imagen.status).toBe(200)
    expect(imagen.headers['content-type']).toBe('image/png')
    expect(imagen.headers['x-content-type-options']).toBe('nosniff')
    expect(Buffer.compare(imagen.body, PNG)).toBe(0)
  })

  it('rechaza lo que no es PNG, JPG o WebP aunque diga serlo, vacío o de más de 2 MB', async () => {
    const ruta = `/productos/${producto}/imagenes`
    expect((await subir(ruta, cajero, SVG)).status).toBe(400)
    expect((await subir(ruta, cajero, Buffer.alloc(0))).status).toBe(400)
    expect((await subir(ruta, cajero, Buffer.concat([PNG, Buffer.alloc(2 * 1024 * 1024)]))).status).toBe(413)
  })

  it('respeta la sucursal y exige sesión', async () => {
    const ruta = `/productos/${producto}/imagenes`
    expect((await subir(ruta, cajeroNorte, PNG)).status).toBe(404)
    expect((await request(app).post(`/api${ruta}`).send(PNG)).status).toBe(401)
    const { id } = (await subir(ruta, cajero, PNG)).body
    expect((await borrar(`${ruta}/${id}`, cajeroNorte)).status).toBe(404)
  })

  it('quitar es lógico: deja de verse, pero se conserva', async () => {
    const ruta = `/productos/${producto}/imagenes`
    const { id } = (await subir(ruta, cajero, PNG)).body
    expect((await borrar(`${ruta}/${id}`, cajero)).status).toBe(200)
    expect((await leer(id)).status).toBe(404)
    expect((await prisma.imagen.findUniqueOrThrow({ where: { id } })).estado).toBe('ELIMINADO')
  })

  it('admite 5 imágenes por producto, también con subidas simultáneas', async () => {
    const estados = (await Promise.all(Array.from({ length: 6 }, () => subir(`/productos/${producto}/imagenes`, cajero, PNG)))).map(
      (r) => r.status,
    )
    expect(estados.filter((s) => s === 201)).toHaveLength(3) // ya había 2
    expect(estados.filter((s) => s === 409)).toHaveLength(3)
  })

  it('el administrador cambia y quita el logotipo; el cajero solo lo ve', async () => {
    const ruta = `/logos-proveedores/${proveedor}`
    expect((await subir(ruta, cajero, PNG)).status).toBe(403)
    const primero = (await subir(ruta, admin, PNG)).body.id
    const segundo = (await subir(ruta, admin, PNG)).body.id
    expect((await leer(primero)).status).toBe(404)
    const lista = await request(app).get('/api/logos-proveedores').set('Authorization', `Bearer ${cajero}`)
    expect(lista.body.find((p: { id: number }) => p.id === proveedor).logoId).toBe(segundo)
    expect((await borrar(ruta, admin)).status).toBe(200)
    expect((await borrar(ruta, admin)).status).toBe(404)
  })

  it('un id de imagen inválido o inexistente no rompe', async () => {
    expect((await leer('abc')).status).toBe(400)
    expect((await leer('00000000-0000-4000-8000-000000000000')).status).toBe(404)
  })
})
