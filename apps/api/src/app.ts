import express from 'express'
import cors from 'cors'
import { manejarErrores } from './middleware/errores'
import { authRoutes } from './modules/auth/auth.routes'
import { productosRoutes } from './modules/productos/productos.routes'
import { ventasRoutes } from './modules/ventas/ventas.routes'
import { cajaRoutes } from './modules/caja/caja.routes'
import { usuariosRoutes } from './modules/usuarios/usuarios.routes'

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

app.use(manejarErrores)
