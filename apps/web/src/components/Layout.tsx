import { useEffect, useMemo, useRef, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { sucursalInicial, sucursalStore } from '../api/sucursal'
import type { Rol, Sucursal } from '../api/tipos'
import { useAuth } from '../auth/AuthContext'
import { tieneRol } from '../auth/RequireRol'
import { Icono, type NombreIcono } from './Icono'
import { useTeclado } from '../hooks/teclado'
import { useCarrito } from '../features/venta/carrito/store'
import { Aviso, Esqueleto, Pagina, Tecla } from './ui'

// Shell "Mostrador": barra lateral oscura, barra superior con migas, paleta de comandos (Ctrl K) y estado de caja.

type Destino = { to: string; texto: string; icono: NombreIcono; minimo: Rol; tecla?: string; grupo: string }

const DESTINOS: Destino[] = [
  { to: '/', texto: 'Inicio', icono: 'inicio', minimo: 'CAJERO', grupo: 'Operación' },
  { to: '/venta', texto: 'Venta', icono: 'escanear', minimo: 'CAJERO', tecla: 'F2', grupo: 'Operación' },
  { to: '/caja', texto: 'Caja', icono: 'caja', minimo: 'CAJERO', grupo: 'Operación' },
  { to: '/inventario', texto: 'Inventario', icono: 'inventario', minimo: 'CAJERO', grupo: 'Catálogo' },
  { to: '/productos/nuevo', texto: 'Agregar productos', icono: 'agregar', minimo: 'CAJERO', grupo: 'Catálogo' },
  { to: '/mermas', texto: 'Registrar merma', icono: 'menos', minimo: 'CAJERO', grupo: 'Catálogo' },
  { to: '/proveedores', texto: 'Proveedores', icono: 'proveedor', minimo: 'CAJERO', grupo: 'Catálogo' },
  { to: '/usuarios', texto: 'Cajeros', icono: 'cajeros', minimo: 'ADMIN', grupo: 'Administración' },
  { to: '/administradores', texto: 'Administradores', icono: 'candado', minimo: 'JEFE', grupo: 'Administración' },
  { to: '/reportes', texto: 'Reporte semanal', icono: 'recibo', minimo: 'ADMIN', grupo: 'Administración' },
]

const NOMBRE_ROL: Record<Rol, string> = { CAJERO: 'Cajero', ADMIN: 'Administrador', JEFE: 'Jefe' }

const iniciales = (nombre: string) =>
  nombre
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('')

const EVENTO_CAJA = 'abarrotes:caja'

/** Avisa al indicador de la barra superior que la caja se abrió o se cerró. */
export const avisarCambioCaja = () => window.dispatchEvent(new Event(EVENTO_CAJA))

/** Estado de la caja del usuario, para el indicador de la barra superior. */
function useCajaAbierta(ruta: string, sucursalId: number | null) {
  const [abiertaDesde, setAbiertaDesde] = useState<string | null | undefined>(undefined)
  const [version, setVersion] = useState(0)
  useEffect(() => {
    const recargar = () => setVersion((v) => v + 1)
    window.addEventListener(EVENTO_CAJA, recargar)
    return () => window.removeEventListener(EVENTO_CAJA, recargar)
  }, [])
  useEffect(() => {
    let vigente = true
    api
      .get<{ turno: { abiertoEn: string } | null }>('/caja/actual')
      .then(({ turno }) => vigente && setAbiertaDesde(turno ? turno.abiertoEn : null))
      .catch(() => vigente && setAbiertaDesde(undefined))
    return () => {
      vigente = false
    }
  }, [ruta, version, sucursalId])
  return abiertaDesde
}

/** HU-14: sucursales activas y la elegida por el jefe. Para los demás roles no consulta nada. */
function useSucursalJefe(esJefe: boolean) {
  const [sucursales, setSucursales] = useState<Sucursal[] | null>(null)
  const [elegida, setElegida] = useState<number | null>(null)
  const [error, setError] = useState('')
  const vaciarCarrito = useCarrito((s) => s.vaciar)

  useEffect(() => {
    if (!esJefe) return
    let vigente = true
    // Sin sucursal guardada: si la anterior ya no existe, la API rechazaría incluso esta consulta.
    const guardada = sucursalStore.get()
    sucursalStore.clear()
    api
      .get<Sucursal[]>('/administradores/sucursales')
      .then((lista) => {
        if (!vigente) return
        const id = sucursalInicial(lista, guardada)
        if (id !== null) sucursalStore.set(id)
        setSucursales(lista)
        setElegida(id)
      })
      .catch(() => {
        if (guardada !== null) sucursalStore.set(guardada)
        if (vigente) setError('No se pudieron consultar las sucursales. Recarga la página.')
      })
    return () => {
      vigente = false
      if (sucursalStore.get() === null && guardada !== null) sucursalStore.set(guardada)
    }
  }, [esJefe])

  function elegir(id: number) {
    sucursalStore.set(id)
    vaciarCarrito() // los productos de la cuenta son de la sucursal anterior
    setElegida(id)
  }

  return { sucursales, elegida, elegir, error }
}

export function Layout() {
  const { usuario, cerrarSesion } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [paleta, setPaleta] = useState(false)
  const [menuMovil, setMenuMovil] = useState(false)
  const esJefe = usuario?.rol === 'JEFE'
  const sucursal = useSucursalJefe(esJefe)
  useTeclado()
  const abiertaDesde = useCajaAbierta(pathname, sucursal.elegida)

  const destinos = useMemo(
    () => (usuario ? DESTINOS.filter((d) => tieneRol(usuario.rol, d.minimo)) : []),
    [usuario],
  )

  useEffect(() => {
    function atajos(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPaleta(true)
      } else if (e.key === 'F2') {
        e.preventDefault()
        navigate('/venta')
      } else if (e.key === 'Escape') setMenuMovil(false)
    }
    window.addEventListener('keydown', atajos)
    return () => window.removeEventListener('keydown', atajos)
  }, [navigate])

  useEffect(() => setMenuMovil(false), [pathname])

  if (!usuario) return null
  const actual = DESTINOS.find((d) => d.to === pathname)

  return (
    <div className="flex min-h-screen bg-papel">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-superficie focus:px-4 focus:py-2 focus:text-sm"
      >
        Saltar al contenido
      </a>
      <Barra
        destinos={destinos}
        nombre={usuario.nombre}
        rol={usuario.rol}
        onSalir={cerrarSesion}
        className={`${menuMovil ? 'fixed inset-y-0 left-0 z-40 flex' : 'hidden'} lg:sticky lg:top-0 lg:flex lg:h-screen`}
      />
      {menuMovil && (
        <button
          type="button"
          aria-label="Cerrar menú"
          className="fixed inset-0 z-30 bg-tinta/40 lg:hidden"
          onClick={() => setMenuMovil(false)}
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex min-h-14 flex-wrap items-center gap-x-4 gap-y-2 border-b border-linea px-4 py-2.5 lg:px-6">
          <button
            type="button"
            aria-label="Abrir menú"
            onClick={() => setMenuMovil(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-[#EFEDE7] lg:hidden"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" aria-hidden="true">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
          <nav aria-label="Ruta" className="flex items-center gap-2 text-[13px] text-piedra">
            {esJefe ? (
              sucursal.sucursales && (
                <select
                  aria-label="Sucursal"
                  value={sucursal.elegida ?? ''}
                  onChange={(e) => sucursal.elegir(Number(e.target.value))}
                  className="h-9 max-w-[180px] rounded-lg border border-linea bg-superficie px-2 text-[13px] font-medium text-tinta"
                >
                  {sucursal.sucursales.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nombre}
                    </option>
                  ))}
                </select>
              )
            ) : (
              <span>Mi sucursal</span>
            )}
            <span aria-hidden="true">/</span>
            <span className="font-medium text-tinta">{actual?.texto ?? 'Abarrotes+'}</span>
          </nav>
          <div className="flex-1" />
          <button
            type="button"
            onClick={() => setPaleta(true)}
            className="flex h-9 min-w-0 items-center gap-2.5 rounded-lg border border-linea bg-superficie px-2.5 text-[13px] text-piedra hover:bg-[#EFEDE7] sm:min-w-[280px]"
          >
            <Icono nombre="buscar" tamano={16} />
            <span className="flex-1 text-left">Ir a…</span>
            <Tecla>Ctrl K</Tecla>
          </button>
          <EstadoCaja abiertaDesde={abiertaDesde} />
        </header>

        <main id="contenido" tabIndex={-1} className="min-w-0 flex-1 outline-none">
          {!esJefe || sucursal.elegida !== null ? (
            // La clave recarga la pantalla con los datos de la sucursal elegida.
            <div key={sucursal.elegida ?? 'propia'} className="h-full">
              <Outlet />
            </div>
          ) : (
            <Pagina>
              {sucursal.error ? (
                <Aviso tipo="error">{sucursal.error}</Aviso>
              ) : sucursal.sucursales ? (
                <Aviso tipo="info">No hay sucursales activas.</Aviso>
              ) : (
                <Esqueleto className="h-10 w-64" />
              )}
            </Pagina>
          )}
        </main>
      </div>

      {paleta && (
        <PaletaComandos
          destinos={destinos}
          onElegir={(to) => {
            setPaleta(false)
            navigate(to)
          }}
          onCerrar={() => setPaleta(false)}
        />
      )}
    </div>
  )
}

function EstadoCaja({ abiertaDesde }: { abiertaDesde: string | null | undefined }) {
  if (abiertaDesde === undefined) return null
  if (abiertaDesde === null) {
    return (
      <NavLink
        to="/caja"
        className="flex h-8 items-center gap-2 rounded-full bg-crema px-3 text-[13px] font-medium text-grafito hover:bg-linea"
      >
        <span aria-hidden="true" className="h-[7px] w-[7px] rounded-full bg-piedra" />
        Caja cerrada
      </NavLink>
    )
  }
  const hora = new Date(abiertaDesde).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
  return (
    <NavLink
      to="/caja"
      className="flex h-8 items-center gap-2 rounded-full bg-hoja-claro px-3 text-[13px] font-medium text-hoja-texto"
    >
      <span aria-hidden="true" className="h-[7px] w-[7px] rounded-full bg-hoja" />
      Caja abierta · desde {hora}
    </NavLink>
  )
}

function Barra({
  destinos,
  nombre,
  rol,
  onSalir,
  className,
}: {
  destinos: Destino[]
  nombre: string
  rol: Rol
  onSalir: () => void
  className: string
}) {
  const grupos = [...new Set(destinos.map((d) => d.grupo))]
  return (
    <nav
      aria-label="Principal"
      data-flechas
      className={`w-[240px] flex-none flex-col gap-6 overflow-y-auto bg-riel px-3 py-4 text-riel-texto ${className}`}
    >
      <div className="flex items-center gap-2.5 px-1.5 pt-1">
        <span
          aria-hidden="true"
          className="num flex h-7 w-7 items-center justify-center rounded-[7px] bg-maiz text-xs font-semibold text-tinta"
        >
          A+
        </span>
        <span className="text-[15px] font-semibold tracking-tight text-white">Abarrotes+</span>
      </div>

      {grupos.map((grupo) => (
        <div key={grupo} className="flex flex-col gap-0.5">
          <span className="px-2.5 pb-1.5 text-[11px] font-medium uppercase tracking-[0.06em] text-riel-tenue">{grupo}</span>
          {destinos
            .filter((d) => d.grupo === grupo)
            .map((d) => (
              <NavLink
                key={d.to}
                to={d.to}
                end={d.to === '/'}
                className={({ isActive }) =>
                  `flex min-h-9 items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors ${
                    isActive ? 'bg-riel-activo text-white' : 'text-riel-texto hover:bg-riel-hover hover:text-white'
                  }`
                }
              >
                <Icono nombre={d.icono} />
                <span className="flex-1">{d.texto}</span>
                {d.tecla && <span className="num text-[11px] text-riel-tenue">{d.tecla}</span>}
              </NavLink>
            ))}
        </div>
      ))}

      <div className="mt-auto flex items-center gap-2.5 border-t border-riel-borde px-2 pt-3">
        <span
          aria-hidden="true"
          className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-riel-avatar text-xs font-semibold text-white"
        >
          {iniciales(nombre)}
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-[13px] text-white">{nombre}</span>
          <span className="text-xs text-riel-tenue">{NOMBRE_ROL[rol]}</span>
        </span>
        <button
          type="button"
          aria-label="Cerrar sesión"
          onClick={onSalir}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-riel-texto hover:bg-riel-hover hover:text-white"
        >
          <Icono nombre="salir" />
        </button>
      </div>
    </nav>
  )
}

function PaletaComandos({
  destinos,
  onElegir,
  onCerrar,
}: {
  destinos: Destino[]
  onElegir: (to: string) => void
  onCerrar: () => void
}) {
  const [texto, setTexto] = useState('')
  const [indice, setIndice] = useState(0)
  const entrada = useRef<HTMLInputElement>(null)
  const opciones = destinos.filter((d) => d.texto.toLowerCase().includes(texto.trim().toLowerCase()))

  useEffect(() => {
    const anterior = document.activeElement
    entrada.current?.focus()
    return () => {
      if (anterior instanceof HTMLElement) anterior.focus()
    }
  }, [])
  useEffect(() => setIndice(0), [texto])

  function teclas(e: React.KeyboardEvent) {
    if (e.key === 'Escape') onCerrar()
    else if (e.key === 'ArrowDown' || (e.key === 'Tab' && !e.shiftKey)) {
      e.preventDefault()
      setIndice((i) => Math.min(i + 1, opciones.length - 1))
    } else if (e.key === 'ArrowUp' || e.key === 'Tab') {
      e.preventDefault()
      setIndice((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && opciones[indice]) {
      e.preventDefault()
      onElegir(opciones[indice].to)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-tinta/40 px-4 pt-[12vh]" onClick={onCerrar}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Ir a una sección"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={teclas}
        className="w-full max-w-lg overflow-hidden rounded-xl border border-linea bg-superficie shadow-[0_24px_48px_-12px_rgba(26,25,22,0.35)]"
      >
        <label className="flex items-center gap-3 border-b border-linea px-4">
          <Icono nombre="buscar" className="text-piedra" />
          <span className="sr-only">Buscar sección</span>
          <input
            ref={entrada}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Ir a venta, caja, inventario…"
            className="h-12 flex-1 bg-transparent text-[15px] outline-none"
          />
          <Tecla>Esc</Tecla>
        </label>
        <ul className="max-h-80 overflow-y-auto p-2">
          {opciones.map((d, i) => (
            <li key={d.to}>
              <button
                type="button"
                onMouseEnter={() => setIndice(i)}
                onClick={() => onElegir(d.to)}
                className={`flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-sm ${
                  i === indice ? 'bg-crema text-tinta' : 'text-grafito'
                }`}
              >
                <Icono nombre={d.icono} className="text-piedra" />
                <span className="flex-1">{d.texto}</span>
                {d.tecla && <Tecla>{d.tecla}</Tecla>}
              </button>
            </li>
          ))}
          {opciones.length === 0 && <li className="px-3 py-6 text-center text-sm text-piedra">Sin resultados</li>}
        </ul>
      </div>
    </div>
  )
}
