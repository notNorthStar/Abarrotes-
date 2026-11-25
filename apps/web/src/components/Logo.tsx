// Logotipo de Abarrotes+: barras de un código de barras y la cuarta es el "+".
// En public/favicon.svg va la misma figura sobre un cuadro tinta.

/** Símbolo para fondo oscuro. */
function Simbolo({ alto }: { alto: number }) {
  return (
    <svg width={alto * 1.2} height={alto} viewBox="4 6 24 20" aria-hidden="true" className="flex-none">
      <path d="M4 6h4v20H4ZM10 6h2v20h-2ZM14 6h2v20h-2Z" className="fill-papel" />
      <path d="M21 11h4v3h3v4h-3v3h-4v-3h-3v-4h3Z" className="fill-maiz" />
    </svg>
  )
}

/** Símbolo y nombre, sobre fondo oscuro. El "+" del nombre lo pone el símbolo. */
export function Logo({ grande = false }: { grande?: boolean }) {
  return (
    <span className={`flex items-center ${grande ? 'gap-3.5' : 'gap-2.5'}`}>
      <Simbolo alto={grande ? 30 : 20} />
      <span className={`font-semibold tracking-tight text-white ${grande ? 'text-2xl' : 'text-[15px]'}`}>
        Abarrotes<span className="sr-only">+</span>
      </span>
    </span>
  )
}
