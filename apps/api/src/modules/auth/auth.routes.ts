import { Router } from 'express'
import { requireRol } from '../../middleware/auth'
import { loginSchema } from './auth.schemas'
import * as auth from './auth.service'

export const authRoutes = Router()

authRoutes.post('/login', async (req, res) => {
  const { usuario, password } = loginSchema.parse(req.body)
  res.json(await auth.login(usuario, password))
})

authRoutes.get('/me', requireRol('CAJERO'), async (req, res) => {
  res.json(await auth.yo(req.usuario!.id))
})
