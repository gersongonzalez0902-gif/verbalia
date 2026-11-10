// Prueba mínima de conexión a Neon Postgres con Prisma 7 (driver adapter pg).
// Uso: bun run scripts/db-ping.ts
// Requiere DATABASE_URL en el entorno (bun la carga de .env.local).
// SCOPE: verificación de conectividad (SELECT 1). Nada más.

import { readFileSync } from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Robustez: el runtime del sandbox puede inyectar un DATABASE_URL no-postgres
// vía .env. Si la variable no es una URI de Postgres, la leemos de .env.local.
function resolveDatabaseUrl(): string | undefined {
  const env = process.env.DATABASE_URL;
  if (env?.startsWith("postgres")) return env;
  try {
    const file = readFileSync(
      path.join(import.meta.dir, "..", ".env.local"),
      "utf8",
    );
    const line = file
      .split("\n")
      .find((l) => l.startsWith("DATABASE_URL=") && l.includes("postgres"));
    const value = line?.slice("DATABASE_URL=".length).trim();
    // La CLI escribe los valores entre comillas; quitarlas si están.
    return value?.replace(/^["']|["']$/g, "");
  } catch {
    return env;
  }
}

const connectionString = resolveDatabaseUrl();

if (!connectionString) {
  console.error(
    "❌ DATABASE_URL no está definida. Ejecuta primero: neon env pull",
  );
  process.exit(1);
}

// Prueba de que no se filtra la credencial: solo mostramos el host.
let host = "desconocido";
try {
  host = new URL(connectionString).host;
} catch {
  /* URL inválida: el error real saldrá al conectar */
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

try {
  const result = await prisma.$queryRaw<Array<{ ok: number }>>`SELECT 1 AS ok`;
  console.log(`SELECT 1 → ${JSON.stringify(result)}`);
  console.log(`✅ Conexión verificada contra ${host}`);
} catch (error) {
  const raw = error instanceof Error ? `${error.message}\n${error.stack ?? ""}` : String(error);
  // Seguridad: nunca imprimir la cadena de conexión
  const masked = raw.replace(/postgres(ql)?:\/\/[^\s@]+@[^\s]+/g, "postgres://[REDACTED]@...");
  console.error("❌ Error de conexión:\n", masked.slice(0, 1500));
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
