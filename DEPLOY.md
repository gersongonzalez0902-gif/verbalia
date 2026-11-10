# 🚀 Publicar VerbalIA en internet — guía paso a paso (sin programar)

**La meta:** que VerbalIA tenga una dirección propia en internet, tipo
`https://verbalia.vercel.app`, que puedas abrir desde cualquier móvil o
computadora, instalar como app y usar incluso sin conexión.

**La idea en 30 segundos:**

| Pieza | Qué es (en cristiano) | Para qué la usamos |
|---|---|---|
| **GitHub** | Una nube para guardar código, con su historia | Guardar una copia del juego en internet |
| **GitHub Desktop** | Un programa con botones para usar GitHub sin escribir comandos | Subir el proyecto desde tu computadora |
| **Vercel** | Una nube que toma el código de GitHub y lo convierte en una página web funcionando | Que el juego se pueda abrir desde una URL |

**Regla de oro:** solo vas a *pulsar botones* y *rellenar casillas*. No
instalas Node, ni Bun, ni nada raro. Vercel hace la instalación técnica por ti.

Tiempo total: ~20 minutos · Costo: $0 (todo con planes gratuitos).

---

## 0. Antes de empezar: dos cuentas y un programa

### 0.1 Crear tu cuenta de GitHub (si no la tienes)

1. Abre el navegador y entra en `https://github.com`.
2. Pulsa el botón **Sign up** (arriba a la derecha).
3. Escribe tu **correo electrónico** → **Continue**.
4. Crea una **contraseña** (guárdala bien) → **Continue**.
5. Elige tu **nombre de usuario** (será público; por ejemplo `mariaperez`) → **Continue**.
6. GitHub te enviará un **código de verificación al correo**: ábrelo, cópialo
   y pégalo en la página de GitHub.
7. Listo: ya tienes cuenta GitHub.

### 0.2 Instalar GitHub Desktop (el programa con botones)

1. Entra en `https://desktop.github.com`.
2. Pulsa **Download for Windows** (o **Download for macOS**, según tu equipo).
3. Instala el archivo descargado (siguiente → siguiente → instalar, como
   cualquier programa).
4. Ábrelo. Te preguntará **«Welcome to GitHub Desktop»**:
   - Pulsa **Sign in to GitHub.com**.
   - Se abre el navegador → inicia sesión con la cuenta del paso 0.1 →
     pulsa **Authorize github-desktop** (autorizar) → vuelve al programa.
   - Si te pregunta tu nombre y correo, deja los que propone → **Finish**.

✅ **Comprobación:** ves la ventana de GitHub Desktop con tu foto/nombre de
usuario arriba a la derecha.

### 0.3 La cuenta de Vercel se crea en el paso 4 (no la crees ahora,
usaremos tu cuenta de GitHub para entrar).

---

## 1. Descomprimir el proyecto en tu computadora

El proyecto te llega como un archivo `verbalia-FECHA.zip` (te lo entregué en
el chat). Ese zip contiene **todo**: el juego completo, los sonidos, y la
historia del proyecto (dentro hay una carpeta invisible llamada `.git` — no
hay que tocarla ni borrarla, el programa la necesita).

1. **Pasa el zip a tu computadora** (descárgalo del chat, o pásalo por USB/
   correo/cómo puedas) y déjalo, por ejemplo, en **Descargas** o **Escritorio**.
2. **Windows:** clic derecho sobre el zip → **«Extraer todo…»** → en la
   ventana que sale pulsa **Extraer**.
   **Mac:** doble clic sobre el zip y ya.
3. Se crea una carpeta con el nombre del zip (algo como
   `verbalia-2026-11-10`). Si quieres, **renómbrala a `verbalia`** (clic
   derecho → Renombrar). Más corto y bonito.
4. **Abre la carpeta** y comprueba que ves archivos como `package.json`,
   `README.md`, `DEPLOY.md` y las carpetas `src` y `public`.
   ⚠️ Si no ves nada de eso, la extracción quedó a medias: borra la carpeta
   y repite el paso 2 extrayendo **todo** el zip.

✅ **Comprobación:** tienes una carpeta (p. ej. `Documentos\verbalia`) que
contiene `package.json`. **Apunta o recuerda dónde quedó esa carpeta** — la
vas a necesitar en el paso 2.

---

## 2. Subir el proyecto a GitHub (con GitHub Desktop)

> Un «repositorio» (o repo) es simplemente la carpeta del proyecto guardada
> en tu GitHub, con su historia. Lo vamos a *publicar* ahí.

1. Abre **GitHub Desktop**.
2. En el menú de arriba a la izquierda: **File → Add local repository…**
   (en español: **Archivo → Añadir repositorio local…**).
3. En la ventana que se abre, pulsa el botón **Choose…** (Elegir…) y navega
   hasta **la carpeta que descomprimiste** (la que contiene `package.json`).
   Selecciónala (no tienes que entrar dentro: basta con marcarla) →
   **Select Folder** / **Abrir**.
4. GitHub Desktop mostrará el proyecto y la palabra **main** arriba
   (es el nombre de la rama principal). Si arriba a la derecha ves el botón
   azul **Publish repository**, vas perfecto.
5. Pulsa **Publish repository** (Publicar repositorio). Se abre una ventanita:
   - **Name:** `verbalia` (o el nombre que prefieras; si te dice que ya
     existe, pon otro como `verbalia-juego`).
   - **Description:** puedes dejarla vacía.
   - Deja **marcada** la casilla **«Keep this code private»** (mantener este
     código privado) — recomendado: solo tú lo ves, y Vercel funciona igual.
6. Pulsa el botón **Publish repository** de esa ventanita y espera unos
   segundos a que suba (con los sonidos y datos son ~40 MB).

✅ **Comprobación (la buena):**
- El botón de arriba a la derecha cambió a **Fetch origin** (ya no dice
  Publish) y abajo dice **No local changes**.
- Abre `https://github.com` en el navegador, entra a tu perfil → pestaña
  **Repositories** → ahí aparece **verbalia**. 

> ℹ️ Solo se sube la rama `main` (el juego). Las ramas de respaldo viejas se
> quedan en el zip, que es donde deben estar.

---

## 3. Crear la cuenta de Vercel (usando tu GitHub)

1. Entra en `https://vercel.com`.
2. Pulsa **Sign Up** (arriba a la derecha).
3. Elige **Continue with GitHub** (continuar con GitHub).
4. El navegador te pide permiso para conectar GitHub con Vercel:
   pulsa **Authorize Vercel**.
5. Puede aparecer una pantalla «Install Vercel» pidiendo acceso a tus
   repositorios: deja **All repositories** (todos) y pulsa **Install**.
   (Es la llavecita para que Vercel pueda leer tu repo y publicarlo.)

✅ **Comprobación:** estás dentro de Vercel y ves el panel principal
(dashboard) con un botón negro **Add New…** arriba a la derecha.

---

## 4. Publicar el juego en Vercel (el momento mágico)

1. En el panel de Vercel, arriba a la derecha: **Add New… → Project**.
2. En la lista **«Import Git Repository»** aparece tu repo **verbalia**.
   Pulsa el botón **Import** de su fila.
   *(Si no aparece: pulsa **Adjust GitHub App Permissions** y concede acceso,
   luego vuelve y recarga.)*
3. Ahora sale la pantalla de configuración **Configure Project**. **Déjala
   casi como está** — Vercel ya detectó todo:
   - **Project Name:** `verbalia` (puedes dejarlo; será parte de tu URL).
   - **Framework Preset:** dice **Next.js** (lo detectó solo — no toques).
   - **Root Directory, Build Command, Install Command:** no toques nada.
   - **Environment Variables:** **no pongas nada** — hoy el juego no usa
     secretos; la plantilla `.env.example` está vacía a propósito. Cuando
     lleguen las funciones online, esas variables reservadas se rellenarán
     aquí mismo (nunca en el código).
4. Pulsa el botón negro **Deploy**.
5. Verás una pantalla de progreso (círculos: Building… Initializing…
   Running checks…). **Espera 1–2 minutos** y no cierres la pestaña.
6. 🎉 Aparece **«Congratulations»** con confeti digital. Pulsa
   **Continue to Dashboard**.

✅ **Comprobación:**
- En el panel del proyecto, arriba a la derecha, hay un botón **Visit** —
  púlsalo: se abre **tu juego en internet**, con su URL parecida a
  `https://verbalia.vercel.app` (o `verbalia-tunombre.vercel.app`).
- Esa URL es **tu dirección pública, para siempre** (mientras no borres el
  proyecto). La puedes compartir por WhatsApp, ponerla en un QR, lo que sea.
- Prueba el latido del servidor: abre en el navegador
  `https://TU-URL.vercel.app/api/v1/health` → debe verse
  `{"ok":true,"version":"…"}`.

---

## 5. Qué probar en la computadora (~2 min)

Abre tu URL y repasa:

- [ ] Se ve el logo **VERBALIA** con **Léxico**, el búho, y el botón
      **«Comenzar la aventura»**.
- [ ] El onboarding te pregunta nombre, trato, avatar, idioma y nivel, y te
      deja en el mapa de colores.
- [ ] Entras a una región y juegas un minijuego completo hasta el final.
- [ ] Menú **Entrenamientos** → un repaso: la tarjeta se voltea y puedes
      autoevaluarte («Fácil / Bien / Difícil»).
- [ ] Menú **Ajustes** → activa/desactiva el sonido y escucha un clic.
- [ ] Cierras la pestaña y vuelves a abrir la URL: carga al instante
      (el juego queda guardado en el navegador tras la primera visita).

## 6. Qué probar en el móvil (~3 min)

1. Abre la URL en el navegador del móvil (Chrome en Android, Safari en iPhone).
2. Juega un entrenamiento corto, con sonido.
3. **Instálalo como app:**
   - **Android (Chrome):** menú **⋮** (los tres puntos, arriba a la derecha)
     → **«Añadir a pantalla de inicio»** (o «Instalar aplicación») →
     **Añadir/Instalar**.
   - **iPhone (Safari):** botón **Compartir** (el cuadrado con la flecha
     hacia arriba) → baja en la lista → **«Añadir a pantalla de inicio»** →
     **Añadir**.
   Se crea un icono en tu pantalla: al abrirlo, el juego ocupa la pantalla
   completa, sin barra de navegador. Es una app de verdad.
4. **Prueba offline:** activa el **modo avión**, cierra el juego y vuelve a
   abrirlo desde el icono. Debe arrancar y dejarte repasar tarjetas ya vistas
   (todo tu progreso vive en el dispositivo, como siempre).
5. Abre `TU-URL.vercel.app/api/v1/health` también en el móvil (mismo JSON).

---

## 7. Cada vez que el juego se actualice

Hay dos caminos según de dónde venga el cambio:

**A) Cambios hechos en tu propia computadora** (editaste algo, o te entregan
un zip nuevo para reemplazar archivos):

1. Abre GitHub Desktop. Verá los cambios y los listará a la izquierda
   (archivos nuevos/modificados en amarillo y verde).
2. Escribe un mensaje corto en el recuadro que dice **Summary (required)** —
   por ejemplo: `Actualizo sonidos y mapa`.
3. Pulsa el botón azul **Commit to main**.
4. Pulsa el botón **Push origin** (arriba). 
5. Vercel lo detecta solo y vuelve a desplegar (1–2 min). **La URL no cambia.**

**B) Si te entregan una carpeta nueva completa** (otro zip con historia
incluida): lo más fácil es repetir los pasos 1–2 con la carpeta nueva y darle
un nombre distinto de repo (p. ej. `verbalia-v2`), y en Vercel crear el
proyecto de nuevo con esa carpeta. La URL antigua sigue funcionando con la
versión que tenía.

---

## 8. Si algo falla (sospechosos habituales)

| Síntoma | Qué pasa y qué hacer |
|---|---|
| GitHub Desktop dice «This directory does not appear to be a Git repository» | La extracción del zip quedó incompleta y falta la carpeta interna invisible `.git`. Borra la carpeta, repite la extracción extrayendo **todo** el zip y vuelve a añadirla. |
| **Publish** da error o no aparece | Confirma que iniciaste sesión con la cuenta correcta y que no existe ya un repo con ese nombre en tu GitHub (cámbiale el nombre). |
| El repo no aparece en la lista de Vercel | En «Import Git Repository» pulsa **Adjust GitHub App Permissions** → concede acceso al repo → recarga la página. |
| El deploy termina en **ERROR** | Abre el despliegue fallido → pestaña **Building** → mira la **última línea roja**. Casi siempre es un archivo a medias: en GitHub Desktop, confirma qué archivos subió, corrige y repite commit + push. |
| La URL abre en blanco | Espera 1 minuto y recarga: la primera vez el certificado de seguridad tarda en propagarse. |
| El juego no suena en el móvil | Los móviles exigen un primer toque: pulsa cualquier botón del juego una vez. |
| El juego se ve raro/viejo tras un push | Recarga con fuerza: **Ctrl+Shift+R** (Windows) o **Cmd+Shift+R** (Mac). El service worker se actualiza a los segundos. |
| Quieres quitarlo de internet | Vercel → tu proyecto → **Settings** → baja hasta **Delete Project**. Tu juego local no se ve afectado en nada. |

> 🔐 **Nota de seguridad:** en el pasado este proyecto guardó una clave de IA
> en un archivo `.env` que llegó a quedar grabado en el historial de git.
> **El historial ya fue purgado**: ningún commit contiene hoy ese archivo ni
> rastro de sus valores (verificado escaneando los objetos del repositorio),
> y las herramientas que llamaban a APIs de IA se retiraron junto con su
> dependencia. Aun así, **rota o revoca esa clave** en el panel de tu
> proveedor: mientras vivió en commits y copias locales, su exposición pasada
> no puede garantizarse limpia.

---

## 9. La hoja de ruta: por qué este despliegue es solo el primer paso

VerbalIA empieza su vida pública exactamente como es hoy: un juego local que
funciona incluso sin conexión. Pero el plan es que **deje de ser 100 % local**:

1. **Ahora (esta guía):** el juego completo publicado en Vercel, funcionando
   offline en el dispositivo y sin cuentas.
2. **Próximo:** funciones online sobre esta misma base — cuentas y perfiles
   compartidos entre dispositivos, progreso sincronizado y modos con otros
   jugadores. El servidor de Vercel ya queda preparado para eso.
3. **Por eso existen las variables reservadas** en `.env.example`
   (`DATABASE_URL`, `APP_URL`, `RESEND_API_KEY`, `MAIL_FROM`, `CRON_SECRET`):
   son los encajes que usarán las funciones online cuando lleguen. Hasta
   entonces permanecen vacías y no hay que tocar nada.

---

## Notas técnicas rápidas (para curiosos)

- Vercel ejecuta `next build` (el script `build` de `package.json`).
- El auto-alojado propio sigue intacto: `bun run build:selfhost` compila y
  arma la carpeta `.next/standalone`, y `bun run start` la levanta. El script
  `scripts/revive.sh` del servidor propio usa `build:selfhost`.
- `GET /api/v1/health` responde `{"ok":true,"version":"…"}` sin base de datos.
- `.env.example` documenta las variables reservadas para las futuras funciones
  online (todas vacías y comentadas): hoy ninguna es necesaria para jugar ni
  para desplegar.
