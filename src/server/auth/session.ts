/**
 * Sesiones opacas · 02-cuentas-auth.md §3.
 *
 * - Login correcto ⇒ token = base64url(random(32)); en DB va sha256(token).
 * - Cookie `verbalia_session`: httpOnly, Secure, SameSite=Lax, Path=/,
 *   Max-Age 30 días (rolling).
 * - Rolling: si a la sesión le quedan < 7 días, al autenticar se extiende.
 * - `lastSeenAt` por sesión (presencia futura); escritura acelerada
 *   (máx. una cada 5 min) para no castigar la DB en cada request.
 */

import { createHash, randomBytes } from "node:crypto";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db";

export const SESSION_COOKIE = "verbalia_session";
export const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 días
export const SESSION_REFRESH_THRESHOLD_MS = 7 * 24 * 60 * 60 * 1000; // < 7 días ⇒ extender
export const LAST_SEEN_THROTTLE_MS = 5 * 60 * 1000;

export interface SessionUser {
  id: string;
  email: string;
  emailVerifiedAt: Date | null;
  passwordHash: string | null;
  displayName: string;
  handle: string;
  farocode: string;
  bio: string;
  avatar: string;
  banner: string;
  featuredBadge: string;
  photo: string;
  role: "USER" | "MODERATOR" | "ADMIN";
  status: "ACTIVE" | "SUSPENDED" | "DELETED";
  riskFlags: number;
  locale: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SessionInfo {
  id: string;
  userId: string;
  tokenHash: string;
  createdAt: Date;
  lastSeenAt: Date;
  expiresAt: Date;
  userAgent: string;
  deviceHint: string;
}

export interface ActiveSession {
  user: SessionUser;
  session: SessionInfo;
}

/** Token opaco nuevo: 32 bytes aleatorios en base64url. */
export function newSessionToken(): string {
  return randomBytes(32).toString("base64url");
}

/** sha256 hex del token: lo único que se guarda en DB. */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** Opciones de cookie de sesión (rolling por defecto). */
export function sessionCookieOptions(maxAgeSec = SESSION_TTL_MS / 1000) {
  return {
    name: SESSION_COOKIE,
    httpOnly: true,
    secure: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxAgeSec,
  };
}

/** "Chrome · Windows" a partir del User-Agent (heurística mínima, sin IP). */
export function deviceHintFromUA(uaRaw: string): string {
  const ua = uaRaw ?? "";
  let browser = "Navegador";
  if (/edg\//i.test(ua)) browser = "Edge";
  else if (/opr\/|opera/i.test(ua)) browser = "Opera";
  else if (/firefox\//i.test(ua)) browser = "Firefox";
  else if (/chrome\//i.test(ua)) browser = "Chrome";
  else if (/safari\//i.test(ua)) browser = "Safari";

  let os = "desconocido";
  if (/windows/i.test(ua)) os = "Windows";
  else if (/android/i.test(ua)) os = "Android";
  else if (/iphone|ipad|ipod/i.test(ua)) os = "iOS";
  else if (/mac os x/i.test(ua)) os = "macOS";
  else if (/linux/i.test(ua)) os = "Linux";

  return `${browser} · ${os}`;
}

/** Crea una sesión (DB + devuelve el token para la cookie). */
export async function createSession(
  userId: string,
  req: NextRequest,
): Promise<{ token: string; session: SessionInfo }> {
  const token = newSessionToken();
  const ua = (req.headers.get("user-agent") ?? "").slice(0, 200);
  const session = await prisma.session.create({
    data: {
      tokenHash: hashToken(token),
      userId,
      expiresAt: new Date(Date.now() + SESSION_TTL_MS),
      userAgent: ua,
      deviceHint: deviceHintFromUA(ua),
    },
  });
  return { token, session: session as unknown as SessionInfo };
}

/** Busca la sesión activa del token (vigente, usuario ACTIVE). null si no. */
export async function findActiveSession(token: string): Promise<ActiveSession | null> {
  if (!token) return null;
  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: true },
  });
  if (!session) return null;
  if (session.expiresAt.getTime() <= Date.now()) return null;
  if (session.user.status !== "ACTIVE") return null;
  return {
    session: session as unknown as SessionInfo,
    user: session.user as unknown as SessionUser,
  };
}

/** Extiende la sesión si le quedan < 7 días (rolling). Devuelve true si extendió. */
export async function refreshSessionIfNeeded(session: SessionInfo): Promise<boolean> {
  const remaining = session.expiresAt.getTime() - Date.now();
  if (remaining >= SESSION_REFRESH_THRESHOLD_MS) return false;
  await prisma.session.update({
    where: { id: session.id },
    data: { expiresAt: new Date(Date.now() + SESSION_TTL_MS) },
  });
  return true;
}

/** Toca lastSeenAt (acelerado a 1 escritura cada 5 min). */
export async function touchLastSeen(session: SessionInfo): Promise<void> {
  if (Date.now() - session.lastSeenAt.getTime() < LAST_SEEN_THROTTLE_MS) return;
  await prisma.session.update({
    where: { id: session.id },
    data: { lastSeenAt: new Date() },
  }).catch(() => {
    /* fallo no fatal: la sesión sigue siendo válida */
  });
}

export async function revokeSession(id: string, userId: string): Promise<boolean> {
  const res = await prisma.session.deleteMany({ where: { id, userId } });
  return res.count > 0;
}

export async function revokeAllSessions(userId: string, exceptSessionId?: string): Promise<number> {
  const res = await prisma.session.deleteMany({
    where: { userId, ...(exceptSessionId ? { id: { not: exceptSessionId } } : {}) },
  });
  return res.count;
}
