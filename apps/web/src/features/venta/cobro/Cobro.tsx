// HU-06 (Sosa): cobro con efectivo, tarjeta y transferencia; pago mixto, referencia y cambio.
// El resumen se calcula aquí solo para guiar al cajero: el servidor recalcula todo al confirmar.
import Decimal from 'decimal.js'
import { useState } from 'react'
import { api, ApiError } from '../../../api/client'
import { useCarrito } from '../carrito/store'

type MetodoPago = 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA'

type PagoForm = { id: number; metodo: MetodoPago; monto: string; referencia: string }

type VentaCreada = { id: number; total: string; cambio: string }

const METODOS: { valor: MetodoPago; texto: string }[] = [
  { valor: 'EFECTIVO', texto: 'Efectivo' },
  { valor: 'TARJETA', texto: 'Tarjeta' },
  { valor: 'TRANSFERENCIA', texto: 'Transferencia' },
]

const MONTO_VALIDO = /^\d+(\.\d{1,2})?$/

/** Monto capturado como Decimal; vacío o inválido cuenta como 0 en el resumen. */
const aDecimal = (monto: string) => (MONTO_VALIDO.test(monto.trim()) ? new Decimal(monto.trim()) : new Decimal(0))

let siguienteId = 1
const nuevoPago = (metodo: MetodoPago = 'EFECTIVO', monto = ''): PagoForm => ({
  id: siguienteId++,
  metodo,
  monto,
  referencia: '',
})

export function Cobro() {
  const renglones = useCarrito((s) => s.renglones)
  const total = useCarrito((s) => s.total)
  const vaciar = useCarrito((s) => s.vaciar)

  const [abierto, setAbierto] = useState(false)
  const [pagos, setPagos] = useState<PagoForm[]>([])
  const [error, setError] = useState<string | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  const totalVenta = new Decimal(total())
  const pagado = pagos.reduce((acc, p) => acc.plus(aDecimal(p.monto)), new Decimal(0))
  const diferencia = pagado.minus(totalVenta)
  const necesitaReferencia = (m: MetodoPago) => m !== 'EFECTIVO'

  const abrir = () => {
    setPagos([nuevoPago('EFECTIVO', totalVenta.toFixed(2))])
    setError(null)
    setAviso(null)
    setAbierto(true)
  }

  const editar = (id: number, cambios: Partial<PagoForm>) =>
    setPagos((ps) => ps.map((p) => (p.id === id ? { ...p, ...cambios } : p)))

  const agregar = () => {
    const faltante = diferencia.isNegative() ? diferencia.negated().toFixed(2) : ''
    setPagos((ps) => [...ps, nuevoPago('TARJETA', faltante)])
  }

  const quitar = (id: number) => setPagos((ps) => ps.filter((p) => p.id !== id))

  const confirmar = async () => {
    setError(null)
    setEnviando(true)
    try {
      const venta = await api.post<VentaCreada>('/ventas', {
        renglones: renglones.map((r) => ({ productoId: r.productoId, cantidad: r.cantidad })),
        pagos: pagos.map((p) => ({
          metodo: p.metodo,
          monto: p.monto.trim(),
          ...(necesitaReferencia(p.metodo) && { referencia: p.referencia.trim() }),
        })),
      })
      setAviso(`Venta registrada · Cambio $${venta.cambio}`)
      vaciar()
      setAbierto(false)
      setPagos([])
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo registrar la venta')
    } finally {
      setEnviando(false)
    }
  }

  const vacio = renglones.length === 0

  return (
    <div className="mt-4">
      {aviso && (
        <p className="mb-3 rounded border border-emerald-300 bg-emerald-50 p-3 font-medium text-emerald-800">{aviso}</p>
      )}

      {!abierto && (
        <button
          onClick={abrir}
          disabled={vacio}
          className="rounded bg-emerald-700 px-6 py-3 text-lg font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          Cobrar ${total()}
        </button>
      )}

      {abierto && (
        <div className="rounded bg-white p-4 shadow">
          <h2 className="mb-3 text-xl font-semibold">Cobro</h2>

          <ul className="space-y-2">
            {pagos.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center gap-2">
                <select
                  value={p.metodo}
                  onChange={(e) => editar(p.id, { metodo: e.target.value as MetodoPago })}
                  className="rounded border border-slate-300 px-2 py-1"
                  aria-label="Método de pago"
                >
                  {METODOS.map((m) => (
                    <option key={m.valor} value={m.valor}>
                      {m.texto}
                    </option>
                  ))}
                </select>
                <input
                  value={p.monto}
                  onChange={(e) => editar(p.id, { monto: e.target.value })}
                  inputMode="decimal"
                  placeholder="0.00"
                  aria-label="Monto"
                  className={`w-32 rounded border px-2 py-1 text-right ${
                    p.monto === '' || MONTO_VALIDO.test(p.monto.trim()) ? 'border-slate-300' : 'border-red-400'
                  }`}
                />
                {necesitaReferencia(p.metodo) && (
                  <input
                    value={p.referencia}
                    onChange={(e) => editar(p.id, { referencia: e.target.value })}
                    placeholder="N.º de referencia"
                    aria-label="Número de referencia"
                    className="w-44 rounded border border-slate-300 px-2 py-1"
                  />
                )}
                {pagos.length > 1 && (
                  <button onClick={() => quitar(p.id)} className="text-sm text-red-600 hover:underline">
                    Quitar
                  </button>
                )}
              </li>
            ))}
          </ul>

          <button onClick={agregar} className="mt-3 text-sm font-medium text-emerald-700 hover:underline">
            + Agregar pago
          </button>

          <dl className="mt-4 grid max-w-xs grid-cols-2 gap-y-1">
            <dt>Total</dt>
            <dd className="text-right font-semibold">${totalVenta.toFixed(2)}</dd>
            <dt>Pagado</dt>
            <dd className="text-right">${pagado.toFixed(2)}</dd>
            {diferencia.isNegative() ? (
              <>
                <dt className="text-red-700">Faltante</dt>
                <dd className="text-right font-semibold text-red-700">${diferencia.negated().toFixed(2)}</dd>
              </>
            ) : (
              <>
                <dt className="text-emerald-700">Cambio</dt>
                <dd className="text-right text-lg font-bold text-emerald-700">${diferencia.toFixed(2)}</dd>
              </>
            )}
          </dl>

          {error && <p className="mt-3 rounded border border-red-300 bg-red-50 p-2 text-red-700">{error}</p>}

          <div className="mt-4 flex gap-2">
            <button
              onClick={confirmar}
              disabled={enviando || pagos.length === 0}
              className="rounded bg-emerald-700 px-4 py-2 font-semibold text-white hover:bg-emerald-800 disabled:bg-slate-300"
            >
              {enviando ? 'Registrando…' : 'Confirmar venta'}
            </button>
            <button
              onClick={() => setAbierto(false)}
              disabled={enviando}
              className="rounded border border-slate-300 px-4 py-2 hover:bg-slate-100"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
