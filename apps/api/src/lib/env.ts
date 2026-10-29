import 'dotenv/config'

function requerida(nombre: string): string {
  const valor = process.env[nombre]
  if (!valor) throw new Error(`Falta la variable de entorno ${nombre} (ver .env.example)`)
  return valor
}

export const env = {
  port: Number(process.env.API_PORT ?? 3000),
  jwtSecret: requerida('JWT_SECRET'),
}
