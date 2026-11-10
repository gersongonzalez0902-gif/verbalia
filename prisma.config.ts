// Configuración de Prisma 7 para VerbalIA.
// La URL de conexión (DATABASE_URL) se toma del entorno — nunca se escribe aquí.
// En desarrollo local vive en .env.local (creado por `neon env pull`, gitignored).

import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
