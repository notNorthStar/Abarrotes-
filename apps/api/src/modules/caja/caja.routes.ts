import { Router } from 'express'
import { requireRol, sucursalDe } from '../../middleware/auth'
import { abrirCajaSchema, cerrarCajaSchema, pagoProveedorSchema } from './caja.schemas'
import * as caja from './caja.service'

// Dueño: Sosa (HU-05, HU-09; reasignadas de Gonzalo el 28 oct).
// Cada usuario opera solo su propia caja; admin y jefe también pueden (jerarquía de roles).
export const cajaRoutes = Router()

cajaRoutes.post('/abrir', requireRol('CAJERO'), async (req, res) => {
  const { montoInicial } = abrirCajaSchema.parse(req.body)
  res.status(201).json(await caja.abrir(req.usuario!.id, sucursalDe(req), montoInicial))
})

cajaRoutes.get('/actual', requireRol('CAJERO'), async (req, res) => {
  res.json({ turno: await caja.actual(req.usuario!.id) })
})

cajaRoutes.get('/actual/corte', requireRol('CAJERO'), async (req, res) => {
  res.json(await caja.corteActual(req.usuario!.id))
})

cajaRoutes.post('/actual/cerrar', requireRol('CAJERO'), async (req, res) => {
  const datos = cerrarCajaSchema.parse(req.body)
  res.json(await caja.cerrar(req.usuario!.id, datos))
})

cajaRoutes.get('/proveedores', requireRol('CAJERO'), async (_req, res) => {
  res.json(await caja.proveedores())
})

cajaRoutes.post('/actual/pagos-proveedor', requireRol('CAJERO'), async (req, res) => {
  const datos = pagoProveedorSchema.parse(req.body)
  res.status(201).json(await caja.registrarPagoProveedor(req.usuario!.id, datos))
})
