# 02 · Cuentas y autenticación

## 1. Modelo de cuenta (datos mínimos)

| Campo | Obligatorio | Notas |
|---|---|---|
| `email` | ✅ | lowercased+trimmed; único. Único dato personal. Para login y recuperación |
| `password` | ✅ (o OAuth luego) | hash scrypt (§3) |
| `displayName` | ✅ | pseudónimo libre, no único (lo único es el handle) |
| `handle` | ✅ autogenerado | `slug(displayName)-####` único; lo ven otros jugadores, nunca el email |
| `farocode` | ✅ autogenerado | `ALBO-3721` estilo; para añadir amigos (07-social.md) |
| `avatar`, `banner`, `bio`, `featuredBadge` | ⭕ | ya existen en `PlayerProfile`; se copian a `public_profiles` al publicar |
| `role` | interno | `USER \| MODERATOR \| ADMIN` |
| `status` | interno | `ACTIVE \| SUSPENDED \| DELETED` |

**Sin fecha de nacimiento, teléfono, contacto ni ubicación.** Los controles
de menores se hacen a nivel de *feature* (sin chat libre, UGC moderado,
modo aula por códigos), no interrogando al usuario.

## 2. Contraseña: scrypt de `node:crypto` (cero dependencias)

Parámetros según OWASP (interactivo): `N=2^17 (131072), r=8, p=1, keylen=32`.

```ts
// src/server/auth/password.ts
import { randomBytes, scrypt as _scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
const scrypt = promisify(_scrypt) as (p: string, s: Buffer, k: number) => Promise<Buffer>;

const N = 1 << 17, R = 8, P = 1, KEYLEN = 32;

export async function hashPassword(pw: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await scryptWithParams(pw, salt);
  return `scrypt$${N}$${R}$${P}$${salt.toString("base64")}$${key.toString("base64")}`;
}

export async function verifyPassword(pw: string, stored: string): Promise<boolean> {
  const [alg, n, r, p, saltB64, keyB64] = stored.split("$");
  if (alg !== "scrypt") return false;
  const key = await scryptWithParams(pw, Buffer.from(saltB64, "base64"), Number(n), Number(r), Number(p));
  return timingSafeEqual(key, Buffer.from(keyB64, "base64"));
}
```

Política: mínimo 8 caracteres; sin reglas de composición; comprobación contra
las 10k contraseñas filtradas más comunes (lista embebida, ~40 KB).

## 3. Sesiones (tokens opacos, sin JWT)

- Login correcto → `token = base64url(random(32))`.
- DB guarda `sha256(token)`; la cookie guarda el token.
- Cookie: `verbalia_session`, `httpOnly, Secure, SameSite=Lax, Max-Age=2592000`.
- **Rolling**: si a la sesión le quedan < 7 días, al autenticar se extiende.
- `lastSeenAt` por sesión → sirve para "faros encendidos" (presencia, 07).
- Endpoints extra: `GET /auth/sessions` y `DELETE /auth/sessions/:id`
  ("cierra la sesión de tu tablet").
- Login exitoso tras un reset de contraseña → invalida todas las demás
  sesiones del usuario.

Guard reutilizable:

```ts
// src/server/auth/guard.ts
export async function requireUser(req: NextRequest) {
  const token = req.cookies.get("verbalia_session")?.value;
  const session = token ? await findSession(token) : null;   // + expiry check
  if (!session || session.user.status !== "ACTIVE") throw new HttpError(401, "unauthorized");
  return session.user;
}
```

## 4. Tokens de un solo uso (verificar email, reset, cambio de email)

Tabla `VerificationToken(type, tokenHash, expiresAt)`:

| Tipo | Caducidad | Uso |
|---|---|---|
| `EMAIL_VERIFY` | 48 h | tras registro o cambio de email |
| `PASSWORD_RESET` | 1 h | flujo "olvidé mi contraseña" |
| `EMAIL_CHANGE` | 48 h | confirma el NUEVO email antes de sustituir |

El token va en la URL `https://app/verificar?token=...` → la pantalla lo
postea a `POST /auth/verify`. Un solo uso: se borra al consumirlo.

## 5. Flujos completos

### 5.1 Registro
```
Cliente                          Servidor
──────                           ────────
POST /auth/register              rate-limit (5/h por IP)
{email, password, displayName}   validar zod + email normalizado
                                 ¿email existe? → respuesta GENÉRICA OK (anti-enumeración),
                                   pero enviar email "alguien intentó registrarse" al dueño
                                 crear User(status ACTIVE, emailVerifiedAt=null)
                                 crear VerificationToken + email
                                 crear Session + cookie
                             ◄── 201 {user, needsVerification: true}
```
El juego funciona desde el minuto 0 sin verificar; ciertas cosas (UGC,
participar en torneos con premio) exigen email verificado.

### 5.2 Login
`POST /auth/login {email, password}` → rate-limit 10/15min por IP y por
cuenta; fallo genérico "credenciales inválidas" (mismo mensaje y mismo
tiempo de respuesta si el email no existe — comparar contra hash dummy).

### 5.3 Olvidé mi contraseña
`POST /auth/password/forgot {email}` → siempre responde OK (anti-enumeración);
si existe, email con token 1 h. `POST /auth/password/reset {token, password}`
→ invalida TODAS las sesiones, crea una nueva.

### 5.4 Verificación de email / cambio de email
Cambio: `POST /auth/email {newEmail, password}` → token `EMAIL_CHANGE` al
nuevo email → al confirmar se sustituye y se re-verifica.

### 5.5 Borrado de cuenta (GDPR "al derecho")
`DELETE /auth/account {password}` → transacción:
1. `User.status = DELETED`, `email = anon-<hash8>@deleted.local`,
   `displayName = "Navegante fantasma"`, bio/avatar/banner vacíos.
2. `ProgressState` borrado. Transcripciones (`transcript Json`) borradas.
3. Filas agregadas (StatDaily, entradas de rankings, duelos) se conservan
   **como números huérfanos** (el ranking no se rompe) apuntando a un
   usuario anonimizado.
4. `TintaLedger` se conserva (es económico agregado) sin referencias visibles.
5. Email de despedida con enlace "arrepentirse 30 días" (restauración).

## 6. OAuth (Ola 2, opcional)

Google únicamente, con `@auth/core` a modo de librería o flow manual
(code exchange + fetch). `User.passwordHash` nullable admite cuentas
"solo Google"; se puede añadir contraseña después con `POST /auth/password`
(validando que no haya ya una).

## 7. Migración de jugadores locales existentes (automática · Ola 1.1)

Ya hay jugadores con progreso en IndexedDB. Desde la Ola 1.1 la unión es
**automática y silenciosa** (`syncOnLogin`, 06-sync §5): al iniciar sesión
(registro, login o apertura con cookie válida), bitácora local y barco se
unen solos, sin preguntar nada y sin botones («Subir y unir» y «Empezar de
cero» ya no existen):

```
Login/registro/apertura ──► syncOnLogin(): GET /progress
   barco vacío   + bitácora  → POST /progress/import (sube en silencio)
   barco vacío   + sin bitácora → nada (la cuenta nueva no se ensucia)
   barco con datos + bitácora  → POST /progress/import (une y adopta)
   barco con datos + sin bitácora → adopta el remoto tal cual
   base ya reconocida → fullSync normal
        │
        └─► El servidor devuelve el estado unido (merge por secciones, 06)
            → el cliente lo adopta y reconoce su updatedAt como base.
```

- La unión es **aditiva** (nunca baja XP, ni pierde logros, ni tinta: la
  tinta local entra como entrada `MIGRATION` del ledger; con el fallback
  `PUT` para correos sin verificar también).
- Si la cuenta traía progreso y el dispositivo estaba limpio, la app
  aterriza directo en el mapa (sin onboarding); si la cuenta es nueva,
  el usuario va al onboarding con normalidad. **Nunca se exige cuenta
  para jugar**: «Entrar sin cuenta» sigue siendo el camino principal.
- `PlayerProfile` local se conserva como perfil visible — el usuario no
  pierde su identidad en el juego, solo ahora además puede iniciar sesión.

## 8. Superficie de endpoints (resumen; contratos completos en 04-api.md)

| Método | Ruta | Nota |
|---|---|---|
| POST | `/auth/register` | anti-enumeración |
| POST | `/auth/login` | rate-limit doble |
| POST | `/auth/logout` | borra sesión actual |
| GET | `/auth/me` | perfil + flags (verified, role) |
| POST | `/auth/verify` · `/auth/resend-verification` | tokens |
| POST | `/auth/password/forgot` · `/auth/password/reset` · `/auth/password/change` | |
| POST | `/auth/email` | cambio de email |
| GET/DELETE | `/auth/sessions` · `/auth/sessions/:id` | gestión de dispositivos |
| DELETE | `/auth/account` | anonimización |
