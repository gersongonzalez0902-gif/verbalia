# VERBALIA ONLINE · Paquete de diseño técnico

> Diseño completo de la capa **online, comunitaria y de amigos** de Verbalia,
> listo para pasar a código. Incluye modelo de datos, contratos de API,
> protocolos de tiempo real, seguridad, moderación y plan de integración
> con el repositorio actual.

---

## 1. Nueva filosofía de datos (cambio respecto a la v1 offline)

Se abandona la identidad cero. Verbalia tendrá **cuentas reales**, pero con un
modelo de datos *honesto y mínimo*: guardamos lo imprescindible para que el
producto funcione, y nada más.

**Lo que SÍ guardamos y por qué:**

| Dato | Por qué | Nota |
|---|---|---|
| Email | login, recuperación, verificación | único dato "personal" obligatorio |
| Nombre visible (displayName) | mostrarte en rankings, duelos, flotas | pseudónimo, libre |
| Handle único (`marina-3721`) | identificación estable sin exponer el email | autogenerado, editable |
| Hash de contraseña (scrypt) | login | nunca en claro |
| Progreso de juego (payload) | sincronización multi-dispositivo | mismo JSON que hoy va a IndexedDB |
| Métricas agregadas por día (StatDaily) | rankings, misiones de flota, anti-trampa | contadores numéricos |
| Contenido que tú publicas (UGC) | La Forja Comunitaria | pasa por moderación |

**Lo que NO haremos (compromisos de producto):**

- ❌ Vender o alquilar datos. ❌ Publicidad. ❌ Trackers de terceros ni analytics externos.
- ❌ Pedir teléfono, fecha de nacimiento completa, contactos o ubicación.
- ❌ Perfiles públicos indexables por buscadores (noindex en páginas sociales).
- ❌ Chat libre (comunicación por frases rápidas en español + tablones de flota moderados).
- ✅ Exportación completa de datos y **borrado de cuenta con anonimización** (2 toques).

## 2. Decisiones técnicas clave (resumen ejecutivo)

1. **Monolito Next.js extendido**: la app actual (Next 16 + App Router) añade
   `/api/v1/*` con route handlers. Sin backends paralelos ni nuevos lenguajes.
2. **Auth propia, sin dependencias mágicas**: email + contraseña con
   `scrypt` de `node:crypto` (cero dependencias nativas), sesiones opacas en
   cookie httpOnly. OAuth Google opcional en Ola 2.
3. **PostgreSQL + Prisma** (ya está instalado Prisma). Postgres gestionado
   (Neon o similar). Esquema completo en `schema.prisma`.
4. **Tiempo real con SSE nativo** (`ReadableStream` en route handlers): pasa el
   CSP actual (`connect-src 'self'`) sin tocarlo, funciona en un solo proceso.
   WebSocket/Socket.io NO es necesario para los duelos planteados.
5. **Anti-trampa por repetición**: los motores puros de `src/engine` se
   ejecutan también en el servidor. El servidor emite la **semilla**, el
   cliente envía la **transcripción** de respuestas y el servidor la
   **re-simula** con el mismo motor para calcular la puntuación oficial.
6. **Sincronización por secciones con políticas de mezcla** (suma / máximo /
   unión / último-escribe-gana), no un blob que se pisa entre dispositivos.
7. **Tinta server-authoritative** una vez hay cuenta: libro mayor
   (`TintaLedger`) con entradas idempotentes.
8. **UGC con validación zod reutilizando los esquemas de ejercicios** y cola
   de moderación obligatoria antes de publicar.
9. **Escuela/familia como ciudadano de primera**: Flotas con código, panel
   agregado para el docente, sin datos personales de menores.
10. **El juego base jamás requiere red**: todo lo online es un extra encima
    del bucle local que ya existe.

## 3. Mapa de documentos

| Archivo | Contenido |
|---|---|
| `01-arquitectura.md` | Stack, componentes, tiempo real, anti-trampa, despliegue, costes |
| `02-cuentas-auth.md` | Modelo de cuenta, contraseñas, sesiones, flujos completos, migración local |
| `03-modelo-datos.md` | Recorrido por las tablas, índices, retención, diagrama ER |
| `schema.prisma` | **Esquema Prisma completo, listo para copiar al repo** |
| `04-api.md` | Contratos REST `/api/v1`: tabla maestra + ejemplos + errores + rate limits |
| `05-tiempo-real.md` | Protocolo SSE, duelos en vivo (quiz y ajedrez), reconexión, escalado |
| `06-sync-progreso.md` | Mezcla de estados, tinta server, cola offline, importación local |
| `07-social.md` | Amigos, faros, duelos, fantasmas, flotas, aula, reto del día, torneos |
| `08-ugc-moderacion.md` | Forja Comunitaria, validación, moderación, reportes, menores |
| `09-integracion.md` | Cambios archivo a archivo en el repo, deps, env, plan de tareas por olas |

## 4. Roadmap por olas

| Ola | Entrega | Depende de | Esfuerzo |
|---|---|---|---|
| **O0 · Infra** | Prisma + Postgres, esqueleto `/api/v1`, CI, env | — | S |
| **O1 · Cuentas y sync** | Registro/login, `ProgressState`, cola offline, import local | O0 | M |
| **O2 · Reto diario + rankings** | `DailyChallenge`, `StatDaily`, rankings semanales, tinta server | O1 | M |
| **O3 · Amigos y duelos asíncronos** | Códigos de faro, `Friendship`, `Duel` async, fantasmas | O1 | M |
| **O4 · Flotas y aula** | `Fleet`, misiones co-op, tablón, panel docente | O2, O3 | M |
| **O5 · Tiempo real** | SSE, duelos en vivo quiz + ajedrez, presencia | O3 | L |
| **O6 · Forja y moderación** | UGC, cola de moderación, reportes, tándem (v2) | O1–O4 | L |

Cada ola deja el sistema **utilizable en producción**; nada es un borrador
interminable. Detalle de tareas por ola en `09-integracion.md`.

## 5. Para empezar mañana mismo

```bash
# 1) Postgres local (o Neon free tier) y variables de entorno
cp .env.example .env            # ver 09-integracion.md

# 2) Esquema
cp schema.prisma prisma/schema.prisma
npx prisma migrate dev --name init

# 3) Primer vertical (O1): registro + login + subir/bajar progreso
#    Endpoints: POST /api/v1/auth/register, /auth/login, GET/PUT /api/v1/progress
```
