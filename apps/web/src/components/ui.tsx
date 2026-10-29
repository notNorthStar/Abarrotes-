// Componentes base del sistema "Mostrador". Usar estos en lugar de clases sueltas.
import type { ButtonHTMLAttributes, ReactNode } from 'react'

type VarianteBoton = 'primario' | 'secundario' | 'peligro' | 'fantasma'

const VARIANTES: Record<VarianteBoton, string> = {
  primario: 'bg-tinta text-white hover:bg-[#33312C] font-medium',
  secundario: 'border border-linea bg-superficie text-tinta hover:bg-[#EFEDE7]',
  peligro: 'bg-chile text-white hover:bg-[#A33124] font-medium',
  fantasma: 'text-piedra hover:bg-[#EFEDE7] hover:text-tinta',
}

const TAMANOS = { sm: 'h-9 px-3 text-sm', md: 'h-10 px-4 text-sm', lg: 'h-12 px-5 text-[15px]' }

export function Boton({
  variante = 'primario',
  tamano = 'md',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variante?: VarianteBoton
  tamano?: keyof typeof TAMANOS
}) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTES[variante]} ${TAMANOS[tamano]} ${className}`}
      {...props}
    />
  )
}

/** Clases de botón para usar en un <Link> o <a>. */
export const claseBoton = (variante: VarianteBoton = 'primario', tamano: keyof typeof TAMANOS = 'md') =>
  `inline-flex items-center justify-center gap-2 rounded-lg transition-colors ${VARIANTES[variante]} ${TAMANOS[tamano]}`

export function Tarjeta({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-xl border border-linea bg-superficie ${className}`}>{children}</section>
}

type Tono = 'neutro' | 'maiz' | 'hoja' | 'chile' | 'cielo'

const TONOS: Record<Tono, string> = {
  neutro: 'bg-crema text-grafito',
  maiz: 'bg-maiz-claro text-maiz-texto',
  hoja: 'bg-hoja-claro text-hoja-texto',
  chile: 'bg-chile-claro text-chile-texto',
  cielo: 'bg-cielo-claro text-cielo-texto',
}

export function Chip({ tono = 'neutro', children, className = '' }: { tono?: Tono; children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${TONOS[tono]} ${className}`}>
      {children}
    </span>
  )
}

/** Atajo de teclado visible, p. ej. <Tecla>F9</Tecla>. */
export function Tecla({ children, oscura = false }: { children: ReactNode; oscura?: boolean }) {
  return (
    <kbd
      className={`num rounded-[5px] px-1.5 py-0.5 text-[11px] font-normal ${
        oscura ? 'bg-riel-avatar text-riel-texto' : 'border border-linea bg-papel text-piedra'
      }`}
    >
      {children}
    </kbd>
  )
}

export function Esqueleto({ className = '' }: { className?: string }) {
  return <div aria-hidden="true" className={`esqueleto ${className}`} />
}

export function Aviso({ tipo, children }: { tipo: 'ok' | 'error' | 'info'; children: ReactNode }) {
  const estilos = {
    ok: 'bg-hoja-claro text-hoja-texto',
    error: 'bg-chile-claro text-chile-texto',
    info: 'bg-crema text-grafito',
  }
  return (
    <p role={tipo === 'error' ? 'alert' : 'status'} className={`rounded-lg px-3 py-2 text-sm ${estilos[tipo]}`}>
      {children}
    </p>
  )
}

/** Encabezado de página: título + subtítulo + acciones a la derecha. */
export function EncabezadoPagina({
  titulo,
  subtitulo,
  acciones,
}: {
  titulo: string
  subtitulo?: ReactNode
  acciones?: ReactNode
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="flex flex-col gap-1">
        <h1 className="text-[26px] font-semibold tracking-tight">{titulo}</h1>
        {subtitulo && <p className="text-sm text-piedra">{subtitulo}</p>}
      </div>
      {acciones && <div className="flex flex-wrap gap-2">{acciones}</div>}
    </div>
  )
}

/**
 * Página con contenido principal y panel lateral derecho (en pantallas grandes);
 * en pantallas chicas el panel baja debajo del contenido.
 */
export function PaginaConPanel({ children, panel, etiquetaPanel }: { children: ReactNode; panel: ReactNode; etiquetaPanel: string }) {
  return (
    <div className="flex min-h-full flex-col xl:flex-row">
      <div className="flex min-w-0 flex-1 flex-col gap-6 px-6 py-7 lg:px-8">{children}</div>
      <aside
        aria-label={etiquetaPanel}
        className="flex flex-col gap-6 border-t border-linea bg-superficie px-5 py-6 xl:w-[340px] xl:flex-none xl:border-l xl:border-t-0"
      >
        {panel}
      </aside>
    </div>
  )
}

/** Página sin panel lateral. */
export function Pagina({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-6 px-6 py-7 lg:px-8">{children}</div>
}

/** Formatea un texto decimal de la API como dinero: "18.5" → "$18.50". */
export const pesos = (valor: string | number) =>
  `$${Number(valor).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
