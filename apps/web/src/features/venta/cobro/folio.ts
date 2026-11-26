/**
 * Folio interno para pagos con tarjeta: fecha y milisegundo del día en base 36 (p. ej. 261124-12AB9Z).
 * No hay conexión con el banco; el cajero puede cambiarlo por el del comprobante de la terminal.
 */
export function folioTarjeta(ahora = new Date()): string {
  const dos = (n: number) => String(n).padStart(2, '0')
  const dia = `${dos(ahora.getFullYear() % 100)}${dos(ahora.getMonth() + 1)}${dos(ahora.getDate())}`
  const ms = ((ahora.getHours() * 60 + ahora.getMinutes()) * 60 + ahora.getSeconds()) * 1000 + ahora.getMilliseconds()
  return `${dia}-${ms.toString(36).toUpperCase().padStart(6, '0')}`
}
