import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import Decimal from 'decimal.js'
import { api, ApiError } from '../../api/client'
import type { Producto } from '../../api/tipos'
import { Icono } from '../../components/Icono'
import {
  Boton,
  Chip,
  EncabezadoPagina,
  Esqueleto,
  PaginaConPanel,
  Tarjeta,
  claseBoton,
  pesos,
} from '../../components/ui'

type Filtro = 'TODOS' | 'PIEZA' | 'KILO' | 'REPONER'

const FILTROS: { id: Filtro; texto: string }[] = [
  { id: 'TODOS', texto: 'Todos' },
  { id: 'PIEZA', texto: 'Pieza' },
  { id: 'KILO', texto: 'Granel' },
  { id: 'REPONER', texto: 'Por reponer' },
]

// Mismo umbral visual que Inicio: ≤ 5 piezas o ≤ 3 kg.
const porReponer = (p: Producto) => Number(p.existencia) <= (p.unidad === 'KILO' ? 3 : 5)

const existencia = (p: Producto) =>
  `${new Decimal(p.existencia).toFixed(p.unidad === 'KILO' ? 3 : 0)} ${p.unidad === 'KILO' ? 'kg' : 'pzas'}`

const pasaFiltro = (p: Producto, filtro: Filtro) =>
  filtro === 'TODOS' ||
  (filtro === 'PIEZA' && p.unidad === 'PIEZA') ||
  (filtro === 'KILO' && p.unidad === 'KILO') ||
  (filtro === 'REPONER' && porReponer(p))

export function InventarioPage() {
  const [texto, setTexto] = useState('')
  const [consulta, setConsulta] = useState({ texto: '', intento: 0 })
  const [productos, setProductos] = useState<Producto[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [filtro, setFiltro] = useState<Filtro>('TODOS')
  const [seleccionId, setSeleccionId] = useState<number | null>(null)

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

  const visibles = productos.filter((p) => pasaFiltro(p, filtro))
  const seleccionado = productos.find((p) => p.id === seleccionId) ?? null

  return (
    <PaginaConPanel
      etiquetaPanel="Detalle del producto"
      panel={<Detalle producto={seleccionado} />}
    >
      <EncabezadoPagina
        titulo="Inventario"
        subtitulo={
          cargando
            ? 'Consultando los precios y existencias de tu sucursal'
            : `${productos.length} ${productos.length === 1 ? 'producto' : 'productos'}${consulta.texto ? ` para “${consulta.texto}”` : ''}`
        }
        acciones={
          <Link to="/productos/nuevo" className={claseBoton('primario')}>
            <Icono nombre="mas" tamano={16} />
            Agregar producto
          </Link>
        }
      />

      <div className="flex flex-wrap items-center gap-2.5">
        <form onSubmit={buscar} className="flex min-w-0 flex-[1_1_280px] items-center gap-2">
          <label
            htmlFor="buscar-inventario"
            className="flex h-10 min-w-0 flex-1 items-center gap-2.5 rounded-lg border border-borde bg-superficie px-3 text-piedra focus-within:border-tinta"
          >
            <Icono nombre="buscar" tamano={16} />
            <span className="sr-only">Buscar por nombre o código de barras</span>
            <input
              id="buscar-inventario"
              className="min-w-0 flex-1 bg-transparent text-sm text-tinta outline-none"
              placeholder="Nombre o código de barras"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
            />
          </label>
          <Boton type="submit" variante="secundario">
            Buscar
          </Boton>
          {consulta.texto && (
            <Boton
              variante="fantasma"
              onClick={() => {
                setTexto('')
                setConsulta((actual) => ({ texto: '', intento: actual.intento + 1 }))
              }}
            >
              Mostrar todos
            </Boton>
          )}
        </form>
        <div
          role="group"
          aria-label="Filtrar productos"
          className="flex gap-1 rounded-[10px] bg-crema p-1"
        >
          {FILTROS.map((f) => {
            const activo = filtro === f.id
            return (
              <button
                key={f.id}
                type="button"
                aria-pressed={activo}
                onClick={() => setFiltro(f.id)}
                className={`h-8 rounded-[7px] px-3 text-[13px] transition-colors ${
                  activo ? 'bg-superficie text-tinta shadow-sm' : 'text-grafito hover:text-tinta'
                }`}
              >
                {f.texto}
              </button>
            )
          })}
        </div>
      </div>

      <div aria-live="polite" aria-busy={cargando} className="flex flex-col gap-3">
        {cargando && (
          <p role="status" className="sr-only">
            Consultando inventario…
          </p>
        )}
        {error && (
          <div
            role="alert"
            className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-chile-claro px-4 py-3 text-sm text-chile-texto"
          >
            <p>{error}</p>
            <Boton
              variante="secundario"
              tamano="sm"
              onClick={() => setConsulta((actual) => ({ ...actual, intento: actual.intento + 1 }))}
            >
              Reintentar
            </Boton>
          </div>
        )}
        {!cargando && !error && visibles.length === 0 && (
          <Tarjeta className="px-4 py-10 text-center text-sm text-piedra">
            {productos.length > 0
              ? 'Ningún producto coincide con este filtro.'
              : consulta.texto
                ? 'No se encontraron productos con ese nombre o código.'
                : 'No hay productos disponibles en tu sucursal.'}
          </Tarjeta>
        )}
        {(cargando || (!error && visibles.length > 0)) && (
          <Tarjeta className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] border-collapse text-sm">
                <caption className="sr-only">
                  {productos.length} productos encontrados. Se muestran hasta 50; usa la búsqueda
                  para precisar los resultados.
                </caption>
                <thead>
                  <tr className="bg-hueso text-left text-xs text-piedra">
                    <th scope="col" className="px-4 py-2.5 font-medium">
                      Producto
                    </th>
                    <th scope="col" className="px-2 py-2.5 font-medium">
                      Código
                    </th>
                    <th scope="col" className="px-2 py-2.5 font-medium">
                      Unidad
                    </th>
                    <th scope="col" className="px-2 py-2.5 text-right font-medium">
                      Precio
                    </th>
                    <th scope="col" className="px-4 py-2.5 text-right font-medium">
                      Existencia
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {cargando
                    ? ['42%', '34%', '50%', '38%', '46%', '30%'].map((ancho) => (
                        <tr key={ancho}>
                          <td className="border-t border-linea px-4 py-4">
                            <div
                              aria-hidden="true"
                              className="esqueleto h-3.5"
                              style={{ width: ancho }}
                            />
                          </td>
                          <td className="border-t border-linea px-2 py-4">
                            <Esqueleto className="h-3 w-28" />
                          </td>
                          <td className="border-t border-linea px-2 py-4">
                            <Esqueleto className="h-5 w-14 rounded-full" />
                          </td>
                          <td className="border-t border-linea px-2 py-4">
                            <Esqueleto className="ml-auto h-3 w-14" />
                          </td>
                          <td className="border-t border-linea px-4 py-4">
                            <Esqueleto className="ml-auto h-3 w-16" />
                          </td>
                        </tr>
                      ))
                    : visibles.map((producto) => {
                        const activo = producto.id === seleccionId
                        return (
                          <tr key={producto.id} className={activo ? 'bg-crema' : 'hover:bg-hueso'}>
                            <th
                              scope="row"
                              className="border-t border-linea p-0 text-left font-normal"
                            >
                              <button
                                type="button"
                                aria-pressed={activo}
                                onClick={() => setSeleccionId(activo ? null : producto.id)}
                                className={`min-h-12 w-full px-4 text-left text-sm ${activo ? 'font-medium' : ''}`}
                              >
                                {producto.nombre}
                              </button>
                            </th>
                            <td className="num border-t border-linea px-2 py-2 text-[13px] text-piedra">
                              {producto.codigoBarras}
                            </td>
                            <td className="border-t border-linea px-2 py-2">
                              <Chip tono={producto.unidad === 'KILO' ? 'maiz' : 'neutro'}>
                                {producto.unidad === 'KILO' ? 'Kilo' : 'Pieza'}
                              </Chip>
                            </td>
                            <td className="num border-t border-linea px-2 py-2 text-right">
                              {pesos(producto.precio)}
                              <span className="text-piedra">
                                {' '}
                                /{producto.unidad === 'KILO' ? 'kg' : 'pza'}
                              </span>
                            </td>
                            <td
                              className={`num border-t border-linea px-4 py-2 text-right ${
                                porReponer(producto) ? 'font-medium text-chile-texto' : ''
                              }`}
                            >
                              {existencia(producto)}
                            </td>
                          </tr>
                        )
                      })}
                </tbody>
              </table>
            </div>
          </Tarjeta>
        )}
      </div>
    </PaginaConPanel>
  )
}

function Detalle({ producto }: { producto: Producto | null }) {
  if (!producto) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl bg-hueso px-5 py-10 text-center">
        <span
          aria-hidden="true"
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-crema text-grafito"
        >
          <Icono nombre="inventario" />
        </span>
        <p className="text-sm font-medium">Elige un producto</p>
        <p className="text-[13px] leading-relaxed text-piedra">
          Toca un renglón de la tabla para ver su precio y existencia aquí.
        </p>
      </div>
    )
  }

  const kilo = producto.unidad === 'KILO'
  return (
    <>
      <div className="flex flex-col gap-1.5">
        <Chip tono={kilo ? 'maiz' : 'neutro'} className="self-start">
          {kilo ? 'Se vende por kilo' : 'Se vende por pieza'}
        </Chip>
        <h2 className="mt-1 text-xl font-semibold tracking-tight">{producto.nombre}</h2>
        <span className="num text-[13px] text-piedra">{producto.codigoBarras}</span>
      </div>
      <dl className="grid grid-cols-2 gap-2.5">
        <div className="flex flex-col gap-1 rounded-[10px] border border-linea p-3.5">
          <dt className="text-xs text-piedra">Precio</dt>
          <dd className="num text-xl font-semibold">{pesos(producto.precio)}</dd>
          <dd className="text-xs text-piedra">por {kilo ? 'kilo' : 'pieza'}</dd>
        </div>
        <div className="flex flex-col gap-1 rounded-[10px] border border-linea p-3.5">
          <dt className="text-xs text-piedra">Existencia</dt>
          <dd
            className={`num text-xl font-semibold ${porReponer(producto) ? 'text-chile-texto' : ''}`}
          >
            {existencia(producto)}
          </dd>
          {porReponer(producto) && <dd className="text-xs text-chile-texto">Por reponer</dd>}
        </div>
      </dl>
      <Link to="/productos/nuevo" className={`${claseBoton('primario')} h-11`}>
        <Icono nombre="mas" tamano={16} />
        Registrar entrada
      </Link>
    </>
  )
}
