import type { NextFunction, Request, Response } from 'express'
import { ZodError } from 'zod'
import { AppError } from '../lib/AppError'

export function manejarErrores(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    res.status(err.status).json({ error: err.message })
    return
  }
  if (err instanceof ZodError) {
    res.status(400).json({ error: err.issues.map((i) => i.message).join('. ') })
    return
  }
  // express.raw y express.json: cuerpo más grande que el límite.
  if (err instanceof Error && 'type' in err && err.type === 'entity.too.large') {
    res.status(413).json({ error: 'El archivo es demasiado grande (máximo 2 MB)' })
    return
  }
  console.error(err)
  res.status(500).json({ error: 'Error interno del servidor' })
}
