import { useEffect, useState } from 'react'
import { api, ApiError } from '../api/client'
import type { Producto } from '../api/tipos'

const ESPERA_MS = 180

/**
 * Busca productos mientras se escribe. Conserva los resultados anteriores hasta que llegan los nuevos
 * y descarta las respuestas que ya no corresponden a lo escrito. `productos` es null antes de la primera.
 */
export function useBusquedaProductos(texto: string, activo = true) {
  const consulta = texto.trim()
  const [productos, setProductos] = useState<Producto[] | null>(null)
  const [cargando, setCargando] = useState(activo)
  const [error, setError] = useState('')
  const [intento, setIntento] = useState(0)

  useEffect(() => {
    if (!activo) {
      setProductos(null)
      setCargando(false)
      setError('')
      return
    }
    let vigente = true
    setCargando(true)
    const espera = window.setTimeout(
      () => {
        api
          .get<Producto[]>(`/productos?q=${encodeURIComponent(consulta)}`)
          .then((lista) => {
            if (!vigente) return
            setProductos(lista)
            setError('')
          })
          .catch((err: unknown) => {
            if (!vigente) return
            setProductos([])
            setError(err instanceof ApiError ? err.message : 'No se pudo consultar. Intenta de nuevo.')
          })
          .finally(() => {
            if (vigente) setCargando(false)
          })
      },
      consulta ? ESPERA_MS : 0,
    )
    return () => {
      vigente = false
      window.clearTimeout(espera)
    }
  }, [consulta, activo, intento])

  return { productos, cargando, error, recargar: () => setIntento((n) => n + 1) }
}
