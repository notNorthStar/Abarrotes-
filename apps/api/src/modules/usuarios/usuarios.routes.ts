import { Router } from 'express'
import { requireRol, sucursalDe } from '../../middleware/auth'
import { crearUsuarioSchema, editarUsuarioSchema, idSchema } from './usuarios.schemas'
import * as usuarios from './usuarios.service'

// Dueño: Sosa (HU-12; HU-15 en Sprint 3).
// ADMIN opera sobre su sucursal; JEFE indica ?sucursalId= (selector de HU-14).
export const usuariosRoutes = Router()

const ROL_GESTIONADO = 'CAJERO'

usuariosRoutes.get('/', requireRol('ADMIN'), async (req, res) => {
  res.json(await usuarios.listar(sucursalDe(req), ROL_GESTIONADO))
})

usuariosRoutes.post('/', requireRol('ADMIN'), async (req, res) => {
  const datos = crearUsuarioSchema.parse(req.body)
  res.status(201).json(await usuarios.crear(sucursalDe(req), ROL_GESTIONADO, datos))
})

usuariosRoutes.patch('/:id', requireRol('ADMIN'), async (req, res) => {
  const id = idSchema.parse(req.params.id)
  const cambios = editarUsuarioSchema.parse(req.body)
  res.json(await usuarios.editar(sucursalDe(req), ROL_GESTIONADO, id, cambios))
})

usuariosRoutes.delete('/:id', requireRol('ADMIN'), async (req, res) => {
  const id = idSchema.parse(req.params.id)
  await usuarios.eliminar(sucursalDe(req), ROL_GESTIONADO, id)
  res.json({ ok: true })
})
