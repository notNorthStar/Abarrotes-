import { Router, raw } from 'express'
import { z } from 'zod'
import { requireRol, sucursalDe } from '../../middleware/auth'
import { idSchema } from '../productos/productos.schemas'
import * as imagenes from './imagenes.service'

// T-34 (Sosa). Fotos de productos: cualquier rol de la sucursal (igual que el alta). Logotipos: administrador.
export const imagenesRoutes = Router()

const idImagen = z.string().uuid('Id de imagen inválido')
const cuerpoImagen = raw({ type: () => true, limit: '2mb' })

// Sin token: <img> no puede enviarlo. El id es un UUID aleatorio y la imagen nunca cambia.
imagenesRoutes.get('/imagenes/:id', async (req, res) => {
  const { tipo, datos } = await imagenes.leer(idImagen.parse(req.params.id))
  res.set({
    'Content-Type': tipo,
    'Cache-Control': 'public, max-age=31536000, immutable',
    'X-Content-Type-Options': 'nosniff',
  })
  res.send(Buffer.from(datos))
})

imagenesRoutes.post('/productos/:id/imagenes', requireRol('CAJERO'), cuerpoImagen, async (req, res) => {
  const id = idSchema.parse(req.params.id)
  res.status(201).json(await imagenes.agregarAProducto(sucursalDe(req), id, req.body))
})

imagenesRoutes.delete('/productos/:id/imagenes/:imagen', requireRol('CAJERO'), async (req, res) => {
  await imagenes.quitarDeProducto(sucursalDe(req), idSchema.parse(req.params.id), idImagen.parse(req.params.imagen))
  res.json({ ok: true })
})

imagenesRoutes.get('/logos-proveedores', requireRol('CAJERO'), async (_req, res) => {
  res.json(await imagenes.proveedoresConLogo())
})

imagenesRoutes.post('/logos-proveedores/:id', requireRol('ADMIN'), cuerpoImagen, async (req, res) => {
  res.status(201).json(await imagenes.cambiarLogo(idSchema.parse(req.params.id), req.body))
})

imagenesRoutes.delete('/logos-proveedores/:id', requireRol('ADMIN'), async (req, res) => {
  await imagenes.quitarLogo(idSchema.parse(req.params.id))
  res.json({ ok: true })
})
