/**
 * Cliente Prisma único (singleton) para toda la capa de servidor.
 *
 * Prisma 7 exige driver adapter: usamos @prisma/adapter-pg con la
 * DATABASE_URL del entorno. El patrón global-cached evita abrir un pool
 * de conexiones nuevo en cada recarga del dev server de Next.js.
 *
 * La conexión es perezosa: nada se abre al importar el módulo (seguro
 * durante `next build`), sino en la primera query real.
 */

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

type Db = PrismaClient;

const globalForDb = globalThis as unknown as { __verbaliaPrisma?: Db };

let instance: Db | null = null;

function createDb(): Db {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString || !connectionString.startsWith("postgres")) {
    throw new Error(
      "DATABASE_URL no está definida o no es Postgres. " +
        "Cópiala en .env.local (neon env pull) o en las variables de entorno del despliegue.",
    );
  }
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

/** Proxy perezoso: crea (o reutiliza) el cliente en el primer acceso real. */
export const prisma: Db = new Proxy({} as Db, {
  get(_target, prop) {
    if (!instance) {
      // Dev: reutiliza el del global para sobrevivir a HMR.
      instance = globalForDb.__verbaliaPrisma ?? createDb();
      if (process.env.NODE_ENV !== "production") {
        globalForDb.__verbaliaPrisma = instance;
      }
    }
    const value = Reflect.get(instance as object, prop);
    return typeof value === "function" ? value.bind(instance) : value;
  },
});
