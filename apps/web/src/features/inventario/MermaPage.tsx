import { useRef, useState, type FormEvent } from 'react'
import { useAuth } from '../../auth/AuthContext'
import { api, ApiError } from '../../api/client'
import type { Producto } from '../../api/tipos'
import { Icono } from '../../components/Icono'
import {
  Aviso,
  Boton,
  Chip,
  EncabezadoPagina,
  Esqueleto,
  PaginaConPanel,
  Tarjeta,
} from '../../components/ui'

export function MermaPage() {
  const { usuario } = useAuth()
  const [texto, setTexto] = useState('')
  const [sucursal, setSucursal] = useState('')
  const [productos, setProductos] = useState<Producto[]>([])
  const [producto, setProducto] = useState<Producto | null>(null)
  const [cantidad, setCantidad] = useState('')
  const [motivo, setMotivo] = useState('')
  const [comentario, setComentario] = useState('')
  const [buscando, setBuscando] = useState(false)
  const [buscado, setBuscado] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [aviso, setAviso] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null)
  const version = useRef(0)
  const jefe = usuario?.rol === 'JEFE'
  const consultaSucursal = jefe ? `&sucursalId=${encodeURIComponent(sucursal)}` : ''
  const errorDe = (e: unknown) =>
    e instanceof ApiError ? e.message : 'No se pudo completar la operación. Intenta de nuevo.'

  async function buscar(e: FormEvent) {
    e.preventDefault()
    const intento = ++version.current
    setBuscando(true)
    setBuscado(false)
    setProductos([])
    setProducto(null)
    setAviso(null)
    try {
      const lista = await api.get<Producto[]>(
        `/productos?q=${encodeURIComponent(texto.trim())}${consultaSucursal}`,
      )
      if (intento === version.current) {
        setProductos(lista)
        setBuscado(true)
      }
    } catch (err) {
      if (intento === version.current) setAviso({ tipo: 'error', texto: errorDe(err) })
    } finally {
      if (intento === version.current) setBuscando(false)
    }
  }

  async function registrar(e: FormEvent) {
    e.preventDefault()
    if (!producto || enviando) return
    setEnviando(true)
    setAviso(null)
    try {
      const actualizado = await api.post<Producto>(
        `/productos/${producto.id}/mermas${jefe ? `?sucursalId=${encodeURIComponent(sucursal)}` : ''}`,
        { cantidad, motivo, ...(comentario.trim() && { comentario: comentario.trim() }) },
      )
      setProductos((lista) => lista.map((p) => (p.id === actualizado.id ? actualizado : p)))
      setProducto(actualizado)
      setCantidad('')
      setMotivo('')
      setComentario('')
      setAviso({
        tipo: 'ok',
        texto: `Merma registrada para ${actualizado.nombre}. Existencia actual: ${actualizado.existencia} ${actualizado.unidad === 'KILO' ? 'kg' : 'pzas'}.`,
      })
    } catch (err) {
      setAviso({ tipo: 'error', texto: errorDe(err) })
    } finally {
      setEnviando(false)
    }
  }

  return (
    <PaginaConPanel
      etiquetaPanel="Registrar merma"
      panel={
        producto ? (
          <form onSubmit={registrar} className="flex flex-col gap-5">
            <Chip tono="chile" className="self-start">
              Salida de inventario
            </Chip>
            <div>
              <h2 className="text-xl font-semibold tracking-tight">{producto.nombre}</h2>
              <p className="num mt-1 text-xs text-piedra">{producto.codigoBarras}</p>
            </div>
            <p className="text-sm text-piedra">
              Existencia:{' '}
              <span className="num font-medium text-tinta">
                {producto.existencia} {producto.unidad === 'KILO' ? 'kg' : 'pzas'}
              </span>
            </p>
            <fieldset disabled={enviando} className="flex flex-col gap-4 disabled:opacity-60">
              <label className="flex flex-col gap-1.5 text-[13px] font-medium">
                Cantidad que se retira ({producto.unidad === 'KILO' ? 'kg' : 'piezas'})
                <input
                  className="campo num"
                  inputMode={producto.unidad === 'KILO' ? 'decimal' : 'numeric'}
                  value={cantidad}
                  onChange={(e) => setCantidad(e.target.value)}
                  required
                  placeholder={producto.unidad === 'KILO' ? '0.000' : '0'}
                />
              </label>
              <label className="flex flex-col gap-1.5 text-[13px] font-medium">
                Motivo
                <select
                  className="campo"
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  required
                >
                  <option value="">Selecciona un motivo</option>
                  <option value="CADUCADO">Caducado</option>
                  <option value="DANADO">Dañado</option>
                </select>
              </label>
              <label className="flex flex-col gap-1.5 text-[13px] font-medium">
                Comentario (opcional)
                <textarea
                  className="campo min-h-20"
                  maxLength={200}
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                />
              </label>
              <Boton type="submit" variante="peligro" disabled={enviando || !cantidad || !motivo}>
                <Icono nombre="menos" tamano={16} />
                {enviando ? 'Registrando…' : 'Registrar merma'}
              </Boton>
            </fieldset>
            <p className="text-xs leading-relaxed text-piedra">
              Se registra tu usuario y la fecha. Esta salida no cambia el efectivo de tu caja.
            </p>
          </form>
        ) : (
          <div className="rounded-xl bg-hueso px-5 py-10 text-center">
            <Icono nombre="inventario" className="mx-auto mb-3 text-piedra" />
            <h2 className="text-sm font-medium">Elige un producto</h2>
            <p className="mt-2 text-[13px] text-piedra">
              Busca por nombre o código y selecciona el producto que se retirará.
            </p>
          </div>
        )
      }
    >
      <EncabezadoPagina
        titulo="Registrar merma"
        subtitulo="Retira productos caducados o dañados de tu inventario."
      />
      {aviso && <Aviso tipo={aviso.tipo}>{aviso.texto}</Aviso>}
      <form onSubmit={buscar} className="flex flex-wrap items-end gap-3">
        {jefe && (
          <label className="flex flex-col gap-1.5 text-[13px] font-medium">
            Número de sucursal
            <input
              className="campo num"
              type="number"
              min="1"
              required
              value={sucursal}
              disabled={enviando}
              onChange={(e) => {
                ++version.current
                setSucursal(e.target.value)
                setProducto(null)
                setProductos([])
                setBuscado(false)
                setBuscando(false)
              }}
            />
          </label>
        )}
        <label className="flex min-w-0 flex-1 flex-col gap-1.5 text-[13px] font-medium">
          Nombre o código de barras
          <input
            className="campo"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Busca el producto"
            disabled={enviando}
          />
        </label>
        <Boton type="submit" variante="secundario" disabled={buscando || enviando}>
          <Icono nombre="buscar" tamano={16} />
          Buscar
        </Boton>
      </form>
      <div aria-busy={buscando} aria-live="polite">
        {buscando ? (
          <Tarjeta className="flex flex-col gap-4 p-5">
            <Esqueleto className="h-6 w-2/3" />
            <Esqueleto className="h-6 w-1/2" />
            <Esqueleto className="h-6 w-2/3" />
          </Tarjeta>
        ) : productos.length ? (
          <Tarjeta className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] text-sm">
                <caption className="sr-only">
                  Productos para registrar merma, hasta 50 resultados
                </caption>
                <thead className="bg-hueso text-left text-xs text-piedra">
                  <tr>
                    <th className="px-4 py-3">Producto</th>
                    <th className="px-4 py-3">Código</th>
                    <th className="px-4 py-3 text-right">Existencia</th>
                  </tr>
                </thead>
                <tbody>
                  {productos.map((p) => (
                    <tr
                      key={p.id}
                      className={producto?.id === p.id ? 'bg-crema' : 'hover:bg-hueso'}
                    >
                      <th className="border-t border-linea text-left font-normal">
                        <button
                          type="button"
                          className="min-h-12 w-full px-4 py-3 text-left"
                          disabled={enviando}
                          aria-pressed={producto?.id === p.id}
                          onClick={() => {
                            setProducto(p)
                            setCantidad('')
                            setMotivo('')
                            setComentario('')
                            setAviso(null)
                          }}
                        >
                          {p.nombre}
                        </button>
                      </th>
                      <td className="num border-t border-linea px-4 py-3 text-xs text-piedra">
                        {p.codigoBarras}
                      </td>
                      <td className="num border-t border-linea px-4 py-3 text-right">
                        {p.existencia} {p.unidad === 'KILO' ? 'kg' : 'pzas'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Tarjeta>
        ) : (
          <Tarjeta className="p-8 text-center text-sm text-piedra">
            {buscado
              ? 'No se encontraron productos. Prueba otro nombre o código.'
              : 'Busca para consultar las existencias de tu sucursal.'}
          </Tarjeta>
        )}
      </div>
    </PaginaConPanel>
  )
}
