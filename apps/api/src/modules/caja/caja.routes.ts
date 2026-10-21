import { Router } from 'express'
import { requireRol } from '../../middleware/auth'
import { noImplementado } from '../noImplementado'

// Dueño: Gonzalo (HU-05, HU-09).
export const cajaRoutes = Router()

cajaRoutes.post('/abrir', requireRol('CAJERO'), noImplementado('HU-05'))
cajaRoutes.get('/actual', requireRol('CAJERO'), noImplementado('HU-05'))
cajaRoutes.get('/actual/corte', requireRol('CAJERO'), noImplementado('HU-05'))
cajaRoutes.post('/actual/cerrar', requireRol('CAJERO'), noImplementado('HU-05'))
cajaRoutes.post('/actual/pagos-proveedor', requireRol('CAJERO'), noImplementado('HU-09'))
