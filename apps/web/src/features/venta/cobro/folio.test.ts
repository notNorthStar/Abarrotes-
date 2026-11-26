import { describe, expect, it } from 'vitest'
import { folioTarjeta } from './folio'

describe('folio automático de tarjeta', () => {
  it('lleva la fecha y siempre mide lo mismo', () => {
    expect(folioTarjeta(new Date(2026, 10, 24, 0, 0, 0, 0))).toBe('261124-000000')
    expect(folioTarjeta(new Date(2026, 0, 5, 23, 59, 59, 999))).toMatch(/^260105-[0-9A-Z]{6}$/)
  })

  it('cambia en cada milisegundo y cada día', () => {
    const fechas = [new Date(2026, 10, 24, 18, 0, 0, 1), new Date(2026, 10, 24, 18, 0, 0, 2), new Date(2026, 10, 25, 18, 0, 0, 1)]
    expect(new Set(fechas.map((f) => folioTarjeta(f))).size).toBe(3)
  })
})
