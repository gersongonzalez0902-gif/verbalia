/**
 * Tokens de un solo uso · 02-cuentas-auth.md §4.
 *
 * EMAIL_VERIFY 48 h · PASSWORD_RESET 1 h · EMAIL_CHANGE 48 h.
 * El token crudo solo existe en el email de destino; en DB va sha256.
 * Un solo uso REAL: la fila se borra al consumirlo (y también si caducó).
 */

import { createHash, randomBytes } from "node:crypto";
import { prisma } from "@/lib/db";

export type OneTimeTokenType = "EMAIL_VERIFY" | "PASSWORD_RESET" | "EMAIL_CHANGE";

const TTL_MS: Record<OneTimeTokenType, number> = {
  EMAIL_VERIFY: 48 * 60 * 60 * 1000,
  PASSWORD_RESET: 60 * 60 * 1000,
  EMAIL_CHANGE: 48 * 60 * 60 * 1000,
};

export interface ConsumedToken {
  userId: string;
  type: OneTimeTokenType;
  payload: string;
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** Emite un token de un solo uso y devuelve el valor crudo (para el email). */
export async function issueToken(
  userId: string,
  type: OneTimeTokenType,
  payload = "",
): Promise<string> {
  const token = randomBytes(32).toString("base64url");
  await prisma.verificationToken.create({
    data: {
      userId,
      type,
      tokenHash: hashToken(token),
      payload,
      expiresAt: new Date(Date.now() + TTL_MS[type]),
    },
  });
  return token;
}

/**
 * Consume un token: lo borra SIEMPRE (usado o caducado) y devuelve sus
 * datos solo si era válido. Segunda llamada ⇒ null (un solo uso real).
 */
export async function consumeToken(
  token: string,
  expected?: OneTimeTokenType,
): Promise<ConsumedToken | null> {
  if (!token || token.length > 200) return null;
  const tokenHash = hashToken(token);
  const row = await prisma.verificationToken.findUnique({ where: { tokenHash } });
  if (!row) return null;
  // Borrado incondicional: un solo uso real (aunque caducado, se limpia).
  await prisma.verificationToken.delete({ where: { id: row.id } }).catch(() => {
    /* carrera de doble click: la otra llamada ya lo borró */
  });
  if (row.expiresAt.getTime() <= Date.now()) return null;
  if (expected && row.type !== expected) return null;
  return {
    userId: row.userId,
    type: row.type as OneTimeTokenType,
    payload: row.payload,
  };
}

/** Borra los tokens previos del mismo tipo (evita acumular enlaces vivos). */
export async function clearTokens(userId: string, type?: OneTimeTokenType): Promise<void> {
  await prisma.verificationToken.deleteMany({
    where: { userId, ...(type ? { type } : {}) },
  });
}
