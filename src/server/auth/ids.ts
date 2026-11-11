/**
 * Identificadores públicos autogenerados · 02-cuentas-auth.md §1.
 *
 * - handle: `slug(displayName)-####` (único; lo ven otros jugadores).
 * - farocode: `PALABRA-####` (único; para añadir amigos).
 *
 * Los conflictos de unicidad se resuelven probando sufijos nuevos.
 */

import { prisma } from "@/lib/db";

/** Translitera a slug ASCII razonable: "María José" → "maria-jose". */
export function slugify(name: string): string {
  const base = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 20);
  return base || "navegante";
}

/** Cuatro dígitos: 1000–9999. */
function digits(): number {
  return 1000 + Math.floor(Math.random() * 9000);
}

/** Genera un handle único `slug-####` (reintenta con otro sufijo). */
export async function generateUniqueHandle(displayName: string): Promise<string> {
  const slug = slugify(displayName);
  for (let attempt = 0; attempt < 8; attempt++) {
    const handle = `${slug}-${digits()}`;
    const exists = await prisma.user.findUnique({ where: { handle }, select: { id: true } });
    if (!exists) return handle;
  }
  // Improbable: sufijo largo basado en el reloj.
  return `${slug}-${Date.now().toString(36).slice(-6)}`;
}

/** Palabras náuticas cortas para el código de faro (estilo ALBO-3721). */
const FARO_WORDS = [
  "ALBO", "BRUMA", "FARO", "MAREA", "NORTE", "SALIA", "ESTELA", "CALMA",
  "BRISA", "MAREA", "NAVE", "PUERTO", "RUMBO", "SIRENA", "TIMON", "ANCLA",
  "BOYA", "COSTA", "DELTA", "ESCOLLO", "FLOTA", "GRUMETE", "HORIZON", "ISLA",
] as const;

/** Genera un farocode único `PALABRA-####`. */
export async function generateUniqueFarocode(): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const word = FARO_WORDS[Math.floor(Math.random() * FARO_WORDS.length)];
    const code = `${word}-${digits()}`;
    const exists = await prisma.user.findUnique({ where: { farocode: code }, select: { id: true } });
    if (!exists) return code;
  }
  return `FARO-${Date.now().toString(36).toUpperCase().slice(-6)}`;
}

/** Normalización de email en UN solo punto (trim + lowercase). */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
