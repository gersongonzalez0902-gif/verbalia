/**
 * Contraseñas con scrypt de node:crypto · 02-cuentas-auth.md §2.
 *
 * - Parámetros OWASP interactivos: N=2^17 (131072), r=8, p=1, keylen=32.
 *   (N=2^17 exige ampliar maxmem: 128·N·r ≈ 134 MB > 32 MB por defecto.)
 * - Formato almacenado: `scrypt$N$r$p$salt$key` (salt y key en base64).
 * - Política: mínimo 8 caracteres, sin reglas de composición, y rechazo
 *   de las ~10 000 contraseñas filtradas más comunes (lista embebida).
 *
 * Es módulo de servidor puro: nunca se importa desde el cliente.
 */

import { randomBytes, scrypt as _scrypt, timingSafeEqual } from "node:crypto";
import type { ScryptOptions } from "node:crypto";
import { promisify } from "node:util";
import { COMMON_PASSWORDS } from "./common-passwords";

const scrypt = promisify(_scrypt) as (
  password: string | Buffer,
  salt: Buffer,
  keylen: number,
  options: ScryptOptions,
) => Promise<Buffer>;

export const SCRYPT_N = 1 << 17; // 131072
export const SCRYPT_R = 8;
export const SCRYPT_P = 1;
export const SCRYPT_KEYLEN = 32;

const MAXMEM = 512 * 1024 * 1024; // margen holgado sobre 128·N·r

function derive(
  password: string,
  salt: Buffer,
  N: number,
  r: number,
  p: number,
  keylen: number,
): Promise<Buffer> {
  return scrypt(password, salt, keylen, { N, r, p, maxmem: MAXMEM });
}

/** Genera el hash almacenable `scrypt$N$r$p$salt$key`. */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await derive(password, salt, SCRYPT_N, SCRYPT_R, SCRYPT_P, SCRYPT_KEYLEN);
  return `scrypt$${SCRYPT_N}$${SCRYPT_R}$${SCRYPT_P}$${salt.toString("base64")}$${key.toString("base64")}`;
}

/** Verifica una contraseña contra el hash almacenado (tiempo constante). */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;
  const [, nRaw, rRaw, pRaw, saltB64, keyB64] = parts;
  const n = Number(nRaw);
  const r = Number(rRaw);
  const p = Number(pRaw);
  if (!Number.isFinite(n) || !Number.isFinite(r) || !Number.isFinite(p) || n < 1 || n > 1 << 22) {
    return false;
  }
  const keylen = Buffer.from(keyB64, "base64").length;
  if (keylen < 16 || keylen > 128) return false;
  try {
    const key = await derive(password, Buffer.from(saltB64, "base64"), n, r, p, keylen);
    const expected = Buffer.from(keyB64, "base64");
    return key.length === expected.length && timingSafeEqual(key, expected);
  } catch {
    return false;
  }
}

/** ¿Está entre las contraseñas filtradas más comunes? (normalizada) */
export function isCommonPassword(password: string): boolean {
  const normalized = password.trim().toLowerCase();
  return COMMON_PASSWORDS.includes(normalized);
}

export interface PasswordPolicyResult {
  ok: boolean;
  reason?: "too_short" | "too_long" | "common";
}

/** Política de contraseña: mínimo 8, máximo 200, no común. */
export function checkPasswordPolicy(password: string): PasswordPolicyResult {
  if (typeof password !== "string" || password.length < 8) return { ok: false, reason: "too_short" };
  if (password.length > 200) return { ok: false, reason: "too_long" };
  if (isCommonPassword(password)) return { ok: false, reason: "common" };
  return { ok: true };
}

/** Mensajes de política en es-ES para la respuesta de validación. */
export function passwordPolicyMessage(reason: "too_short" | "too_long" | "common"): string {
  switch (reason) {
    case "too_short":
      return "La contraseña debe tener al menos 8 caracteres.";
    case "too_long":
      return "La contraseña no puede pasar de 200 caracteres.";
    case "common":
      return "Esa contraseña está entre las más usadas del mundo: elige otra menos predecible.";
  }
}

/**
 * Hash señuelo para igualar el tiempo de respuesta cuando el email no
 * existe en el login (anti-enumeración · 02-cuentas-auth.md §5.2).
 * Se calcula una sola vez y se reutiliza: mismo trabajo siempre.
 */
let dummyHashPromise: Promise<string> | null = null;

export function getDummyHash(): Promise<string> {
  dummyHashPromise ??= hashPassword(randomBytes(24).toString("hex"));
  return dummyHashPromise;
}
