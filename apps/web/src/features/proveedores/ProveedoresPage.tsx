import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { api, ApiError } from '../../api/client'
import { useAuth } from '../../auth/AuthContext'
import { tieneRol } from '../../auth/RequireRol'
import { Icono } from '../../components/Icono'
import { Aviso, Boton, Chip, EncabezadoPagina, Esqueleto, Pagina, Tarjeta } from '../../components/ui'
import {
   claveDiaIso,
  estadoDeVisita,
  formatearFechaVisita,
  hoyIsoLocal,
  pasaFiltroVisita,
  type EstadoVisita,
  type FiltroVisita,
} from './fechasVisita'

// HU-07 (Gonzalo): el administrador registra las visitas de proveedores y el cajero las consulta en lista por fecha y proveedor.

type ProveedorCatalogo = { id: number; nombre: string }

export type VisitaProveedor = {
  id: number
  proveedorId: number
  proveedor: string
  sucursalId: number
  fecha: string
  nota: string | null
}

const mensaje = (err: unknown) => (err instanceof ApiError ? err.message : 'Error de conexión')

const FILTROS: { id: FiltroVisita; texto: string }[] = [
  { id: 'TODAS', texto: 'Todas' },
  { id: 'PROXIMAS', texto: 'Próximas' },
  { id: 'PASADAS', texto: 'Pasadas' },
]

const TONO_ESTADO: Record<EstadoVisita, 'maiz' | 'hoja' | 'neutro'> = {
  HOY: 'maiz',
  PROXIMA: 'hoja',
  PASADA: 'neutro',
}

const TEXTO_ESTADO: Record<EstadoVisita, string> = {
  HOY: 'Hoy',
  PROXIMA: 'Próxima',
  PASADA: 'Pasada',
}

export function ProveedoresPage() {
  const { usuario } = useAuth()

  if (usuario?.rol === 'JEFE') {
    return (
      <Pagina>
        <EncabezadoPagina titulo="Visitas de proveedores" />
        <Aviso tipo="info">Selecciona una sucursal (disponible en HU-14).</Aviso>
      </Pagina>
    )
  }

  return <ContenidoProveedores esAdmin={usuario ? tieneRol(usuario.rol, 'ADMIN') : false} />
}

function ContenidoProveedores({ esAdmin }: { esAdmin: boolean }) {
  const [visitas, setVisitas] = useState<VisitaProveedor[]>([])
  const [catalogo, setCatalogo] = useState<ProveedorCatalogo[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [aviso, setAviso] = useState('')

  const [busqueda, setBusqueda] = useState('')
  const [filtro, setFiltro] = useState<FiltroVisita>('TODAS')

  const [form, setForm] = useState(() => ({
    proveedor: '',
    fecha: hoyIsoLocal(),
    nota: '',
  }))
  const [errorForm, setErrorForm] = useState('')
  const [guardando, setGuardando] = useState(false)

  const cargar = useCallback(async () => {
    try {
      const [listaVisitas, listaCatalogo] = await Promise.all([
        api.get<VisitaProveedor[]>('/proveedores/visitas'),
        esAdmin ? api.get<ProveedorCatalogo[]>('/proveedores/catalogo') : Promise.resolve([]),
      ])
      setVisitas(listaVisitas)
      if (esAdmin) setCatalogo(listaCatalogo)
      setError('')
    } catch (err) {
      setError(mensaje(err))
    } finally {
      setCargando(false)
    }
  }, [esAdmin])

  useEffect(() => {
    void cargar()
  }, [cargar])

  async function registrar(e: FormEvent) {
    e.preventDefault()
    setErrorForm('')
    setAviso('')
    setGuardando(true)
    try {
      const creada = await api.post<VisitaProveedor>('/proveedores/visitas', {
        proveedor: form.proveedor,
        fecha: form.fecha,
        ...(form.nota.trim() && { nota: form.nota.trim() }),
      })
      setForm({ proveedor: '', fecha: hoyIsoLocal(), nota: '' })
      setAviso(`Visita de "${creada.proveedor}" programada para el ${claveDiaIso(creada.fecha)}.`)
      await cargar()
    } catch (err) {
      setErrorForm(mensaje(err))
    } finally {
      setGuardando(false)
    }
  }

  const hoy = hoyIsoLocal()
  const textoBusqueda = busqueda.trim().toLowerCase()
  const visibles = visitas.filter(
    (v) =>
      pasaFiltroVisita(v.fecha, filtro, hoy) &&
      (!textoBusqueda ||
        v.proveedor.toLowerCase().includes(textoBusqueda) ||
        (v.nota?.toLowerCase().includes(textoBusqueda) ?? false)),
  )

  const proximas = visitas.filter((v) => pasaFiltroVisita(v.fecha, 'PROXIMAS', hoy)).length
  const subtitulo = cargando
    ? 'Consultando visitas programadas de tu sucursal'
    : `${visitas.length} ${visitas.length === 1 ? 'visita registrada' : 'visitas registradas'} · ${proximas} ${proximas === 1 ? 'próxima' : 'próximas'}`

  return (
    <Pagina>
      <EncabezadoPagina titulo="Visitas de proveedores" subtitulo={subtitulo} />

      {esAdmin && (
        <Tarjeta className="p-5">
          <form onSubmit={registrar} aria-labelledby="h-nueva-visita" className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <h2 id="h-nueva-visita" className="text-sm font-semibold">
                Registrar visita de proveedor
              </h2>
              <p className="text-[13px] text-piedra">
                Registra los días de visita para que los cajeros revisen el inventario con anticipación.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-[1.2fr_180px_1.5fr_auto] md:items-end">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="vp-proveedor" className="text-[13px] font-medium">
                  Proveedor
                </label>
                <input
                  id="vp-proveedor"
                  className="campo"
                  list="catalogo-proveedores"
                  placeholder="Ej. Coca-Cola FEMSA"
                  autoComplete="off"
                  value={form.proveedor}
                  onChange={(e) => setForm({ ...form, proveedor: e.target.value })}
                />
                <datalist id="catalogo-proveedores">
                  {catalogo.map((p) => (
                    <option key={p.id} value={p.nombre} />
                  ))}
                </datalist>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="vp-fecha" className="text-[13px] font-medium">
                  Fecha
                </label>
                <input
                  id="vp-fecha"
                  type="date"
                  className="campo num"
                  value={form.fecha}
                  onChange={(e) => setForm({ ...form, fecha: e.target.value })}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="vp-nota" className="text-[13px] font-medium">
                  Nota (opcional)
                </label>
                <input
                  id="vp-nota"
                  className="campo"
                  placeholder="Ej. Revisar existencia de refrescos y agua"
                  value={form.nota}
                  onChange={(e) => setForm({ ...form, nota: e.target.value })}
                />
              </div>

              <Boton type="submit" disabled={guardando}>
                <Icono nombre="mas" tamano={16} />
                {guardando ? 'Guardando…' : 'Registrar visita'}
              </Boton>
            </div>

            {errorForm && <Aviso tipo="error">{errorForm}</Aviso>}
          </form>
        </Tarjeta>
      )}

      {error && <Aviso tipo="error">{error}</Aviso>}
      {aviso && <Aviso tipo="ok">{aviso}</Aviso>}

      <div className="flex flex-wrap items-center gap-2.5">
        <label
          htmlFor="buscar-proveedor"
          className="flex h-10 min-w-0 flex-[1_1_260px] items-center gap-2.5 rounded-lg border border-borde bg-superficie px-3 text-piedra focus-within:border-tinta"
        >
          <Icono nombre="buscar" tamano={16} />
          <span className="sr-only">Filtrar por proveedor o nota</span>
          <input
            id="buscar-proveedor"
            className="min-w-0 flex-1 bg-transparent text-sm text-tinta outline-none"
            placeholder="Filtrar por proveedor o nota…"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </label>

        {busqueda && (
          <Boton variante="fantasma" onClick={() => setBusqueda('')}>
            Limpiar
          </Boton>
        )}

        <div
          role="group"
          aria-label="Filtrar visitas por fecha"
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

      <Tarjeta className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <caption className="sr-only">Visitas de proveedores de la sucursal</caption>
            <thead className="border-b border-linea bg-hueso text-xs text-piedra">
              <tr>
                <th scope="col" className="px-4 py-2.5 font-medium">
                  Fecha
                </th>
                <th scope="col" className="px-4 py-2.5 font-medium">
                  Proveedor
                </th>
                <th scope="col" className="px-4 py-2.5 font-medium">
                  Estado
                </th>
                <th scope="col" className="px-4 py-2.5 font-medium">
                  Nota
                </th>
              </tr>
            </thead>
            <tbody>
              {cargando &&
                ['32%', '44%', '28%'].map((ancho) => (
                  <tr key={ancho} className="border-t border-linea first:border-t-0">
                    <td className="px-4 py-3.5">
                      <Esqueleto className="h-3.5 w-28" />
                    </td>
                    <td className="px-4 py-3.5">
                      <div aria-hidden="true" className="esqueleto h-3.5" style={{ width: ancho }} />
                    </td>
                    <td className="px-4 py-3.5">
                      <Esqueleto className="h-5 w-16 rounded-full" />
                    </td>
                    <td className="px-4 py-3.5">
                      <Esqueleto className="h-3 w-48" />
                    </td>
                  </tr>
                ))}

              {!cargando && visibles.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-sm text-piedra">
                    {visitas.length === 0
                      ? 'Aún no hay visitas de proveedores registradas en tu sucursal.'
                      : 'Ninguna visita coincide con este filtro.'}
                  </td>
                </tr>
              )}

              {!cargando &&
                visibles.map((v) => {
                  const estado = estadoDeVisita(v.fecha, hoy)
                  return (
                    <tr key={v.id} className="border-t border-linea first:border-t-0 hover:bg-hueso">
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="font-medium capitalize">{formatearFechaVisita(v.fecha)}</span>
                          <span className="num text-xs text-piedra">{claveDiaIso(v.fecha)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <span
                            aria-hidden="true"
                            className="flex h-8 w-8 flex-none items-center justify-center rounded-lg bg-crema text-grafito"
                          >
                            <Icono nombre="proveedor" tamano={16} />
                          </span>
                          <span className="font-medium">{v.proveedor}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Chip tono={TONO_ESTADO[estado]}>{TEXTO_ESTADO[estado]}</Chip>
                      </td>
                      <td className="px-4 py-3 text-grafito">{v.nota ?? '—'}</td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
        </div>
      </Tarjeta>
    </Pagina>
  )
}
