import { useEffect, useState } from 'react'
import { api, ApiError } from '../../api/client'
import type { Sucursal } from '../../api/tipos'
import { Aviso, EncabezadoPagina, Esqueleto, Pagina } from '../../components/ui'
import { GestionCuentas } from './UsuariosPage'

// HU-15 (Sosa): el jefe crea, suspende/reactiva, restablece contraseña y elimina administradores.
// Cada administrador queda ligado a la sucursal elegida en el selector.

export function AdministradoresPage() {
  const [sucursales, setSucursales] = useState<Sucursal[] | null>(null)
  const [sucursalId, setSucursalId] = useState<number | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get<Sucursal[]>('/administradores/sucursales')
      .then((lista) => {
        setSucursales(lista)
        setSucursalId(lista[0]?.id ?? null)
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Error de conexión'))
  }, [])

  const actual = sucursales?.find((s) => s.id === sucursalId)

  if (!actual) {
    return (
      <Pagina>
        <EncabezadoPagina titulo="Cuentas de administrador" />
        {error ? (
          <Aviso tipo="error">{error}</Aviso>
        ) : sucursales ? (
          <Aviso tipo="info">No hay sucursales activas.</Aviso>
        ) : (
          <Esqueleto className="h-10 w-64" />
        )}
      </Pagina>
    )
  }

  return (
    <GestionCuentas
      ruta="/administradores"
      consulta={`?sucursalId=${actual.id}`}
      singular="administrador"
      plural="administradores"
      ambito={`la sucursal ${actual.nombre}`}
      acciones={
        <label className="flex flex-col gap-1.5 text-[13px] font-medium">
          Sucursal
          <select
            className="campo min-w-48"
            value={actual.id}
            onChange={(e) => setSucursalId(Number(e.target.value))}
          >
            {sucursales!.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nombre}
              </option>
            ))}
          </select>
        </label>
      }
    />
  )
}
