import { useEffect } from 'react'

// Navegación con teclado de toda la app. Se activa una vez en Layout.
// - Enter en <textarea> o <select> envía su formulario (Shift+Enter: salto de línea).
// - Flechas, Inicio y Fin recorren los controles de un role="group" o de un contenedor data-flechas.
// - ↓ en un campo con data-flechas-a="id" entra a ese contenedor; ↑ en el primero regresa al campo.
// - "/" lleva al buscador de la pantalla (data-busqueda).

/** Índice al que mueve una tecla dentro de una lista, o null si la tecla no aplica. */
export function siguienteIndice(tecla: string, actual: number, total: number): number | null {
  if (total === 0) return null
  if (tecla === 'ArrowDown' || tecla === 'ArrowRight') return Math.min(actual + 1, total - 1)
  if (tecla === 'ArrowUp' || tecla === 'ArrowLeft') return Math.max(actual - 1, 0)
  if (tecla === 'Home') return 0
  if (tecla === 'End') return total - 1
  return null
}

const controles = (contenedor: Element) =>
  [...contenedor.querySelectorAll<HTMLElement>('button:not(:disabled), a[href]')].filter((e) => e.offsetParent !== null)

const escribiendo = (e: Element) =>
  e.matches('input, textarea, select, [contenteditable="true"]')

function alTeclear(e: KeyboardEvent) {
  const origen = e.target
  if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey || !(origen instanceof HTMLElement)) return

  if (e.key === 'Enter' && !e.shiftKey && !e.isComposing && origen.matches('textarea, select')) {
    const formulario = (origen as HTMLTextAreaElement | HTMLSelectElement).form
    const enviar = formulario?.querySelector<HTMLButtonElement>('button[type="submit"]:not(:disabled)')
    if (!formulario || !enviar) return
    e.preventDefault()
    formulario.requestSubmit(enviar)
    return
  }

  if (e.key === '/' && !escribiendo(origen)) {
    const buscador = document.querySelector<HTMLInputElement>('main [data-busqueda]')
    if (!buscador) return
    e.preventDefault()
    buscador.focus()
    buscador.select()
    return
  }

  if (escribiendo(origen)) {
    const destino = origen.dataset.flechasA && document.getElementById(origen.dataset.flechasA)
    if (e.key === 'ArrowDown' && destino) {
      const primero = controles(destino)[0]
      if (!primero) return
      e.preventDefault()
      primero.focus()
    }
    return
  }

  const contenedor = origen.closest<HTMLElement>('[role="group"], [data-flechas]')
  if (!contenedor) return
  const lista = controles(contenedor)
  const actual = lista.indexOf(origen)
  const nuevo = siguienteIndice(e.key, actual, lista.length)
  if (actual < 0 || nuevo === null) return
  e.preventDefault()
  if (e.key === 'ArrowUp' && actual === 0 && contenedor.id) {
    document.querySelector<HTMLElement>(`[data-flechas-a="${contenedor.id}"]`)?.focus()
    return
  }
  lista[nuevo].focus()
}

export function useTeclado() {
  useEffect(() => {
    document.addEventListener('keydown', alTeclear)
    return () => document.removeEventListener('keydown', alTeclear)
  }, [])
}
