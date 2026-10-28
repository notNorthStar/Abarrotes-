import Decimal from 'decimal.js'
import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { api, ApiError } from '../../api/client'
import type { Corte, CorteCerrado, Proveedor, Turno } from './tipos'

// HU-05 (abrir caja, corte y cierre) y HU-09 (pagos a proveedor). Sosa, reasignadas de Gonzalo el 28 oct.

const mensaje = (err: unknown) => (err instanceof ApiError ? err.message : 'Error de conexión')
const pesos = (v: string) => `$${new Decimal(v).toFixed(2)}`
const campo = 'w-full rounded border px-3 py-2'
const tarjeta = 'space-y-3 rounded-lg bg-white p-5 shadow'

function MensajeError({ texto }: { texto: string }) {
  return texto ? <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{texto}</p> : null
}

function Fila({ texto, valor, fuerte }: { texto: string; valor: string; fuerte?: boolean }) {
  return (
    <div className={`flex justify-between py-1 ${fuerte ? 'border-t font-semibold' : ''}`}>
      <span>{texto}</span>
      <span>{valor}</span>
    </div>
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

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold">Caja</h1>
      <MensajeError texto={error} />
      {cerrado && <ResumenCierre corte={cerrado} onCerrar={() => setCerrado(null)} />}
      {turno === undefined && <p className="text-slate-500">Cargando…</p>}
      {turno === null && !cerrado && <AbrirCaja onAbierta={cargar} />}
      {turno && corte && (
        <>
          <ResumenCorte corte={corte} />
          <PagoProveedor onRegistrado={cargar} />
          <CerrarCaja
            corte={corte}
            onCerrada={(c) => {
              setCerrado(c)
              void cargar()
            }}
          />
        </>
      )}
    </section>
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
      onAbierta()
    } catch (err) {
      setError(mensaje(err))
    }
  }

  return (
    <form onSubmit={abrir} className={tarjeta}>
      <h2 className="text-lg font-semibold">Abrir caja</h2>
      <p className="text-sm text-slate-600">
        Cuenta el efectivo con el que empiezas tu turno. Sin caja abierta no puedes cobrar.
      </p>
      <label className="block max-w-xs text-sm">
        Monto inicial en efectivo
        <input
          className={campo}
          autoFocus
          inputMode="decimal"
          placeholder="0.00"
          value={monto}
          onChange={(e) => setMonto(e.target.value)}
        />
      </label>
      <MensajeError texto={error} />
      <button className="rounded bg-emerald-700 px-4 py-2 font-semibold text-white hover:bg-emerald-800">
        Abrir caja
      </button>
    </form>
  )
}

function ResumenCorte({ corte }: { corte: Corte }) {
  return (
    <section className={tarjeta}>
      <div className="flex items-baseline justify-between">
        <h2 className="text-lg font-semibold">Corte del turno</h2>
        <span className="text-sm text-slate-500">
          Abierta desde{' '}
          {new Date(corte.abiertoEn).toLocaleTimeString('es-MX', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="text-sm">
          <h3 className="mb-1 font-semibold text-slate-700">Ventas ({corte.numeroVentas})</h3>
          <Fila texto="Efectivo (neto de cambio)" valor={pesos(corte.ventasPorMetodo.EFECTIVO)} />
          <Fila texto="Tarjeta" valor={pesos(corte.ventasPorMetodo.TARJETA)} />
          <Fila texto="Transferencia" valor={pesos(corte.ventasPorMetodo.TRANSFERENCIA)} />
          <Fila texto="Total vendido" valor={pesos(corte.totalVendido)} fuerte />
        </div>
        <div className="text-sm">
          <h3 className="mb-1 font-semibold text-slate-700">Efectivo en caja</h3>
          <Fila texto="Monto inicial" valor={pesos(corte.montoInicial)} />
          <Fila texto="+ Ventas en efectivo" valor={pesos(corte.ventasPorMetodo.EFECTIVO)} />
          <Fila
            texto="− Pagos a proveedor en efectivo"
            valor={pesos(corte.pagosProveedor.EFECTIVO)}
          />
          <Fila texto="Efectivo esperado" valor={pesos(corte.efectivoEsperado)} fuerte />
          <p className="mt-1 text-xs text-slate-500">
            Pagos por transferencia a proveedores: {pesos(corte.pagosProveedor.TRANSFERENCIA)} (no
            salen de la caja)
          </p>
        </div>
      </div>
      {corte.pagosProveedor.detalle.length > 0 && (
        <table className="w-full text-left text-sm">
          <thead className="text-slate-500">
            <tr>
              <th className="py-1">Proveedor</th>
              <th>Forma de pago</th>
              <th>Monto</th>
              <th>Comentario</th>
            </tr>
          </thead>
          <tbody>
            {corte.pagosProveedor.detalle.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="py-1">{p.proveedor}</td>
                <td>{p.metodo === 'EFECTIVO' ? 'Efectivo' : 'Transferencia'}</td>
                <td>{pesos(p.monto)}</td>
                <td className="text-slate-600">{p.comentario}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  )
}

const pagoVacio = {
  proveedor: '',
  monto: '',
  metodo: 'EFECTIVO' as 'EFECTIVO' | 'TRANSFERENCIA',
  comentario: '',
}

function PagoProveedor({ onRegistrado }: { onRegistrado: () => void }) {
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

  return (
    <form onSubmit={registrar} className={tarjeta}>
      <h2 className="text-lg font-semibold">Pago a proveedor</h2>
      <div className="grid gap-3 sm:grid-cols-4">
        <label className="text-sm sm:col-span-2">
          Proveedor
          <input
            className={campo}
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
        <label className="text-sm">
          Monto
          <input
            className={campo}
            inputMode="decimal"
            placeholder="0.00"
            value={form.monto}
            onChange={(e) => setForm({ ...form, monto: e.target.value })}
          />
        </label>
        <label className="text-sm">
          Forma de pago
          <select
            className={campo}
            value={form.metodo}
            onChange={(e) => setForm({ ...form, metodo: e.target.value as typeof form.metodo })}
          >
            <option value="EFECTIVO">Efectivo (sale de la caja)</option>
            <option value="TRANSFERENCIA">Transferencia</option>
          </select>
        </label>
        <label className="text-sm sm:col-span-4">
          Comentario (opcional)
          <input
            className={campo}
            value={form.comentario}
            onChange={(e) => setForm({ ...form, comentario: e.target.value })}
          />
        </label>
      </div>
      <MensajeError texto={error} />
      {aviso && <p className="rounded bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{aviso}</p>}
      <button className="rounded bg-emerald-700 px-4 py-2 font-semibold text-white hover:bg-emerald-800">
        Registrar pago
      </button>
    </form>
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

  return (
    <form onSubmit={cerrar} className={tarjeta}>
      <h2 className="text-lg font-semibold">Cerrar caja</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          Efectivo contado
          <input
            className={campo}
            inputMode="decimal"
            placeholder="0.00"
            value={contado}
            onChange={(e) => setContado(e.target.value)}
          />
        </label>
        <div className="self-end text-sm">
          {diferencia &&
            (diferencia.isZero() ? (
              <p className="font-semibold text-emerald-700">La caja cuadra.</p>
            ) : (
              <p
                className={`font-semibold ${diferencia.isPositive() ? 'text-amber-700' : 'text-red-700'}`}
              >
                {diferencia.isPositive() ? 'Sobrante' : 'Faltante'} de $
                {diferencia.abs().toFixed(2)}
              </p>
            ))}
        </div>
        <label className="text-sm sm:col-span-2">
          Comentario{' '}
          {diferencia && !diferencia.isZero()
            ? '(obligatorio: explica la diferencia)'
            : '(opcional)'}
          <input
            className={campo}
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
          />
        </label>
      </div>
      <MensajeError texto={error} />
      <button className="rounded bg-slate-800 px-4 py-2 font-semibold text-white hover:bg-slate-900">
        Cerrar caja
      </button>
    </form>
  )
}

function ResumenCierre({ corte, onCerrar }: { corte: CorteCerrado; onCerrar: () => void }) {
  const diferencia = new Decimal(corte.diferencia)
  return (
    <section className={`${tarjeta} border-l-4 border-emerald-600`}>
      <h2 className="text-lg font-semibold">Caja cerrada</h2>
      <div className="max-w-md text-sm">
        <Fila texto={`Ventas (${corte.numeroVentas})`} valor={pesos(corte.totalVendido)} />
        <Fila texto="Efectivo esperado" valor={pesos(corte.efectivoEsperado)} />
        <Fila texto="Efectivo contado" valor={pesos(corte.efectivoContado)} />
        <Fila
          texto={
            diferencia.isZero() ? 'Diferencia' : diferencia.isPositive() ? 'Sobrante' : 'Faltante'
          }
          valor={pesos(diferencia.abs().toString())}
          fuerte
        />
        {corte.comentario && <p className="mt-2 text-slate-600">Comentario: {corte.comentario}</p>}
      </div>
      <button
        type="button"
        onClick={onCerrar}
        className="rounded border px-4 py-2 text-sm hover:bg-slate-50"
      >
        Aceptar
      </button>
    </section>
  )
}
