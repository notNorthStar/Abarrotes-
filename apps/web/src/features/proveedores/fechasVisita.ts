// Helpers de formato y clasificación de fechas para visitas de proveedores (HU-07).

export type EstadoVisita = 'HOY' | 'PROXIMA' | 'PASADA'
export type FiltroVisita = 'TODAS' | 'PROXIMAS' | 'PASADAS'

export function claveDiaIso(fechaIso: string): string {
  return fechaIso.slice(0, 10)
}

export function hoyIsoLocal(ahora = new Date()): string {
  const anio = ahora.getFullYear()
  const mes = String(ahora.getMonth() + 1).padStart(2, '0')
  const dia = String(ahora.getDate()).padStart(2, '0')
  return `${anio}-${mes}-${dia}`
}

export function estadoDeVisita(fechaIso: string, hoy = hoyIsoLocal()): EstadoVisita {
  const dia = claveDiaIso(fechaIso)
  if (dia === hoy) return 'HOY'
  return dia > hoy ? 'PROXIMA' : 'PASADA'
}

export function pasaFiltroVisita(
  fechaIso: string,
  filtro: FiltroVisita,
  hoy = hoyIsoLocal(),
): boolean {
  if (filtro === 'TODAS') return true
  const estado = estadoDeVisita(fechaIso, hoy)
  if (filtro === 'PROXIMAS') return estado === 'HOY' || estado === 'PROXIMA'
  return estado === 'PASADA'
}

export function formatearFechaVisita(fechaIso: string): string {
  const [anio, mes, dia] = claveDiaIso(fechaIso).split('-').map(Number)
  const fecha = new Date(Date.UTC(anio, mes - 1, dia, 12, 0, 0))
  return fecha.toLocaleDateString('es-MX', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })
}
