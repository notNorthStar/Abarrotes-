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
    const res = await request(app).get('/api/productos?q=coca').set('Authorization', `Bearer ${cajero}`)
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
    const res = await request(app).get('/api/productos/codigo/000').set('Authorization', `Bearer ${cajero}`)
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

  it('el jefe debe indicar sucursal', async () => {
    const jefe = await tokenDe('jefe')
    const res = await request(app).get('/api/productos').set('Authorization', `Bearer ${jefe}`)
    expect(res.status).toBe(400)
  })

  it('sin sesión → 401', async () => {
    expect((await request(app).get('/api/productos')).status).toBe(401)
  })
})
