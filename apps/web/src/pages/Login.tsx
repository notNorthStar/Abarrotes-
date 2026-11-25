import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { ApiError } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import { Icono } from '../components/Icono'
import { Logo } from '../components/Logo'
import { Aviso, Boton } from '../components/ui'
import { GaleriaLogin, useObra } from '../features/login/GaleriaLogin'
import { saludo } from '../lib/saludo'
import { rutaInicial } from '../rutaInicial'

// HU-01: login con usuario y contraseña; redirige según el rol.
export function Login() {
  const { usuario, iniciarSesion } = useAuth()
  const navigate = useNavigate()
  const obra = useObra()
  const [form, setForm] = useState({ usuario: '', password: '' })
  const [verPassword, setVerPassword] = useState(false)
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  if (usuario) return <Navigate to={rutaInicial(usuario.rol)} replace />

  async function enviar(e: FormEvent) {
    e.preventDefault()
    if (!form.usuario.trim() || !form.password) {
      setError('Escribe tu usuario y contraseña')
      return
    }
    setError('')
    setEnviando(true)
    try {
      const u = await iniciarSesion(form.usuario.trim(), form.password)
      navigate(rutaInicial(u.rol), { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error de conexión')
    } finally {
      setEnviando(false)
    }
  }

  const fecha = new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div className="flex min-h-screen bg-papel text-tinta">
      <GaleriaLogin obra={obra} />

      <main className="relative flex flex-1 flex-col px-6 py-7 lg:px-10">
        <LineaAcento color={obra.acento} className="top-0" />
        <LineaAcento color={obra.acento} className="bottom-0" />
        <p className="self-end text-sm text-grafito first-letter:uppercase">{fecha}</p>

        <div className="m-auto flex w-full max-w-[360px] flex-col gap-8 py-8">
          <span className="inline-flex self-start rounded-2xl bg-riel px-5 py-3.5">
            <Logo grande />
          </span>

          <div className="flex flex-col gap-1">
            <p className="text-[15px] text-grafito">{saludo()}</p>
            <h1 className="text-[26px] font-semibold tracking-tight">Inicia sesión</h1>
            <p className="text-sm text-piedra">Entra con el usuario que te dio tu administrador.</p>
          </div>

          <form onSubmit={enviar} noValidate className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="login-usuario" className="text-[13px] font-medium">
                Usuario
              </label>
              <input
                id="login-usuario"
                className="campo h-11"
                autoFocus
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                value={form.usuario}
                onChange={(e) => setForm({ ...form, usuario: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="login-password" className="text-[13px] font-medium">
                Contraseña
              </label>
              <span className="relative">
                <input
                  id="login-password"
                  className="campo h-11 pr-12"
                  type={verPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  autoCapitalize="none"
                  spellCheck={false}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <button
                  type="button"
                  aria-label={verPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  aria-controls="login-password"
                  onClick={() => setVerPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-lg text-piedra hover:text-tinta"
                >
                  <Icono nombre={verPassword ? 'ojoTachado' : 'ojo'} />
                </button>
              </span>
            </div>
            {error && <Aviso tipo="error">{error}</Aviso>}
            <Boton type="submit" tamano="lg" disabled={enviando} className="mt-2 w-full">
              {enviando ? 'Entrando…' : 'Entrar'}
            </Boton>
          </form>
        </div>
      </main>
    </div>
  )
}

/** Línea en el borde del lado del formulario, con el color de la obra en exhibición. */
function LineaAcento({ color, className }: { color: string; className: string }) {
  return (
    <span
      aria-hidden="true"
      style={{ backgroundColor: color }}
      className={`absolute inset-x-0 h-1 transition-colors duration-1000 ${className}`}
    />
  )
}
