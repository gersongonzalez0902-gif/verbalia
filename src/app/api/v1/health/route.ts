import { prisma } from "@/lib/db";
import { withRoute } from "@/server/http";
import pkg from "../../../../../package.json";

/**
 * Latido público del servidor: GET /api/v1/health → { ok, db, version }
 * Ola 0: chequeo REAL de base de datos (SELECT 1 contra Neon).
 * 200 {ok:true, db:true} · 503 {ok:false, db:false} si Neon no responde.
 */

export const dynamic = "force-dynamic";

export const GET = withRoute({ route: "GET /api/v1/health" }, async (ctx) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return ctx.json({ ok: true, db: true, version: pkg.version });
  } catch {
    return ctx.json({ ok: false, db: false, version: pkg.version }, 503);
  }
});
