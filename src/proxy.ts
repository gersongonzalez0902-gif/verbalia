import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * Proxy de seguridad de VERBALIA · "muro de la Fortaleza".
 *
 * - Cabeceras de seguridad en TODAS las respuestas (CSP estricta,
 *   anti-clickjacking, anti-MIME-sniffing, referrer mínimo).
 * - CORS cerrado a mismo origen: nadie llama a la API desde fuera.
 * - Métodos permitidos acotados; el resto cae al agua.
 * - Cap de tamaño de cuerpo para las rutas de la bóveda.
 */

const ALLOWED_METHODS = new Set(["GET", "POST", "HEAD", "OPTIONS"]);
const MAX_BODY_BYTES = 3 * 1024 * 1024; // 3 MB: sobres de la bóveda incluidos

const CSP = [
  "default-src 'self'",
  // Next.js en desarrollo inyecta estilos/bundles con eval de recarga.
  process.env.NODE_ENV === "production"
    ? "script-src 'self' 'unsafe-inline'"
    : "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "media-src 'self' blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

export function proxy(request: NextRequest) {
  // Método no permitido: 405 directo.
  if (!ALLOWED_METHODS.has(request.method)) {
    return new NextResponse(null, {
      status: 405,
      headers: { Allow: [...ALLOWED_METHODS].join(", ") },
    });
  }

  // Cuerpo demasiado grande para /api/*: el sobre cifrado pasa de largo.
  const isApi = request.nextUrl.pathname.startsWith("/api");
  if (isApi && request.method === "POST") {
    const declared = Number(request.headers.get("content-length") ?? "0");
    if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) {
      return NextResponse.json(
        { error: "Sobre demasiado grande" },
        { status: 413 },
      );
    }
  }

  const response = NextResponse.next();

  // Cabeceras de seguridad universales.
  response.headers.set("Content-Security-Policy", CSP);
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(), usb=()");
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  response.headers.set("Cross-Origin-Resource-Policy", "same-origin");
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains",
  );

  // CORS: solo mismo origen para la API.
  if (isApi) {
    response.headers.set("Access-Control-Allow-Origin", "same-origin");
    response.headers.set("Vary", "Origin");
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|sw.js|icons/).*)"],
};
