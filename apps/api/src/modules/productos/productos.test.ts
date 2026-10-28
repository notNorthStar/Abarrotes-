import request from 'supertest'
import { beforeAll, describe, expect, it } from 'vitest'
import { app } from '../../app'
import { tokenDe } from '../../test/helpers'

describe('productos (lectura)', () => {
  let cajero: string
  let cajeroNorte: string
  beforeAll(async () => {
    cajero = await tokenDe('cajero1')
    cajeroNorte = await tokenDe('cajero.norte')
  })

  it('busca por nombre sin importar mayúsculas', async () => {
    const res = await request(app)
      .get('/api/productos?q=coca')
      .set('Authorization', `Bearer ${cajero}`)
    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(2)
  })

  it('encuentra por código de barras; el precio llega como texto decimal', async () => {
    const res = await request(app)
      .get('/api/productos/codigo/7501000000011')
      .set('Authorization', `Bearer ${cajero}`)
    expect(res.body.nombre).toBe('Coca-Cola 600 ml')
    expect(res.body.precio).toBe('18.5')
  })

  it('código inexistente → 404', async () => {
    const res = await request(app)
      .get('/api/productos/codigo/000')
      .set('Authorization', `Bearer ${cajero}`)
    expect(res.status).toBe(404)
    expect(res.body.error).toBe('Producto no encontrado')
  })

  it('cada cajero solo ve productos de su sucursal', async () => {
    const a = await request(app)
      .get('/api/productos/codigo/7501000000011')
      .set('Authorization', `Bearer ${cajero}`)
    const b = await request(app)
      .get('/api/productos/codigo/7501000000011')
      .set('Authorization', `Bearer ${cajeroNorte}`)
    expect(a.body.sucursalId).not.toBe(b.body.sucursalId)
  })

  it('HU-04: el listado incluye precio, existencia y unidad, y aísla las sucursales', async () => {
    const centro = await request(app).get('/api/productos').set('Authorization', `Bearer ${cajero}`)
    const norte = await request(app)
      .get('/api/productos')
      .set('Authorization', `Bearer ${cajeroNorte}`)
    expect(centro.status).toBe(200)
    expect(norte.status).toBe(200)
    expect(centro.body.length).toBeGreaterThan(0)
    expect(norte.body.length).toBeGreaterThan(0)
    const sucursalCentro = centro.body[0].sucursalId
    const sucursalNorte = norte.body[0].sucursalId
    expect(sucursalCentro).not.toBe(sucursalNorte)
    for (const producto of centro.body) {
      expect(producto.sucursalId).toBe(sucursalCentro)
      expect(typeof producto.precio).toBe('string')
      expect(typeof producto.existencia).toBe('string')
      expect(['PIEZA', 'KILO']).toContain(producto.unidad)
    }
    for (const producto of norte.body) expect(producto.sucursalId).toBe(sucursalNorte)

    // El cliente no puede consultar otra sucursal manipulando el parámetro.
    const intento = await request(app)
      .get(`/api/productos?sucursalId=${sucursalNorte}`)
      .set('Authorization', `Bearer ${cajero}`)
    expect(intento.status).toBe(200)
    for (const producto of intento.body) expect(producto.sucursalId).toBe(sucursalCentro)
  })

  it('HU-04: busca por código en el listado y devuelve vacío si no hay coincidencias', async () => {
    const encontrado = await request(app)
      .get('/api/productos?q=7501000000011')
      .set('Authorization', `Bearer ${cajero}`)
    expect(encontrado.status).toBe(200)
    expect(encontrado.body).toHaveLength(1)
    expect(encontrado.body[0].codigoBarras).toBe('7501000000011')

    const vacio = await request(app)
      .get('/api/productos?q=producto-inexistente-HU04')
      .set('Authorization', `Bearer ${cajero}`)
    expect(vacio.status).toBe(200)
    expect(vacio.body).toEqual([])
  })

  it('el jefe debe indicar sucursal', async () => {
    const jefe = await tokenDe('jefe')
    const res = await request(app).get('/api/productos').set('Authorization', `Bearer ${jefe}`)
    expect(res.status).toBe(400)
  })

  it('sin sesión → 401', async () => {
    expect((await request(app).get('/api/productos')).status).toBe(401)
  })
})
