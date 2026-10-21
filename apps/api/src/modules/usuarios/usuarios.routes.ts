import { Router } from 'express'
import { requireRol } from '../../middleware/auth'
import { noImplementado } from '../noImplementado'

// Dueño: Sosa (HU-12; HU-15 en Sprint 3).
export const usuariosRoutes = Router()

usuariosRoutes.get('/', requireRol('ADMIN'), noImplementado('HU-12'))
usuariosRoutes.post('/', requireRol('ADMIN'), noImplementado('HU-12'))
usuariosRoutes.patch('/:id', requireRol('ADMIN'), noImplementado('HU-12'))
usuariosRoutes.delete('/:id', requireRol('ADMIN'), noImplementado('HU-12'))
