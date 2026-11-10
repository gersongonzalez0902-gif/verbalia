# 🚀 Cómo publicar VerbalIA en internet (guía sin programar)

Esta guía te lleva desde el proyecto en tu computadora hasta una dirección
pública tipo `https://verbalia.vercel.app` que puedes abrir en cualquier móvil.

**Dónde está hoy el proyecto:** el juego funciona **100 % local** (offline-first):
el progreso se guarda solo en tu dispositivo y, al publicarlo, Vercel se limita
a repartir los archivos del juego. Esta publicación en internet es **el primer
paso de la hoja de ruta hacia las funciones online**: el juego seguirá
funcionando sin conexión tal como hoy, y sobre esta misma base llegarán
después cuentas, sincronización y modos con otros jugadores. Por eso no se
crea ninguna cuenta todavía.

Tiempo total: ~15 minutos · Costo: $0 (plan gratuito).

---

## 0. Lo que necesitas antes de empezar

| Cosa | Dónde conseguirlo | Precio |
|---|---|---|
| Cuenta de **GitHub** | github.com → *Sign up* | gratis |
| **GitHub Desktop** | desktop.github.com → *Download* | gratis |
| Cuenta de **Vercel** | vercel.com → *Sign up* → «Continue with GitHub» | gratis |

> 🔐 **Antes de subir el código (Paso 1):** en el pasado este proyecto guardó
> una clave de IA en un archivo `.env` que llegó a quedar grabado en el
> historial de git. **El historial ya fue purgado**: ningún commit contiene
> hoy ese archivo ni rastro de sus valores (verificado escaneando los objetos
> del repositorio), y las herramientas que llamaban a APIs de IA se retiraron
> junto con su dependencia. Aun así, **rota o revoca esa clave** en el panel
> de tu proveedor: mientras vivió en commits y copias locales, su exposición
> pasada no puede garantizarse limpia. Este paso es aún más importante ahora
> que el repo será la base de un proyecto con funciones online.

---

## 1. Subir el proyecto a GitHub con GitHub Desktop

1. Abre **GitHub Desktop** e inicia sesión con tu cuenta de GitHub.
2. Menú **File → Add local repository…** → **Choose…** → selecciona la carpeta
   del proyecto (la que contiene `package.json`) → **Add Repository**.
   Como el proyecto ya tiene su historial, GitHub Desktop lo reconocerá tal cual.
3. Arriba, pulsa el botón azul **Publish repository** y verifica:
   - **Name:** `verbalia` (o el nombre que prefieras)
   - Deja marcado **«Keep this code private»** (recomendado: Vercel funciona
     igual de bien con repos privados).
4. Pulsa **Publish repository**. Listo: el código ya vive en tu GitHub.

> ℹ️ GitHub Desktop sube solo la rama `main` (el juego completo). Las ramas de
> respaldo antiguas se quedan en tu computadora, que es donde deben estar.

---

## 2. Desplegar en Vercel (importar y publicar)

1. Entra a **vercel.com** e inicia sesión con **Continue with GitHub**
   (la misma cuenta del paso anterior).
2. En tu panel, arriba a la derecha: **Add New… → Project**.
3. En «Import Git Repository» verás la lista de tus repos. Busca `verbalia`
   y pulsa **Import**.
4. En la pantalla de configuración déjalo casi todo como está:
   - **Framework Preset:** Next.js (lo detecta solo)
   - **Root Directory:** `./` (predeterminado)
   - **Build Command / Install Command:** valores por defecto
   - **Environment Variables:** no pongas ninguna — hoy el juego no usa
     secretos; todo lo de `.env.example` está vacío a propósito. Cuando
     lleguen las funciones online, esas variables reservadas se rellenarán
     aquí mismo (nunca en el código).
5. Pulsa **Deploy** y espera 1–2 minutos (verás el progreso en vivo).
6. Cuando aparezca **«Congratulations»**, pulsa **Visit** o copia tu URL,
   algo como `https://verbalia.vercel.app`. ¡Ya está publicado!

---

## 3. Qué probar en el navegador de la computadora (~2 min)

- [ ] Tu URL abre y se ve el logo **VERBALIA** con **Léxico**, el búho.
- [ ] Si empiezas de cero: el onboarding pregunta nombre, trato, avatar,
      idioma y nivel, y te deja en el mapa de colores.
- [ ] Entra a una región y juega un minijuego completo hasta el final.
- [ ] Menú **Entrenamientos** → abre un repaso: la tarjeta se voltea y
      puedes autoevaluarte («Fácil / Bien / Difícil»).
- [ ] Menú **Ajustes**: activa/desactiva el sonido y escucha un clic.
- [ ] Visita `https://TU-URL.vercel.app/api/v1/health`: debe mostrar
      `{"ok":true,"version":"…"}` — es el latido del servidor.
- [ ] Cierra la pestaña y vuelve a abrir la URL: carga al instante porque
      el juego queda cacheado en el navegador tras la primera visita.

## 4. Qué probar en el móvil (~3 min)

1. Abre la URL en el navegador del móvil.
2. Juega un entrenamiento corto, con sonido.
3. **Instálalo como app:** botón de compartir (el cuadrado con flecha) →
   **«Añadir a pantalla de inicio»** → ábrelo desde el nuevo icono: se ve a
   pantalla completa, sin barra del navegador.
4. **Prueba offline:** activa el modo avión y vuelve a abrir el juego.
   Debería arrancar y dejarte repasar tarjetas ya vistas.
5. Abre `TU-URL.vercel.app/api/v1/health` también en el móvil (mismo JSON).

---

## 5. Después: publicar cambios

Cada vez que cambies algo del juego:

1. **GitHub Desktop** → escribe un mensaje corto en el recuadro de la
   izquierda → **Commit to main**.
2. Pulsa **Push origin**.
3. Vercel lo detecta y vuelve a desplegar solo (1–2 min). La URL no cambia.

## 6. Si algo falla

| Síntoma | Qué hacer |
|---|---|
| **Publish** da error | Revisa haber iniciado sesión con la cuenta correcta y que no exista ya un repo con ese nombre en tu GitHub. |
| Tu repo no aparece en Vercel | En «Import Git Repository» → **Adjust GitHub App Permissions** → dale acceso al repositorio y recarga la lista. |
| El deploy termina en **ERROR** | Abre el despliegue fallido en Vercel → pestaña **Building** → mira la última línea roja. Casi siempre es un archivo a medias: vuelve a GitHub Desktop, confirma que el *commit* incluyó todos los archivos y vuelve a hacer push. |
| La URL abre en blanco | Espera un minuto y recarga: la primera vez el certificado tarda en propagarse. |
| El juego no suena | Los móviles exigen un primer toque: pulsa cualquier botón del juego una vez. |
| Quieres quitarlo de internet | Vercel → tu proyecto → **Settings → Delete**. Tu juego local no se ve afectado en nada. |

---

## 7. La hoja de ruta: por qué este despliegue es solo el primer paso

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
  arma la carpeta `.next/standalone` (con `public/` y los estáticos dentro),
  y `bun run start` la levanta. El script `scripts/revive.sh` del servidor
  propio ahora usa `build:selfhost`.
- `GET /api/v1/health` responde `{"ok":true,"version":"…"}` sin base de datos.
- `.env.example` documenta las variables reservadas para las futuras funciones
  online (todas vacías y comentadas): hoy ninguna es necesaria para jugar ni
  para desplegar.
