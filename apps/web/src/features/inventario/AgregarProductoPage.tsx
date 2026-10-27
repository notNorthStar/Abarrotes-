import { useState, type FormEvent } from 'react'
import { api, ApiError } from '../../api/client'
import type { Producto, UnidadVenta } from '../../api/tipos'

// HU-08 (Sosa): alta de productos nuevos y entrada de existencias. Cajero, admin y jefe.

const formVacio = { codigoBarras: '', nombre: '', precio: '', unidad: 'PIEZA' as UnidadVenta, cantidad: '' }

const mensajeDe = (err: unknown) => (err instanceof ApiError ? err.message : 'Error de conexión')

function Aviso({ tipo, texto }: { tipo: 'ok' | 'error'; texto: string }) {
  const color = tipo === 'ok' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-700'
  return <p className={`rounded px-3 py-2 text-sm ${color}`}>{texto}</p>
}

function NuevoProducto() {
  const [form, setForm] = useState(formVacio)
  const [aviso, setAviso] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null)
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

  const campo = 'w-full rounded border px-3 py-2'
  return (
    <form onSubmit={enviar} className="space-y-3 rounded-lg bg-white p-5 shadow">
      <h2 className="text-lg font-semibold">Producto nuevo</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          Código de barras
          <input
            className={campo}
            autoFocus
            placeholder="Escanea o escribe el código"
            value={form.codigoBarras}
            onChange={(e) => setForm({ ...form, codigoBarras: e.target.value })}
          />
        </label>
        <label className="text-sm">
          Nombre
          <input className={campo} value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
        </label>
        <label className="text-sm">
          Se vende por
          <select
            className={campo}
            value={form.unidad}
            onChange={(e) => setForm({ ...form, unidad: e.target.value as UnidadVenta })}
          >
            <option value="PIEZA">Pieza</option>
            <option value="KILO">Kilo (granel)</option>
          </select>
        </label>
        <label className="text-sm">
          Precio {form.unidad === 'KILO' ? 'por kg' : 'por pieza'}
          <input
            className={campo}
            inputMode="decimal"
            placeholder="0.00"
            value={form.precio}
            onChange={(e) => setForm({ ...form, precio: e.target.value })}
          />
        </label>
        <label className="text-sm">
          Cantidad inicial {form.unidad === 'KILO' ? '(kg)' : '(piezas)'}
          <input
            className={campo}
            inputMode="decimal"
            placeholder="0"
            value={form.cantidad}
            onChange={(e) => setForm({ ...form, cantidad: e.target.value })}
          />
        </label>
      </div>
      {aviso && <Aviso {...aviso} />}
      <button
        disabled={enviando}
        className="rounded bg-emerald-700 px-4 py-2 font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
      >
        {enviando ? 'Guardando…' : 'Dar de alta'}
      </button>
    </form>
  )
}

function EntradaExistencias() {
  const [codigo, setCodigo] = useState('')
  const [producto, setProducto] = useState<Producto | null>(null)
  const [cantidad, setCantidad] = useState('')
  const [comentario, setComentario] = useState('')
  const [aviso, setAviso] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null)

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

  const campo = 'w-full rounded border px-3 py-2'
  return (
    <section className="space-y-3 rounded-lg bg-white p-5 shadow">
      <h2 className="text-lg font-semibold">Entrada de existencias</h2>
      <form onSubmit={buscar} className="flex gap-2">
        <input
          className={campo}
          placeholder="Escanea o escribe el código del producto"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
        />
        <button className="rounded border border-emerald-700 px-4 py-2 text-emerald-800 hover:bg-emerald-50">
          Buscar
        </button>
      </form>

      {producto && (
        <form onSubmit={registrar} className="space-y-3 rounded border border-slate-200 p-4">
          <p>
            <span className="font-semibold">{producto.nombre}</span> · existencia actual{' '}
            <span className="font-semibold">
              {producto.existencia} {producto.unidad === 'KILO' ? 'kg' : 'pzas'}
            </span>
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm">
              Cantidad que entra {producto.unidad === 'KILO' ? '(kg)' : '(piezas)'}
              <input
                className={campo}
                autoFocus
                inputMode="decimal"
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
              />
            </label>
            <label className="text-sm">
              Comentario (opcional)
              <input
                className={campo}
                placeholder="Ej. visita del proveedor"
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
              />
            </label>
          </div>
          <button className="rounded bg-emerald-700 px-4 py-2 font-semibold text-white hover:bg-emerald-800">
            Registrar entrada
          </button>
        </form>
      )}
      {aviso && <Aviso {...aviso} />}
    </section>
  )
}

export function AgregarProductoPage() {
  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold">Agregar productos</h1>
      <NuevoProducto />
      <EntradaExistencias />
    </section>
  )
}
