import type { UnidadVenta } from '../../api/tipos'

export type MetodoReporte = 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA'
export type UsuarioReporte = { id: number; nombre: string; usuario: string }
export type ProductoReporte = {
  id: number
  nombre: string
  codigoBarras: string
  unidad: UnidadVenta
}
export type MovimientoReporte = {
  id: number
  fecha: string
  producto: ProductoReporte
  cantidad: string
  comentario: string | null
  usuario: UsuarioReporte
}

export type ReporteSemanal = {
  sucursal: { id: number; nombre: string }
  semana: { inicio: string; fin: string }
  ingresos: Record<MetodoReporte, string> & { total: string }
  ventas: {
    id: number
    fecha: string
    usuario: UsuarioReporte
    total: string
    pagos: Record<MetodoReporte, string>
  }[]
  pagosProveedor: {
    id: number
    fecha: string
    proveedor: string
    metodo: MetodoReporte
    monto: string
    comentario: string | null
    usuario: UsuarioReporte
  }[]
  productosAgregados: (MovimientoReporte & { tipo: 'ALTA' | 'ENTRADA' })[]
  mermas: (MovimientoReporte & { motivo: 'CADUCADO' | 'DANADO' })[]
}
