/**
 * Rate limit · Token bucket en memoria por (ruta, userId|IP).
 * Patrón de 01-arquitectura.md §6 y 04-api.md §1.
 *
 * - Cubo por clave: capacidad = límite, recarga = límite / ventana.
 *   Ej.: 5/h ⇒ capacidad 5, 1 token cada 12 min.
 * - `X-RateLimit-Remaining` en cada respuesta; 429 + `Retry-After` al agotar.
 * - Memoria acotada: barrido de cubos llenos e inactivos cuando crece.
 *
 * Fase A (1 instancia) basta con memoria; la interfaz permite mover a
 * Redis sin tocar las rutas.
 */

export interface RateLimitResult {
  ok: boolean;
  /** Tokens restantes tras esta petición (para la cabecera). */
  remaining: number;
  /** Segundos hasta el próximo token (solo si ok = false). */
  retryAfterSec: number;
}

interface Bucket {
  tokens: number;
  updatedAt: number;
}

const MAX_BUCKETS = 8000;

const buckets = new Map<string, Bucket>();

/** Barrido: los cubos llenos llevan mucho tiempo sin usarse (sobran). */
function sweep(now: number): void {
  if (buckets.size <= MAX_BUCKETS) return;
  for (const [key, b] of buckets) {
    if (b.tokens >= 0.999 && now - b.updatedAt > 60_000) buckets.delete(key);
  }
}

/**
 * Consume 1 token del cubo `key`.
 * @param limit Máximo de peticiones por ventana (capacidad del cubo).
 * @param windowMs Ventana en ms (velocidad de recarga = limit/windowMs).
 */
export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  let b = buckets.get(key);
  if (!b) {
    b = { tokens: limit, updatedAt: now };
    buckets.set(key, b);
  }

  // Recarga lineal desde la última visita, con tope en la capacidad.
  const elapsed = now - b.updatedAt;
  if (elapsed > 0) {
    b.tokens = Math.min(limit, b.tokens + (elapsed * limit) / windowMs);
    b.updatedAt = now;
  }

  if (b.tokens < 1) {
    sweep(now);
    const waitMs = ((1 - b.tokens) * windowMs) / limit;
    return {
      ok: false,
      remaining: 0,
      retryAfterSec: Math.max(1, Math.ceil(waitMs / 1000)),
    };
  }

  b.tokens -= 1;
  sweep(now);
  return { ok: true, remaining: Math.max(0, Math.floor(b.tokens)), retryAfterSec: 0 };
}

/** Solo para tests: reinicia el estado en memoria. */
export function __resetRateLimits(): void {
  buckets.clear();
}
