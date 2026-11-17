import { Router } from 'express'
import { requireRol, sucursalDe } from '../../middleware/auth'
import { reporteSchema } from './reportes.schemas'
import { semanal } from './reportes.service'
import { generarPdf } from './reportes.pdf'

export const reportesRoutes = Router()

reportesRoutes.get('/semanal', requireRol('ADMIN'), async (req, res) => {
  const { fecha } = reporteSchema.parse(req.query)
  res.json(await semanal(sucursalDe(req), fecha))
})

reportesRoutes.get('/semanal/pdf', requireRol('ADMIN'), async (req, res) => {
  const { fecha } = reporteSchema.parse(req.query)
  const reporte = await semanal(sucursalDe(req), fecha)
  const pdf = await generarPdf(reporte)
  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="reporte-sucursal-${reporte.sucursal.id}-${reporte.semana.inicio}.pdf"`,
  )
  res.send(pdf)
})
