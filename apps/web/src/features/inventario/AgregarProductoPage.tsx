import { useState, type FormEvent, type ReactNode } from 'react'
import { api, ApiError } from '../../api/client'
import type { Producto, UnidadVenta } from '../../api/tipos'
import { Icono } from '../../components/Icono'
import { Aviso, Boton, EncabezadoPagina, Pagina, Tarjeta } from '../../components/ui'

// HU-08 (Sosa): alta de productos nuevos y entrada de existencias. Cajero, admin y jefe.

const formVacio = { codigoBarras: '', nombre: '', precio: '', unidad: 'PIEZA' as UnidadVenta, cantidad: '' }

const mensajeDe = (err: unknown) => (err instanceof ApiError ? err.message : 'Error de conexión')

type AvisoForm = { tipo: 'ok' | 'error'; texto: string }

const UNIDADES: { valor: UnidadVenta; texto: string }[] = [
  { valor: 'PIEZA', texto: 'Pieza' },
  { valor: 'KILO', texto: 'Kilo (granel)' },
]

/** Etiqueta visible + campo, en columna. */
function Campo({ id, etiqueta, children }: { id: string; etiqueta: ReactNode; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[13px] font-medium">
        {etiqueta}
      </label>
      {children}
    </div>
  )
}

function NuevoProducto() {
  const [form, setForm] = useState(formVacio)
  const [aviso, setAviso] = useState<AvisoForm | null>(null)
  const [enviando, setEnviando] = useState(false)

  async function enviar(e: FormEvent) {
    e.preventDefault()
    setEnviando(true)
    setAviso(null)
    try {
      const p = await api.post<Producto>('/productos', form)
      setAviso({ tipo: 'ok', texto: `Se dio de alta "${p.nombre}" con ${p.existencia} en existencia.` })
      setForm(formVacio)
    } catch (err) {
      setAviso({ tipo: 'error', texto: mensajeDe(err) })
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Tarjeta className="p-5">
      <form onSubmit={enviar} aria-labelledby="h-nuevo" className="flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <h2 id="h-nuevo" className="text-sm font-semibold">
            Producto nuevo
          </h2>
          <p className="text-[13px] text-piedra">Da de alta un producto que aún no está en el catálogo de tu sucursal.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Campo id="np-codigo" etiqueta="Código de barras">
            <input
              id="np-codigo"
              className="campo num"
              autoFocus
              autoComplete="off"
              placeholder="Escanea o escribe el código"
              value={form.codigoBarras}
              onChange={(e) => setForm({ ...form, codigoBarras: e.target.value })}
            />
          </Campo>
          <Campo id="np-nombre" etiqueta="Nombre">
            <input
              id="np-nombre"
              className="campo"
              autoComplete="off"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            />
          </Campo>

          <div className="flex flex-col gap-1.5">
            <span id="np-unidad" className="text-[13px] font-medium">
              Se vende por
            </span>
            <div role="group" aria-labelledby="np-unidad" className="flex h-10 gap-1 rounded-lg border border-linea bg-crema p-[3px]">
              {UNIDADES.map((u) => {
                const activa = form.unidad === u.valor
                return (
                  <button
                    key={u.valor}
                    type="button"
                    aria-pressed={activa}
                    onClick={() => setForm({ ...form, unidad: u.valor })}
                    className={`flex-1 rounded-md text-sm transition-colors ${
                      activa ? 'border border-borde bg-superficie font-medium text-tinta' : 'text-grafito hover:text-tinta'
                    }`}
                  >
                    {u.texto}
                  </button>
                )
              })}
            </div>
          </div>

          <Campo id="np-precio" etiqueta={`Precio ${form.unidad === 'KILO' ? 'por kg' : 'por pieza'}`}>
            <input
              id="np-precio"
              className="campo num"
              inputMode="decimal"
              placeholder="0.00"
              value={form.precio}
              onChange={(e) => setForm({ ...form, precio: e.target.value })}
            />
          </Campo>
          <Campo id="np-cantidad" etiqueta={`Cantidad inicial ${form.unidad === 'KILO' ? '(kg)' : '(piezas)'}`}>
            <input
              id="np-cantidad"
              className="campo num"
              inputMode="decimal"
              placeholder="0"
              value={form.cantidad}
              onChange={(e) => setForm({ ...form, cantidad: e.target.value })}
            />
          </Campo>
        </div>

        {aviso && <Aviso tipo={aviso.tipo}>{aviso.texto}</Aviso>}
        <div>
          <Boton type="submit" disabled={enviando}>
            <Icono nombre="mas" tamano={16} />
            {enviando ? 'Guardando…' : 'Dar de alta'}
          </Boton>
        </div>
      </form>
    </Tarjeta>
  )
}

function EntradaExistencias() {
  const [codigo, setCodigo] = useState('')
  const [producto, setProducto] = useState<Producto | null>(null)
  const [cantidad, setCantidad] = useState('')
  const [comentario, setComentario] = useState('')
  const [aviso, setAviso] = useState<AvisoForm | null>(null)

  async function buscar(e: FormEvent) {
    e.preventDefault()
    setAviso(null)
    setProducto(null)
    if (!codigo.trim()) return
    try {
      setProducto(await api.get<Producto>(`/productos/codigo/${encodeURIComponent(codigo.trim())}`))
    } catch (err) {
      setAviso({ tipo: 'error', texto: mensajeDe(err) })
    }
  }

  async function registrar(e: FormEvent) {
    e.preventDefault()
    if (!producto) return
    setAviso(null)
    try {
      const actualizado = await api.post<Producto>(`/productos/${producto.id}/entradas`, {
        cantidad,
        ...(comentario.trim() && { comentario: comentario.trim() }),
      })
      setAviso({
        tipo: 'ok',
        texto: `Entrada registrada: "${actualizado.nombre}" ahora tiene ${actualizado.existencia} en existencia.`,
      })
      setProducto(null)
      setCodigo('')
      setCantidad('')
      setComentario('')
    } catch (err) {
      setAviso({ tipo: 'error', texto: mensajeDe(err) })
    }
  }

  return (
    <Tarjeta className="flex flex-col gap-5 p-5">
      <div className="flex flex-col gap-1">
        <h2 className="text-sm font-semibold">Entrada de existencias</h2>
        <p className="text-[13px] text-piedra">Suma piezas o kilos a un producto que ya existe.</p>
      </div>

      <form onSubmit={buscar} className="flex flex-col gap-1.5">
        <label htmlFor="ee-codigo" className="text-[13px] font-medium">
          Código del producto
        </label>
        <div className="flex gap-2">
          <input
            id="ee-codigo"
            className="campo num"
            autoComplete="off"
            placeholder="Escanea o escribe el código del producto"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
          />
          <Boton type="submit" variante="secundario" className="flex-none">
            <Icono nombre="buscar" tamano={16} />
            Buscar
          </Boton>
        </div>
      </form>

      {producto && (
        <form onSubmit={registrar} className="flex flex-col gap-4 rounded-lg border border-linea bg-hueso p-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="text-sm font-medium">{producto.nombre}</span>
            <span className="text-[13px] text-piedra">
              Existencia actual{' '}
              <span className="num font-medium text-tinta">
                {producto.existencia} {producto.unidad === 'KILO' ? 'kg' : 'pzas'}
              </span>
            </span>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Campo id="ee-cantidad" etiqueta={`Cantidad que entra ${producto.unidad === 'KILO' ? '(kg)' : '(piezas)'}`}>
              <input
                id="ee-cantidad"
                className="campo num"
                autoFocus
                inputMode="decimal"
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
              />
            </Campo>
            <Campo id="ee-comentario" etiqueta="Comentario (opcional)">
              <input
                id="ee-comentario"
                className="campo"
                placeholder="Ej. visita del proveedor"
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
              />
            </Campo>
          </div>
          <div>
            <Boton type="submit">Registrar entrada</Boton>
          </div>
        </form>
      )}
      {aviso && <Aviso tipo={aviso.tipo}>{aviso.texto}</Aviso>}
    </Tarjeta>
  )
}

export function AgregarProductoPage() {
  return (
    <Pagina>
      <EncabezadoPagina titulo="Agregar productos" subtitulo="Alta de productos nuevos y entrada de mercancía." />
      <NuevoProducto />
      <EntradaExistencias />
    </Pagina>
  )
}
