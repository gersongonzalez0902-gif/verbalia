"use client";

/**
 * Cliente tipado de la API /api/v1 · fetch + CSRF + errores uniformes.
 *
 * - Toda mutación viaja con Content-Type: application/json y la cabecera
 *   custom `x-verbalia-csrf` (01-arquitectura.md §6).
 * - Errores → ApiError {code, message, status, meta} (04-api.md §4).
 * - Cookies de sesión: same-origin (httpOnly) — el fetch no toca nada.
 */

export interface PublicUser {
  id: string;
  email: string;
  displayName: string;
  handle: string;
  farocode: string;
  emailVerified: boolean;
  role: string;
  status: string;
  createdAt: string;
}

export interface SessionItemDto {
  id: string;
  deviceHint: string;
  userAgent: string;
  createdAt: string;
  lastSeenAt: string;
  expiresAt: string;
  current: boolean;
}

export interface ValidatedEvent {
  validated: { xp: number; tinta: number; accuracy: number; bestCombo: number };
  statDelta: { day: string; xp: number; answers: number; correct: number };
  flags: string[];
}

export class ApiError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly status: number,
    readonly meta?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const BASE = "/api/v1";
const CSRF_HEADER = "x-verbalia-csrf";

async function apiFetch<T>(
  path: string,
  init: RequestInit & { idempotencyKey?: string } = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  const hasBody = init.body !== undefined && init.body !== null;
  if (hasBody) headers.set("Content-Type", "application/json");
  if (init.method && init.method !== "GET") headers.set(CSRF_HEADER, "1");
  if (init.idempotencyKey) headers.set("Idempotency-Key", init.idempotencyKey);

  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, { ...init, headers, credentials: "same-origin" });
  } catch {
    // Red caída: el juego sigue; la cola offline reintenta.
    throw new ApiError("network_error", "Sin conexión con el barco.", 0);
  }

  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }

  if (!res.ok) {
    const err = (body as { error?: { code?: string; message?: string; meta?: unknown } })?.error;
    throw new ApiError(err?.code ?? "unknown", err?.message ?? `Error ${res.status}`, res.status, err?.meta);
  }
  return body as T;
}

function json(data: unknown): string {
  return JSON.stringify(data);
}

/* ============================== Auth (#1–13) ============================== */

export const api = {
  auth: {
    register(email: string, password: string, displayName: string) {
      return apiFetch<{ user: PublicUser; needsVerification: boolean }>("/auth/register", {
        method: "POST",
        body: json({ email, password, displayName }),
      });
    },
    login(email: string, password: string) {
      return apiFetch<{ user: PublicUser }>("/auth/login", {
        method: "POST",
        body: json({ email, password }),
      });
    },
    async logout() {
      try {
        await apiFetch<{ ok: boolean }>("/auth/logout", { method: "POST" });
      } catch {
        /* cerrar sesión local aunque el barco no responda */
      }
    },
    me() {
      return apiFetch<{ user: PublicUser | null }>("/auth/me");
    },
    verify(token: string) {
      return apiFetch<{ ok: boolean; emailChanged?: boolean }>("/auth/verify", {
        method: "POST",
        body: json({ token }),
      });
    },
    resendVerification() {
      return apiFetch<{ ok: boolean; alreadyVerified?: boolean }>("/auth/resend-verification", {
        method: "POST",
      });
    },
    forgotPassword(email: string) {
      return apiFetch<{ ok: boolean }>("/auth/password/forgot", {
        method: "POST",
        body: json({ email }),
      });
    },
    resetPassword(token: string, password: string) {
      return apiFetch<{ ok: boolean }>("/auth/password/reset", {
        method: "POST",
        body: json({ token, password }),
      });
    },
    changePassword(current: string, next: string) {
      return apiFetch<{ ok: boolean }>("/auth/password/change", {
        method: "POST",
        body: json({ current, next }),
      });
    },
    changeEmail(newEmail: string, password: string) {
      return apiFetch<{ ok: boolean }>("/auth/email", {
        method: "POST",
        body: json({ newEmail, password }),
      });
    },
    sessions() {
      return apiFetch<{ items: SessionItemDto[] }>("/auth/sessions");
    },
    revokeSession(id: string) {
      return apiFetch<{ ok: boolean }>(`/auth/sessions/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
    },
    deleteAccount(password: string) {
      return apiFetch<{ ok: boolean }>("/auth/account", {
        method: "DELETE",
        body: json({ password }),
      });
    },
  },

  /* ============================== Progreso (#14–18) ============================== */

  progress: {
    /** null si el barco aún no tiene estado (404). */
    async get(): Promise<{ version: number; payload: unknown; updatedAt: string } | null> {
      try {
        return await apiFetch<{ version: number; payload: unknown; updatedAt: string }>("/progress");
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) return null;
        throw err;
      }
    },
    /** PUT con base: 200 normal o 409 conflict_outdated (merged ya mezclado). */
    async put(input: {
      baseUpdatedAt: string | null;
      payload: unknown;
      deltas: unknown;
    }): Promise<{ status: 200 | 409; merged: unknown; updatedAt: string; conflicts?: string[] }> {
      try {
        const res = await apiFetch<{ merged: unknown; updatedAt: string; conflicts?: string[] }>(
          "/progress",
          { method: "PUT", body: json(input) },
        );
        return { status: 200, merged: res.merged, updatedAt: res.updatedAt, conflicts: res.conflicts };
      } catch (err) {
        if (err instanceof ApiError && err.status === 409) {
          // El servidor ya mezcló: el cuerpo trae el estado unido.
          const res = await readConflictBody(err);
          return { status: 409, merged: res.merged, updatedAt: res.updatedAt, conflicts: res.conflicts };
        }
        throw err;
      }
    },
    importPayload(payload: unknown) {
      return apiFetch<{ merged: unknown; updatedAt: string }>("/progress/import", {
        method: "POST",
        body: json({ payload }),
      });
    },
    postEvent(
      session: unknown,
      idempotencyKey: string,
    ): Promise<ValidatedEvent> {
      return apiFetch<ValidatedEvent>("/progress/events", {
        method: "POST",
        body: json({ session }),
        idempotencyKey,
      });
    },
  },

  stats: {
    me(window: "7d" | "30d" = "7d") {
      return apiFetch<{
        days: Array<{ day: string; xp: number; sessions: number; answers: number; correct: number; bestCombo: number; minutes: number }>;
        streakOfficial: number;
      }>(`/stats/me?window=${window}`);
    },
  },
};

/** El 409 de PUT trae merged en el cuerpo: lo recuperamos del meta del error. */
async function readConflictBody(err: ApiError): Promise<{ merged: unknown; updatedAt: string; conflicts?: string[] }> {
  const meta = err.meta as { merged?: unknown; updatedAt?: string; conflicts?: string[] } | undefined;
  if (meta?.merged) return meta as { merged: unknown; updatedAt: string; conflicts?: string[] };
  return { merged: null, updatedAt: new Date().toISOString() };
}
