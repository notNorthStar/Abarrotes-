// Antes de todas las pruebas: recrea la BD de pruebas desde las migraciones y corre el seed.
import 'dotenv/config'
import { execSync } from 'node:child_process'

export default function setup() {
  const url = process.env.DATABASE_URL_TEST
  if (!url) throw new Error('Falta DATABASE_URL_TEST en apps/api/.env')
  execSync('npx prisma migrate reset --force --skip-generate', {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: url },
  })
}
