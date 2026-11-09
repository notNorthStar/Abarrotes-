import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import Decimal from 'decimal.js'
import { api, ApiError } from '../../api/client'
import { useAuth } from '../../auth/AuthContext'
import { Icono } from '../../components/Icono'
import {
  Aviso,
  Boton,
  Chip,
  EncabezadoPagina,
  Esqueleto,
  Pagina,
  Tarjeta,
  pesos,
} from '../../components/ui'
import type { MetodoReporte, ReporteSemanal, UsuarioReporte } from './tipos'

const METODOS: { id: MetodoReporte; texto: string }[] = [
  { id: 'EFECTIVO', texto: 'Efectivo' },
  { id: 'TARJETA', texto: 'Tarjeta' },
  { id: 'TRANSFERENCIA', texto: 'Transferencia' },
]
const hoyMexico = () => {
  const partes = new Intl.DateTimeFormat('en', {
    timeZone: 'America/Mexico_City',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date())
  const valor = (tipo: string) => partes.find((p) => p.type === tipo)!.value
  return `${valor('year')}-${valor('month')}-${valor('day')}`
}
const dia = (fecha: string) =>
  new Date(`${fecha}T12:00:00-06:00`).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'America/Mexico_City',
  })
const momento = (fecha: string) =>
  new Date(fecha).toLocaleString('es-MX', {
    timeZone: 'America/Mexico_City',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
const mensaje = (error: unknown) =>
  error instanceof ApiError
    ? error.message
    : 'No se pudo conectar con el servidor. Intenta de nuevo.'
type Consulta = { fecha: string; sucursal: string; intento: number }

export function ReportesPage() {
  const { usuario } = useAuth()
  const jefe = usuario?.rol === 'JEFE'
  const [fecha, setFecha] = useState(hoyMexico)
  const [sucursal, setSucursal] = useState('')
  const [consulta, setConsulta] = useState<Consulta>(() => ({
    fecha: hoyMexico(),
    sucursal: '',
    intento: 0,
  }))
  const [reporte, setReporte] = useState<ReporteSemanal | null>(null)
  const [cargando, setCargando] = useState(!jefe)
  const [error, setError] = useState('')
  const [exportando, setExportando] = useState(false)
  const [errorPdf, setErrorPdf] = useState('')
  const parametros = new URLSearchParams({ fecha: consulta.fecha })
  if (jefe && consulta.sucursal) parametros.set('sucursalId', consulta.sucursal)
  const query = parametros.toString()

  useEffect(() => {
    let vigente = true
    setReporte(null)
    setError('')
    setErrorPdf('')
    if (jefe && !consulta.sucursal) {
      setCargando(false)
      return
    }
    setCargando(true)
    api
      .get<ReporteSemanal>(`/reportes/semanal?${query}`)
      .then((resultado) => {
        if (vigente) setReporte(resultado)
      })
      .catch((err: unknown) => {
        if (vigente) setError(mensaje(err))
      })
      .finally(() => {
        if (vigente) setCargando(false)
      })
    return () => {
      vigente = false
    }
  }, [query, consulta.intento, consulta.sucursal, jefe])

  function consultar(e: FormEvent) {
    e.preventDefault()
    setReporte(null)
    setCargando(true)
    setConsulta((prev) => ({ fecha, sucursal: jefe ? sucursal : '', intento: prev.intento + 1 }))
  }

  async function exportar() {
    if (!reporte || cargando || exportando) return
    setExportando(true)
    setErrorPdf('')
    try {
      const blob = await api.download(`/reportes/semanal/pdf?${query}`)
      const url = URL.createObjectURL(blob)
      const enlace = document.createElement('a')
      enlace.href = url
      enlace.download = `reporte-sucursal-${reporte.sucursal.id}-${reporte.semana.inicio}.pdf`
      document.body.appendChild(enlace)
      enlace.click()
      enlace.remove()
      // Deja que el navegador inicie la descarga antes de liberar el recurso.
      window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch (err) {
      setErrorPdf(mensaje(err))
    } finally {
      setExportando(false)
    }
  }

  return (
    <Pagina>
      <EncabezadoPagina
        titulo="Reporte semanal"
        subtitulo="Ingresos, pagos y movimientos de inventario de tu sucursal."
        acciones={
          <Boton
            variante="secundario"
            disabled={!reporte || cargando || exportando}
            onClick={exportar}
          >
            <Icono nombre="imprimir" tamano={16} />
            {exportando ? 'Preparando PDF…' : 'Exportar PDF'}
          </Boton>
        }
      />
      <Tarjeta className="p-5">
        <form onSubmit={consultar} className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="reporte-fecha" className="text-[13px] font-medium">
              Fecha de la semana
            </label>
            <input
              id="reporte-fecha"
              type="date"
              className="campo num"
              required
              value={fecha}
              disabled={exportando}
              onChange={(e) => setFecha(e.target.value)}
            />
          </div>
          {jefe && (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="reporte-sucursal" className="text-[13px] font-medium">
                Número de sucursal
              </label>
              <input
                id="reporte-sucursal"
                type="number"
                min="1"
                step="1"
                required
                className="campo num"
                value={sucursal}
                disabled={exportando}
                onChange={(e) => setSucursal(e.target.value)}
              />
            </div>
          )}
          <Boton type="submit" disabled={exportando}>
            Consultar semana
          </Boton>
          <p className="w-full text-xs text-piedra">
            Selecciona cualquier día. El reporte abarca de lunes a domingo, en horario de Ciudad de
            México.
          </p>
        </form>
      </Tarjeta>

      {errorPdf && <Aviso tipo="error">No se pudo exportar el PDF. {errorPdf}</Aviso>}
      <div aria-live="polite" aria-busy={cargando} className="flex flex-col gap-6">
        {cargando && (
          <>
            <span role="status" className="sr-only">
              Consultando reporte semanal…
            </span>
            <Esqueleto className="h-6 w-64" />
            {[1, 2, 3].map((n) => (
              <Tarjeta key={n} className="flex flex-col gap-5 p-5">
                <Esqueleto className="h-4 w-40" />
                <Esqueleto className="h-8 w-full" />
                <Esqueleto className="h-8 w-full" />
              </Tarjeta>
            ))}
          </>
        )}
        {error && (
          <div className="flex flex-col gap-3">
            <Aviso tipo="error">{error}</Aviso>
            <Boton
              variante="secundario"
              className="self-start"
              onClick={() => setConsulta((prev) => ({ ...prev, intento: prev.intento + 1 }))}
            >
              Reintentar
            </Boton>
          </div>
        )}
        {!cargando && !error && !reporte && (
          <Tarjeta className="px-5 py-10 text-center text-sm text-piedra">
            Indica una sucursal para consultar su reporte semanal.
          </Tarjeta>
        )}
        {!cargando && !error && reporte && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-base font-semibold">{reporte.sucursal.nombre}</h2>
              <p className="text-[13px] text-piedra">
                {dia(reporte.semana.inicio)} — {dia(reporte.semana.fin)}
              </p>
            </div>
            <Tabla titulo="Ingresos por forma de pago" columnas={['Forma de pago', 'Ingreso neto']}>
              {METODOS.map((m) => (
                <tr key={m.id}>
                  <Celda>{m.texto}</Celda>
                  <Celda numerica>{pesos(reporte.ingresos[m.id])}</Celda>
                </tr>
              ))}
              <tr className="bg-hueso font-semibold">
                <Celda>Total de ingresos</Celda>
                <Celda numerica>{pesos(reporte.ingresos.total)}</Celda>
              </tr>
            </Tabla>
            <p className="-mt-3 text-xs text-piedra">
              El efectivo ya descuenta el cambio entregado. Los pagos a proveedores se muestran por
              separado.
            </p>
            <Tabla
              titulo="Ventas"
              columnas={[
                'Fecha',
                'Venta',
                'Realizada por',
                'Efectivo neto',
                'Tarjeta',
                'Transferencia',
                'Total',
              ]}
              vacia={reporte.ventas.length === 0}
            >
              {reporte.ventas.map((v) => (
                <tr key={v.id}>
                  <Celda>{momento(v.fecha)}</Celda>
                  <Celda>
                    <span className="num">#{v.id}</span>
                  </Celda>
                  <Celda>
                    <Persona usuario={v.usuario} />
                  </Celda>
                  {METODOS.map((m) => (
                    <Celda key={m.id} numerica>
                      {pesos(v.pagos[m.id])}
                    </Celda>
                  ))}
                  <Celda numerica>{pesos(v.total)}</Celda>
                </tr>
              ))}
            </Tabla>
            <Tabla
              titulo="Pagos a proveedores"
              columnas={['Fecha', 'Proveedor', 'Realizado por', 'Método', 'Monto', 'Comentario']}
              vacia={reporte.pagosProveedor.length === 0}
            >
              {reporte.pagosProveedor.map((p) => (
                <tr key={p.id}>
                  <Celda>{momento(p.fecha)}</Celda>
                  <Celda>{p.proveedor}</Celda>
                  <Celda>
                    <Persona usuario={p.usuario} />
                  </Celda>
                  <Celda>{METODOS.find((m) => m.id === p.metodo)?.texto}</Celda>
                  <Celda numerica>{pesos(p.monto)}</Celda>
                  <Celda>{p.comentario || '—'}</Celda>
                </tr>
              ))}
            </Tabla>
            <Tabla
              titulo="Productos agregados"
              columnas={[
                'Fecha',
                'Producto',
                'Movimiento',
                'Cantidad',
                'Registrado por',
                'Comentario',
              ]}
              vacia={reporte.productosAgregados.length === 0}
            >
              {reporte.productosAgregados.map((m) => (
                <tr key={m.id}>
                  <Celda>{momento(m.fecha)}</Celda>
                  <Celda>
                    <Producto nombre={m.producto.nombre} codigo={m.producto.codigoBarras} />
                  </Celda>
                  <Celda>
                    <Chip>{m.tipo === 'ALTA' ? 'Alta' : 'Entrada'}</Chip>
                  </Celda>
                  <Celda numerica>{cantidad(m.cantidad, m.producto.unidad)}</Celda>
                  <Celda>
                    <Persona usuario={m.usuario} />
                  </Celda>
                  <Celda>{m.comentario || '—'}</Celda>
                </tr>
              ))}
            </Tabla>
            <Tabla
              titulo="Mermas"
              columnas={['Fecha', 'Producto', 'Motivo', 'Cantidad', 'Registrada por', 'Comentario']}
              vacia={reporte.mermas.length === 0}
            >
              {reporte.mermas.map((m) => (
                <tr key={m.id}>
                  <Celda>{momento(m.fecha)}</Celda>
                  <Celda>
                    <Producto nombre={m.producto.nombre} codigo={m.producto.codigoBarras} />
                  </Celda>
                  <Celda>
                    <Chip tono="chile">{m.motivo === 'CADUCADO' ? 'Caducado' : 'Dañado'}</Chip>
                  </Celda>
                  <Celda numerica>{cantidad(m.cantidad, m.producto.unidad)}</Celda>
                  <Celda>
                    <Persona usuario={m.usuario} />
                  </Celda>
                  <Celda>{m.comentario || '—'}</Celda>
                </tr>
              ))}
            </Tabla>
          </>
        )}
      </div>
    </Pagina>
  )
}

function Tabla({
  titulo,
  columnas,
  children,
  vacia = false,
}: {
  titulo: string
  columnas: string[]
  children: ReactNode
  vacia?: boolean
}) {
  return (
    <Tarjeta className="overflow-hidden">
      <h3 className="border-b border-linea px-5 py-4 text-sm font-semibold">{titulo}</h3>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <caption className="sr-only">{titulo} de la semana seleccionada</caption>
          <thead>
            <tr className="bg-hueso text-left text-xs text-piedra">
              {columnas.map((col) => (
                <th key={col} scope="col" className="whitespace-nowrap px-4 py-2.5 font-medium">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {vacia ? (
              <tr>
                <td colSpan={columnas.length} className="px-5 py-8 text-center text-piedra">
                  Sin operaciones en esta semana.
                </td>
              </tr>
            ) : (
              children
            )}
          </tbody>
        </table>
      </div>
    </Tarjeta>
  )
}
function Celda({ children, numerica = false }: { children: ReactNode; numerica?: boolean }) {
  return (
    <td
      className={`border-t border-linea px-4 py-3 ${numerica ? 'num whitespace-nowrap text-right' : ''}`}
    >
      {children}
    </td>
  )
}
function Persona({ usuario }: { usuario: UsuarioReporte }) {
  return (
    <span className="flex flex-col gap-0.5">
      <span>{usuario.nombre}</span>
      <span className="text-xs text-piedra">{usuario.usuario}</span>
    </span>
  )
}
function Producto({ nombre, codigo }: { nombre: string; codigo: string }) {
  return (
    <span className="flex flex-col gap-0.5">
      <span>{nombre}</span>
      <span className="num text-xs text-piedra">{codigo}</span>
    </span>
  )
}
const cantidad = (valor: string, unidad: 'PIEZA' | 'KILO') =>
  `${new Decimal(valor).toFixed(unidad === 'KILO' ? 3 : 0)} ${unidad === 'KILO' ? 'kg' : 'pzas'}`
