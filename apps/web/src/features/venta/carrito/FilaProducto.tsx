import { useState, type FormEvent } from 'react'
import Decimal from 'decimal.js'
import { useCarrito, type Renglon } from './store'

export function FilaProducto({
  renglon: r,
  alTerminar,
}: {
  renglon: Renglon
  alTerminar: () => void
}) {
  const cambiar = useCarrito((s) => s.cambiarCantidad)
  const quitar = useCarrito((s) => s.quitar)
  const [cantidad, setCantidad] = useState(r.cantidad)
  const [error, setError] = useState('')
  function guardar(e: FormEvent) {
    e.preventDefault()
    try {
      cambiar(r.productoId, cantidad)
      setError('')
      alTerminar()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Cantidad inválida.')
    }
  }
  return (
    <tr className="border-t">
      <th scope="row" className="py-3 font-normal">
        {r.nombre}
      </th>
      <td className="p-2">
        <form onSubmit={guardar} className="flex flex-wrap items-center gap-2">
          <label className="sr-only" htmlFor={`cantidad-${r.productoId}`}>
            Cantidad de {r.nombre}
          </label>
          <input
            id={`cantidad-${r.productoId}`}
            value={cantidad}
            onChange={(e) => {
              setCantidad(e.target.value)
              setError('')
            }}
            inputMode={r.unidad === 'KILO' ? 'decimal' : 'numeric'}
            aria-invalid={!!error}
            aria-describedby={error ? `error-${r.productoId}` : undefined}
            className="w-24 rounded border p-2"
          />
          <span>{r.unidad === 'KILO' ? 'kg' : 'pzas'}</span>
          <button
            className="rounded border px-2 py-1"
            aria-label={`Actualizar cantidad de ${r.nombre}`}
          >
            Actualizar
          </button>
        </form>
        {error && (
          <p id={`error-${r.productoId}`} role="alert" className="mt-1 max-w-xs text-red-700">
            {error}
          </p>
        )}
      </td>
      <td className="p-2">
        ${new Decimal(r.precio).toFixed(2)} / {r.unidad === 'KILO' ? 'kg' : 'pieza'}
      </td>
      <td className="p-2">${r.subtotal}</td>
      <td className="p-2">
        <button
          type="button"
          onClick={() => {
            quitar(r.productoId)
            alTerminar()
          }}
          aria-label={`Quitar ${r.nombre}`}
          className="rounded border border-red-200 px-3 py-1 text-red-700"
        >
          Quitar
        </button>
      </td>
    </tr>
  )
}
