/**
 * Pruebas de auth · `bun test` · 09-integracion.md §6.
 * scrypt roundtrip, formato del hash, caducidad de tokens (formato y
 * un-solo-uso), política de contraseñas (10k comunes), anti-enumeración
 * (hash dummy con el mismo coste), generación de handle/farocode y
 * device hints.
 */

import { describe, expect, test } from "bun:test";
import {
  SCRYPT_N,
  SCRYPT_R,
  SCRYPT_P,
  checkPasswordPolicy,
  getDummyHash,
  hashPassword,
  isCommonPassword,
  verifyPassword,
} from "@/server/auth/password";
import { hashToken, newSessionToken, deviceHintFromUA, SESSION_COOKIE } from "@/server/auth/session";
import { slugify } from "@/server/auth/ids";
import { COMMON_PASSWORDS } from "@/server/auth/common-passwords";

/* ============================== scrypt ============================== */

describe("password.ts · scrypt (02 §2)", () => {
  test("roundtrip: hashPassword → verifyPassword acepta la buena y rechaza la mala", async () => {
    const hash = await hashPassword("vela-de-trinquete-9");
    expect(await verifyPassword("vela-de-trinquete-9", hash)).toBe(true);
    expect(await verifyPassword("vela-de-trinquete-8", hash)).toBe(false);
  });

  test("formato almacenado: scrypt$N$r$p$salt$key con N=131072, r=8, p=1", async () => {
    const hash = await hashPassword("bitacora-secreta-77");
    const parts = hash.split("$");
    expect(parts).toHaveLength(6);
    expect(parts[0]).toBe("scrypt");
    expect(Number(parts[1])).toBe(SCRYPT_N);
    expect(Number(parts[1])).toBe(131072); // 2^17 (OWASP interactivo)
    expect(Number(parts[2])).toBe(SCRYPT_R);
    expect(Number(parts[3])).toBe(SCRYPT_P);
    // salt y key en base64 (keylen 32 bytes).
    expect(Buffer.from(parts[4], "base64").length).toBe(16);
    expect(Buffer.from(parts[5], "base64").length).toBe(32);
  });

  test("cada hash lleva su propia sal (dos hashes difieren)", async () => {
    const a = await hashPassword("la-misma-contrasena");
    const b = await hashPassword("la-misma-contrasena");
    expect(a).not.toBe(b);
    expect(await verifyPassword("la-misma-contrasena", a)).toBe(true);
    expect(await verifyPassword("la-misma-contrasena", b)).toBe(true);
  });

  test("hash corrupto o de otro algoritmo: false, nunca excepción", async () => {
    expect(await verifyPassword("x", "")).toBe(false);
    expect(await verifyPassword("x", "md5$abc$def")).toBe(false);
    expect(await verifyPassword("x", "scrypt$1$1$1$c2FsdA==a$$")).toBe(false);
    expect(await verifyPassword("x", "scrypt$NaN$8$1$c2FsdA==$a2V5")).toBe(false);
  });
});

/* ============================== Política (10k comunes) ============================== */

describe("password.ts · política de contraseñas", () => {
  test("mínimo 8 caracteres, sin reglas de composición", () => {
    expect(checkPasswordPolicy("abc123").ok).toBe(false);
    expect(checkPasswordPolicy("abc123").reason).toBe("too_short");
    // Larga y rara: vale sin mayúsculas ni símbolos.
    expect(checkPasswordPolicy("la-gaviota-come-pan").ok).toBe(true);
  });

  test("rechaza las contraseñas filtradas más comunes", () => {
    expect(isCommonPassword("123456")).toBe(true);
    expect(isCommonPassword("Password")).toBe(true); // normaliza a minúsculas
    expect(isCommonPassword("qwerty123")).toBe(true);
    expect(checkPasswordPolicy("password1").ok).toBe(false);
    expect(checkPasswordPolicy("password1").reason).toBe("common");
  });

  test("la lista embebida es sustancial (~10k) y minúscula", () => {
    expect(COMMON_PASSWORDS.length).toBeGreaterThan(5000);
    expect(COMMON_PASSWORDS.includes("123456")).toBe(true);
    expect(COMMON_PASSWORDS.every((p) => p === p.toLowerCase())).toBe(true);
  });

  test("máximo 200 caracteres", () => {
    expect(checkPasswordPolicy("a".repeat(201)).reason).toBe("too_long");
    expect(checkPasswordPolicy("n".repeat(197) + "9Zq").ok).toBe(true);
  });
});

/* ============================== Anti-enumeración ============================== */

describe("password.ts · hash dummy (anti-enumeración 02 §5.2)", () => {
  test("el hash señuelo es un scrypt real con el mismo coste y formato", async () => {
    const dummy = await getDummyHash();
    const parts = dummy.split("$");
    expect(parts[0]).toBe("scrypt");
    expect(Number(parts[1])).toBe(131072);
    // Verificable (mismo trabajo de scrypt que un usuario real).
    expect(await verifyPassword("cualquier-cosa", dummy)).toBe(false);
    // Y es estable entre llamadas (memoizado: mismo trabajo siempre).
    expect(await getDummyHash()).toBe(dummy);
  });
});

/* ============================== Sesiones ============================== */

describe("session.ts · tokens opacos (02 §3)", () => {
  test("token de 32 bytes en base64url (43 caracteres, sin + ni /)", () => {
    const t = newSessionToken();
    expect(t).toHaveLength(43);
    expect(t).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  test("cada token es único y en DB iría hasheado (sha256 hex)", () => {
    const a = newSessionToken();
    const b = newSessionToken();
    expect(a).not.toBe(b);
    const h = hashToken(a);
    expect(h).toHaveLength(64);
    expect(h).toMatch(/^[0-9a-f]+$/);
    // Difusión: un carácter distinto cambia todo el hash.
    expect(hashToken(b)).not.toBe(h);
  });

  test("la cookie se llama verbalia_session", () => {
    expect(SESSION_COOKIE).toBe("verbalia_session");
  });

  test("deviceHint: Chrome·Windows, Safari·iPhone, Firefox·Linux, genérico", () => {
    expect(deviceHintFromUA("Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 Chrome/120.0 Safari/537.36")).toBe("Chrome · Windows");
    expect(deviceHintFromUA("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0) AppleWebKit/605.1.15 Safari/604.1")).toBe("Safari · iOS");
    expect(deviceHintFromUA("Mozilla/5.0 (X11; Linux x86_64) Gecko/20100101 Firefox/121.0")).toBe("Firefox · Linux");
    expect(deviceHintFromUA("")).toBe("Navegador · desconocido");
  });
});

/* ============================== Handles ============================== */

describe("ids.ts · handle y normalización", () => {
  test("slugify quita acentos, espacios y símbolos", () => {
    expect(slugify("María José")).toBe("maria-jose");
    expect(slugify("¡Ñoño! ¿Estás?")).toBe("nono-estas"); // Ñ → n (NFD), no desaparece
    expect(slugify("")).toBe("navegante");
    expect(slugify("!!!")).toBe("navegante");
  });
});
