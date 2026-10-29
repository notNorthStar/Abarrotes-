import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { ApiError } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import { Aviso, Boton } from '../components/ui'
import { rutaInicial } from '../rutaInicial'

// HU-01: login con usuario y contraseña; redirige según el rol.
export function Login() {
  const { usuario, iniciarSesion } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ usuario: '', password: '' })
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

  return (
    <div className="flex min-h-screen bg-papel text-tinta">
      {/* Panel de marca: solo en pantallas grandes. */}
      <aside className="hidden w-[44%] max-w-[560px] flex-none flex-col justify-between bg-riel px-12 py-10 lg:flex">
        <Marca />
        <p className="max-w-sm text-[22px] font-medium leading-snug tracking-tight text-white">
          Punto de venta para tu abarrotes: cobra, cuadra tu caja y controla tu inventario.
        </p>
      </aside>

      <main className="flex flex-1 flex-col items-center justify-center px-6 py-10">
        <div className="flex w-full max-w-[360px] flex-col gap-8">
          <div className="lg:hidden">
            <span className="inline-flex items-center gap-2.5 rounded-xl bg-riel px-3 py-2.5">
              <Marca />
            </span>
          </div>

          <div className="flex flex-col gap-1">
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
              <input
                id="login-password"
                className="campo h-11"
                type="password"
                autoComplete="current-password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
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

function Marca() {
  return (
    <span className="flex items-center gap-2.5">
      <span
        aria-hidden="true"
        className="num flex h-7 w-7 items-center justify-center rounded-[7px] bg-maiz text-xs font-semibold text-tinta"
      >
        A+
      </span>
      <span className="text-[15px] font-semibold tracking-tight text-white">Abarrotes+</span>
    </span>
  )
}
