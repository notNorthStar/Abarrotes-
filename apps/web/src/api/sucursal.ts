// HU-14: sucursal sobre la que opera el jefe. Se conserva al navegar y al recargar (CA3).

const SUCURSAL_KEY = 'abarrotes.sucursal'

export const sucursalStore = {
  get: () => {
    const id = Number(localStorage.getItem(SUCURSAL_KEY))
    return Number.isInteger(id) && id > 0 ? id : null
  },
  set: (id: number) => localStorage.setItem(SUCURSAL_KEY, String(id)),
  clear: () => localStorage.removeItem(SUCURSAL_KEY),
}

/** Agrega ?sucursalId= a la ruta si hay sucursal elegida y la ruta no la trae ya. */
export function conSucursal(ruta: string, sucursalId: number | null): string {
  if (sucursalId === null || /[?&]sucursalId=/.test(ruta)) return ruta
  return `${ruta}${ruta.includes('?') ? '&' : '?'}sucursalId=${sucursalId}`
}

/** La sucursal guardada si sigue activa; si no, la primera de la lista. */
export function sucursalInicial(sucursales: { id: number }[], guardada: number | null): number | null {
  if (sucursales.some((s) => s.id === guardada)) return guardada
  return sucursales[0]?.id ?? null
}
