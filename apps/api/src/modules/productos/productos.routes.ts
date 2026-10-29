import { Router } from 'express'
import { requireRol, sucursalDe } from '../../middleware/auth'
import { crearProductoSchema, entradaSchema, idSchema } from './productos.schemas'
import * as productos from './productos.service'

// Rol mínimo CAJERO: por la jerarquía de roles, ADMIN y JEFE también pueden (JEFE indica ?sucursalId=).
export const productosRoutes = Router()

productosRoutes.get('/', requireRol('CAJERO'), async (req, res) => {
  const q = typeof req.query.q === 'string' ? req.query.q : undefined
  res.json(await productos.buscar(sucursalDe(req), q))
})

productosRoutes.get('/codigo/:codigo', requireRol('CAJERO'), async (req, res) => {
  res.json(await productos.porCodigo(sucursalDe(req), String(req.params.codigo)))
})

// HU-08: alta de producto nuevo
productosRoutes.post('/', requireRol('CAJERO'), async (req, res) => {
  const datos = crearProductoSchema.parse(req.body)
  res.status(201).json(await productos.crear(sucursalDe(req), req.usuario!.id, datos))
})

// HU-08: entrada de existencias a un producto existente
productosRoutes.post('/:id/entradas', requireRol('CAJERO'), async (req, res) => {
  const id = idSchema.parse(req.params.id)
  const datos = entradaSchema.parse(req.body)
  res.json(await productos.registrarEntrada(sucursalDe(req), req.usuario!.id, id, datos))
})
