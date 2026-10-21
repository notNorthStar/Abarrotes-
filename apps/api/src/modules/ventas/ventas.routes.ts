import { Router } from 'express'
import { requireRol } from '../../middleware/auth'
import { noImplementado } from '../noImplementado'

// Dueño: Sosa (HU-06). Contrato de POST /ventas en docs/04-arquitectura.md.
export const ventasRoutes = Router()

ventasRoutes.post('/', requireRol('CAJERO'), noImplementado('HU-06'))
