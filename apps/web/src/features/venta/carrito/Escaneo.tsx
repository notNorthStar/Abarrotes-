import { useEffect, useRef, useState, type FormEvent, type RefObject } from 'react'
import Decimal from 'decimal.js'
import { api, ApiError } from '../../../api/client'
import type { Producto } from '../../../api/tipos'
import { useCarrito } from './store'

type Props = {
  inputRef: RefObject<HTMLInputElement>
  onGranel: (producto: Producto) => void
}

export function Escaneo({ inputRef, onGranel }: Props) {
  const agregar = useCarrito((s) => s.agregarProducto)
  const [codigo, setCodigo] = useState('')
  const [aviso, setAviso] = useState('')
  const [error, setError] = useState('')
  const [buscando, setBuscando] = useState(false)
  const [manual, setManual] = useState(false)
  const [nombre, setNombre] = useState('')
  const [resultados, setResultados] = useState<Producto[]>([])
  const [busquedaHecha, setBusquedaHecha] = useState(false)
  const [cargandoManual, setCargandoManual] = useState(false)
  const cola = useRef(Promise.resolve())
  const secuencia = useRef(0)
  const vivo = useRef(true)
  const busquedaRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    vivo.current = true
    inputRef.current?.focus()
    return () => {
      vivo.current = false
      secuencia.current += 1
    }
  }, [inputRef])

  function enfocar() {
    inputRef.current?.focus()
  }

  function seleccionar(producto: Producto) {
    setError('')
    if (producto.unidad === 'KILO') {
      onGranel(producto)
      setAviso(`Captura el peso de ${producto.nombre}.`)
    } else {
      agregar(producto)
      setAviso(`${producto.nombre} agregado a la cuenta.`)
      enfocar()
    }
  }

  function escanear(e: FormEvent) {
    e.preventDefault()
    const capturado = codigo.trim()
    if (!capturado) {
      setError('Escribe o escanea un código de barras.')
      enfocar()
      return
    }
    setCodigo('')
    setError('')
    setBuscando(true)
    // Serializa lecturas para conservar el orden y no perder escaneos consecutivos.
    cola.current = cola.current.then(async () => {
      try {
        const producto = await api.get<Producto>(
          `/productos/codigo/${encodeURIComponent(capturado)}`,
        )
        if (vivo.current) seleccionar(producto)
      } catch (err) {
        if (!vivo.current) return
        setAviso('')
        if (err instanceof ApiError && err.status === 404) {
          setError(`Producto no encontrado: ${capturado}. Puedes buscarlo por nombre.`)
          setManual(true)
        } else
          setError(
            err instanceof Error
              ? err.message
              : 'No se pudo consultar el producto. Intenta de nuevo.',
          )
        enfocar()
      } finally {
        if (vivo.current) setBuscando(false)
      }
    })
  }

  async function buscar(e: FormEvent) {
    e.preventDefault()
    const texto = nombre.trim()
    if (!texto) {
      setError('Escribe el nombre del producto.')
      busquedaRef.current?.focus()
      return
    }
    const turno = ++secuencia.current
    setCargandoManual(true)
    setError('')
    setResultados([])
    setBusquedaHecha(false)
    try {
      const datos = await api.get<Producto[]>(`/productos?q=${encodeURIComponent(texto)}`)
      if (vivo.current && turno === secuencia.current) {
        setResultados(datos)
        setBusquedaHecha(true)
      }
    } catch (err) {
      if (vivo.current && turno === secuencia.current)
        setError(err instanceof Error ? err.message : 'No se pudo buscar el producto.')
    } finally {
      if (vivo.current && turno === secuencia.current) setCargandoManual(false)
    }
  }

  return (
    <section
      className="mb-4 space-y-3 rounded bg-white p-4 shadow"
      aria-labelledby="titulo-escaneo"
    >
      <h2 id="titulo-escaneo" className="text-lg font-semibold">
        Escanear productos
      </h2>
      <form onSubmit={escanear} className="flex flex-wrap items-end gap-2">
        <label htmlFor="codigo-venta" className="min-w-0 flex-1">
          Código de barras
          <input
            ref={inputRef}
            id="codigo-venta"
            autoComplete="off"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            className="mt-1 block w-full rounded border p-2"
            aria-describedby="ayuda-escaneo"
          />
        </label>
        <button className="rounded bg-emerald-700 px-4 py-2 text-white">Agregar por código</button>
        <button
          type="button"
          onClick={() => {
            setManual((actual) => !actual)
            if (manual) enfocar()
          }}
          className="rounded border px-4 py-2"
          aria-expanded={manual}
        >
          Búsqueda manual
        </button>
      </form>
      <p id="ayuda-escaneo" className="text-sm text-slate-600">
        Escanea con tu lector USB o escribe el código y presiona Enter.
      </p>
      {buscando && <p role="status">Consultando código…</p>}
      {error && (
        <p role="alert" className="rounded border border-red-300 bg-red-50 p-3 text-red-800">
          {error}
        </p>
      )}
      <p role="status" className="text-emerald-800">
        {aviso}
      </p>
      {manual && (
        <div className="space-y-3 rounded border p-3">
          <form onSubmit={buscar} className="flex flex-wrap items-end gap-2">
            <label htmlFor="nombre-venta" className="flex-1">
              Nombre del producto
              <input
                ref={busquedaRef}
                id="nombre-venta"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="mt-1 block w-full rounded border p-2"
              />
            </label>
            <button
              className="rounded bg-emerald-700 px-4 py-2 text-white"
              disabled={cargandoManual}
            >
              Buscar por nombre
            </button>
          </form>
          {cargandoManual && <p role="status">Buscando por nombre…</p>}
          {busquedaHecha && resultados.length === 0 && (
            <p>No se encontraron productos con ese nombre.</p>
          )}
          {resultados.length > 0 && (
            <>
              <p className="text-sm text-slate-600">
                Hasta 50 resultados. Selecciona el producto para agregarlo.
              </p>
              <ul className="grid gap-2 sm:grid-cols-2">
                {resultados.map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      className="w-full rounded border p-2 text-left hover:bg-emerald-50"
                      onClick={() => seleccionar(p)}
                    >
                      {p.nombre}
                      <span className="block text-sm text-slate-600">
                        ${new Decimal(p.precio).toFixed(2)} / {p.unidad === 'KILO' ? 'kg' : 'pieza'}{' '}
                        · {p.codigoBarras}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </section>
  )
}
