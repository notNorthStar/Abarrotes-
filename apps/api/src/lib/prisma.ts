import { PrismaClient } from '@prisma/client'

// Por defecto Prisma espera 2 s para empezar una transacción: con varias a la vez no alcanza en equipos lentos.
export const prisma = new PrismaClient({ transactionOptions: { maxWait: 10_000, timeout: 10_000 } })
