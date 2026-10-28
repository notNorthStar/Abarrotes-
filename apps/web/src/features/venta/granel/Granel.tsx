import { useEffect, useRef, useState, type FormEvent } from 'react'
import Decimal from 'decimal.js'
import { api } from '../../../api/client'
import type { Producto } from '../../../api/tipos'
import { Icono } from '../../../components/Icono'
import { Boton, Esqueleto, pesos } from '../../../components/ui'
import { useCarrito } from '../carrito/store'
import { cantidadValida, precioGranel, type UnidadPeso } from './calculosGranel'

const UNIDADES: { valor: UnidadPeso; etiqueta: string }[] = [
  { valor: 'kg', etiqueta: 'Kilogramos' },
  { valor: 'g', etiqueta: 'Gramos' },
]

export function Granel({
  productoExterno,
  onFinalizar,
}: {
  productoExterno?: Producto | null
  onFinalizar?: () => void
}) {
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
  const pesoRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (producto) pesoRef.current?.focus()
  }, [producto])

  useEffect(() => {
    if (!productoExterno) return
    setProducto(productoExterno)
    setPeso('')
    setUnidad('kg')
    setErrorPeso('')
    setAviso('')
  }, [productoExterno])

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
      onFinalizar?.()
    } catch (e) {
      setErrorPeso(e instanceof Error ? e.message : 'Revisa el peso.')
    }
  }

  return (
    <>
      {producto && (
        <form
          onSubmit={confirmar}
          aria-labelledby="titulo-captura-granel"
          className="flex flex-col gap-3 rounded-xl border border-maiz-borde bg-maiz-claro p-4"
        >
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex min-w-0 flex-[1_1_200px] flex-col gap-1">
              <h3 id="titulo-captura-granel" className="text-xs font-normal text-piedra">
                Capturar peso
              </h3>
              <span className="text-[15px] font-medium">{producto.nombre}</span>
              <span className="num text-[13px] text-piedra">
                ${new Decimal(producto.precio).toFixed(2)} / kg · {producto.codigoBarras}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="peso-granel" className="text-xs text-piedra">
                Peso
              </label>
              <span className="flex h-11 items-center overflow-hidden rounded-lg border border-borde bg-superficie focus-within:border-tinta">
                <input
                  autoFocus
                  ref={pesoRef}
                  id="peso-granel"
                  inputMode="decimal"
                  value={peso}
                  onChange={(e) => {
                    setPeso(e.target.value)
                    setErrorPeso('')
                  }}
                  aria-invalid={!!errorPeso}
                  aria-describedby="ayuda-peso error-peso"
                  placeholder={unidad === 'kg' ? '0.000' : '0'}
                  className="num h-full w-24 bg-transparent px-3 text-base text-tinta outline-none"
                />
                <span role="group" aria-label="Unidad de peso" className="flex h-full border-l border-linea">
                  {UNIDADES.map((u) => (
                    <button
                      key={u.valor}
                      type="button"
                      aria-pressed={unidad === u.valor}
                      aria-label={u.etiqueta}
                      onClick={() => {
                        if (unidad === u.valor) return
                        setUnidad(u.valor)
                        setPeso('')
                        setErrorPeso('')
                        pesoRef.current?.focus()
                      }}
                      className={`px-3 text-[13px] transition-colors ${
                        unidad === u.valor ? 'bg-tinta text-white' : 'bg-superficie hover:bg-[#EFEDE7]'
                      }`}
                    >
                      {u.valor}
                    </button>
                  ))}
                </span>
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-piedra">Importe</span>
              <span aria-live="polite" className="num flex h-11 items-center text-lg font-semibold">
                {subtotal ? pesos(subtotal) : '—'}
              </span>
            </div>
            <div className="flex gap-2">
              <Boton type="submit" className="h-11">
                Agregar a la cuenta
              </Boton>
              <Boton
                variante="secundario"
                className="h-11"
                onClick={() => {
                  setProducto(null)
                  setErrorPeso('')
                  onFinalizar?.()
                }}
              >
                Cancelar
              </Boton>
            </div>
          </div>
          <p id="ayuda-peso" className="text-xs text-piedra">
            {subtotal ? (
              <span className="num">
                {kilos} kg × ${new Decimal(producto.precio).toFixed(2)}/kg = ${subtotal}
              </span>
            ) : (
              'Hasta 3 decimales en kilos o gramos enteros. Al cambiar de unidad, vuelve a capturar el peso.'
            )}
          </p>
          <p id="error-peso" role={errorPeso ? 'alert' : undefined} className="text-sm text-chile-texto empty:hidden">
            {errorPeso}
          </p>
        </form>
      )}
      <section
        aria-labelledby="titulo-granel"
        className="flex flex-col gap-3 rounded-xl border border-linea bg-superficie p-4"
      >
        <form onSubmit={buscar} className="flex flex-wrap items-end gap-2">
          <div className="flex min-w-0 flex-[1_1_240px] flex-col gap-1">
            <h2 id="titulo-granel" className="text-sm font-semibold">
              Productos a granel
            </h2>
            <label htmlFor="buscar-granel" className="sr-only">
              Buscar por nombre o código
            </label>
            <input
              id="buscar-granel"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre o código"
              className="campo"
            />
          </div>
          <Boton type="submit" variante="secundario">
            <Icono nombre="buscar" />
            Buscar granel
          </Boton>
        </form>
        <div aria-live="polite" aria-busy={cargando}>
          {cargando && (
            <div role="status" className="flex flex-wrap gap-2">
              <span className="sr-only">Buscando productos a granel…</span>
              {['w-36', 'w-28', 'w-40'].map((ancho) => (
                <Esqueleto key={ancho} className={`h-11 rounded-lg ${ancho}`} />
              ))}
            </div>
          )}
          {errorBusqueda && (
            <div
              role="alert"
              className="flex flex-wrap items-center gap-2 rounded-lg bg-chile-claro px-3 py-2 text-sm text-chile-texto"
            >
              <p>{errorBusqueda}</p>
              <button
                type="button"
                className="font-medium underline"
                onClick={() => setConsulta((c) => ({ ...c, intento: c.intento + 1 }))}
              >
                Reintentar
              </button>
            </div>
          )}
          {!cargando && !errorBusqueda && productos.length === 0 && (
            <p className="text-sm text-piedra">
              No se encontraron productos por kilo. Prueba otro nombre o código.
            </p>
          )}
        </div>
        {!cargando && !errorBusqueda && productos.length > 0 && (
          <ul className="flex flex-wrap gap-2">
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
                  className={`flex min-h-[44px] flex-col items-start justify-center rounded-lg border px-3 py-1.5 text-left text-sm transition-colors ${
                    producto?.id === p.id
                      ? 'border-maiz-borde bg-maiz-claro'
                      : 'border-linea bg-hueso hover:border-borde hover:bg-superficie'
                  }`}
                >
                  {p.nombre}
                  <span className="num text-xs text-piedra">
                    ${new Decimal(p.precio).toFixed(2)}/kg · {p.codigoBarras}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
        <p role="status" className="flex items-center gap-1.5 text-[13px] text-hoja-texto">
          {aviso && (
            <>
              <Icono nombre="check" tamano={16} />
              {aviso}
            </>
          )}
        </p>
      </section>
    </>
  )
}
