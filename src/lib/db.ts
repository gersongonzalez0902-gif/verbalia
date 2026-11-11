/**
 * Cliente Prisma único (singleton) para toda la capa de servidor.
 *
 * Prisma 7 exige driver adapter: usamos @prisma/adapter-pg con la
 * DATABASE_URL del entorno. El patrón global-cached evita abrir un pool
 * de conexiones nuevo en cada recarga del dev server de Next.js.
 *
 * Robustez del entorno: si el DATABASE_URL inyectado no es Postgres
 * (p. ej. un .env del entorno de desarrollo con URL de otro motor),
 * se lee el valor bueno de .env.local (creado por `neon env pull`).
 * En producción (Vercel) la variable del entorno ya es Postgres y
 * .env.local no existe: se usa directamente.
 *
 * La conexión es perezosa: nada se abre al importar el módulo (seguro
 * durante `next build`), sino en la primera query real.
 */

import { readFileSync } from "node:fs";
import path from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

type Db = PrismaClient;

const globalForDb = globalThis as unknown as { __verbaliaPrisma?: Db };

let instance: Db | null = null;

/** Resuelve la cadena de conexión Postgres (env > .env.local de respaldo). */
function resolveConnectionString(): string {
  const fromEnv = process.env.DATABASE_URL;
  if (fromEnv?.startsWith("postgres")) return fromEnv;

  // Entornos que inyectan un DATABASE_URL no-Postgres vía .env: el valor
  // bueno (Neon) vive en .env.local, que Next no priorizó al mezclar.
  try {
    const local = readFileSync(path.join(process.cwd(), ".env.local"), "utf8");
    const line = local
      .split("\n")
      .find((l) => l.startsWith("DATABASE_URL=") && l.includes("postgres"));
    if (line) {
      return line
        .slice("DATABASE_URL=".length)
        .trim()
        .replace(/^["']|["']$/g, "");
    }
  } catch {
    /* sin .env.local (producción): seguimos con el valor del entorno */
  }

  if (fromEnv) return fromEnv; // fallará con un error claro del adapter
  throw new Error(
    "DATABASE_URL no está definida o no es Postgres. " +
      "Cópiala en .env.local (neon env pull) o en las variables de entorno del despliegue.",
  );
}

function createDb(): Db {
  const adapter = new PrismaPg({ connectionString: resolveConnectionString() });
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
