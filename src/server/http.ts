/**
 * HTTP de servidor para /api/v1 · 04-api.md §1.
 *
 * - Errores uniformes: { error: { code, message, meta? } }.
 * - Logs JSON: una línea por request { route, userId, ms, status }.
 * - Rate limit con cabeceras X-RateLimit-Remaining y 429 + Retry-After.
 * - CSRF transversal: TODA mutución (POST/PUT/PATCH/DELETE) exige la
 *   cabecera custom `x-verbalia-csrf` y, si hay cuerpo,
 *   `Content-Type: application/json` (01-arquitectura.md §6).
 * - Sesión rolling: si quedan < 7 días, se extiende y se reenvía la cookie.
 */

import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { rateLimit } from "./ratelimit";
import {
  findActiveSession,
  refreshSessionIfNeeded,
  sessionCookieOptions,
  SESSION_COOKIE,
  touchLastSeen,
  type ActiveSession,
} from "./auth/session";

/* ============================== Errores ============================== */

export class HttpError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message?: string,
    readonly meta?: unknown,
  ) {
    super(message ?? code);
    this.name = "HttpError";
  }
}

export function errorBody(err: HttpError): { error: { code: string; message: string; meta?: unknown } } {
  return { error: { code: err.code, message: err.message, ...(err.meta !== undefined ? { meta: err.meta } : {}) } };
}

/* ============================== Utilidades ============================== */

/** IP del cliente: primer salto de x-forwarded-for (Vercel) o "local". */
export function ipOf(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) {
    const first = fwd.split(",")[0].trim();
    if (first) return first;
  }
  return req.headers.get("x-real-ip") ?? "local";
}

export type PublicUser = {
  id: string;
  email: string;
  displayName: string;
  handle: string;
  farocode: string;
  emailVerified: boolean;
  role: string;
  status: string;
  createdAt: string;
};

/** Forma pública y estable del usuario (nunca el hash ni flags internos). */
export function publicUser(u: {
  id: string;
  email: string;
  displayName: string;
  handle: string;
  farocode: string;
  emailVerifiedAt: Date | string | null;
  role: string;
  status: string;
  createdAt: Date | string;
}): PublicUser {
  return {
    id: u.id,
    email: u.email,
    displayName: u.displayName,
    handle: u.handle,
    farocode: u.farocode,
    emailVerified: Boolean(u.emailVerifiedAt),
    role: u.role,
    status: u.status,
    createdAt: new Date(u.createdAt).toISOString(),
  };
}

/* ============================== Contexto ============================== */

interface QueuedCookie {
  name: string;
  value: string;
  maxAgeSec: number;
}

export type RateLimitScope = "ip" | "user" | { account: string };

export interface RouteCtx {
  req: NextRequest;
  ip: string;
  /** Parámetros dinámicos de la ruta (ya resueltos). */
  params: Record<string, string>;
  /** Autentica; lanza 401 si no hay sesión válida. */
  auth: () => Promise<ActiveSession>;
  /** Autentica; null si no hay sesión (rutas públicas). */
  tryAuth: () => Promise<ActiveSession | null>;
  /**
   * Aplica un rate limit. Lanza 429 si se agota. La cabecera
   * X-RateLimit-Remaining viaja en la respuesta.
   * - "ip": por IP de cliente · "user": por usuario autenticado
   * - { account }: por identificador de cuenta (email en login).
   */
  rl: (limit: number, windowMs: number, scope: RateLimitScope) => void;
  /** Encola la cookie de sesión para la respuesta. */
  setSessionCookie: (token: string) => void;
/** Encola el borrado de la cookie de sesión. */
  clearSessionCookie: () => void;
  /** Respuesta JSON con cookies encoladas y cabeceras RL aplicadas. */
  json: (body: unknown, status?: number) => NextResponse;
}

export interface RouteOptions {
  /** Nombre para logs: "POST /api/v1/auth/login". */
  route: string;
}

const MUTATION_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

/** CSRF + Content-Type en toda mutación de /api/v1 (01 §6). */
function enforceMutationHeaders(req: NextRequest): void {
  if (!MUTATION_METHODS.has(req.method)) return;
  const csrf = req.headers.get("x-verbalia-csrf");
  if (!csrf) {
    throw new HttpError(403, "forbidden", "Falta la cabecera anti-falsificación (x-verbalia-csrf).");
  }
  const hasBody =
    (Number(req.headers.get("content-length") ?? "0") || 0) > 0 ||
    Boolean(req.headers.get("transfer-encoding"));
  if (hasBody) {
    const ct = (req.headers.get("content-type") ?? "").toLowerCase();
    if (!ct.startsWith("application/json")) {
      throw new HttpError(400, "validation_error", "Content-Type debe ser application/json.");
    }
  }
}

/** Envuelve un handler de ruta: guardas, logs, errores, cookies, sesión rolling. */
export function withRoute(
  opts: RouteOptions,
  handler: (ctx: RouteCtx) => Promise<Response>,
) {
  return async (
    req: NextRequest,
    routeCtx?: { params?: Promise<Record<string, string>> },
  ): Promise<Response> => {
    const startedAt = Date.now();
    const ip = ipOf(req);
    const auth: { userId: string | null; active: ActiveSession | null; token: string | null } = {
      userId: null,
      active: null,
      token: null,
    };
    let rlRemaining: number | null = null;
    const cookies: QueuedCookie[] = [];

    const ctx: RouteCtx = {
      req,
      ip,
      params: {},
      async auth() {
        const found = await this.tryAuth();
        if (!found) {
          throw new HttpError(401, "unauthorized", "Necesitas iniciar sesión para continuar.");
        }
        return found;
      },
      async tryAuth() {
        if (auth.active) return auth.active;
        auth.token = req.cookies.get(SESSION_COOKIE)?.value ?? null;
        if (!auth.token) return null;
        auth.active = await findActiveSession(auth.token);
        if (auth.active) auth.userId = auth.active.user.id;
        return auth.active;
      },
      rl(limit, windowMs, scope) {
        const id =
          scope === "ip" ? `ip:${ip}` : scope === "user" ? `user:${auth.userId ?? "anon"}` : `acct:${scope.account}`;
        const res = rateLimit(`${opts.route}:${id}`, limit, windowMs);
        if (!res.ok) {
          throw new HttpError(429, "rate_limited", "Demasiadas peticiones. Espera un momento y reintenta.", {
            retryAfterSec: res.retryAfterSec,
          });
        }
        rlRemaining = rlRemaining === null ? res.remaining : Math.min(rlRemaining, res.remaining);
      },
      setSessionCookie(token) {
        cookies.push({ name: SESSION_COOKIE, value: token, maxAgeSec: 30 * 24 * 60 * 60 });
      },
      clearSessionCookie() {
        cookies.push({ name: SESSION_COOKIE, value: "", maxAgeSec: 0 });
      },
      json(body, status = 200) {
        return NextResponse.json(body, { status });
      },
    };

    try {
      // Parámetros dinámicos (Next 16: promesa).
      if (routeCtx?.params) ctx.params = await routeCtx.params;

      // Guardas transversales de mutación (CSRF + Content-Type).
      enforceMutationHeaders(req);

      const response = await handler(ctx);
      const status = response.status;

      // Sesión rolling: < 7 días ⇒ extender + reenviar cookie.
      if (auth.active && auth.token) {
        const refreshed = await refreshSessionIfNeeded(auth.active.session);
        if (refreshed) {
          ctx.setSessionCookie(auth.token);
        }
        void touchLastSeen(auth.active.session);
      }

      // Cookies encoladas + cabeceras de rate limit.
      if (response instanceof NextResponse) {
        for (const c of cookies) {
          response.cookies.set({ ...sessionCookieOptions(c.maxAgeSec), value: c.value });
        }
      }
      if (rlRemaining !== null) {
        response.headers.set("X-RateLimit-Remaining", String(rlRemaining));
      }
      logRequest(opts.route, auth.userId, status, startedAt, response.headers.get("retry-after"));
      return response;
    } catch (err) {
      const response = errorResponse(err);
      if (rlRemaining !== null) {
        response.headers.set("X-RateLimit-Remaining", String(rlRemaining));
      }
      logRequest(opts.route, auth.userId, response.status, startedAt, response.headers.get("retry-after"));
      return response;
    }
  };
}

function errorResponse(err: unknown): NextResponse {
  if (err instanceof HttpError) {
    const res = NextResponse.json(errorBody(err), { status: err.status });
    if (err.status === 429) {
      const meta = err.meta as { retryAfterSec?: number } | undefined;
      const secs = Math.max(1, Math.ceil(Number(meta?.retryAfterSec ?? 60)));
      res.headers.set("Retry-After", String(secs));
    }
    return res;
  }
  if (err instanceof z.ZodError) {
    return NextResponse.json(
      errorBody(new HttpError(400, "validation_error", "Los datos enviados no son válidos.", z.treeifyError(err))),
      { status: 400 },
    );
  }
  // Error no controlado: log completo, respuesta genérica (sin filtrar).
  console.error(
    JSON.stringify({
      level: "error",
      route: "unknown",
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    }),
  );
  return NextResponse.json(
    errorBody(new HttpError(500, "internal_error", "Algo se torció en el servidor. Inténtalo de nuevo.")),
    { status: 500 },
  );
}

/** Log JSON mínimo por request: { route, userId, ms, status }. */
function logRequest(route: string, userId: string | null, status: number, startedAt: number, retryAfter?: string | null): void {
  console.log(
    JSON.stringify({
      route,
      userId,
      ms: Date.now() - startedAt,
      status,
      ...(retryAfter ? { retryAfter: Number(retryAfter) } : {}),
    }),
  );
}

/* ============================== Cuerpos ============================== */

/** Lee y valida el cuerpo JSON con zod; 400 validation_error con detalles. */
export async function parseBody<T extends z.ZodType>(
  ctx: RouteCtx,
  schema: T,
): Promise<z.output<T>> {
  let raw: unknown;
  try {
    const text = await ctx.req.text();
    raw = text ? JSON.parse(text) : {};
  } catch {
    throw new HttpError(400, "validation_error", "El cuerpo de la petición no es JSON válido.");
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    throw new HttpError(
      400,
      "validation_error",
      "Los datos enviados no son válidos.",
      z.treeifyError(parsed.error),
    );
  }
  return parsed.data;
}
