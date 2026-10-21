import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { ApiError } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import { rutaInicial } from '../rutaInicial'

// T-00: login base. HU-01 (Sosa) completa validaciones, estados y pruebas.
export function Login() {
  const { usuario, iniciarSesion } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ usuario: '', password: '' })
  const [error, setError] = useState('')

  if (usuario) return <Navigate to={rutaInicial(usuario.rol)} replace />

  async function enviar(e: FormEvent) {
    e.preventDefault()
    setError('')
    try {
      const u = await iniciarSesion(form.usuario, form.password)
      navigate(rutaInicial(u.rol), { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error de conexión')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <form onSubmit={enviar} className="w-80 space-y-4 rounded-lg bg-white p-8 shadow">
        <h1 className="text-center text-2xl font-bold text-emerald-700">Abarrotes+</h1>
        <input
          className="w-full rounded border px-3 py-2"
          placeholder="Usuario"
          autoFocus
          value={form.usuario}
          onChange={(e) => setForm({ ...form, usuario: e.target.value })}
        />
        <input
          className="w-full rounded border px-3 py-2"
          type="password"
          placeholder="Contraseña"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="w-full rounded bg-emerald-700 py-2 font-semibold text-white hover:bg-emerald-800">
          Entrar
        </button>
      </form>
    </div>
  )
}
