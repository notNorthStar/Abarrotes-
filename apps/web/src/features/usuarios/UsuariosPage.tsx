import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { api, ApiError } from '../../api/client'
import type { CuentaUsuario, EstadoCuenta } from '../../api/tipos'
import { useAuth } from '../../auth/AuthContext'
import { Icono } from '../../components/Icono'
import { Aviso, Boton, Chip, EncabezadoPagina, Esqueleto, Pagina, Tarjeta } from '../../components/ui'

// HU-12 (Sosa): el admin crea, suspende/reactiva, restablece contraseña y elimina cajeros de su sucursal.

const mensaje = (err: unknown) => (err instanceof ApiError ? err.message : 'Error de conexión')

const tonoEstado: Record<EstadoCuenta, 'hoja' | 'maiz' | 'neutro'> = {
  ACTIVO: 'hoja',
  SUSPENDIDO: 'maiz',
  ELIMINADO: 'neutro',
}

const textoEstado: Record<EstadoCuenta, string> = {
  ACTIVO: 'Activo',
  SUSPENDIDO: 'Suspendido',
  ELIMINADO: 'Eliminado',
}

const FORM_VACIO = { nombre: '', usuario: '', password: '' }

const iniciales = (nombre: string) =>
  nombre
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('')

/** Botón de eliminar: peligro sutil (texto rojo, fondo claro al pasar). */
const claseEliminar =
  'inline-flex h-9 items-center justify-center gap-1.5 rounded-lg px-3 text-sm text-chile-texto transition-colors hover:bg-chile-claro'

export function UsuariosPage() {
  const { usuario } = useAuth()

  if (usuario?.rol === 'JEFE') {
    return (
      <Pagina>
        <EncabezadoPagina titulo="Cuentas de cajero" />
        <Aviso tipo="info">Selecciona una sucursal (disponible en HU-14).</Aviso>
      </Pagina>
    )
  }
  return <GestionCajeros />
}

function GestionCajeros() {
  const [cajeros, setCajeros] = useState<CuentaUsuario[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [aviso, setAviso] = useState('')
  const [form, setForm] = useState(FORM_VACIO)
  const [errorForm, setErrorForm] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [resetId, setResetId] = useState<number | null>(null)

  const cargar = useCallback(async () => {
    try {
      setCajeros(await api.get<CuentaUsuario[]>('/usuarios'))
      setError('')
    } catch (err) {
      setError(mensaje(err))
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    void cargar()
  }, [cargar])

  async function crear(e: FormEvent) {
    e.preventDefault()
    setErrorForm('')
    setAviso('')
    setGuardando(true)
    try {
      const nuevo = await api.post<CuentaUsuario>('/usuarios', form)
      setForm(FORM_VACIO)
      setAviso(`Cajero "${nuevo.usuario}" creado.`)
      await cargar()
    } catch (err) {
      setErrorForm(mensaje(err))
    } finally {
      setGuardando(false)
    }
  }

  async function accion(fn: () => Promise<unknown>, exito: string) {
    setError('')
    setAviso('')
    try {
      await fn()
      setAviso(exito)
      await cargar()
    } catch (err) {
      setError(mensaje(err))
    }
  }

  function cambiarEstado(c: CuentaUsuario) {
    const estado = c.estado === 'ACTIVO' ? 'SUSPENDIDO' : 'ACTIVO'
    void accion(
      () => api.patch(`/usuarios/${c.id}`, { estado }),
      estado === 'SUSPENDIDO' ? `${c.nombre} quedó suspendido.` : `${c.nombre} fue reactivado.`,
    )
  }

  function eliminar(c: CuentaUsuario) {
    if (
      !window.confirm(
        `¿Eliminar la cuenta de ${c.nombre}? Su historial de operaciones se conserva.`,
      )
    )
      return
    void accion(() => api.delete(`/usuarios/${c.id}`), `${c.nombre} fue eliminado.`)
  }

  const activos = cajeros.filter((c) => c.estado === 'ACTIVO').length
  const subtitulo = cargando
    ? 'Cajeros de tu sucursal'
    : `${cajeros.length} ${cajeros.length === 1 ? 'cajero' : 'cajeros'} · ${activos} ${activos === 1 ? 'activo' : 'activos'}`

  return (
    <Pagina>
      <EncabezadoPagina titulo="Cuentas de cajero" subtitulo={subtitulo} />

      <Tarjeta className="p-5">
        <form onSubmit={crear} aria-labelledby="h-nuevo-cajero" className="flex flex-col gap-4">
          <h2 id="h-nuevo-cajero" className="text-sm font-semibold">
            Nuevo cajero
          </h2>
          <div className="grid gap-4 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="nc-nombre" className="text-[13px] font-medium">
                Nombre
              </label>
              <input
                id="nc-nombre"
                className="campo"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="nc-usuario" className="text-[13px] font-medium">
                Usuario
              </label>
              <input
                id="nc-usuario"
                className="campo num"
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                value={form.usuario}
                onChange={(e) => setForm({ ...form, usuario: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="nc-password" className="text-[13px] font-medium">
                Contraseña
              </label>
              <input
                id="nc-password"
                className="campo"
                type="password"
                placeholder="Mínimo 6 caracteres"
                autoComplete="new-password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <Boton type="submit" disabled={guardando}>
              <Icono nombre="mas" tamano={16} />
              {guardando ? 'Guardando…' : 'Crear cajero'}
            </Boton>
          </div>
          {errorForm && <Aviso tipo="error">{errorForm}</Aviso>}
        </form>
      </Tarjeta>

      {error && <Aviso tipo="error">{error}</Aviso>}
      {aviso && <Aviso tipo="ok">{aviso}</Aviso>}

      <Tarjeta className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Cajeros de la sucursal</caption>
            <thead className="border-b border-linea bg-hueso text-xs text-piedra">
              <tr>
                <th scope="col" className="px-4 py-2.5 font-medium">
                  Nombre
                </th>
                <th scope="col" className="px-4 py-2.5 font-medium">
                  Usuario
                </th>
                <th scope="col" className="px-4 py-2.5 font-medium">
                  Estado
                </th>
                <th scope="col" className="px-4 py-2.5 text-right font-medium">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {cargando &&
                ['36%', '28%', '42%'].map((ancho) => (
                  <tr key={ancho} className="border-t border-linea first:border-t-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Esqueleto className="h-8 w-8 flex-none rounded-full" />
                        <div className="min-w-[120px] flex-1">
                          <div aria-hidden="true" className="esqueleto h-3" style={{ width: ancho }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Esqueleto className="h-3 w-20" />
                    </td>
                    <td className="px-4 py-3">
                      <Esqueleto className="h-5 w-16 rounded-full" />
                    </td>
                    <td className="px-4 py-3">
                      <Esqueleto className="ml-auto h-8 w-56" />
                    </td>
                  </tr>
                ))}
              {!cargando && cajeros.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-sm text-piedra">
                    No hay cajeros en tu sucursal.
                  </td>
                </tr>
              )}
              {cajeros.map((c) => (
                <FilaCajero
                  key={c.id}
                  cajero={c}
                  restableciendo={resetId === c.id}
                  onCambiarEstado={() => cambiarEstado(c)}
                  onEliminar={() => eliminar(c)}
                  onAbrirReset={() => setResetId(resetId === c.id ? null : c.id)}
                  onRestablecer={async (password) => {
                    await api.patch(`/usuarios/${c.id}`, { password })
                    setResetId(null)
                    setAviso(`Contraseña de ${c.nombre} restablecida.`)
                  }}
                />
              ))}
            </tbody>
          </table>
        </div>
      </Tarjeta>
    </Pagina>
  )
}

type FilaProps = {
  cajero: CuentaUsuario
  restableciendo: boolean
  onCambiarEstado: () => void
  onEliminar: () => void
  onAbrirReset: () => void
  onRestablecer: (password: string) => Promise<void>
}

function FilaCajero({
  cajero,
  restableciendo,
  onCambiarEstado,
  onEliminar,
  onAbrirReset,
  onRestablecer,
}: FilaProps) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function enviar(e: FormEvent) {
    e.preventDefault()
    setError('')
    try {
      await onRestablecer(password)
      setPassword('')
    } catch (err) {
      setError(mensaje(err))
    }
  }

  const idPassword = `reset-${cajero.id}`

  return (
    <>
      <tr className="border-t border-linea first:border-t-0 hover:bg-hueso">
        <td className="px-4 py-3">
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-crema text-xs font-medium text-grafito"
            >
              {iniciales(cajero.nombre)}
            </span>
            <span className="font-medium">{cajero.nombre}</span>
          </div>
        </td>
        <td className="num px-4 py-3 text-grafito">{cajero.usuario}</td>
        <td className="px-4 py-3">
          <Chip tono={tonoEstado[cajero.estado]}>{textoEstado[cajero.estado]}</Chip>
        </td>
        <td className="px-4 py-3">
          <div className="flex justify-end gap-2 whitespace-nowrap">
            <Boton variante="secundario" tamano="sm" onClick={onCambiarEstado}>
              {cajero.estado === 'ACTIVO' ? 'Suspender' : 'Reactivar'}
            </Boton>
            <Boton variante="secundario" tamano="sm" onClick={onAbrirReset} aria-expanded={restableciendo}>
              <Icono nombre="candado" tamano={15} />
              Restablecer contraseña
            </Boton>
            <button type="button" onClick={onEliminar} className={claseEliminar}>
              <Icono nombre="basura" tamano={15} />
              Eliminar
            </button>
          </div>
        </td>
      </tr>
      {restableciendo && (
        <tr className="bg-hueso">
          <td colSpan={4} className="border-t border-linea px-4 py-3.5">
            <form onSubmit={enviar} className="flex flex-col gap-2">
              <label htmlFor={idPassword} className="text-[13px] font-medium">
                Nueva contraseña para <span className="num">{cajero.usuario}</span>
              </label>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  id={idPassword}
                  className="campo h-9 w-auto min-w-[220px] flex-1 sm:max-w-xs"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Mínimo 6 caracteres"
                  autoFocus
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Boton type="submit" tamano="sm">
                  Guardar
                </Boton>
                <Boton variante="fantasma" tamano="sm" onClick={onAbrirReset}>
                  Cancelar
                </Boton>
              </div>
              {error && <Aviso tipo="error">{error}</Aviso>}
            </form>
          </td>
        </tr>
      )}
    </>
  )
}
