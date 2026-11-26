import { useRef, useState } from 'react'
import { api, ApiError } from '../api/client'
import type { ImagenRef } from '../api/tipos'
import { useConfirmar } from './Confirmar'
import { Icono, type NombreIcono } from './Icono'
import { Aviso, Boton } from './ui'

// T-34 (Sosa): fotos de productos y logotipos de proveedores.

export const MAX_IMAGENES_PRODUCTO = 5
const LADO_MAXIMO = 1000

export const urlImagen = (id: string) => `/api/imagenes/${id}`

/** Reduce la foto antes de subirla (lado mayor de 1000 px, WebP) para que cargue rápido en la caja. */
export async function reducirImagen(archivo: File): Promise<Blob> {
  const mapa = await createImageBitmap(archivo).catch(() => {
    throw new ApiError(400, `${archivo.name}: el archivo no es una imagen que se pueda abrir`)
  })
  const escala = Math.min(1, LADO_MAXIMO / Math.max(mapa.width, mapa.height))
  const lienzo = document.createElement('canvas')
  lienzo.width = Math.max(1, Math.round(mapa.width * escala))
  lienzo.height = Math.max(1, Math.round(mapa.height * escala))
  lienzo.getContext('2d')?.drawImage(mapa, 0, 0, lienzo.width, lienzo.height)
  mapa.close()
  const blob = await new Promise<Blob | null>((listo) => lienzo.toBlob(listo, 'image/webp', 0.85))
  if (!blob) throw new ApiError(400, `${archivo.name}: no se pudo preparar la imagen`)
  return blob
}

/** Foto o logotipo en un cuadro; sin imagen muestra un ícono. Decorativa: el nombre va siempre al lado. */
export function Miniatura({
  id,
  icono = 'inventario',
  tamano = 36,
  contener = false,
}: {
  id?: string | null
  icono?: NombreIcono
  tamano?: number
  /** Logotipos: se ven completos en lugar de recortarse. */
  contener?: boolean
}) {
  return (
    <span
      aria-hidden="true"
      style={{ width: tamano, height: tamano }}
      className={`flex flex-none items-center justify-center overflow-hidden rounded-lg text-piedra ${
        id ? 'border border-linea bg-superficie' : 'bg-crema'
      }`}
    >
      {id ? (
        <img
          src={urlImagen(id)}
          alt=""
          loading="lazy"
          className={`h-full w-full ${contener ? 'object-contain p-0.5' : 'object-cover'}`}
        />
      ) : (
        <Icono nombre={icono} tamano={Math.round(tamano * 0.5)} />
      )}
    </span>
  )
}

/** Botón que abre el selector de archivos. */
export function BotonImagen({
  texto,
  varias = false,
  disabled,
  tamano = 'sm',
  etiqueta,
  onElegir,
}: {
  texto: string
  varias?: boolean
  disabled?: boolean
  tamano?: 'sm' | 'md'
  etiqueta?: string
  onElegir: (archivos: File[]) => void
}) {
  const entrada = useRef<HTMLInputElement>(null)
  return (
    <>
      <Boton variante="secundario" tamano={tamano} disabled={disabled} aria-label={etiqueta} onClick={() => entrada.current?.click()}>
        <Icono nombre="imagen" tamano={16} />
        {texto}
      </Boton>
      <input
        ref={entrada}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        multiple={varias}
        hidden
        onChange={(e) => {
          const archivos = [...(e.target.files ?? [])]
          e.target.value = '' // permite volver a elegir el mismo archivo
          if (archivos.length > 0) onElegir(archivos)
        }}
      />
    </>
  )
}

/** Galería editable de un producto: la primera imagen es la principal. */
export function GaleriaProducto({
  productoId,
  nombre,
  imagenes,
  onCambio,
}: {
  productoId: number
  nombre: string
  imagenes: ImagenRef[]
  onCambio: () => void
}) {
  const confirmar = useConfirmar()
  const [elegida, setElegida] = useState<string | null>(null)
  const [ocupado, setOcupado] = useState(false)
  const [error, setError] = useState('')
  const actual = imagenes.find((i) => i.id === elegida) ?? imagenes[0]

  async function hacer(accion: () => Promise<unknown>) {
    setOcupado(true)
    setError('')
    try {
      await accion()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error de conexión')
    } finally {
      setOcupado(false)
      onCambio()
    }
  }

  const subir = (archivos: File[]) =>
    hacer(async () => {
      for (const archivo of archivos) await api.subir(`/productos/${productoId}/imagenes`, await reducirImagen(archivo))
    })

  async function quitar(id: string) {
    if (!(await confirmar({ titulo: '¿Quitar esta imagen?', detalle: nombre, aceptar: 'Quitar', peligro: true }))) return
    await hacer(() => api.delete(`/productos/${productoId}/imagenes/${id}`))
  }

  return (
    <section aria-label="Imágenes" className="flex flex-col gap-2.5">
      {actual && (
        <img
          src={urlImagen(actual.id)}
          alt={nombre}
          className="aspect-square w-full rounded-xl border border-linea bg-superficie object-contain"
        />
      )}
      {imagenes.length > 1 && (
        <div role="group" aria-label="Elegir imagen" className="flex flex-wrap gap-2">
          {imagenes.map((i, n) => (
            <button
              key={i.id}
              type="button"
              aria-label={`Imagen ${n + 1}`}
              aria-pressed={i.id === actual.id}
              onClick={() => setElegida(i.id)}
              className={`rounded-lg border-2 ${i.id === actual.id ? 'border-maiz' : 'border-transparent'}`}
            >
              <Miniatura id={i.id} tamano={48} />
            </button>
          ))}
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        <BotonImagen
          varias
          texto={ocupado ? 'Guardando…' : 'Agregar imagen'}
          disabled={ocupado || imagenes.length >= MAX_IMAGENES_PRODUCTO}
          onElegir={(a) => void subir(a)}
        />
        {actual && (
          <Boton variante="fantasma" tamano="sm" disabled={ocupado} onClick={() => void quitar(actual.id)}>
            <Icono nombre="basura" tamano={15} />
            Quitar
          </Boton>
        )}
      </div>
      {error && <Aviso tipo="error">{error}</Aviso>}
    </section>
  )
}
