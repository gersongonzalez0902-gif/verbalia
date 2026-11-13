/**
 * Tests de seguridad automatizada · Ola D · Área 2.5
 * ---------------------------------------------------------------
 * Prueban las piezas puras del muro de la Fortaleza:
 * - Rate limit: cubo agotable responde 429 honesto (retryAfter).
 * - Guardas de mutación: CSRF + Content-Type en POST/PUT/PATCH/DELETE.
 * - Esquemas zod: login/registro normalizan y acotan; el payload de
 *   progreso rechaza sobres gigantes (fotos infinitas, XP negativo).
 * - Ciclo de sesión y tokens: TTLs reales, cookie blindada.
 *
 * Lo que NO se prueba aquí (necesita una base de datos de verdad):
 * el borrado de sesiones al cambiar contraseña y la anti-enumeración
 * de login en vivo (cubiertas por diseño y por tests/sync.test.ts).
 */

import { describe, expect, test, beforeEach } from "bun:test";
import { rateLimit, __resetRateLimits } from "../src/server/ratelimit";
import { enforceMutationHeaders, HttpError } from "../src/server/http";
import { LoginSchema, RegisterSchema, ProgressPayloadSchema } from "../src/server/schemas";
import { TTL_MS } from "../src/server/auth/tokens";
import { SESSION_COOKIE, SESSION_TTL_MS, sessionCookieOptions } from "../src/server/auth/session";

describe("Ola D · Área 2.5 · rate limit honesto", () => {
  beforeEach(() => __resetRateLimits());

  test("el cubo se agota y responde 429 con reintento", () => {
    const key = "test:seg:login";
    expect(rateLimit(key, 3, 60_000).ok).toBe(true);
    expect(rateLimit(key, 3, 60_000).ok).toBe(true);
    expect(rateLimit(key, 3, 60_000).ok).toBe(true);
    const cuarto = rateLimit(key, 3, 60_000);
    expect(cuarto.ok).toBe(false);
    expect(cuarto.retryAfterSec).toBeGreaterThan(0);
    expect(cuarto.retryAfterSec).toBeLessThanOrEqual(60);
  });

  test("cada llave tiene su propio cubo (IP y cuenta separadas)", () => {
    const ip = "test:seg:ip:1.2.3.4";
    const cuenta = "test:seg:acct:ana@mar.es";
    expect(rateLimit(ip, 1, 60_000).ok).toBe(true);
    expect(rateLimit(ip, 1, 60_000).ok).toBe(false);
    // Otra llave, otro cubo: la cuenta de al lado no paga por la IP.
    expect(rateLimit(cuenta, 1, 60_000).ok).toBe(true);
  });

  test("los tokens restantes se reportan para la cabecera X-RateLimit-Remaining", () => {
    const key = "test:seg:hdr";
    expect(rateLimit(key, 5, 60_000).remaining).toBe(4);
    expect(rateLimit(key, 5, 60_000).remaining).toBe(3);
  });
});

describe("Ola D · Área 2.5 · mutaciones blindadas (CSRF + Content-Type)", () => {
  const req = (method: string, headers: Record<string, string>) => ({
    method,
    headers: new Headers(headers),
  });

  test("POST sin cabecera anti-falsificación → 403", () => {
    expect(() => enforceMutationHeaders(req("POST", {}))).toThrow(HttpError);
    try {
      enforceMutationHeaders(req("POST", {}));
      throw new Error("debía lanzar");
    } catch (err) {
      expect((err as HttpError).status).toBe(403);
    }
  });

  test("PUT con cuerpo y Content-Type equivocado → 400", () => {
    try {
      enforceMutationHeaders(
        req("PUT", { "x-verbalia-csrf": "1", "content-type": "text/plain", "content-length": "12" }),
      );
      throw new Error("debía lanzar");
    } catch (err) {
      expect((err as HttpError).status).toBe(400);
    }
  });

  test("mutación bien formada (CSRF + JSON) pasa sin lanzar", () => {
    expect(() =>
      enforceMutationHeaders(
        req("POST", { "x-verbalia-csrf": "1", "content-type": "application/json", "content-length": "10" }),
      ),
    ).not.toThrow();
  });

  test("DELETE con CSRF y sin cuerpo pasa (no exige Content-Type)", () => {
    expect(() => enforceMutationHeaders(req("DELETE", { "x-verbalia-csrf": "1" }))).not.toThrow();
  });

  test("GET no es mutación: pasa sin cabeceras", () => {
    expect(() => enforceMutationHeaders(req("GET", {}))).not.toThrow();
  });
});

describe("Ola D · Área 2.5 · esquemas zod de entrada", () => {
  test("login normaliza el email (trim + minúsculas)", () => {
    const parsed = LoginSchema.parse({ email: "  Ana@Mar.Es ", password: "travesia-segura" });
    expect(parsed.email).toBe("ana@mar.es");
  });

  test("login rechaza email inválido y contraseña vacía", () => {
    expect(LoginSchema.safeParse({ email: "no-es-email", password: "x" }).success).toBe(false);
    expect(LoginSchema.safeParse({ email: "ana@mar.es", password: "" }).success).toBe(false);
  });

  test("registro acota el nombre visible (máx. 40, sin espacios de más)", () => {
    const parsed = RegisterSchema.parse({
      email: "ana@mar.es",
      password: "travesia-segura",
      displayName: "  Ana la Navegante  ",
    });
    expect(parsed.displayName).toBe("Ana la Navegante");
    expect(
      RegisterSchema.safeParse({
        email: "ana@mar.es",
        password: "travesia-segura",
        displayName: "x".repeat(41),
      }).success,
    ).toBe(false);
  });

  test("payload de progreso legítimo pasa entero", () => {
    const ok = ProgressPayloadSchema.safeParse({
      version: 1,
      profile: { name: "Ana", bio: "Navegante del bosque", photo: "", banner: "preset:aurora" },
      settings: { sound: true, musicVolume: 0.55 },
      core: { xp: 1520 },
      srs: { "palabra-1": { ease: 2.5 } },
      savedAt: 1_700_000_000_000,
    });
    expect(ok.success).toBe(true);
  });

  test("payload de progreso rechaza XP negativo y nombre gigante", () => {
    expect(ProgressPayloadSchema.safeParse({ profile: { name: "Ana" }, core: { xp: -5 } }).success).toBe(false);
    expect(ProgressPayloadSchema.safeParse({ profile: { name: "x".repeat(61) }, core: { xp: 5 } }).success).toBe(
      false,
    );
  });

  test("payload de progreso rechaza fotos absurdas y jardines infinitos", () => {
    expect(
      ProgressPayloadSchema.safeParse({
        profile: { name: "Ana", photo: "data:image/png;base64," + "x".repeat(500_001) },
        core: { xp: 5 },
      }).success,
    ).toBe(false);
    const jardinInfinito: Record<string, unknown> = {};
    for (let i = 0; i < 30_001; i++) jardinInfinito[`w-${i}`] = { ease: 2 };
    expect(
      ProgressPayloadSchema.safeParse({ profile: { name: "Ana" }, core: { xp: 5 }, srs: jardinInfinito }).success,
    ).toBe(false);
  });
});

describe("Ola D · Área 2.5 · ciclo de sesión y tokens de un solo uso", () => {
  test("los tokens de un solo uso caducan por TIEMPO, no solo por uso", () => {
    expect(TTL_MS.PASSWORD_RESET).toBe(60 * 60 * 1000); // 1 hora
    expect(TTL_MS.EMAIL_VERIFY).toBe(48 * 60 * 60 * 1000); // 48 horas
    expect(TTL_MS.EMAIL_CHANGE).toBe(48 * 60 * 60 * 1000); // 48 horas
  });

  test("la cookie de sesión vive 30 días, httpOnly, sameSite lax y secure", () => {
    const opts = sessionCookieOptions();
    expect(SESSION_COOKIE).toBe("verbalia_session");
    expect(SESSION_TTL_MS).toBe(30 * 24 * 60 * 60 * 1000);
    expect(opts.httpOnly).toBe(true);
    expect(opts.sameSite).toBe("lax");
    expect(opts.secure).toBe(true);
    expect(opts.path).toBe("/");
  });
});
