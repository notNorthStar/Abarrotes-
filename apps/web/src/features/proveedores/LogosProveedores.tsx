import { useCallback, useEffect, useState } from 'react'
import { api, ApiError } from '../../api/client'
import type { ProveedorLogo } from '../../api/tipos'
import { useConfirmar } from '../../components/Confirmar'
import { Icono } from '../../components/Icono'
import { BotonImagen, Miniatura, reducirImagen } from '../../components/Imagenes'
import { Aviso, Boton, Tarjeta } from '../../components/ui'

/** Proveedores con su logotipo (T-34). Si falla, la pantalla sigue funcionando sin logos. */
export function useLogos() {
  const [proveedores, setProveedores] = useState<ProveedorLogo[]>([])
  const recargar = useCallback(
    () =>
      api
        .get<ProveedorLogo[]>('/logos-proveedores')
        .then(setProveedores)
        .catch(() => {}),
    [],
  )
  useEffect(() => {
    void recargar()
  }, [recargar])
  return { proveedores, recargar }
}

/** El administrador pone, cambia o quita el logotipo de cada proveedor. */
export function LogosProveedores({
  proveedores,
  onCambio,
}: {
  proveedores: ProveedorLogo[]
  onCambio: () => Promise<void>
}) {
  const confirmar = useConfirmar()
  const [ocupado, setOcupado] = useState<number | null>(null)
  const [error, setError] = useState('')

  async function hacer(id: number, accion: () => Promise<unknown>) {
    setOcupado(id)
    setError('')
    try {
      await accion()
      await onCambio()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error de conexión')
    } finally {
      setOcupado(null)
    }
  }

  async function quitar(p: ProveedorLogo) {
    if (!(await confirmar({ titulo: `¿Quitar el logotipo de ${p.nombre}?`, aceptar: 'Quitar', peligro: true }))) return
    await hacer(p.id, () => api.delete(`/logos-proveedores/${p.id}`))
  }

  if (proveedores.length === 0) return null
  return (
    <Tarjeta className="flex flex-col gap-4 p-5">
      <div className="flex flex-col gap-1">
        <h2 className="text-sm font-semibold">Logotipos de proveedores</h2>
        <p className="text-[13px] text-piedra">Se ven en las visitas y en los pagos de todas las sucursales.</p>
      </div>
      <ul data-flechas className="grid grid-cols-[repeat(auto-fill,minmax(min(260px,100%),1fr))] gap-3">
        {proveedores.map((p) => (
          <li key={p.id} className="flex items-center gap-3 rounded-[10px] border border-linea p-3">
            <Miniatura id={p.logoId} icono="proveedor" tamano={52} contener />
            <span className="flex min-w-0 flex-1 flex-col gap-1.5">
              <span className="truncate text-sm font-medium">{p.nombre}</span>
              <span className="flex gap-1.5">
                <BotonImagen
                  texto={ocupado === p.id ? 'Guardando…' : p.logoId ? 'Cambiar' : 'Subir logo'}
                  etiqueta={`${p.logoId ? 'Cambiar' : 'Subir'} logotipo de ${p.nombre}`}
                  disabled={ocupado !== null}
                  onElegir={([archivo]) =>
                    void hacer(p.id, async () => api.subir(`/logos-proveedores/${p.id}`, await reducirImagen(archivo)))
                  }
                />
                {p.logoId && (
                  <Boton
                    variante="fantasma"
                    tamano="sm"
                    disabled={ocupado !== null}
                    aria-label={`Quitar logotipo de ${p.nombre}`}
                    onClick={() => void quitar(p)}
                  >
                    <Icono nombre="basura" tamano={15} />
                  </Boton>
                )}
              </span>
            </span>
          </li>
        ))}
      </ul>
      {error && <Aviso tipo="error">{error}</Aviso>}
    </Tarjeta>
  )
}
