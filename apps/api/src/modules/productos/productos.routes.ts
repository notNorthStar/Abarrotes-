import { Router } from 'express'
import { requireRol, sucursalDe } from '../../middleware/auth'
import { noImplementado } from '../noImplementado'
import * as productos from './productos.service'

export const productosRoutes = Router()

productosRoutes.get('/', requireRol('CAJERO'), async (req, res) => {
  const q = typeof req.query.q === 'string' ? req.query.q : undefined
  res.json(await productos.buscar(sucursalDe(req), q))
})

productosRoutes.get('/codigo/:codigo', requireRol('CAJERO'), async (req, res) => {
  res.json(await productos.porCodigo(sucursalDe(req), String(req.params.codigo)))
})

productosRoutes.post('/', requireRol('CAJERO'), noImplementado('HU-08'))
productosRoutes.post('/:id/entradas', requireRol('CAJERO'), noImplementado('HU-08'))
