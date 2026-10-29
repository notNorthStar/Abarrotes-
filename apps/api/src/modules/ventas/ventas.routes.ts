import { Router } from 'express'
import { requireRol, sucursalDe } from '../../middleware/auth'
import { crearVentaSchema } from './ventas.schemas'
import * as ventas from './ventas.service'

// Dueño: Sosa (HU-06). Contrato de POST /ventas en docs/04-arquitectura.md.
export const ventasRoutes = Router()

ventasRoutes.post('/', requireRol('CAJERO'), async (req, res) => {
  const datos = crearVentaSchema.parse(req.body)
  res.status(201).json(await ventas.crearVenta(req.usuario!.id, sucursalDe(req), datos))
})
