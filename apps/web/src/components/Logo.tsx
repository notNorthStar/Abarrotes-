// Logotipo de Abarrotes+: una A cuyo travesaño es el toldo de la tienda, con el "+" en la esquina.
// La misma figura está en public/favicon.svg.

export function Simbolo({ tamano = 28 }: { tamano?: number }) {
  return (
    <svg width={tamano} height={tamano} viewBox="0 0 32 32" aria-hidden="true" className="flex-none">
      <rect width="32" height="32" rx="8" className="fill-maiz" />
      <path
        d="M6 26.5 13.5 6 21 26.5"
        fill="none"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="stroke-tinta"
      />
      <path d="M3.9 15h4.8v3.2a2.4 2.4 0 0 1-4.8 0z" className="fill-chile" />
      <path d="M8.7 15h4.8v3.2a2.4 2.4 0 0 1-4.8 0z" className="fill-papel" />
      <path d="M13.5 15h4.8v3.2a2.4 2.4 0 0 1-4.8 0z" className="fill-chile" />
      <path d="M18.3 15h4.8v3.2a2.4 2.4 0 0 1-4.8 0z" className="fill-papel" />
      <path d="M26 4.8v6.4M22.8 8h6.4" fill="none" strokeWidth="2.6" strokeLinecap="round" className="stroke-tinta" />
    </svg>
  )
}

/** Símbolo y nombre, sobre fondo oscuro. */
export function Logo({ grande = false }: { grande?: boolean }) {
  return (
    <span className={`flex items-center ${grande ? 'gap-3.5' : 'gap-2.5'}`}>
      <Simbolo tamano={grande ? 44 : 28} />
      <span className={`font-semibold tracking-tight text-white ${grande ? 'text-2xl' : 'text-[15px]'}`}>
        Abarrotes<span className="text-maiz">+</span>
      </span>
    </span>
  )
}
