import { Router } from 'express'
import { requireRol } from '../../middleware/auth'
import {
  crearSucursalSchema,
  estadoSucursalSchema,
  idSucursalSchema,
  listarSucursalesSchema,
} from './sucursales.schemas'
import * as sucursales from './sucursales.service'

export const sucursalesRoutes = Router()
sucursalesRoutes.use(requireRol('JEFE'))
sucursalesRoutes.get('/', async (req, res) => {
  const { estado } = listarSucursalesSchema.parse(req.query)
  res.json(await sucursales.listar(estado))
})
sucursalesRoutes.post('/', async (req, res) => {
  res.status(201).json(await sucursales.crear(crearSucursalSchema.parse(req.body)))
})
sucursalesRoutes.patch('/:id', async (req, res) => {
  const id = idSucursalSchema.parse(req.params.id)
  const { estado } = estadoSucursalSchema.parse(req.body)
  res.json(await sucursales.cambiarEstado(id, estado))
})
sucursalesRoutes.delete('/:id', async (req, res) => {
  await sucursales.eliminar(idSucursalSchema.parse(req.params.id))
  res.json({ ok: true })
})
