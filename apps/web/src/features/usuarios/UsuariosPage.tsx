import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { api, ApiError } from '../../api/client'
import type { CuentaUsuario, EstadoCuenta } from '../../api/tipos'
import { useAuth } from '../../auth/AuthContext'

// HU-12 (Sosa): el admin crea, suspende/reactiva, restablece contraseña y elimina cajeros de su sucursal.

const mensaje = (err: unknown) => (err instanceof ApiError ? err.message : 'Error de conexión')

const estilosEstado: Record<EstadoCuenta, string> = {
  ACTIVO: 'bg-emerald-100 text-emerald-800',
  SUSPENDIDO: 'bg-amber-100 text-amber-800',
  ELIMINADO: 'bg-slate-200 text-slate-600',
}

const textoEstado: Record<EstadoCuenta, string> = {
  ACTIVO: 'Activo',
  SUSPENDIDO: 'Suspendido',
  ELIMINADO: 'Eliminado',
}

const FORM_VACIO = { nombre: '', usuario: '', password: '' }

export function UsuariosPage() {
  const { usuario } = useAuth()

  if (usuario?.rol === 'JEFE') {
    return (
      <section>
        <h1 className="mb-4 text-2xl font-semibold">Cuentas de cajero</h1>
        <p className="rounded border border-amber-300 bg-amber-50 p-4 text-amber-800">
          Selecciona una sucursal (disponible en HU-14).
        </p>
      </section>
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

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold">Cuentas de cajero</h1>

      <form onSubmit={crear} className="space-y-3 rounded-lg bg-white p-4 shadow">
        <h2 className="font-semibold">Nuevo cajero</h2>
        <div className="grid gap-3 sm:grid-cols-4">
          <input
            className="rounded border px-3 py-2"
            placeholder="Nombre"
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          />
          <input
            className="rounded border px-3 py-2"
            placeholder="Usuario"
            autoComplete="off"
            value={form.usuario}
            onChange={(e) => setForm({ ...form, usuario: e.target.value })}
          />
          <input
            className="rounded border px-3 py-2"
            type="password"
            placeholder="Contraseña (mín. 6)"
            autoComplete="new-password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <button
            disabled={guardando}
            className="rounded bg-emerald-700 py-2 font-semibold text-white hover:bg-emerald-800 disabled:opacity-50"
          >
            {guardando ? 'Guardando…' : 'Crear cajero'}
          </button>
        </div>
        {errorForm && <p className="text-sm text-red-600">{errorForm}</p>}
      </form>

      {error && <p className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {aviso && <p className="rounded bg-emerald-50 p-3 text-sm text-emerald-800">{aviso}</p>}

      <div className="overflow-x-auto rounded-lg bg-white shadow">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 text-slate-600">
            <tr>
              <th className="px-4 py-2">Nombre</th>
              <th className="px-4 py-2">Usuario</th>
              <th className="px-4 py-2">Estado</th>
              <th className="px-4 py-2 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cargando && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                  Cargando…
                </td>
              </tr>
            )}
            {!cargando && cajeros.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
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
    </section>
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

  return (
    <>
      <tr className="border-t">
        <td className="px-4 py-2">{cajero.nombre}</td>
        <td className="px-4 py-2 font-mono">{cajero.usuario}</td>
        <td className="px-4 py-2">
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${estilosEstado[cajero.estado]}`}
          >
            {textoEstado[cajero.estado]}
          </span>
        </td>
        <td className="space-x-2 whitespace-nowrap px-4 py-2 text-right">
          <button onClick={onCambiarEstado} className="rounded border px-2 py-1 hover:bg-slate-50">
            {cajero.estado === 'ACTIVO' ? 'Suspender' : 'Reactivar'}
          </button>
          <button onClick={onAbrirReset} className="rounded border px-2 py-1 hover:bg-slate-50">
            Restablecer contraseña
          </button>
          <button
            onClick={onEliminar}
            className="rounded border border-red-300 px-2 py-1 text-red-700 hover:bg-red-50"
          >
            Eliminar
          </button>
        </td>
      </tr>
      {restableciendo && (
        <tr className="bg-slate-50">
          <td colSpan={4} className="px-4 py-3">
            <form onSubmit={enviar} className="flex flex-wrap items-center gap-2">
              <span className="text-slate-600">Nueva contraseña para {cajero.usuario}:</span>
              <input
                className="rounded border px-3 py-1"
                type="password"
                autoComplete="new-password"
                placeholder="Mínimo 6 caracteres"
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button className="rounded bg-emerald-700 px-3 py-1 font-semibold text-white hover:bg-emerald-800">
                Guardar
              </button>
              <button
                type="button"
                onClick={onAbrirReset}
                className="rounded px-3 py-1 text-slate-600 hover:underline"
              >
                Cancelar
              </button>
              {error && <span className="text-sm text-red-600">{error}</span>}
            </form>
          </td>
        </tr>
      )}
    </>
  )
}
