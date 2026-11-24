import { describe, expect, it } from 'vitest'
import { siguienteIndice } from './teclado'

describe('navegación con flechas', () => {
  it('avanza y retrocede sin salirse de la lista', () => {
    expect(siguienteIndice('ArrowDown', 0, 3)).toBe(1)
    expect(siguienteIndice('ArrowRight', 2, 3)).toBe(2)
    expect(siguienteIndice('ArrowUp', 0, 3)).toBe(0)
    expect(siguienteIndice('ArrowLeft', 2, 3)).toBe(1)
  })

  it('Inicio y Fin van a los extremos', () => {
    expect(siguienteIndice('Home', 2, 3)).toBe(0)
    expect(siguienteIndice('End', 0, 3)).toBe(2)
  })

  it('ignora otras teclas y listas vacías', () => {
    expect(siguienteIndice('a', 0, 3)).toBeNull()
    expect(siguienteIndice('ArrowDown', 0, 0)).toBeNull()
  })
})
