import { useEffect, useState, type FormEvent } from 'react'
import Decimal from 'decimal.js'
import { api } from '../../../api/client'
import type { Producto } from '../../../api/tipos'
import { useCarrito } from '../carrito/store'
import { cantidadValida, precioGranel, type UnidadPeso } from './calculosGranel'

export function Granel() {
  const agregar = useCarrito((s) => s.agregarProducto)
  const [busqueda, setBusqueda] = useState('')
  const [consulta, setConsulta] = useState({ texto: '', intento: 0 })
  const [productos, setProductos] = useState<Producto[]>([])
  const [cargando, setCargando] = useState(true)
  const [errorBusqueda, setErrorBusqueda] = useState('')
  const [producto, setProducto] = useState<Producto | null>(null)
  const [peso, setPeso] = useState('')
  const [unidad, setUnidad] = useState<UnidadPeso>('kg')
  const [errorPeso, setErrorPeso] = useState('')
  const [aviso, setAviso] = useState('')

  useEffect(() => {
    let vigente = true
    setCargando(true)
    setErrorBusqueda('')
    setProductos([])
    api
      .get<Producto[]>(`/productos?q=${encodeURIComponent(consulta.texto)}`)
      .then((datos) => {
        if (vigente) setProductos(datos.filter((p) => p.unidad === 'KILO'))
      })
      .catch((e: unknown) => {
        if (vigente)
          setErrorBusqueda(
            e instanceof Error ? e.message : 'No se pudieron consultar los productos.',
          )
      })
      .finally(() => {
        if (vigente) setCargando(false)
      })
    return () => {
      vigente = false
    }
  }, [consulta])

  let kilos = ''
  let subtotal = ''
  if (producto && peso.trim()) {
    try {
      kilos = cantidadValida(peso, producto.unidad, unidad)
      subtotal = precioGranel(kilos, producto.precio)
    } catch {
      /* El error se explica al intentar agregar; la vista previa solo muestra valores válidos. */
    }
  }

  function buscar(e: FormEvent) {
    e.preventDefault()
    setConsulta((actual) => ({ texto: busqueda.trim(), intento: actual.intento + 1 }))
  }

  function confirmar(e: FormEvent) {
    e.preventDefault()
    if (!producto) return
    try {
      const cantidad = cantidadValida(peso, producto.unidad, unidad)
      agregar(producto, cantidad)
      setAviso(
        `Agregado: ${producto.nombre}, ${cantidad} kg por $${precioGranel(cantidad, producto.precio)}.`,
      )
      setProducto(null)
      setPeso('')
      setErrorPeso('')
    } catch (e) {
      setErrorPeso(e instanceof Error ? e.message : 'Revisa el peso.')
    }
  }

  return (
    <section aria-labelledby="titulo-granel" className="space-y-4 rounded bg-white p-4 shadow">
      <h2 id="titulo-granel" className="text-lg font-semibold">
        Agregar producto a granel
      </h2>
      <form onSubmit={buscar} className="flex flex-wrap items-end gap-2">
        <label className="flex-1" htmlFor="buscar-granel">
          Buscar por nombre o código
          <input
            id="buscar-granel"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="mt-1 w-full rounded border p-2"
          />
        </label>
        <button className="rounded bg-emerald-700 px-4 py-2 text-white">Buscar granel</button>
      </form>
      <div aria-live="polite" aria-busy={cargando}>
        {cargando && <p role="status">Buscando productos a granel…</p>}
        {errorBusqueda && (
          <div role="alert" className="text-red-700">
            <p>{errorBusqueda}</p>
            <button
              type="button"
              className="underline"
              onClick={() => setConsulta((c) => ({ ...c, intento: c.intento + 1 }))}
            >
              Reintentar
            </button>
          </div>
        )}
        {!cargando && !errorBusqueda && productos.length === 0 && (
          <p>No se encontraron productos por kilo. Prueba otro nombre o código.</p>
        )}
      </div>
      {!cargando && !errorBusqueda && productos.length > 0 && (
        <ul className="grid gap-2 sm:grid-cols-2">
          {productos.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => {
                  setProducto(p)
                  setPeso('')
                  setUnidad('kg')
                  setErrorPeso('')
                  setAviso('')
                }}
                className="w-full rounded border p-3 text-left hover:bg-emerald-50"
              >
                {p.nombre}{' '}
                <span className="block text-sm text-slate-600">
                  ${new Decimal(p.precio).toFixed(2)}/kg · Código {p.codigoBarras}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {producto && (
        <form
          onSubmit={confirmar}
          className="space-y-3 rounded border border-emerald-300 bg-emerald-50 p-4"
        >
          <h3 className="font-semibold">Capturar peso: {producto.nombre}</h3>
          <p>Precio por kg: ${new Decimal(producto.precio).toFixed(2)}</p>
          <div className="flex flex-wrap gap-3">
            <label htmlFor="peso-granel">
              Peso manual
              <input
                autoFocus
                id="peso-granel"
                inputMode="decimal"
                value={peso}
                onChange={(e) => {
                  setPeso(e.target.value)
                  setErrorPeso('')
                }}
                aria-invalid={!!errorPeso}
                aria-describedby="ayuda-peso error-peso"
                className="mt-1 block rounded border p-2"
              />
            </label>
            <label htmlFor="unidad-granel">
              Unidad
              <select
                id="unidad-granel"
                value={unidad}
                onChange={(e) => {
                  setUnidad(e.target.value as UnidadPeso)
                  setPeso('')
                  setErrorPeso('')
                }}
                className="mt-1 block rounded border p-2"
              >
                <option value="kg">Kilogramos (kg)</option>
                <option value="g">Gramos (g)</option>
              </select>
            </label>
          </div>
          <p id="ayuda-peso" className="text-sm">
            Hasta 3 decimales en kilos o gramos enteros. Al cambiar de unidad, vuelve a capturar el
            peso.
          </p>
          <p aria-live="polite">
            {subtotal
              ? `${kilos} kg × $${new Decimal(producto.precio).toFixed(2)}/kg = $${subtotal}`
              : 'Captura un peso válido para calcular el subtotal.'}
          </p>
          <p id="error-peso" role={errorPeso ? 'alert' : undefined} className="text-red-700">
            {errorPeso}
          </p>
          <div className="flex gap-2">
            <button className="rounded bg-emerald-700 px-4 py-2 text-white">
              Agregar a la cuenta
            </button>
            <button
              type="button"
              onClick={() => {
                setProducto(null)
                setErrorPeso('')
              }}
              className="rounded border px-4 py-2"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
      <p role="status" className="text-emerald-800">
        {aviso}
      </p>
    </section>
  )
}
