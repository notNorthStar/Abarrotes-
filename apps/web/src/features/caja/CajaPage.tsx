import Decimal from 'decimal.js'
import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { api, ApiError } from '../../api/client'
import { avisarCambioCaja } from '../../components/Layout'
import {
  Aviso,
  Boton,
  Chip,
  EncabezadoPagina,
  Esqueleto,
  Pagina,
  PaginaConPanel,
  Tarjeta,
  pesos,
} from '../../components/ui'
import type { Corte, CorteCerrado, Proveedor, Turno } from './tipos'

// HU-05 (abrir caja, corte y cierre) y HU-09 (pagos a proveedor). Sosa, reasignadas de Gonzalo el 28 oct.

const mensaje = (err: unknown) => (err instanceof ApiError ? err.message : 'Error de conexión')
const hora = (fecha: string) =>
  new Date(fecha).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
const etiquetaCampo = 'flex flex-col gap-1 text-xs text-piedra'

function MensajeError({ texto }: { texto: string }) {
  return texto ? <Aviso tipo="error">{texto}</Aviso> : null
}

function Fila({ texto, valor }: { texto: string; valor: string }) {
  return (
    <div className="flex justify-between gap-3 py-[9px] text-sm">
      <dt className="text-grafito">{texto}</dt>
      <dd className="num">{valor}</dd>
    </div>
  )
}

function Total({ texto, valor, grande }: { texto: string; valor: string; grande?: boolean }) {
  return (
    <div className="mt-auto flex items-baseline justify-between gap-3 border-t border-linea pt-3">
      <dt className="font-medium">{texto}</dt>
      <dd className={`num font-semibold ${grande ? 'text-[22px]' : 'text-lg'}`}>{valor}</dd>
    </div>
  )
}

/** Campo de monto grande con signo de pesos, como en el prototipo. */
function CampoMonto({
  etiqueta,
  valor,
  onCambio,
  autoFocus,
}: {
  etiqueta: ReactNode
  valor: string
  onCambio: (v: string) => void
  autoFocus?: boolean
}) {
  return (
    <label className="flex flex-col gap-1.5 text-[13px] font-medium">
      {etiqueta}
      <span className="flex h-[52px] items-center gap-1.5 rounded-[10px] border-[1.5px] border-tinta bg-superficie px-3.5 focus-within:border-maiz">
        <span aria-hidden="true" className="num text-[17px] text-piedra">
          $
        </span>
        <input
          className="num min-w-0 flex-1 bg-transparent text-right text-xl font-normal outline-none"
          autoFocus={autoFocus}
          inputMode="decimal"
          placeholder="0.00"
          value={valor}
          onChange={(e) => onCambio(e.target.value)}
        />
      </span>
    </label>
  )
}

export function CajaPage() {
  const [turno, setTurno] = useState<Turno | null | undefined>(undefined)
  const [corte, setCorte] = useState<Corte | null>(null)
  const [cerrado, setCerrado] = useState<CorteCerrado | null>(null)
  const [error, setError] = useState('')

  const cargar = useCallback(async () => {
    try {
      const { turno } = await api.get<{ turno: Turno | null }>('/caja/actual')
      setTurno(turno)
      setCorte(turno ? await api.get<Corte>('/caja/actual/corte') : null)
      setError('')
    } catch (err) {
      setError(mensaje(err))
    }
  }, [])

  useEffect(() => {
    void cargar()
  }, [cargar])

  const resumenCierre = cerrado && (
    <ResumenCierre corte={cerrado} onCerrar={() => setCerrado(null)} />
  )

  if (turno && corte) {
    return (
      <PaginaConPanel
        etiquetaPanel="Cerrar caja"
        panel={
          <CerrarCaja
            corte={corte}
            onCerrada={(c) => {
              setCerrado(c)
              avisarCambioCaja()
              void cargar()
            }}
          />
        }
      >
        <EncabezadoPagina
          titulo="Corte del turno"
          subtitulo={`Abierta desde ${hora(corte.abiertoEn)}`}
        />
        <MensajeError texto={error} />
        {resumenCierre}
        <ResumenCorte corte={corte} />
        <PagoProveedor corte={corte} onRegistrado={cargar} />
      </PaginaConPanel>
    )
  }

  return (
    <Pagina>
      <EncabezadoPagina titulo="Caja" />
      <MensajeError texto={error} />
      {resumenCierre}
      {turno === undefined && (
        <Tarjeta className="flex max-w-xl flex-col gap-3 p-5">
          <span className="sr-only" role="status">
            Consultando la caja…
          </span>
          <Esqueleto className="h-4 w-1/3" />
          <Esqueleto className="h-3 w-3/4" />
          <Esqueleto className="h-[52px] w-full" />
          <Esqueleto className="h-10 w-32" />
        </Tarjeta>
      )}
      {turno === null && !cerrado && <AbrirCaja onAbierta={cargar} />}
    </Pagina>
  )
}

function AbrirCaja({ onAbierta }: { onAbierta: () => void }) {
  const [monto, setMonto] = useState('')
  const [error, setError] = useState('')

  async function abrir(e: FormEvent) {
    e.preventDefault()
    setError('')
    try {
      await api.post('/caja/abrir', { montoInicial: monto.trim() || '0' })
      avisarCambioCaja()
      onAbierta()
    } catch (err) {
      setError(mensaje(err))
    }
  }

  return (
    <Tarjeta className="max-w-xl">
      <form onSubmit={abrir} className="flex flex-col gap-4 p-5">
        <div className="flex flex-col gap-1">
          <h2 className="text-sm font-semibold">Abrir caja</h2>
          <p className="text-[13px] leading-relaxed text-piedra">
            Cuenta el efectivo con el que empiezas tu turno. Sin caja abierta no puedes cobrar.
          </p>
        </div>
        <CampoMonto
          etiqueta="Monto inicial en efectivo"
          valor={monto}
          onCambio={setMonto}
          autoFocus
        />
        <MensajeError texto={error} />
        <Boton type="submit" tamano="lg" className="self-start">
          Abrir caja
        </Boton>
      </form>
    </Tarjeta>
  )
}

const BARRAS = [
  { clave: 'EFECTIVO', nombre: 'Efectivo', color: 'bg-tinta' },
  { clave: 'TARJETA', nombre: 'Tarjeta', color: 'bg-maiz' },
  { clave: 'TRANSFERENCIA', nombre: 'Transferencia', color: 'bg-piedra' },
] as const

function ResumenCorte({ corte }: { corte: Corte }) {
  const total = new Decimal(corte.totalVendido)
  const porcentaje = (monto: string) =>
    total.isZero()
      ? 0
      : Decimal.max(0, Decimal.min(100, new Decimal(monto).div(total).times(100))).toNumber()

  return (
    <section
      aria-label="Resumen del corte"
      className="grid grid-cols-[repeat(auto-fit,minmax(min(300px,100%),1fr))] gap-3"
    >
      <Tarjeta className="flex flex-col gap-1 p-[18px]">
        <h2 className="mb-2 text-sm font-semibold">Ventas por forma de pago</h2>
        <dl className="flex flex-1 flex-col">
          {BARRAS.map((b) => (
            <div key={b.clave} className="flex flex-col gap-1.5 py-2">
              <div className="flex justify-between gap-3 text-sm">
                <dt className="text-grafito">{b.nombre}</dt>
                <dd className="num">{pesos(corte.ventasPorMetodo[b.clave])}</dd>
              </div>
              <div aria-hidden="true" className="h-1.5 overflow-hidden rounded-full bg-crema">
                <div
                  className={`h-full rounded-full ${b.color}`}
                  style={{ width: `${porcentaje(corte.ventasPorMetodo[b.clave])}%` }}
                />
              </div>
            </div>
          ))}
          <Total
            texto={`Total vendido · ${corte.numeroVentas} ${corte.numeroVentas === 1 ? 'venta' : 'ventas'}`}
            valor={pesos(corte.totalVendido)}
          />
        </dl>
      </Tarjeta>
      <Tarjeta className="flex flex-col p-[18px]">
        <h2 className="mb-2 text-sm font-semibold">Efectivo en caja</h2>
        <dl className="flex flex-1 flex-col">
          <Fila texto="Monto inicial" valor={pesos(corte.montoInicial)} />
          <Fila
            texto="Ventas en efectivo, neto de cambio"
            valor={`+ ${pesos(corte.ventasPorMetodo.EFECTIVO)}`}
          />
          <Fila
            texto="Pagos a proveedor en efectivo"
            valor={`− ${pesos(corte.pagosProveedor.EFECTIVO)}`}
          />
          <Total texto="Efectivo esperado" valor={pesos(corte.efectivoEsperado)} grande />
        </dl>
        <p className="mt-2 text-xs text-piedra">
          Las transferencias a proveedores (
          <span className="num">{pesos(corte.pagosProveedor.TRANSFERENCIA)}</span>) no salen de la
          caja.
        </p>
      </Tarjeta>
    </section>
  )
}

const pagoVacio = {
  proveedor: '',
  monto: '',
  metodo: 'EFECTIVO' as 'EFECTIVO' | 'TRANSFERENCIA',
  comentario: '',
}

const METODOS_PAGO = [
  { valor: 'EFECTIVO', texto: 'Efectivo' },
  { valor: 'TRANSFERENCIA', texto: 'Transferencia' },
] as const

function PagoProveedor({ corte, onRegistrado }: { corte: Corte; onRegistrado: () => void }) {
  const [form, setForm] = useState(pagoVacio)
  const [proveedores, setProveedores] = useState<Proveedor[]>([])
  const [error, setError] = useState('')
  const [aviso, setAviso] = useState('')

  useEffect(() => {
    api
      .get<Proveedor[]>('/caja/proveedores')
      .then(setProveedores)
      .catch(() => setProveedores([]))
  }, [aviso])

  async function registrar(e: FormEvent) {
    e.preventDefault()
    setError('')
    setAviso('')
    try {
      await api.post('/caja/actual/pagos-proveedor', {
        ...form,
        comentario: form.comentario.trim() || undefined,
      })
      setAviso(`Pago a ${form.proveedor.trim()} registrado.`)
      setForm(pagoVacio)
      onRegistrado()
    } catch (err) {
      setError(mensaje(err))
    }
  }

  const pagos = corte.pagosProveedor.detalle

  return (
    <Tarjeta className="overflow-hidden">
      <section aria-labelledby="h-proveedores">
        <div className="flex items-center justify-between px-4 py-3.5">
          <h2 id="h-proveedores" className="text-sm font-semibold">
            Pagos a proveedor
          </h2>
        </div>
        <form onSubmit={registrar} className="flex flex-col gap-3 px-4 pb-4">
          <div className="flex flex-wrap items-end gap-2.5">
            <label className={`${etiquetaCampo} flex-[2_1_200px]`}>
              Proveedor
              <input
                className="campo"
                list="lista-proveedores"
                placeholder="Ej. Bimbo"
                value={form.proveedor}
                onChange={(e) => setForm({ ...form, proveedor: e.target.value })}
              />
              <datalist id="lista-proveedores">
                {proveedores.map((p) => (
                  <option key={p.id} value={p.nombre} />
                ))}
              </datalist>
            </label>
            <label className={`${etiquetaCampo} flex-[1_1_120px]`}>
              Monto
              <input
                className="campo num text-right"
                inputMode="decimal"
                placeholder="0.00"
                value={form.monto}
                onChange={(e) => setForm({ ...form, monto: e.target.value })}
              />
            </label>
            <div className={etiquetaCampo}>
              <span id="forma-pago">Forma de pago</span>
              <div
                role="group"
                aria-labelledby="forma-pago"
                className="flex h-10 overflow-hidden rounded-lg border border-borde"
              >
                {METODOS_PAGO.map((m) => {
                  const activo = form.metodo === m.valor
                  return (
                    <button
                      key={m.valor}
                      type="button"
                      aria-pressed={activo}
                      onClick={() => setForm({ ...form, metodo: m.valor })}
                      className={`px-3 text-[13px] transition-colors ${
                        activo ? 'bg-tinta text-white' : 'bg-superficie text-tinta hover:bg-crema'
                      }`}
                    >
                      {m.texto}
                    </button>
                  )
                })}
              </div>
            </div>
            <Boton type="submit">Registrar</Boton>
          </div>
          <label className={etiquetaCampo}>
            Comentario (opcional)
            <input
              className="campo"
              value={form.comentario}
              onChange={(e) => setForm({ ...form, comentario: e.target.value })}
            />
          </label>
          {form.metodo === 'EFECTIVO' && (
            <p className="text-xs text-piedra">El pago en efectivo sale de la caja.</p>
          )}
          <MensajeError texto={error} />
          {aviso && <Aviso tipo="ok">{aviso}</Aviso>}
        </form>
        {pagos.length === 0 ? (
          <p className="border-t border-linea px-4 py-6 text-center text-sm text-piedra">
            Aún no hay pagos a proveedor en este turno.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] border-collapse text-sm">
              <thead>
                <tr className="text-left text-xs text-piedra">
                  <th scope="col" className="border-t border-linea px-4 py-2 font-medium">
                    Proveedor
                  </th>
                  <th scope="col" className="border-t border-linea px-2 py-2 font-medium">
                    Forma de pago
                  </th>
                  <th scope="col" className="border-t border-linea px-2 py-2 font-medium">
                    Hora
                  </th>
                  <th
                    scope="col"
                    className="border-t border-linea px-4 py-2 text-right font-medium"
                  >
                    Monto
                  </th>
                </tr>
              </thead>
              <tbody>
                {pagos.map((p) => (
                  <tr key={p.id} className="hover:bg-hueso">
                    <td className="border-t border-linea px-4 py-3">
                      <span className="flex flex-col gap-0.5">
                        <span>{p.proveedor}</span>
                        {p.comentario && (
                          <span className="text-xs text-piedra">{p.comentario}</span>
                        )}
                      </span>
                    </td>
                    <td className="border-t border-linea px-2 py-2">
                      <Chip tono={p.metodo === 'EFECTIVO' ? 'neutro' : 'cielo'}>
                        {p.metodo === 'EFECTIVO' ? 'Efectivo' : 'Transferencia'}
                      </Chip>
                    </td>
                    <td className="num border-t border-linea px-2 py-2 text-piedra">
                      {hora(p.creadoEn)}
                    </td>
                    <td className="num border-t border-linea px-4 py-2 text-right">
                      {pesos(p.monto)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </Tarjeta>
  )
}

function CerrarCaja({ corte, onCerrada }: { corte: Corte; onCerrada: (c: CorteCerrado) => void }) {
  const [contado, setContado] = useState('')
  const [comentario, setComentario] = useState('')
  const [error, setError] = useState('')

  let diferencia: Decimal | null = null
  if (/^\d+(\.\d{1,2})?$/.test(contado.trim()))
    diferencia = new Decimal(contado.trim()).minus(corte.efectivoEsperado)

  async function cerrar(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (!window.confirm('¿Cerrar la caja? Ya no podrás cobrar en este turno.')) return
    try {
      onCerrada(
        await api.post<CorteCerrado>('/caja/actual/cerrar', {
          efectivoContado: contado.trim(),
          comentario: comentario.trim() || undefined,
        }),
      )
    } catch (err) {
      setError(mensaje(err))
    }
  }

  const hayDiferencia = diferencia !== null && !diferencia.isZero()
  const estado =
    diferencia === null
      ? { clase: 'bg-crema text-piedra', texto: 'Escribe el efectivo contado' }
      : diferencia.isZero()
        ? { clase: 'bg-hoja-claro text-hoja-texto', texto: 'La caja cuadra' }
        : diferencia.isPositive()
          ? { clase: 'bg-maiz-claro text-maiz-texto', texto: 'Sobrante' }
          : { clase: 'bg-chile-claro text-chile-texto', texto: 'Faltante' }

  return (
    <form onSubmit={cerrar} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h2 className="text-sm font-semibold">Cerrar caja</h2>
        <p className="text-[13px] leading-relaxed text-piedra">
          Cuenta el efectivo del cajón. Si no coincide con lo esperado, explica la diferencia.
        </p>
      </div>
      <CampoMonto etiqueta="Efectivo contado" valor={contado} onCambio={setContado} />
      <div
        aria-live="polite"
        className={`flex items-baseline justify-between gap-3 rounded-[10px] px-4 py-3.5 transition-colors ${estado.clase}`}
      >
        <span className="text-[13px] font-medium">{estado.texto}</span>
        <span className="num text-[22px] font-semibold">
          {diferencia === null ? '—' : pesos(diferencia.abs().toFixed(2))}
        </span>
      </div>
      <label className="flex flex-col gap-1.5 text-[13px] font-medium">
        <span className="flex items-center gap-2">
          Comentario
          {hayDiferencia ? (
            <Chip tono="chile">obligatorio</Chip>
          ) : (
            <span className="font-normal text-piedra">(opcional)</span>
          )}
        </span>
        <textarea
          rows={3}
          className="resize-y rounded-lg border border-borde bg-superficie p-2.5 text-sm font-normal text-tinta outline-none focus:border-tinta"
          placeholder={
            hayDiferencia ? 'Explica la diferencia' : 'Ej. Se dio cambio de más en una venta'
          }
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
        />
      </label>
      <MensajeError texto={error} />
      <Boton type="submit" tamano="lg" className="w-full">
        Cerrar caja
      </Boton>
    </form>
  )
}

function ResumenCierre({ corte, onCerrar }: { corte: CorteCerrado; onCerrar: () => void }) {
  const diferencia = new Decimal(corte.diferencia)
  const estado = diferencia.isZero()
    ? { clase: 'bg-hoja-claro text-hoja-texto', texto: 'La caja cuadró' }
    : diferencia.isPositive()
      ? { clase: 'bg-maiz-claro text-maiz-texto', texto: 'Sobrante' }
      : { clase: 'bg-chile-claro text-chile-texto', texto: 'Faltante' }

  return (
    <Tarjeta className="flex max-w-xl flex-col gap-4 p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold">Caja cerrada</h2>
        <span className="text-xs text-piedra">a las {hora(corte.cerradoEn)}</span>
      </div>
      <dl className="flex flex-col">
        <Fila texto={`Ventas (${corte.numeroVentas})`} valor={pesos(corte.totalVendido)} />
        <Fila texto="Efectivo esperado" valor={pesos(corte.efectivoEsperado)} />
        <Fila texto="Efectivo contado" valor={pesos(corte.efectivoContado)} />
      </dl>
      <div
        className={`flex items-baseline justify-between gap-3 rounded-[10px] px-4 py-3.5 ${estado.clase}`}
      >
        <span className="text-[13px] font-medium">{estado.texto}</span>
        <span className="num text-[22px] font-semibold">{pesos(diferencia.abs().toString())}</span>
      </div>
      {corte.comentario && (
        <p className="text-[13px] text-grafito">
          <span className="text-piedra">Comentario:</span> {corte.comentario}
        </p>
      )}
      <Boton variante="secundario" onClick={onCerrar} className="self-start">
        Aceptar
      </Boton>
    </Tarjeta>
  )
}
