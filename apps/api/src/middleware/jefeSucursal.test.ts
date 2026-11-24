import bcrypt from 'bcryptjs'
import request from 'supertest'
import { beforeAll, describe, expect, it } from 'vitest'
import { app } from '../app'
import { prisma } from '../lib/prisma'
import { tokenDe } from '../test/helpers'

// HU-14 · Operaciones de administrador para el jefe. Jefe propio (hu14.jefe) para no chocar con otros turnos.

describe('HU-14 · el jefe opera en la sucursal elegida', () => {
  let jefe: string
  let centro: number
  let norte: number

  beforeAll(async () => {
    await prisma.usuario.create({
      data: { nombre: 'hu14.jefe', usuario: 'hu14.jefe', passwordHash: await bcrypt.hash('abarrotes123', 10), rol: 'JEFE' },
    })
    jefe = await tokenDe('hu14.jefe')
    centro = (await prisma.sucursal.findFirstOrThrow({ where: { nombre: 'Centro' } })).id
    norte = (await prisma.sucursal.findFirstOrThrow({ where: { nombre: 'Norte' } })).id
  })

  const get = (ruta: string, token = jefe) => request(app).get(`/api${ruta}`).set('Authorization', `Bearer ${token}`)
  const post = (ruta: string, body: object) =>
    request(app).post(`/api${ruta}`).set('Authorization', `Bearer ${jefe}`).send(body)

  it.each(['/productos', '/usuarios', '/administradores', '/proveedores/visitas', '/reportes/semanal'])(
    'CA1/CA4: %s exige sucursal, acepta una existente y rechaza una que no existe',
    async (ruta) => {
      expect((await get(ruta)).status).toBe(400)
      expect((await get(`${ruta}?sucursalId=${norte}`)).status).toBe(200)
      expect((await get(`${ruta}?sucursalId=999999`)).status).toBe(404)
      expect((await get(`${ruta}?sucursalId=abc`)).status).toBe(404)
    },
  )

  it('CA3: cada sucursal devuelve solo sus productos', async () => {
    const lista = (await get(`/productos?sucursalId=${norte}`)).body as { sucursalId: number }[]
    expect(lista.length).toBeGreaterThan(0)
    expect(lista.every((p) => p.sucursalId === norte)).toBe(true)
  })

  it('con la caja abierta en una sucursal no puede vender ni pagar en otra', async () => {
    expect((await post(`/caja/abrir?sucursalId=${centro}`, { montoInicial: '100' })).status).toBe(201)
    const [producto] = (await get(`/productos?q=Coca&sucursalId=${norte}`)).body
    const venta = await post(`/ventas?sucursalId=${norte}`, {
      renglones: [{ productoId: producto.id, cantidad: '1' }],
      pagos: [{ metodo: 'EFECTIVO', monto: '100' }],
    })
    expect(venta.status).toBe(409)
    const pago = await post(`/caja/actual/pagos-proveedor?sucursalId=${norte}`, {
      proveedor: 'Bimbo',
      monto: '10',
      metodo: 'EFECTIVO',
    })
    expect(pago.status).toBe(409)
  })

  it('CA5: administradores y cajeros siguen en su sucursal aunque manden otra', async () => {
    for (const usuario of ['admin.centro', 'cajero1']) {
      const lista = (await get(`/productos?sucursalId=${norte}`, await tokenDe(usuario))).body as { sucursalId: number }[]
      expect(lista.every((p) => p.sucursalId === centro)).toBe(true)
    }
  })
})
