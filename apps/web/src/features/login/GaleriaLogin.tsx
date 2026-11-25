import { useEffect, useState } from 'react'
import { OBRAS } from './obras'

// T-35 (Sosa): el panel del login es una galería de arte sobre lo más mundano de una tienda.

const CAMBIO_MS = 9000

export function GaleriaLogin() {
  const [indice, setIndice] = useState(() => Math.floor(Math.random() * OBRAS.length))
  const obra = OBRAS[indice]

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const siguiente = (indice + 1) % OBRAS.length
    // Se adelanta la descarga de la siguiente para que el cambio no parpadee.
    new Image().src = `/arte/${OBRAS[siguiente].archivo}`
    const reloj = window.setTimeout(() => setIndice(siguiente), CAMBIO_MS)
    return () => window.clearTimeout(reloj)
  }, [indice])

  return (
    <aside
      aria-label="Galería"
      className="relative hidden w-[44%] max-w-[720px] flex-none items-end overflow-hidden bg-riel lg:flex"
    >
      <img
        key={obra.archivo}
        src={`/arte/${obra.archivo}`}
        alt={`${obra.titulo}. ${obra.estilo}.`}
        className="absolute inset-0 h-full w-full animate-aparecer object-cover motion-reduce:animate-none"
      />
      {/* Ficha de museo sobre fondo oscuro: se lee con cualquier obra detrás. */}
      <div className="relative m-5 flex max-w-[300px] flex-col gap-1 rounded-md bg-riel/90 px-3 py-2.5 text-[11px] leading-snug text-riel-texto">
        <p className="text-[13px] font-medium italic text-white">{obra.titulo}</p>
        <p>{obra.tecnica}</p>
        <p>{obra.cedula}</p>
      </div>
    </aside>
  )
}
