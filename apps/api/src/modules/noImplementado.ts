import type { Request, Response } from 'express'

/** Placeholder de contrato: la ruta existe pero su HU aún no se implementa. */
export const noImplementado = (hu: string) => (_req: Request, res: Response) => {
  res.status(501).json({ error: `Pendiente: ${hu}` })
}
