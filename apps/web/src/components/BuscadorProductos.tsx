import { useEffect, useRef, useState, type KeyboardEvent, type RefObject } from 'react'
import { api, ApiError } from '../api/client'
import type { Producto } from '../api/tipos'
import { useBusquedaProductos } from '../hooks/useBusquedaProductos'
import { Icono } from './Icono'
import { Aviso, Tecla, pesos } from './ui'

/**
 * Campo de código o nombre con coincidencias en vivo. Con el lector: Enter busca el código exacto.
 * Con el teclado: ↓ ↑ recorren las coincidencias, Enter elige y Esc cierra.
 * Pasar el mouse nunca cambia la selección, para que un escaneo no agregue el producto equivocado.
 */
export function BuscadorProductos({
  id,
  etiqueta,
  placeholder,
  inputRef,
  onElegir,
  onVacio,
  children,
}: {
  id: string
  etiqueta: string
  placeholder: string
  inputRef?: RefObject<HTMLInputElement>
  onElegir: (producto: Producto) => void
  /** Enter con el campo vacío. */
  onVacio?: () => void
  children?: React.ReactNode
}) {
  const propio = useRef<HTMLInputElement>(null)
  const entrada = inputRef ?? propio
  const [texto, setTexto] = useState('')
  const [abierto, setAbierto] = useState(false)
  const [indice, setIndice] = useState(-1)
  const [error, setError] = useState('')
  const cola = useRef(Promise.resolve())
  const textoActual = useRef('')
  const vivo = useRef(true)
  const lista = useRef<HTMLUListElement>(null)
  const { productos, cargando, error: errorBusqueda } = useBusquedaProductos(texto, texto.trim() !== '')
  const opciones = productos ?? []
  const mostrar = abierto && texto.trim() !== '' && productos !== null
  const idLista = `${id}-opciones`

  useEffect(() => {
    vivo.current = true
    return () => {
      vivo.current = false
    }
  }, [])

  useEffect(() => {
    if (indice >= 0) lista.current?.children[indice]?.scrollIntoView({ block: 'nearest' })
  }, [indice])

  function escribir(valor: string) {
    textoActual.current = valor
    setTexto(valor)
    setIndice(-1)
  }

  function elegir(producto: Producto) {
    escribir('')
    setAbierto(false)
    setError('')
    onElegir(producto)
  }

  /** Serializa las lecturas para conservar el orden y no perder escaneos consecutivos. */
  function buscarCodigo(capturado: string) {
    escribir('')
    setAbierto(false)
    setError('')
    cola.current = cola.current.then(async () => {
      try {
        const producto = await api.get<Producto>(`/productos/codigo/${encodeURIComponent(capturado)}`)
        if (vivo.current) onElegir(producto)
      } catch (err) {
        if (!vivo.current) return
        if (err instanceof ApiError && err.status === 404) await buscarNombre(capturado)
        else setError(err instanceof Error ? err.message : 'No se pudo consultar el producto. Intenta de nuevo.')
      }
    })
  }

  async function buscarNombre(capturado: string) {
    const coincidencias = await api
      .get<Producto[]>(`/productos?q=${encodeURIComponent(capturado)}`)
      .catch(() => [] as Producto[])
    if (!vivo.current) return
    if (coincidencias.length === 1) onElegir(coincidencias[0])
    else if (coincidencias.length === 0) setError(`Producto no encontrado: ${capturado}.`)
    else if (textoActual.current === '') {
      // Varias coincidencias: se deja la primera marcada y un segundo Enter la elige.
      textoActual.current = capturado
      setTexto(capturado)
      setAbierto(true)
      setIndice(0)
    }
  }

  function teclas(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      const capturado = texto.trim()
      if (mostrar && indice >= 0 && opciones[indice]) elegir(opciones[indice])
      else if (capturado) buscarCodigo(capturado)
      else if (onVacio) onVacio()
    } else if (e.key === 'ArrowDown' && texto.trim()) {
      e.preventDefault()
      setAbierto(true)
      setIndice((i) => Math.min(i + 1, opciones.length - 1))
    } else if (e.key === 'ArrowUp' && mostrar) {
      e.preventDefault()
      setIndice((i) => Math.max(i - 1, -1))
    } else if (e.key === 'Escape') {
      if (mostrar) setAbierto(false)
      else escribir('')
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-[13px] font-medium">
        {etiqueta}
      </label>
      <div className="flex flex-wrap gap-2">
        <div className="relative min-w-0 flex-[1_1_320px]" onBlur={() => setAbierto(false)}>
          <div className="flex h-[52px] items-center gap-3 rounded-[10px] border-[1.5px] border-tinta bg-superficie px-3.5">
            <Icono nombre="escanear" tamano={22} />
            <input
              ref={entrada}
              id={id}
              data-busqueda
              role="combobox"
              aria-expanded={mostrar}
              aria-controls={idLista}
              aria-autocomplete="list"
              aria-activedescendant={mostrar && indice >= 0 ? `${idLista}-${indice}` : undefined}
              autoComplete="off"
              spellCheck={false}
              value={texto}
              onChange={(e) => {
                escribir(e.target.value)
                setAbierto(true)
                setError('')
              }}
              onFocus={() => setAbierto(true)}
              onKeyDown={teclas}
              placeholder={placeholder}
              className="num h-full min-w-0 flex-1 bg-transparent text-[17px] outline-none"
            />
            <Tecla>Enter</Tecla>
          </div>
          {mostrar && (
            <ul
              ref={lista}
              id={idLista}
              role="listbox"
              aria-label="Coincidencias"
              aria-busy={cargando}
              className="absolute inset-x-0 top-full z-20 mt-1 max-h-80 overflow-y-auto rounded-xl border border-linea bg-superficie p-1.5 shadow-[0_16px_32px_-12px_rgba(26,25,22,0.3)]"
            >
              {opciones.map((p, i) => (
                <li
                  key={p.id}
                  id={`${idLista}-${i}`}
                  role="option"
                  aria-selected={i === indice}
                  // preventDefault: el foco se queda en el campo y el clic alcanza a elegir.
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => elegir(p)}
                  className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-3 py-1.5 text-sm ${
                    i === indice ? 'bg-maiz-claro' : 'hover:bg-crema'
                  }`}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate">{p.nombre}</span>
                    <span className="num block text-xs text-piedra">{p.codigoBarras}</span>
                  </span>
                  <span className="num text-[13px] text-grafito">
                    {pesos(p.precio)} / {p.unidad === 'KILO' ? 'kg' : 'pza'}
                  </span>
                </li>
              ))}
              {opciones.length === 0 && !cargando && (
                <li role="option" aria-selected={false} aria-disabled className="px-3 py-4 text-center text-sm text-piedra">
                  {errorBusqueda || 'Sin coincidencias'}
                </li>
              )}
            </ul>
          )}
        </div>
        {children}
      </div>
      {error && <Aviso tipo="error">{error}</Aviso>}
    </div>
  )
}
