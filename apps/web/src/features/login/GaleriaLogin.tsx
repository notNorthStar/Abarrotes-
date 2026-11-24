import { useEffect, useState } from 'react'
import { Logo } from '../../components/Logo'
import { OBRAS } from './obras'

// T-35 (Sosa): el panel del login es una galería de arte sobre lo más mundano de una tienda.

const CAMBIO_MS = 9000

export function GaleriaLogin() {
  const [indice, setIndice] = useState(() => Math.floor(Math.random() * OBRAS.length))
  const [pausada, setPausada] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const obra = OBRAS[indice]
  const mover = (paso: number) => setIndice((i) => (i + paso + OBRAS.length) % OBRAS.length)

  useEffect(() => {
    // Se adelanta la descarga de la siguiente para que el cambio no parpadee.
    new Image().src = `/arte/${OBRAS[(indice + 1) % OBRAS.length].archivo}`
    if (pausada) return
    const reloj = window.setTimeout(() => setIndice((indice + 1) % OBRAS.length), CAMBIO_MS)
    return () => window.clearTimeout(reloj)
  }, [indice, pausada])

  return (
    <aside
      aria-label="Galería"
      className="relative hidden w-[44%] max-w-[720px] flex-none flex-col justify-between overflow-hidden bg-riel lg:flex"
    >
      <img
        key={obra.archivo}
        src={`/arte/${obra.archivo}`}
        alt={`${obra.titulo}. ${obra.estilo}.`}
        className="absolute inset-0 h-full w-full animate-aparecer object-cover motion-reduce:animate-none"
      />
      <div className="relative self-start p-8">
        <span className="inline-flex rounded-xl bg-riel px-3 py-2.5">
          <Logo />
        </span>
      </div>

      {/* Ficha de museo sobre fondo sólido: se lee con cualquier obra detrás. */}
      <div className="relative m-8 flex flex-col gap-3 self-start rounded-lg bg-papel p-5 text-tinta xl:max-w-[420px]">
        <div className="flex flex-col gap-1">
          <p className="text-[17px] font-semibold leading-snug tracking-tight">
            <span className="italic">{obra.titulo}</span>, <span className="num text-[15px] font-normal">{obra.anio}</span>
          </p>
          <p className="text-[13px] text-piedra">
            {obra.tecnica}. {obra.estilo}.
          </p>
        </div>
        <p className="text-sm leading-relaxed text-grafito">{obra.cedula}</p>
        <div role="group" aria-label="Cambiar obra" className="flex items-center gap-1.5 border-t border-linea pt-3">
          <Control etiqueta="Obra anterior" onClick={() => mover(-1)} trazo="M15 6l-6 6 6 6" />
          <Control
            etiqueta={pausada ? 'Reanudar la galería' : 'Pausar la galería'}
            onClick={() => setPausada((p) => !p)}
            trazo={pausada ? 'M8 5v14l11-7z' : 'M9 5v14M15 5v14'}
          />
          <Control etiqueta="Obra siguiente" onClick={() => mover(1)} trazo="M9 6l6 6-6 6" />
          <span className="num ml-auto text-xs text-piedra">
            {indice + 1} / {OBRAS.length}
          </span>
        </div>
      </div>
    </aside>
  )
}

function Control({ etiqueta, trazo, onClick }: { etiqueta: string; trazo: string; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={etiqueta}
      onClick={onClick}
      className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-crema"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d={trazo} />
      </svg>
    </button>
  )
}
