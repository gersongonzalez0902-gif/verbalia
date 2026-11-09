import { NextResponse } from "next/server";
import pkg from "../../../../../package.json";

/**
 * Latido público del servidor: GET /api/v1/health → { ok: true, version }
 * No toca base de datos ni el juego; sirve para comprobar que el
 * despliegue (Vercel o auto-alojado) está vivo.
 */
export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({ ok: true, version: pkg.version });
}
