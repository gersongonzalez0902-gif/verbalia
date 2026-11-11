/**
 * Guard de autenticación · 02-cuentas-auth.md §3.
 *
 * requireUser(): cookie → sesión válida → usuario ACTIVE.
 * requireRole(): roles USER/MODERATOR/ADMIN.
 */

import type { NextRequest } from "next/server";
import { HttpError } from "@/server/http";
import {
  findActiveSession,
  type ActiveSession,
  SESSION_COOKIE,
} from "./session";

/** Lee la cookie de sesión y valida la sesión; null si no hay sesión válida. */
export async function requireSession(req: NextRequest): Promise<ActiveSession | null> {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return findActiveSession(token);
}

/** Lanza 401 unauthorized si no hay sesión válida. */
export async function requireUser(req: NextRequest): Promise<ActiveSession> {
  const active = await requireSession(req);
  if (!active) {
    throw new HttpError(401, "unauthorized", "Necesitas iniciar sesión para continuar.");
  }
  return active;
}

/** Lanza 403 forbidden si el usuario no tiene uno de los roles exigidos. */
export function requireRole(
  user: { role: string },
  ...roles: Array<"USER" | "MODERATOR" | "ADMIN">
): void {
  if (!roles.includes(user.role as "USER" | "MODERATOR" | "ADMIN")) {
    throw new HttpError(403, "forbidden", "No tienes permiso para hacer eso.");
  }
}
