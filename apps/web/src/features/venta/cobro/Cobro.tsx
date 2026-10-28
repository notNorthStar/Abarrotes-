// HU-06 (Sosa): cobro con efectivo, tarjeta y transferencia; pago mixto, referencia y cambio.
// El resumen se calcula aquí solo para guiar al cajero: el servidor recalcula todo al confirmar.
import Decimal from 'decimal.js'
import { useEffect, useRef, useState } from 'react'
import { api, ApiError } from '../../../api/client'
import { Icono } from '../../../components/Icono'
import { Aviso, Boton, Tecla, pesos } from '../../../components/ui'
import { useCarrito } from '../carrito/store'

type MetodoPago = 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA'

type PagoForm = { id: number; metodo: MetodoPago; monto: string; referencia: string }

type VentaCreada = { id: number; total: string; cambio: string }

const METODOS: { valor: MetodoPago; texto: string; quitar: string }[] = [
  { valor: 'EFECTIVO', texto: 'Efectivo', quitar: 'Quitar pago en efectivo' },
  { valor: 'TARJETA', texto: 'Tarjeta', quitar: 'Quitar pago con tarjeta' },
  { valor: 'TRANSFERENCIA', texto: 'Transferencia', quitar: 'Quitar pago por transferencia' },
]

const metodo = (valor: MetodoPago) => METODOS.find((m) => m.valor === valor) ?? METODOS[0]

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

const claseCampo =
  'num h-10 min-w-0 rounded-lg border bg-superficie px-2.5 text-[15px] text-tinta outline-none focus:border-tinta'

export function Cobro() {
  const renglones = useCarrito((s) => s.renglones)
  const total = useCarrito((s) => s.total)
  const vaciar = useCarrito((s) => s.vaciar)

  const [pagos, setPagos] = useState<PagoForm[]>([])
  const [error, setError] = useState<string | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  const totalVenta = new Decimal(total())
  const pagado = pagos.reduce((acc, p) => acc.plus(aDecimal(p.monto)), new Decimal(0))
  const diferencia = pagado.minus(totalVenta)
  const necesitaReferencia = (m: MetodoPago) => m !== 'EFECTIVO'

  const editar = (id: number, cambios: Partial<PagoForm>) =>
    setPagos((ps) => ps.map((p) => (p.id === id ? { ...p, ...cambios } : p)))

  /** Agrega una forma de pago precargada con lo que falta por cubrir. */
  const agregar = (m: MetodoPago) => {
    const faltante = diferencia.isNegative() ? diferencia.negated().toFixed(2) : ''
    setError(null)
    setAviso(null)
    setPagos((ps) => [...ps, nuevoPago(m, faltante)])
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
      setPagos([])
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo registrar la venta')
    } finally {
      setEnviando(false)
    }
  }

  const vacio = renglones.length === 0
  const puedeConfirmar = !vacio && !enviando && pagos.length > 0

  // F9 confirma la venta (mismo efecto que el botón).
  const atajo = useRef<() => void>(() => {})
  atajo.current = () => {
    if (puedeConfirmar) void confirmar()
  }
  useEffect(() => {
    function alTeclear(e: KeyboardEvent) {
      if (e.key !== 'F9') return
      e.preventDefault()
      atajo.current()
    }
    window.addEventListener('keydown', alTeclear)
    return () => window.removeEventListener('keydown', alTeclear)
  }, [])

  const faltante = diferencia.isNegative()

  return (
    <>
      <div className="flex flex-col gap-1">
        <h2 className="text-sm font-semibold">Cobro</h2>
        <span className="text-[13px] text-piedra">Total a cobrar</span>
        <span className="num text-[40px] font-semibold leading-[1.1] tracking-[-0.03em]">{pesos(totalVenta.toFixed(2))}</span>
      </div>

      {aviso && <Aviso tipo="ok">{aviso}</Aviso>}

      <div className="flex flex-col gap-2">
        <span id="titulo-forma-pago" className="text-xs text-piedra">
          Agregar forma de pago
        </span>
        <div role="group" aria-labelledby="titulo-forma-pago" className="grid grid-cols-3 gap-1.5">
          {METODOS.map((m) => (
            <button
              key={m.valor}
              type="button"
              onClick={() => agregar(m.valor)}
              disabled={vacio || enviando}
              className="h-10 rounded-lg border border-linea bg-hueso text-[13px] transition-colors hover:bg-[#EFEDE7] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {m.texto}
            </button>
          ))}
        </div>
      </div>

      {pagos.length > 0 && (
        <ul aria-label="Pagos" className="flex flex-col gap-2.5">
          {pagos.map((p) => {
            const montoInvalido = p.monto !== '' && !MONTO_VALIDO.test(p.monto.trim())
            const campoMonto = (
              <label className="flex flex-col gap-1 text-xs text-piedra">
                {p.metodo === 'EFECTIVO' ? 'Recibido' : 'Monto'}
                <input
                  value={p.monto}
                  onChange={(e) => editar(p.id, { monto: e.target.value })}
                  inputMode="decimal"
                  placeholder="0.00"
                  aria-invalid={montoInvalido}
                  className={`${claseCampo} text-right ${montoInvalido ? 'border-chile' : 'border-borde'}`}
                />
              </label>
            )
            return (
              <li key={p.id} className="flex flex-col gap-1.5 rounded-[10px] border border-linea p-3">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-medium">{metodo(p.metodo).texto}</span>
                  <button
                    type="button"
                    onClick={() => quitar(p.id)}
                    disabled={enviando}
                    aria-label={metodo(p.metodo).quitar}
                    className="flex h-8 w-8 items-center justify-center rounded-md text-piedra transition-colors hover:bg-[#EFEDE7] hover:text-tinta disabled:opacity-50"
                  >
                    <Icono nombre="cerrar" tamano={14} />
                  </button>
                </div>
                {necesitaReferencia(p.metodo) ? (
                  <div className="grid grid-cols-2 gap-2">
                    {campoMonto}
                    <label className="flex flex-col gap-1 text-xs text-piedra">
                      Referencia
                      <input
                        value={p.referencia}
                        onChange={(e) => editar(p.id, { referencia: e.target.value })}
                        placeholder="N.º"
                        className={`${claseCampo} border-borde`}
                      />
                    </label>
                  </div>
                ) : (
                  campoMonto
                )}
              </li>
            )
          })}
        </ul>
      )}

      <dl className="flex flex-col text-sm">
        <div className="flex justify-between py-1.5">
          <dt className="text-piedra">Total</dt>
          <dd className="num">{pesos(totalVenta.toFixed(2))}</dd>
        </div>
        <div className="flex justify-between py-1.5">
          <dt className="text-piedra">Pagado</dt>
          <dd className="num">{pesos(pagado.toFixed(2))}</dd>
        </div>
        <div className="mt-1 flex items-baseline justify-between border-t border-linea pt-2.5">
          <dt className={`font-medium ${faltante ? 'text-chile' : 'text-hoja-texto'}`}>{faltante ? 'Faltante' : 'Cambio'}</dt>
          <dd className={`num text-[22px] font-semibold ${faltante ? 'text-chile' : 'text-hoja-texto'}`}>
            {pesos((faltante ? diferencia.negated() : diferencia).toFixed(2))}
          </dd>
        </div>
      </dl>

      {error && <Aviso tipo="error">{error}</Aviso>}

      <Boton tamano="lg" onClick={confirmar} disabled={!puedeConfirmar} className="h-12 gap-2.5 rounded-[10px]">
        {enviando ? 'Registrando…' : 'Confirmar venta'}
        <Tecla oscura>F9</Tecla>
      </Boton>

      <div className="mt-auto flex flex-wrap gap-x-3.5 gap-y-1.5 border-t border-[#EEEBE5] pt-3.5 text-xs text-piedra">
        <span>
          <span className="num text-tinta">Enter</span> agregar código
        </span>
        <span>
          <span className="num text-tinta">F9</span> cobrar
        </span>
        <span>
          <span className="num text-tinta">F2</span> ir a venta
        </span>
      </div>
    </>
  )
}
