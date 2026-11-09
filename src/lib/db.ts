import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/**
 * Cliente Prisma de VERBALIA.
 * En producción el contenedor exporta DATABASE_URL; en el sandbox
 * (server standalone arrancado a mano) puede no estar en el entorno,
 * así que caemos al archivo local de siempre antes de rendirse.
 */
export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
    datasourceUrl:
      process.env.DATABASE_URL ?? `file:${process.cwd()}/db/custom.db`,
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
