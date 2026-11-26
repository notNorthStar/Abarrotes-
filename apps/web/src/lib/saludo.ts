/** Saludo según la hora local. */
export function saludo(ahora = new Date()) {
  const h = ahora.getHours()
  return h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches'
}
