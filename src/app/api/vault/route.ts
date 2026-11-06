import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

/**
 * Bóveda cifrada · API zero-knowledge.
 * ----------------------------------------------------------------
 * El jugador cifra su progreso EN EL NAVEGADOR (AES-GCM con clave
 * derivada por PBKDF2 de 600 000 iteraciones). Aquí solo llega un
 * sobre sellado: el servidor no tiene la passphrase, no puede
 * abrir nada y no guarda metadatos personales.
 *
 * Seguridad:
 * - Validación estricta con zod (forma y tamaño de todos los campos).
 * - Límite de tamaño del sobre (2 MiB cifrado ≈ copia holgada).
 * - Rate limit en memoria por IP (subidas y descargas separadas).
 * - IDs aleatorios de 64 hex (no enumerables).
 * - Expiración perezosa a los 30 días; barrido en cada acceso.
 * - Sin cookies, sin sesiones, sin registro: identidad cero.
 */

/* ------------------------------- Esquema ------------------------------- */

const B64_RE = /^[A-Za-z0-9+/]+={0,2}$/;

const envelopeSchema = z.object({
  /** Nonce AES-GCM: 12 bytes → base64 de exactamente 16 caracteres. */
  nonce: z.string().regex(B64_RE).length(16),
  /** Sal PBKDF2: 16 bytes → base64 de exactamente 24 caracteres. */
  salt: z.string().regex(B64_RE).length(24),
  /** Cifrado AES-GCM (base64, entre 16 bytes y ~2 MiB, múltiplo de 4). */
  ciphertext: z
    .string()
    .regex(B64_RE)
    .min(24)
    .max(2 * 1024 * 1024)
    .refine((v) => v.length % 4 === 0, "base64 mal alineado"),
});

/* ------------------------------ Almacén ------------------------------ */

interface VaultEntry {
  nonce: string;
  salt: string;
  ciphertext: string;
  storedAt: number;
  expiresAt: number;
}

const VAULT_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 días
const MAX_ENTRIES = 500;

/** Memoria del proceso: se pierde al reiniciar el servidor (aceptado:
 *  es un respaldo de emergencia, no un disco en la nube). */
const vault = new Map<string, VaultEntry>();

function sweep() {
  const now = Date.now();
  for (const [id, entry] of vault) {
    if (entry.expiresAt < now) vault.delete(id);
  }
  if (vault.size > MAX_ENTRIES) {
    // Recorte por antigüedad si alguien abusa del buzón.
    const sorted = [...vault.entries()].sort((a, b) => a[1].storedAt - b[1].storedAt);
    for (const [id] of sorted.slice(0, vault.size - MAX_ENTRIES)) vault.delete(id);
  }
}

/* ----------------------------- Rate limit ----------------------------- */

const WINDOW_MS = 60 * 60 * 1000; // 1 hora
const RATE_UPLOAD = 5; // sobres por IP y hora (respaldo puntual, no disco)
const RATE_DOWNLOAD = 30;

const hits = new Map<string, number[]>();

function rateLimited(ip: string, max: number): boolean {
  const now = Date.now();
  const list = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (list.length >= max) {
    hits.set(ip, list);
    return true;
  }
  list.push(now);
  hits.set(ip, list);
  return false;
}

function clientIp(request: NextRequest): string {
  // Detrás del proxy del despliegue; sin proxy, la conexión es local.
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "local"
  );
}

/* ------------------------------- Rutas ------------------------------- */

export async function POST(request: NextRequest) {
  const ip = clientIp(request);
  if (rateLimited(ip, RATE_UPLOAD)) {
    return NextResponse.json(
      { error: "Demasiadas copias seguidas: espera un rato." },
      { status: 429, headers: { "Retry-After": "3600" } },
    );
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo no válido" }, { status: 400 });
  }

  const parsed = envelopeSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "El sobre no supera la inspección de la Fortaleza." },
      { status: 422 },
    );
  }

  sweep();
  const id = crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
  const now = Date.now();
  vault.set(id, {
    ...parsed.data,
    storedAt: now,
    expiresAt: now + VAULT_TTL_MS,
  });

  return NextResponse.json(
    {
      ok: true,
      id,
      expiresAt: new Date(now + VAULT_TTL_MS).toISOString(),
    },
    { status: 201 },
  );
}

export async function GET(request: NextRequest) {
  const ip = clientIp(request);
  if (rateLimited(ip, RATE_DOWNLOAD)) {
    return NextResponse.json({ error: "Demasiadas descargas: espera un rato." }, { status: 429 });
  }

  const id = request.nextUrl.searchParams.get("id") ?? "";
  if (!/^[0-9a-f]{64}$/.test(id)) {
    return NextResponse.json({ error: "Código de bóveda no válido" }, { status: 400 });
  }

  sweep();
  const entry = vault.get(id);
  if (!entry || entry.expiresAt < Date.now()) {
    // La misma respuesta para «no existe» y «expiró»: no filtramos información.
    return NextResponse.json(
      { error: "Ese sobre no está en la bóveda (o ya zarpó hace tiempo)." },
      { status: 404 },
    );
  }

  return NextResponse.json({
    ok: true,
    nonce: entry.nonce,
    salt: entry.salt,
    ciphertext: entry.ciphertext,
    storedAt: new Date(entry.storedAt).toISOString(),
  });
}
