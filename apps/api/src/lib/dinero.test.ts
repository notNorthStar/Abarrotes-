import { describe, expect, it } from 'vitest'
import { round2, subtotal, sumar } from './dinero'

describe('dinero', () => {
  it('suma sin errores de punto flotante', () => {
    expect(sumar('0.1', '0.2').toString()).toBe('0.3')
  })

  it('redondea half-up a 2 decimales', () => {
    expect(round2('2.345').toFixed(2)).toBe('2.35')
    expect(round2('2.344').toFixed(2)).toBe('2.34')
  })

  it('calcula subtotal de granel: 0.750 kg × $28.90', () => {
    expect(subtotal('0.750', '28.90').toFixed(2)).toBe('21.68')
  })
})
