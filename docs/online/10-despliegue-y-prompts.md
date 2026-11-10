# 10 · Despliegue en Vercel + Neon · Guía para no-programadores y prompts listos

> Esta guía responde a una sola pregunta: **¿qué hace tu IA y qué haces tú?**
> Respuesta corta: la IA hace TODO el código y la configuración (~80 % del
> trabajo). Tú solo haces lo que exige tocar webs con tu correo y tus
> contraseñas: crear cuentas, copiar/pegar 2 claves y apretar botones
> (~20 %, sin programar nada).

---

## 1. Quién hace qué

| Lo hace tu IA (sola) | Lo haces TÚ (única forma) |
|---|---|
| Arreglar el build para Vercel | Crear cuenta en **GitHub** y subir el proyecto |
| Crear `.gitignore` (crítico: tu repo no lo tiene) | Crear cuenta en **Vercel** y pulsar "Import project" → "Deploy" |
| Todo el código de cuentas, sync, base de datos | Crear cuenta en **Neon** y copiar la "Connection string" |
| Correr migraciones, tests, lint | Pegar esa clave en Vercel → Environment Variables |
| Escribir la documentación de cada paso | Abrir la URL y probar el juego (reportar lo que falle) |
| Preparar prompts y commits | Crear cuenta en **Resend** (emails) cuando toque la Ola 1 |

Tu IA no puede (ni debe) tener tus contraseñas: por eso las cuentas se
crean una vez, a mano, y es literalmente seguir ventanas de registro.

---

## 2. Tus pasos humanos, en orden (≈ 45 min la primera vez)

### Paso 1 · GitHub (la "carpeta" donde vive el código)
1. Entra en **github.com** → Sign up → confirma tu email.
2. Instala **GitHub Desktop** (aplicación visual, sin comandos).
3. `File → Add local repository...` → elige la carpeta de Verbalia.
   - Si pregunta "create a repository here": dale que sí, nombre `verbalia`.
4. ⚠️ **Antes de subir**: pídele a tu IA "crea el .gitignore del proyecto"
   (el PROMPT A lo hace). Sin eso subirías basura y — peor — claves si las
   hubiera. Nunca debe subirse un archivo `.env` a GitHub.
5. `Commit to main` → `Publish repository` (puede ser privado).

### Paso 2 · Vercel (la casa del juego online)
1. **vercel.com** → Sign up → **"Continue with GitHub"**.
2. `Add New... → Project` → importa el repo `verbalia` → **Deploy**.
3. Espera ~2 min. Te da una URL tipo `verbalia-tu-nombre.vercel.app`.
4. Abre esa URL **en tu móvil** y juega una partida. Si funciona, ya tienes
   el juego en internet, gratis, con HTTPS. Ese es tu primer gran hito. 🎉

### Paso 3 · Neon (el "Excel" de cuentas en la nube)
1. **neon.com** → Sign up (con Google o email; **no pide tarjeta**).
2. `Create project` → nombre `verbalia` → región más cercana a tu público.
3. En el dashboard busca **Connection string** y cópialo. Se ve así:
   `postgresql://usuario:clave@ep-algo-123.neon.tech/neondb?sslmode=require`
4. Guárdalo en un bloc de notas privado. **Esa cadena es la llave maestra
   de tu base de datos**: no la publiques, no la mandes a grupos.

### Paso 4 · Conectar todo (cuando tu IA termine la Ola 1)
1. Vercel → tu proyecto → `Settings → Environment Variables`:
   - `DATABASE_URL` = la cadena de Neon
   - `APP_URL` = tu URL de Vercel
2. `Deployments` → los 3 puntitos del último → **Redeploy**.
3. Abre la URL → crea una cuenta de prueba → juega → cierra sesión →
   entra en otro navegador → ¿aparece tu progreso? Si sí: **la Ola 1
   está viva en internet**.

### Paso 5 · Emails (con la Ola 1, 10 min)
1. **resend.com** → cuenta gratis → crea una **API key**.
2. En Vercel → Environment Variables: `RESEND_API_KEY` = la clave,
   `MAIL_FROM` = `Verbalia <onboarding@resend.dev>`.
3. Nota honesta: sin dominio propio, Resend solo puede enviar correos **a
   tu propio email** (modo pruebas). Suficiente para desarrollar. Cuando
   quieras correos a cualquier usuario: comprar un dominio (~10 USD/año)
   y verificarlo en Resend — tu IA te guía en ese momento.

### Paso 6 · Cron externo (con la Ola 2)
1. **cron-job.org** → cuenta gratis → Create cronjob.
2. URL: `https://TU-APP.vercel.app/api/v1/internal/cron/daily-rollover`
   → cada 10 min → añade header `x-cron-secret` con el valor de tu
   variable `CRON_SECRET`. (Tu IA te dará la lista exacta de jobs.)

---

## 3. El bucle de trabajo con tu IA (la regla de oro)

```
1. Pega UN prompt de ola (abajo).               ← IA construye
2. La IA corrige hasta que build + tests pasen. ← IA verifica
3. Tú pruebas en el navegador la lista de
   comprobación que la IA te devuelve.          ← TÚ verificas
4. Algo falla → copia el texto del error
   EXACTO y pégaselo a la IA.                   ← IA repara
5. Commit + push (GitHub Desktop: 2 clics) → Vercel redespliega solo.
```

**Nunca dos olas en un prompt.** El paquete está dividido en olas
precisamente porque un megaprompt produce código roto que nadie sabe
arreglar. Ola verde → siguiente ola.

---

## 4. PROMPT A · "Deja el proyecto listo para Vercel" (cópialo tal cual)

```text
Actúa como desarrollador senior de Next.js 16. Este repositorio es VERBALIA,
un juego de aprendizaje de español (App Router, TypeScript, Tailwind,
shadcn/ui, PWA, juego 100% offline hoy). NO es necesario que me expliques el
juego; conócelo leyendo el código, pero NO cambies ninguna mecánica.

OBJETIVO: dejar el proyecto exactamente igual funcionalmente, pero listo
para desplegar en Vercel conectado a un repositorio de GitHub. No añadas
features nuevas, no toques el juego, no añadas base de datos todavía.

TAREAS:
1. Crea .gitignore correcto para este stack: node_modules, .next, .env,
   .env.local, .env*.local, dev.log, server.log, coverage, .DS_Store,
   *.tsbuildinfo. Verifica que el repo NO tenga secretos ya cometidos.
2. Revisa package.json: el script "build" actual hace `next build && cp -r
   .next/static .next/standalone/...` y "start" usa bun con output
   standalone: eso es para auto-alojamiento. Haz que Vercel funcione sin
   romper el auto-alojamiento: por ejemplo, separa `build` (solo
   `next build`, lo que Vercel necesita) y `build:selfhost` con los cp, y
   documéntalo en un comentario. Verifica que `next build` completa sin
   errores y corrige lo que impida el build (tipos, imports), sin cambiar
   comportamientos de juego.
3. Crea .env.example con variables VACÍAS y comentadas (una línea de
   explicación cada una): DATABASE_URL, APP_URL, RESEND_API_KEY, MAIL_FROM,
   CRON_SECRET.
4. Crea src/app/api/v1/health/route.ts que responde GET con { ok: true,
   version: "0.1.0" } (sin DB aún).
5. Crea DEPLOY.md en español, dirigido a alguien que NO programa: los pasos
   exactos de GitHub Desktop → Vercel (import, deploy, URL) y qué verificar
   en el móvil. Estilo claro, numerado, sin jerga.
6. Corre lint y build; deja todo en verde. NO uses ningún servicio externo.

DEVOLVEME AL FINAL:
a) Lista de archivos creados/modificados con 1 línea de qué cambiaste.
b) Comandos que debo correr (si los hay).
c) La lista de verificación en el navegador para que yo pruebe.
d) Un mensaje de commit sugerido.
```

---

## 5. PROMPT B · "Ola 0 + Ola 1: cuentas y nube" ⚠️ VERSIÓN ORIGINAL — sustituida por la v2 (con Prisma 7) en la sección 5-bis al final del documento. Usa la 5-bis.

> Requisito previo: copia la carpeta `verbalia-online` (este paquete de
> diseño) DENTRO del proyecto, en `docs/online/`. Tu IA necesita leerla.

```text
Eres el desarrollador senior de VERBALIA (Next.js 16, App Router, TS,
Tailwind, shadcn/ui, PWA, Vitest). El juego offline funciona y ya está en
Vercel. Hoy empieza la capa online.

PRIMERO lee y respeta al pie de la letra estos documentos del repo:
- docs/online/README.md          (filosofía de datos y decisiones)
- docs/online/01-arquitectura.md (stack, anti-trampa, cron, seguridad)
- docs/online/02-cuentas-auth.md (auth completa, flujos, anonimización)
- docs/online/04-api.md          (SOLO las secciones: convenciones, auth
  #1-13, progreso #14-18, códigos de error)
- docs/online/06-sync-progreso.md (políticas de mezcla por secciones)
- docs/online/09-integracion.md  (carpetas, cambios en archivos, testing)
- docs/online/schema.prisma      (esquema completo YA validado)

ALCANCE DE ESTA TAREA (Ola 0 + Ola 1 — nada más):
Ola 0: prisma/schema.prisma en el repo (copiado de docs), DATABASE_URL por
env, `prisma migrate dev` inicial, src/server/ratelimit.ts (token bucket en
memoria, estilo del rate limit de la bóveda), logs JSON mínimos,
/api/v1/health con chequeo de DB.
Ola 1: auth completa con scrypt de node:crypto (N=2^17, r=8, p=1, keylen 32,
formato "scrypt$N$r$p$salt$key"), sesiones opacas (token 32 bytes, sha256 en
DB, cookie httpOnly Secure SameSite=Lax 30d rolling), tokens de un solo uso
(EMAIL_VERIFY 48h, PASSWORD_RESET 1h, EMAIL_CHANGE 48h), endpoints auth 1-13
con anti-enumeración exacta de 02-cuentas-auth.md, mailer.ts vía fetch a
Resend (4 plantillas es-ES), guard requireUser, CSRF (exigir
Content-Type: application/json + header x-verbalia-csrf en mutaciones),
services/merge.ts como función PURA con las políticas de la tabla de
06-sync-progreso.md (suma de deltas, max, unión, LWW por tarjeta SRS con
updatedAt nuevo en SrsCard, perfil/settings LWW), endpoints progress 14-18
(incluye /progress/import idempotente), cola de sync en
services/storage.ts (SyncQueueItem, enqueue, drain con backoff), hook en
onSessionComplete que encola, pantalla "Cuenta" dentro de settings
(registro/login/verificar/cambiar contraseña/dispositivos/borrar cuenta con
anonimización), flujo "subir tu progreso local" tras el primer login.

REGLAS INQUEBRANTABLES:
1. Sigue las decisiones de los docs EXACTAMENTE (nombres de cookie, códigos
   de error, tasas de rate limit, formato de errores
   { error: { code, message } }). Si un doc y tu criterio difieren, GANA el doc.
2. Todo lo que calcule merge de estados, XP validado o tinta debe ser
   función pura con tests en tests/ (usa Vitest como el resto del repo).
   Escribe tests/merge.test.ts con al menos 10 escenarios de la vida real
   (dos dispositivos, offline largo, logro duplicado, tarjeta SRS
   conflictiva, import sobre cuenta existente...).
3. PROHIBIDO implementar rankings, duelos, flotas, fantasmas, UGC ni reto
   diario (son olas siguientes). PROHIBIDO romper el modo offline: sin
   sesión, el juego debe funcionar idéntico a hoy, sin errores en consola.
4. El onboarding NO pide cuenta nunca; la cuenta se pide al usar features
   online o desde Ajustes.
5. No instales dependencias nuevas salvo que sea imposible evitarlo
   (scrypt es node:crypto, mail va por fetch a la API de Resend).
6. Al terminar: lint, tests y build EN VERDE; si algo falla, arréglalo tú
   antes de responderme.

DEVOLVEME AL FINAL:
a) Archivos creados/modificados (lista con 1 línea cada uno).
b) Comandos exactos que debo correr (npm/prisma) en orden.
c) Las variables de entorno que debo pegar en Vercel (nombres y de dónde
   salen los valores), y qué hacer para redesplegar.
d) Guía de prueba en el navegador paso a paso para no-programador:
   registrar 2 cuentas, jugar, verificar que el progreso se sincroniza
   entre un navegador y otro, recuperar contraseña con el email de prueba.
e) Qué va a fallar de forma esperada (p. ej. emails solo a mi correo por
   el modo sandbox de Resend) para que no me asuste.
f) Mensaje de commit sugerido.
```

---

## 6. Tu lista de verificación tras el PROMPT B (la prueba del algodón)

Marca todo antes de pasar a la Ola 2:

- [ ] En la URL de Vercel: registro con un email tuyo → llega email de verificación → verifico.
- [ ] Juego una sesión → cierro sesión → vuelvo a entrar → progreso intacto.
- [ ] Abro la app en OTRO navegador/dispositivo → entro con la misma cuenta → el progreso está.
- [ ] "Olvidé mi contraseña" → llega email → la cambio → entro con la nueva.
- [ ] Sin cuenta / sin sesión: el juego funciona igual que siempre, sin errores.
- [ ] En Neon (dashboard) veo que existen tablas y filas (el "Excel" se está llenando).
- [ ] Borro una cuenta de prueba → ya no puedo entrar → los datos quedaron anonimizados.

Si las 7 casillas están marcadas: **tienes Verbalia con cuentas y nube,
en producción, gratis**. Y recién ahí pedimos a la IA la Ola 2 (reto
diario, rankings y tinta server).

---

## 5-bis. PROMPT B · VERSIÓN FINAL (v2) — adaptada a Prisma 7 y al entorno real del repo

> Contexto real ya confirmado: proyecto Neon `round-mouse-35849092` enlazado,
> `neon.ts` creado, `.env.local` con `DATABASE_URL`, `.gitignore` cubre `.env*`,
> **Prisma 7.10.1 + @prisma/adapter-pg + prisma.config.ts + schema mínimo sin
> modelos**. Este prompt reemplaza por completo al de la sección 5.

```text
Eres el desarrollador senior de VERBALIA (Next.js 16, App Router, TypeScript,
Tailwind, shadcn/ui, PWA, Vitest). El juego offline funciona y ya está
desplegado en Vercel. Hoy empieza la capa online: esta tarea es SOLO la
Ola 0 + Ola 1 (infraestructura + cuentas + sincronización de progreso).

══════════ 0. ESTADO DEL ENTORNO (ya hecho — NO lo repitas) ══════════
- Neon enlazado: proyecto round-mouse-35849092, branch production, neon.ts.
- .env.local ya contiene DATABASE_URL. .gitignore ya cubre .env* y .neon.
- Prisma 7.10.1 + @prisma/adapter-pg + prisma.config.ts instalados.
- prisma/schema.prisma actual es MÍNIMO (sin modelos): lo sustituirás.
- Si alguna operación volviera a pedir autenticación de Neon, NO uses ninguna
  clave anterior: pídeme crear una API key NUEVA en console.neon.tech → API
  Keys. Nunca inventes ni reutilices claves.

══════════ 1. LEE PRIMERO — Y RESPÉTALOS AL PIE DE LA LETRA ══════════
- docs/online/README.md             (filosofía de datos y decisiones)
- docs/online/01-arquitectura.md    (stack, anti-trampa, cron, seguridad)
- docs/online/02-cuentas-auth.md    (auth completa: flujos, tokens, borrado)
- docs/online/04-api.md             (SOLO: convenciones §1, auth #1–13,
                                     progreso #14–18, códigos de error §4)
- docs/online/06-sync-progreso.md   (políticas de mezcla por secciones)
- docs/online/09-integracion.md     (carpetas, cambios en archivos, testing)
- docs/online/schema.prisma         (esquema completo ya validado)
Regla jerárquica: si un documento y tu criterio difieren, GANA el documento.
Si algo es genuinamente imposible de implementar tal como está escrito,
DETENTE y pregúntame antes de improvisar.

══════════ 2. BASE DE DATOS — Prisma 7 (compatibilidad) ══════════
- Sustituye el schema mínimo por el COMPLETO de docs/online/schema.prisma,
  adaptando ÚNICAMENTE la cabecera a Prisma 7: generator "prisma-client"
  (con output en src/generated/prisma) y datasource url = env("DATABASE_URL").
- Todos los MODELOS, ENUMS, @@unique, @@index y relaciones deben quedar
  EXACTOS al documento: ni un nombre de tabla, campo, tipo ni relación
  distinto.
- Cliente: centraliza en src/lib/db.ts un singleton PrismaClient con el
  adapter @prisma/adapter-pg (patrón global-cached para dev de Next.js).
- Ejecuta la migración inicial contra el branch production de Neon y verifica
  (query SQL o dashboard) que las tablas existen. Reporta el nombre de la
  migración creada.

══════════ 3. OLA 0 · INFRAESTRUCTURA ══════════
- src/server/ratelimit.ts: token bucket en memoria por (ruta, userId|IP),
  con cabeceras X-RateLimit-Remaining; patrón y tasas del documento 04.
- Amplía /api/v1/health: chequeo real de DB (SELECT 1) → { ok, db: true }.
- Logs JSON mínimos por request: { route, userId, ms, status }.

══════════ 4. OLA 1 · CUENTAS Y SYNC (exactamente los docs) ══════════
4.1 Auth (documento 02):
  - scrypt de node:crypto (N=2^17, r=8, p=1, keylen 32, formato
    "scrypt$N$r$p$salt$key"), checker de 10k contraseñas comunes embebido.
  - Sesiones opacas: token 32 bytes base64url, sha256 en DB, cookie
    "verbalia_session" (httpOnly, Secure, SameSite=Lax, 30 días rolling,
    extensión si quedan <7), lastSeenAt para presencia futura.
  - Tokens de un solo uso: EMAIL_VERIFY 48h, PASSWORD_RESET 1h,
    EMAIL_CHANGE 48h; un solo uso real (se borran al consumir).
  - Endpoints auth #1–13 de 04-api.md, con anti-enumeración EXACTA:
    registro con email existente responde genérico OK y avisa al dueño;
    login con mensaje/tiempo idénticos si el email no existe (hash dummy).
  - Borrado de cuenta con anonimización transaccional (02 §5.5) y
    "cerrar sesión en otros dispositivos" (GET/DELETE /auth/sessions).
  - Roles USER/MODERATOR/ADMIN y guard requireUser()/requireRole().
4.2 Mailer: src/server/mailer.ts vía fetch a la API de Resend, 4 plantillas
  es-ES (verificar email, bienvenida, reset, cambio email), MAIL_FROM de env.
4.3 Seguridad transversal: en middleware o helper, exigir en TODA mutación
  /api/v1 Content-Type: application/json + header x-verbalia-csrf.
4.4 Sync (documento 06):
  - src/server/services/merge.ts como FUNCIÓN PURA exportada mergePayload()
    con las políticas de la tabla: XP y contadores suma de deltas / max,
    bestComboEver y streak.best max, logros unión con timestamp mínimo,
    SRS LWW por tarjeta (añade updatedAt a SrsCard en types), wallet tinta
    server-authoritative (TintaLedger), misiones LWW por clave, errores y
    seenExercises unión acotada, profile/settings LWW por updatedAt.
  - Endpoints progreso #14–18 de 04-api.md, incluido /progress/import
    idempotente (una vez, RL 3/día, sin otorgar XP de ranking) y
    /progress/events con validación de transcripción (suelos de tiempo,
    techos diarios de freeplay; el replay completo llega en la Ola 2).
  - TintaLedger: toda recompensa con refId idempotente @@unique([userId, refId]).
4.5 Cola offline (storage.ts): SyncQueueItem { id, kind, body, attempts,
  createdAt }, enqueue/drain con backoff exponencial 30s→2h máx 12 intentos;
  hook en onSessionComplete del game-store que encola events + marca dirty;
  drain al recuperar red (integración con pwa.tsx existente).
4.6 UI: pantalla "Cuenta" accesible desde Ajustes: registro, login,
  verificar email, cambiar contraseña, dispositivos activos, borrar cuenta;
  y el flujo post-primer-login "Tu bitácora ya existe: ¿subimos tu
  progreso?" con merge y adopción del resultado. NUNCA en el onboarding.
  Sin sesión y sin red, la app se comporta IDÉNTICA a hoy, sin errores.

══════════ 5. REGLAS INQUEBRANTABLES ══════════
1. PROHIBIDO implementar: rankings, duelos, fantasmas, flotas, UGC, reto
   diario, SSE/tiempo real (son olas siguientes).
2. PROHIBIDO romper el juego offline existente: es el criterio de aceptación
   más importante junto a los tests.
3. Todo lo que decida merge de estados, XP validado o tinta = función pura
   con tests en tests/merge.test.ts (mín. 10 escenarios: dos dispositivos,
   offline largo, logro duplicado, tarjeta SRS conflictiva, import sobre
   cuenta existente, wallet en conflicto, misiones de dos días...).
4. Dependencias nuevas: solo si es imposible evitarlo (scrypt es
   node:crypto; mail es fetch). Prisma 7 ya está.
5. Códigos de error EXACTOS de 04-api.md §4 y formato { error: { code, message } }.
6. Rate limits EXACTOS de la tabla de 04-api.md para las rutas de esta ola.

══════════ 6. ANTES DE RESPONDERME ══════════
- lint, tests y `next build` EN VERDE. Si algo falla, arréglalo tú.
DEVUÉLVEME:
a) Archivos creados/modificados (1 línea cada uno).
b) Comandos exactos que debo correr (npm/prisma) en orden.
c) Variables de entorno que debo pegar en Vercel (nombres, valores de dónde
   salen) y cómo redesplegar.
d) Guía de prueba en navegador paso a paso para no-programador: registrar 2
   cuentas, verificar email (modo sandbox de Resend), jugar, comprobar sync
   entre dos navegadores, recuperar contraseña, borrar cuenta de prueba.
e) Qué fallará de forma ESPERADA (p. ej. emails solo a mi correo por sandbox
   de Resend) para que no me asuste.
f) Mensaje de commit sugerido.
```

