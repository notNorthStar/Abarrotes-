import { useEffect, useState, type FormEvent } from 'react'
import Decimal from 'decimal.js'
import { api, ApiError } from '../../api/client'
import type { Producto } from '../../api/tipos'

export function InventarioPage() {
  const [texto, setTexto] = useState('')
  const [consulta, setConsulta] = useState({ texto: '', intento: 0 })
  const [productos, setProductos] = useState<Producto[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let vigente = true
    setCargando(true)
    setError('')
    setProductos([])
    api
      .get<Producto[]>(`/productos?q=${encodeURIComponent(consulta.texto)}`)
      .then((resultado) => {
        if (vigente) setProductos(resultado)
      })
      .catch((err: unknown) => {
        if (vigente)
          setError(
            err instanceof ApiError
              ? err.message
              : 'No se pudo consultar el inventario. Intenta de nuevo.',
          )
      })
      .finally(() => {
        if (vigente) setCargando(false)
      })
    return () => {
      vigente = false
    }
  }, [consulta])

  function buscar(e: FormEvent) {
    e.preventDefault()
    setConsulta((actual) => ({ texto: texto.trim(), intento: actual.intento + 1 }))
  }

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Inventario</h1>
        <p className="text-slate-600">Consulta los precios y las existencias de tu sucursal.</p>
      </div>
      <form
        onSubmit={buscar}
        className="flex flex-wrap items-end gap-3 rounded-lg bg-white p-4 shadow"
      >
        <label className="min-w-0 flex-1 text-sm" htmlFor="buscar-inventario">
          Nombre o código de barras
          <input
            id="buscar-inventario"
            className="mt-1 w-full rounded border px-3 py-2"
            placeholder="Ej. jitomate o 7501000000011"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
          />
        </label>
        <button className="rounded bg-emerald-700 px-4 py-2 font-semibold text-white hover:bg-emerald-800">
          Buscar
        </button>
        <button
          type="button"
          className="rounded border px-4 py-2 hover:bg-slate-50"
          onClick={() => {
            setTexto('')
            setConsulta((actual) => ({ texto: '', intento: actual.intento + 1 }))
          }}
        >
          Mostrar todos
        </button>
      </form>
      <div aria-live="polite" aria-busy={cargando}>
        {cargando && <p role="status">Consultando inventario…</p>}
        {error && (
          <div role="alert" className="rounded bg-red-50 p-4 text-red-800">
            <p>{error}</p>
            <button
              className="mt-2 underline"
              onClick={() => setConsulta((actual) => ({ ...actual, intento: actual.intento + 1 }))}
            >
              Reintentar
            </button>
          </div>
        )}
        {!cargando && !error && productos.length === 0 && (
          <p className="rounded bg-white p-4 shadow">
            {consulta.texto
              ? 'No se encontraron productos con ese nombre o código.'
              : 'No hay productos disponibles en tu sucursal.'}
          </p>
        )}
        {!cargando && !error && productos.length > 0 && (
          <div className="overflow-x-auto rounded-lg bg-white shadow">
            <table className="w-full text-left text-sm">
              <caption className="px-4 py-3 text-left text-slate-600">
                {productos.length} productos encontrados. Se muestran hasta 50; usa la búsqueda para
                precisar los resultados.
              </caption>
              <thead className="bg-slate-100">
                <tr>
                  <th scope="col" className="px-4 py-3">
                    Producto
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Código de barras
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Unidad
                  </th>
                  <th scope="col" className="px-4 py-3 text-right">
                    Precio (MXN)
                  </th>
                  <th scope="col" className="px-4 py-3 text-right">
                    Existencia
                  </th>
                </tr>
              </thead>
              <tbody>
                {productos.map((producto) => (
                  <tr key={producto.id} className="border-t">
                    <th scope="row" className="px-4 py-3 font-medium">
                      {producto.nombre}
                    </th>
                    <td className="px-4 py-3">{producto.codigoBarras}</td>
                    <td className="px-4 py-3">{producto.unidad === 'KILO' ? 'Kilo' : 'Pieza'}</td>
                    <td className="px-4 py-3 text-right">
                      ${new Decimal(producto.precio).toFixed(2)} /{' '}
                      {producto.unidad === 'KILO' ? 'kg' : 'pieza'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {new Decimal(producto.existencia).toFixed(producto.unidad === 'KILO' ? 3 : 0)}{' '}
                      {producto.unidad === 'KILO' ? 'kg' : 'pzas'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}
