import { describe, expect, it } from 'vitest'
import { OBRAS } from './obras'

/** Contraste WCAG de un color hexadecimal contra blanco. */
function contrasteConBlanco(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 1.05 / (0.2126 * r + 0.7152 * g + 0.0722 * b + 0.05)
}

describe('galería del login', () => {
  it.each(OBRAS.map((o) => [o.titulo, o.acento]))('%s: su acento se distingue como foco (3:1)', (_titulo, acento) => {
    expect(contrasteConBlanco(acento)).toBeGreaterThanOrEqual(3)
  })
})
