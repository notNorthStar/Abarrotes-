import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { Boton, Tecla } from './ui'

// Confirmaciones de la app: Enter acepta, Esc cancela y Tab o las flechas cambian de botón.

type Pregunta = { titulo: string; detalle?: string; aceptar: string; peligro?: boolean }
type Pendiente = Pregunta & { responder: (ok: boolean) => void }

const Contexto = createContext<(p: Pregunta) => Promise<boolean>>(async () => false)

export function ProveedorConfirmar({ children }: { children: ReactNode }) {
  const [pendiente, setPendiente] = useState<Pendiente | null>(null)
  const confirmar = useCallback(
    (p: Pregunta) => new Promise<boolean>((responder) => setPendiente({ ...p, responder })),
    [],
  )
  return (
    <Contexto.Provider value={confirmar}>
      {children}
      {pendiente && (
        <Dialogo
          pregunta={pendiente}
          onResponder={(ok) => {
            setPendiente(null)
            pendiente.responder(ok)
          }}
        />
      )}
    </Contexto.Provider>
  )
}

/** const confirmar = useConfirmar(); if (!(await confirmar({ … }))) return */
export const useConfirmar = () => useContext(Contexto)

function Dialogo({ pregunta, onResponder }: { pregunta: Pregunta; onResponder: (ok: boolean) => void }) {
  const dialogo = useRef<HTMLDialogElement>(null)
  const botones = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const anterior = document.activeElement
    const d = dialogo.current
    d?.showModal()
    // showModal enfoca el primer botón (Cancelar); Enter debe aceptar.
    botones.current?.querySelector<HTMLButtonElement>('button:last-child')?.focus()
    return () => {
      d?.close()
      if (anterior instanceof HTMLElement) anterior.focus()
    }
  }, [])

  return (
    <dialog
      ref={dialogo}
      aria-labelledby="confirmar-titulo"
      // Dejar presionado Enter no debe aceptar el diálogo que ese mismo Enter abrió.
      onKeyDown={(e) => e.repeat && e.key === 'Enter' && e.preventDefault()}
      onCancel={(e) => {
        e.preventDefault()
        onResponder(false)
      }}
      className="w-full max-w-md rounded-xl border border-linea bg-superficie p-0 text-tinta shadow-[0_24px_48px_-12px_rgba(26,25,22,0.35)] backdrop:bg-tinta/40"
    >
      <div className="flex flex-col gap-5 p-5">
        <div className="flex flex-col gap-1.5">
          <h2 id="confirmar-titulo" className="text-[17px] font-semibold tracking-tight">
            {pregunta.titulo}
          </h2>
          {pregunta.detalle && <p className="text-sm leading-relaxed text-piedra">{pregunta.detalle}</p>}
        </div>
        <div ref={botones} role="group" aria-label="Respuesta" className="flex justify-end gap-2">
          <Boton variante="secundario" onClick={() => onResponder(false)}>
            Cancelar <Tecla>Esc</Tecla>
          </Boton>
          <Boton variante={pregunta.peligro ? 'peligro' : 'primario'} onClick={() => onResponder(true)}>
            {pregunta.aceptar} <Tecla oscura>Enter</Tecla>
          </Boton>
        </div>
      </div>
    </dialog>
  )
}
