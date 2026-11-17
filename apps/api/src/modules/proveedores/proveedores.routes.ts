import { Router } from 'express'
import { requireRol, sucursalDe } from '../../middleware/auth'
import { crearVisitaSchema } from './proveedores.schemas'
import * as proveedores from './proveedores.service'

// Dueño: Gonzalo (HU-07 · Saber visitas de proveedores).
// CA1: ADMIN registra visitas. CA2: CAJERO consulta lista por fecha y proveedor. CA3: filtrado por sucursal.
export const proveedoresRoutes = Router()

proveedoresRoutes.get('/catalogo', requireRol('CAJERO'), async (_req, res) => {
  res.json(await proveedores.listarProveedores())
})

proveedoresRoutes.get('/', requireRol('CAJERO'), async (req, res) => {
  const q = typeof req.query.q === 'string' ? req.query.q : undefined
  res.json(await proveedores.listarVisitas(sucursalDe(req), q))
})

proveedoresRoutes.get('/visitas', requireRol('CAJERO'), async (req, res) => {
  const q = typeof req.query.q === 'string' ? req.query.q : undefined
  res.json(await proveedores.listarVisitas(sucursalDe(req), q))
})

proveedoresRoutes.post('/', requireRol('ADMIN'), async (req, res) => {
  const datos = crearVisitaSchema.parse(req.body)
  res.status(201).json(await proveedores.registrarVisita(sucursalDe(req), datos))
})

proveedoresRoutes.post('/visitas', requireRol('ADMIN'), async (req, res) => {
  const datos = crearVisitaSchema.parse(req.body)
  res.status(201).json(await proveedores.registrarVisita(sucursalDe(req), datos))
})
