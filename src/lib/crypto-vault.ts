/**
 * Criptografía de la bóveda (lado cliente) · Web Crypto API.
 * ----------------------------------------------------------------
 * AES-GCM 256 con clave derivada por PBKDF2-SHA256 (600 000
 * iteraciones, sal de 16 bytes, nonce de 12 bytes por sobre).
 * La passphrase NUNCA sale del dispositivo: el servidor solo ve
 * un sobre sellado imposible de abrir sin ella.
 */

const PBKDF2_ITERATIONS = 600_000;

export interface VaultEnvelope {
  nonce: string;
  salt: string;
  ciphertext: string;
}

/* ------------------------------ base64 ------------------------------ */

function toB64(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function fromB64(b64: string): Uint8Array {
  const binary = atob(b64);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
  return out;
}

/* ------------------------------ clave ------------------------------ */

async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const baseKey = await crypto.subtle.importKey("raw", enc.encode(passphrase), "PBKDF2", false, [
    "deriveKey",
  ]);
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt as unknown as BufferSource,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

/* ---------------------------- sobres ---------------------------- */

/** Cifra un texto plano con la passphrase; devuelve el sobre en base64. */
export async function sealVault(plain: string, passphrase: string): Promise<VaultEnvelope> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const nonce = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(passphrase, salt);
  const enc = new TextEncoder();
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: nonce as unknown as BufferSource },
    key,
    enc.encode(plain),
  );
  return {
    nonce: toB64(nonce),
    salt: toB64(salt),
    ciphertext: toB64(ciphertext),
  };
}

/** Abre un sobre con la passphrase. Lanza si la passphrase no es la correcta. */
export async function openVault(envelope: VaultEnvelope, passphrase: string): Promise<string> {
  const salt = fromB64(envelope.salt);
  const nonce = fromB64(envelope.nonce);
  const key = await deriveKey(passphrase, salt);
  try {
    const plain = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: nonce as unknown as BufferSource },
      key,
      fromB64(envelope.ciphertext) as unknown as BufferSource,
    );
    return new TextDecoder().decode(plain);
  } catch {
    throw new Error("La contraseña no abre este sobre.");
  }
}

/* ---------------------------- API ---------------------------- */

export async function uploadVault(plain: string, passphrase: string): Promise<{ id: string; expiresAt: string }> {
  const envelope = await sealVault(plain, passphrase);
  const res = await fetch("/api/vault", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(envelope),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `La bóveda rechazó la copia (código ${res.status}).`);
  }
  return (await res.json()) as { id: string; expiresAt: string };
}

export async function downloadVault(id: string, passphrase: string): Promise<string> {
  const res = await fetch(`/api/vault?id=${encodeURIComponent(id)}`);
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `La bóveda no entregó el sobre (código ${res.status}).`);
  }
  const envelope = (await res.json()) as VaultEnvelope;
  return openVault(envelope, passphrase);
}
