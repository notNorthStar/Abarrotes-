import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { api, tokenStore } from '../api/client'
import type { Usuario } from '../api/tipos'

type Sesion = {
  usuario: Usuario | null
  cargando: boolean
  iniciarSesion: (usuario: string, password: string) => Promise<Usuario>
  cerrarSesion: () => void
}

const AuthContext = createContext<Sesion | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    if (!tokenStore.get()) {
      setCargando(false)
      return
    }
    api
      .get<Usuario>('/auth/me')
      .then(setUsuario)
      .catch(() => tokenStore.clear())
      .finally(() => setCargando(false))
  }, [])

  const iniciarSesion = useCallback(async (usuario: string, password: string) => {
    const res = await api.post<{ token: string; usuario: Usuario }>('/auth/login', { usuario, password })
    tokenStore.set(res.token)
    setUsuario(res.usuario)
    return res.usuario
  }, [])

  const cerrarSesion = useCallback(() => {
    tokenStore.clear()
    setUsuario(null)
  }, [])

  return (
    <AuthContext.Provider value={{ usuario, cargando, iniciarSesion, cerrarSesion }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
