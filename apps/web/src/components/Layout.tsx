import { NavLink, Outlet } from 'react-router-dom'
import type { Rol } from '../api/tipos'
import { useAuth } from '../auth/AuthContext'
import { tieneRol } from '../auth/RequireRol'

const menu: { to: string; texto: string; minimo: Rol }[] = [
  { to: '/venta', texto: 'Venta', minimo: 'CAJERO' },
  { to: '/caja', texto: 'Caja', minimo: 'CAJERO' },
  { to: '/inventario', texto: 'Inventario', minimo: 'CAJERO' },
  { to: '/productos/nuevo', texto: 'Agregar productos', minimo: 'CAJERO' },
  { to: '/usuarios', texto: 'Cajeros', minimo: 'ADMIN' },
]

export function Layout() {
  const { usuario, cerrarSesion } = useAuth()
  if (!usuario) return null

  return (
    <div className="min-h-screen">
      <header className="flex items-center gap-6 bg-emerald-700 px-6 py-3 text-white">
        <span className="text-lg font-bold">Abarrotes+</span>
        <nav className="flex gap-1">
          {menu
            .filter((m) => tieneRol(usuario.rol, m.minimo))
            .map((m) => (
              <NavLink
                key={m.to}
                to={m.to}
                className={({ isActive }) =>
                  `rounded px-3 py-1 ${isActive ? 'bg-emerald-900' : 'hover:bg-emerald-600'}`
                }
              >
                {m.texto}
              </NavLink>
            ))}
        </nav>
        <div className="ml-auto flex items-center gap-3 text-sm">
          <span>
            {usuario.nombre} · {usuario.rol}
          </span>
          <button onClick={cerrarSesion} className="rounded bg-emerald-900 px-3 py-1 hover:bg-emerald-950">
            Salir
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-6xl p-6">
        <Outlet />
      </main>
    </div>
  )
}
