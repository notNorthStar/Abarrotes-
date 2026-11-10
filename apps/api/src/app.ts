import express from 'express'
import cors from 'cors'
import { manejarErrores } from './middleware/errores'
import { authRoutes } from './modules/auth/auth.routes'
import { productosRoutes } from './modules/productos/productos.routes'
import { ventasRoutes } from './modules/ventas/ventas.routes'
import { cajaRoutes } from './modules/caja/caja.routes'
import { administradoresRoutes, usuariosRoutes } from './modules/usuarios/usuarios.routes'
import { reportesRoutes } from './modules/reportes/reportes.routes'
import { proveedoresRoutes } from './modules/proveedores/proveedores.routes'

export const app = express()

app.use(cors())
app.use(express.json())

app.get('/api/salud', (_req, res) => {
  res.json({ ok: true })
})
app.use('/api/auth', authRoutes)
app.use('/api/productos', productosRoutes)
app.use('/api/ventas', ventasRoutes)
app.use('/api/caja', cajaRoutes)
app.use('/api/usuarios', usuariosRoutes)
app.use('/api/administradores', administradoresRoutes)
app.use('/api/reportes', reportesRoutes)
app.use('/api/proveedores', proveedoresRoutes)

app.use(manejarErrores)
