import { useState, type FormEvent } from 'react'
import Decimal from 'decimal.js'
import { Icono } from '../../../components/Icono'
import { pesos } from '../../../components/ui'
import { useCarrito, type Renglon } from './store'

const celda = 'border-t border-[#F0EEE8]'
const paso =
  'flex h-9 w-9 items-center justify-center bg-superficie transition-colors hover:bg-[#EFEDE7] disabled:cursor-not-allowed disabled:opacity-40'

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
  const esKilo = r.unidad === 'KILO'

  function aplicar(nueva: string) {
    try {
      cambiar(r.productoId, nueva)
      setError('')
      alTerminar()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Cantidad inválida.')
    }
  }

  function guardar(e: FormEvent) {
    e.preventDefault()
    aplicar(cantidad)
  }

  const campo = (
    <>
      <label className="sr-only" htmlFor={`cantidad-${r.productoId}`}>
        Cantidad de {r.nombre} {esKilo ? 'en kilos' : 'en piezas'}
      </label>
      <input
        id={`cantidad-${r.productoId}`}
        value={cantidad}
        onChange={(e) => {
          setCantidad(e.target.value)
          setError('')
        }}
        inputMode={esKilo ? 'decimal' : 'numeric'}
        aria-invalid={!!error}
        aria-describedby={error ? `error-${r.productoId}` : undefined}
        className={`num h-9 bg-transparent text-center text-sm outline-none ${esKilo ? 'w-16' : 'w-12'}`}
      />
      <button className="sr-only" aria-label={`Actualizar cantidad de ${r.nombre}`}>
        Actualizar
      </button>
    </>
  )

  return (
    <tr className="hover:bg-[#FAF9F6]">
      <th scope="row" className={`${celda} px-4 py-3 font-normal`}>
        {r.nombre}
      </th>
      <td className={`${celda} p-2`}>
        <form onSubmit={guardar}>
          {esKilo ? (
            <span className="inline-flex h-[38px] items-center gap-1 rounded-lg border border-dashed border-borde pl-3 pr-3 focus-within:border-tinta">
              <Icono nombre="granel" tamano={16} />
              {campo}
              <span className="num">kg</span>
            </span>
          ) : (
            <span className="inline-flex items-center overflow-hidden rounded-lg border border-linea focus-within:border-tinta">
              <button
                type="button"
                className={paso}
                aria-label={`Quitar una pieza de ${r.nombre}`}
                disabled={new Decimal(r.cantidad).lte(1)}
                onClick={() => aplicar(new Decimal(r.cantidad).minus(1).toString())}
              >
                <Icono nombre="menos" tamano={16} />
              </button>
              {campo}
              <button
                type="button"
                className={paso}
                aria-label={`Agregar una pieza de ${r.nombre}`}
                onClick={() => aplicar(new Decimal(r.cantidad).plus(1).toString())}
              >
                <Icono nombre="mas" tamano={16} />
              </button>
            </span>
          )}
        </form>
        {error && (
          <p id={`error-${r.productoId}`} role="alert" className="mt-1 max-w-xs text-xs text-chile-texto">
            {error}
          </p>
        )}
      </td>
      <td className={`${celda} num p-2 text-right text-piedra`}>
        {pesos(r.precio)}
        {esKilo && ' / kg'}
      </td>
      <td className={`${celda} num p-2 text-right font-medium`}>{pesos(r.subtotal)}</td>
      <td className={`${celda} py-2 pl-2 pr-4 text-right`}>
        <button
          type="button"
          onClick={() => {
            quitar(r.productoId)
            alTerminar()
          }}
          aria-label={`Quitar ${r.nombre}`}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-piedra transition-colors hover:bg-chile-claro hover:text-chile-texto"
        >
          <Icono nombre="basura" tamano={16} />
        </button>
      </td>
    </tr>
  )
}
