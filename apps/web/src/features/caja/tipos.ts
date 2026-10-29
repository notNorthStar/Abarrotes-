// Respuestas de /api/caja (HU-05, HU-09). Los montos llegan como texto decimal.

export type Turno = { id: number; montoInicial: string; abiertoEn: string }

export type PagoProveedorDetalle = {
  id: number
  proveedor: string
  metodo: 'EFECTIVO' | 'TRANSFERENCIA'
  monto: string
  comentario: string | null
  creadoEn: string
}

export type Corte = {
  turnoId: number
  abiertoEn: string
  montoInicial: string
  numeroVentas: number
  totalVendido: string
  ventasPorMetodo: { EFECTIVO: string; TARJETA: string; TRANSFERENCIA: string }
  pagosProveedor: { EFECTIVO: string; TRANSFERENCIA: string; detalle: PagoProveedorDetalle[] }
  efectivoEsperado: string
}

export type CorteCerrado = Corte & {
  cerradoEn: string
  efectivoContado: string
  diferencia: string
  comentario: string | null
}

export type Proveedor = { id: number; nombre: string }
