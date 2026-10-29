import { useEffect, useRef, useState, type FormEvent, type RefObject } from 'react'
import Decimal from 'decimal.js'
import { api, ApiError } from '../../../api/client'
import type { Producto } from '../../../api/tipos'
import { Icono } from '../../../components/Icono'
import { Aviso, Boton, Tecla } from '../../../components/ui'
import { useCarrito } from './store'

const botonSecundario =
  'inline-flex h-[52px] items-center gap-2 rounded-[10px] border border-linea bg-superficie px-4 text-sm transition-colors hover:bg-[#EFEDE7]'

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
    <section aria-labelledby="titulo-escaneo" className="flex flex-col gap-2">
      <h2 id="titulo-escaneo" className="sr-only">
        Escanear productos
      </h2>
      <form onSubmit={escanear} className="flex flex-col gap-2">
        <label htmlFor="codigo-venta" className="text-[13px] font-medium">
          Código de barras
        </label>
        <div className="flex flex-wrap gap-2">
          <div className="flex h-[52px] min-w-0 flex-[1_1_320px] items-center gap-3 rounded-[10px] border-[1.5px] border-tinta bg-superficie px-3.5">
            <Icono nombre="escanear" tamano={22} />
            <input
              ref={inputRef}
              id="codigo-venta"
              autoComplete="off"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="Escanea o escribe el código"
              className="num h-full min-w-0 flex-1 bg-transparent text-[17px] outline-none"
              aria-describedby="ayuda-escaneo"
            />
            <Tecla>Enter</Tecla>
          </div>
          <button type="submit" className="sr-only">
            Agregar por código
          </button>
          <button
            type="button"
            onClick={() => {
              setManual((actual) => !actual)
              if (manual) enfocar()
            }}
            className={botonSecundario}
            aria-expanded={manual}
            aria-controls="busqueda-nombre"
          >
            <Icono nombre="buscar" />
            Buscar por nombre
          </button>
          <button
            type="button"
            onClick={() => document.getElementById('buscar-granel')?.focus()}
            className={botonSecundario}
            aria-controls="buscar-granel"
          >
            <Icono nombre="granel" />
            Granel
          </button>
        </div>
      </form>
      <p id="ayuda-escaneo" className="sr-only">
        Escanea con tu lector USB o escribe el código y presiona Enter.
      </p>
      {buscando && (
        <p role="status" className="text-[13px] text-piedra">
          Consultando código…
        </p>
      )}
      {error && <Aviso tipo="error">{error}</Aviso>}
      <p role="status" className="flex items-center gap-1.5 text-[13px] text-hoja-texto">
        {aviso && (
          <>
            <Icono nombre="check" tamano={16} />
            {aviso}
          </>
        )}
      </p>
      {manual && (
        <div id="busqueda-nombre" className="flex flex-col gap-3 rounded-xl border border-linea bg-superficie p-4">
          <form onSubmit={buscar} className="flex flex-wrap items-end gap-2">
            <label htmlFor="nombre-venta" className="flex min-w-0 flex-[1_1_240px] flex-col gap-1 text-[13px] font-medium">
              Nombre del producto
              <input
                ref={busquedaRef}
                id="nombre-venta"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="campo font-normal"
              />
            </label>
            <Boton type="submit" disabled={cargandoManual}>
              Buscar por nombre
            </Boton>
          </form>
          {cargandoManual && (
            <p role="status" className="text-[13px] text-piedra">
              Buscando por nombre…
            </p>
          )}
          {busquedaHecha && resultados.length === 0 && (
            <p className="text-sm text-piedra">No se encontraron productos con ese nombre.</p>
          )}
          {resultados.length > 0 && (
            <>
              <p className="text-xs text-piedra">
                Hasta 50 resultados. Selecciona el producto para agregarlo.
              </p>
              <ul className="grid gap-2 sm:grid-cols-2">
                {resultados.map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      className="flex min-h-[44px] w-full flex-col gap-0.5 rounded-lg border border-linea bg-hueso px-3 py-2 text-left text-sm transition-colors hover:border-borde hover:bg-superficie"
                      onClick={() => seleccionar(p)}
                    >
                      {p.nombre}
                      <span className="num text-xs text-piedra">
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
