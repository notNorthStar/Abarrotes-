import { describe, expect, it } from 'vitest'
import { conSucursal, sucursalInicial } from './sucursal'

describe('HU-14 · sucursal del jefe', () => {
  it('agrega la sucursal a rutas con y sin parámetros', () => {
    expect(conSucursal('/productos', 3)).toBe('/productos?sucursalId=3')
    expect(conSucursal('/productos?q=coca', 3)).toBe('/productos?q=coca&sucursalId=3')
  })

  it('respeta la que ya trae la ruta y no agrega nada sin sucursal elegida', () => {
    expect(conSucursal('/productos?sucursalId=1', 3)).toBe('/productos?sucursalId=1')
    expect(conSucursal('/productos', null)).toBe('/productos')
  })

  it('conserva la guardada solo si sigue activa', () => {
    const activas = [{ id: 1 }, { id: 2 }]
    expect(sucursalInicial(activas, 2)).toBe(2)
    expect(sucursalInicial(activas, 9)).toBe(1)
    expect(sucursalInicial([], 2)).toBeNull()
  })
})
