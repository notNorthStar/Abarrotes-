import { describe, expect, it } from 'vitest'
import {
  claveDiaIso,
  estadoDeVisita,
  formatearFechaVisita,
  pasaFiltroVisita,
} from './fechasVisita'

describe('fechasVisita (HU-07)', () => {
  it('extrae la clave AAAA-MM-DD de una fecha ISO', () => {
    expect(claveDiaIso('2026-11-12T12:00:00.000Z')).toBe('2026-11-12')
  })

  it('clasifica visitas en HOY, PROXIMA y PASADA respecto a la fecha actual', () => {
    const hoy = '2026-11-10'
    expect(estadoDeVisita('2026-11-10T12:00:00.000Z', hoy)).toBe('HOY')
    expect(estadoDeVisita('2026-11-12T12:00:00.000Z', hoy)).toBe('PROXIMA')
    expect(estadoDeVisita('2026-11-08T12:00:00.000Z', hoy)).toBe('PASADA')
  })

  it('filtra visitas por TODAS, PROXIMAS (incluye hoy) y PASADAS', () => {
    const hoy = '2026-11-10'
    expect(pasaFiltroVisita('2026-11-10T12:00:00.000Z', 'PROXIMAS', hoy)).toBe(true)
    expect(pasaFiltroVisita('2026-11-15T12:00:00.000Z', 'PROXIMAS', hoy)).toBe(true)
    expect(pasaFiltroVisita('2026-11-05T12:00:00.000Z', 'PROXIMAS', hoy)).toBe(false)
    expect(pasaFiltroVisita('2026-11-05T12:00:00.000Z', 'PASADAS', hoy)).toBe(true)
    expect(pasaFiltroVisita('2026-11-05T12:00:00.000Z', 'TODAS', hoy)).toBe(true)
  })

  it('formatea la fecha en español sin desfase de huso horario', () => {
    const texto = formatearFechaVisita('2026-11-12T12:00:00.000Z')
    expect(texto).toContain('12')
    expect(texto).toContain('2026')
  })
})
