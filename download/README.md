# VERBALIA · La aventura del lenguaje

**VerbalIA** es un videojuego educativo de entrenamiento lingüístico en español. El jugador explora el **Archipiélago de las Palabras**: seis regiones (una por habilidad) llenas de minijuegos, misiones y progresión adaptativa, en sesiones de 3 a 5 minutos.

> Estado actual: **Etapa 1 — MVP jugable, completa y verificada**. Todo lo que se ve en la interfaz funciona de verdad; lo que está previsto para etapas futuras se muestra bloqueado y etiquetado con honestidad (nunca simulado).

---

## 1. Qué incluye la Etapa 1

| Área | Entregado |
|---|---|
| **Identidad visual** | Paleta verde profundo con crema cálido y dorado de XP, modo claro y modo oscuro, tipografía Fredoka + Nunito, emblema propio, animaciones ligeras que respetan `prefers-reduced-motion` |
| **Onboarding** | 4 pasos (nombre, avatar, objetivo, experiencia) + evaluación inicial «La prueba del faro» (8 ítems calibrados, saltable) |
| **Mundo** | Mapa SVG interactivo del Archipiélago con 6 islas, desbloqueo por nivel y lista accesible alternativa |
| **7 minijuegos** | Jardín de Tarjetas (SRS), Trivia Relámpago, Puentes de Palabras (puzzle sintáctico), Puentes de Contexto (cloze), Caza de Errores, Tribunal de las Tildes, Cronista de la Biblioteca (constructor de párrafos) |
| **Progresión** | XP con desglose, niveles (curva 100+40·(n−1)), 7 rangos, 18 logros, misiones diarias (3, deterministas por fecha) y semanales (con Escudo de Racha), combos, tope diario suave anti-farmeo, decaimiento por repetición |
| **Adaptación** | Nivel de habilidad 1-10 por habilidad que sube/baja con cada respuesta; selección de dificultad 55/25/20 (en nivel / refuerzo / reto); SRS SM-2 simplificado configurable |
| **Contenido** | 48 palabras SRS (A1-C2, con regionalismos: *morriña*, *guagua*, *chapulín*, *órdago*…) + 36 trivia + 18 puzzles + 16 cloze + 16 caza de errores + 21 tildes + 8 párrafos originales |
| **15 pantallas** | Bienvenida, onboarding, evaluación, dashboard, mapa, ficha de región, partida, resultados, perfil, estadísticas (con gráficos e historial), colección, cuaderno de errores, misiones/logros, ajustes, biblioteca + hoja de ruta |
| **Persistencia** | IndexedDB (con espejo en localStorage), guardado diferido + volcado inmediato en fin de sesión y al ocultar la pestaña; exportar/importar JSON; borrado total |
| **PWA** | Manifest, service worker *network-first* conservador, página offline, iconos (incl. maskable), aviso de nueva versión |
| **Compañero** | **Tinta, la lechuza bibliotecaria**: interviene solo en momentos clave (nunca interrumpe la partida), con parpadeo y balanceo en CSS puro |
| **Accesibilidad** | Navegación por teclado (Enter para continuar), etiquetas ARIA, contrastes AA en ambas paletas, tamaño de texto configurable (3 escalas), alternativa táctil/teclado a todo arrastre, estados que no dependen solo del color |
| **Pruebas** | 55 pruebas unitarias del motor (`bun test`) + verificación E2E con navegador real (flujo completo, persistencia, móvil 390px, tema, textos) |

---

## 2. Arquitectura

```
src/
├── app/                  # Ruta única Next.js (App Router)
│   ├── layout.tsx        # Fuentes, metadatos PWA, ThemeProvider (next-themes)
│   ├── page.tsx          # Raíz SPA: hidratación, enrutador, carcasa
│   ├── globals.css       # Tokens de diseño, animaciones, utilidades
│   └── icon.svg          # Emblema (favicon)
├── types/index.ts        # Tipos del dominio (ejercicios, progreso, SRS…)
├── data/                 # PAQUETES DE CONTENIDO (solo datos, sin UI)
│   ├── regions.ts        #  6 regiones: metadatos, mapa, desbloqueo
│   ├── games.ts          #  registro de minijuegos (instrucciones, tiempos)
│   ├── words-srs.ts      #  48 palabras con definición, ejemplo y MCER
│   ├── trivia.ts / puzzles.ts / cloze.ts
│   ├── errors-hunt.ts / tildes.ts / paragraphs.ts
│   ├── placement.ts (en content.ts)  # evaluación inicial
│   ├── achievements.ts   #  18 logros con evaluadores puros
│   ├── missions.ts       #  plantillas diarias/semanales
│   ├── roadmap.ts        #  25 mecánicas + 26 módulos con etapa asignada
│   └── companion.ts      #  repertorio de Tinta
├── engine/               # LÓGICA PURA (testeable sin navegador)
│   ├── core.ts           #  reductor de sesión: XP, racha, misiones, logros
│   ├── xp.ts             #  niveles, rangos, MCER, dificultad objetivo
│   ├── srs.ts            #  SM-2 simplificado
│   ├── scoring.ts        #  XP por ítem: dificultad, combo, velocidad, topes
│   ├── validation.ts     #  validación por tipo de ejercicio
│   ├── session.ts        #  constructores de sesión (misión/entreno/repaso)
│   ├── missions.ts       #  generación determinista + métricas
│   ├── streak.ts         #  rachas flexibles con escudos
│   └── rng.ts            #  RNG determinista (mulberry32) + barajado
├── services/
│   ├── storage.ts        #  IndexedDB + espejo localStorage + export/import
│   └── audio.ts          #  sonidos WebAudio sintetizados + TTS del navegador
├── store/
│   ├── game-store.ts     #  Zustand: perfil, ajustes, core, SRS, persistencia
│   └── ui-store.ts       #  enrutador por hash (botón atrás funcional)
├── components/
│   ├── game/             #  carcasa, HUD, Tinta, feedback, widgets, iconos, PWA
│   └── ui/               #  shadcn/ui
├── games/                #  LOS 7 MINIJUEGOS (componentes por ejercicio)
└── screens/              #  LAS 15 PANTALLAS
```

### Decisiones técnicas clave

1. **Next.js 16 + React 19 + TypeScript** (en lugar de Vite): el entorno de despliegue de este proyecto está construido alrededor de Next.js, y su App Router deja preparadas rutas de API para la IA de la Etapa 3. El juego en sí es una SPA cliente 100 % React + TS, exactamente la propuesta técnica original.
2. **Ruta única con enrutador propio por hash**: la interfaz completa vive bajo `/` (requisito del entorno), pero el botón atrás del navegador funciona porque el router sincroniza `location.hash` (`#/home`, `#/juego/trivia/training`…). Al recargar, se restaura la pantalla.
3. **Separación estricta contenido / lógica / interfaz**: `data/` no importa React; `engine/` es puro (sin DOM) y por eso se puede probar con `bun test` sin navegador; `games/` y `screens/` solo orquestan.
4. **Reductor de sesión puro** (`engine/core.ts`): `reduceSessionComplete(core, input) → { core, result }` aplica XP, habilidades, racha, misiones, logros y errores en una sola función inmutable — 30 de las 55 pruebas cubren justo este flujo.
5. **Zustand + persistencia propia**: guardado diferido (700 ms) para ráfagas de tarjetas y volcado inmediato al terminar sesión o ocultar la pestaña (`pagehide` + `visibilitychange`), de modo que nunca se pierde progreso.
6. **Anti-farmeo honesto**: repetir un ejercicio visto hace <3 días rinde 25 % de XP; superado el tope diario (600 XP) el XP extra rinde al 50 % — con aviso transparente en resultados. El SRS no decae: repasar es legítimo.
7. **Service worker conservador**: red primero para navegación (nunca sirve contenido viejo), SWR solo para estáticos con hash, `/api` y no-GET nunca se interceptan. Registro solo en https/localhost y con ajuste para desactivarlo.
8. **Iconos dinámicos por registro** (`components/game/icons.tsx`): los datos referencian iconos por nombre sin acoplar los ficheros de datos a React.

---

## 3. Cómo ejecutar

Requisitos: Node.js 20+ (o Bun 1.1+) y npm/bun.

```bash
# 1) Instalar dependencias
npm install        # o: bun install

# 2) Desarrollo (http://localhost:3000)
npm run dev        # o: bun run dev

# 3) Pruebas unitarias del motor (55 pruebas)
npm test           # o: bun test tests/engine.test.ts

# 4) Lint
npm run lint       # o: bun run lint
```

> **Este entorno**: el servidor de desarrollo ya corre en el puerto 3000 y la app se ve en el **panel de vista previa** (botón «Abrir en una pestaña nueva»). No hace falta ejecutar nada.

### Probar el juego en 3 minutos

1. **Comenzar la aventura** → pon tu nombre, elige avatar, objetivo y experiencia.
2. **Prueba del faro**: 8 preguntas (o «Saltar por ahora»).
3. En el **dashboard**: pulsa «Sesión recomendada» (jardín de tarjetas SRS).
4. Abre el **mapa**, entra en una región y lanza la **misión de región** (mezcla 2 mecánicas).
5. Falla algo a propósito → abre tu **cuaderno de errores** → «Practicar».
6. Recarga la página: tu progreso sigue ahí (IndexedDB).
7. En **Ajustes**: cambia a tema oscuro, sube el tamaño del texto, reduce el movimiento.
8. En **Biblioteca → Hoja de ruta**: las 4 etapas del producto, módulo a módulo.

### Generar los iconos PWA (ya generados en `public/icons/`)

```bash
bun scripts/generate-icons.mjs
```

---

## 4. Despliegue

La aplicación es una SPA cliente sin dependencias de servidor (la IA de la Etapa 3 sí añadirá backend):

```bash
npm run build   # genera .next/standalone
npm start       # servidor Node autónomo (o bun .next/standalone/server.js)
```

También funciona en **Vercel, Netlify o Cloudflare Pages** sin configuración extra (build `next build`, output estándar). Para alojarla como estática detrás de cualquier CDN, `next build` con `output: "standalone"` ya está configurado; el service worker hará el resto para el modo offline.

Checklist de producción: HTTPS (necesario para service worker e instalación PWA), iconos servidos desde `/icons/` (ya incluidos), y `manifest.webmanifest` en la raíz (ya enlazado en los metadatos).

---

## 5. Pruebas ejecutadas (evidencia real)

| Prueba | Resultado |
|---|---|
| `bun test tests/engine.test.ts` | **55/55 aprobadas** — niveles/rangos, MCER, dificultad objetivo, SRS completo (again/hard/good/easy, facilidad acotada, dominio), puntuación (dificultad, combo, velocidad, decaimiento anti-farmeo, tope diario), validación de los 6 tipos de ejercicio (incl. frases limpias y mayúsculas), rachas (escudos, reinicio suave, mismo día), misiones (determinismo, reclamo único), reductor de sesión (XP, contadores, errores, logros, evaluación), evaluación inicial, RNG |
| `bun run lint` (ESLint 9 + reglas React Compiler) | **0 errores, 0 avisos** |
| E2E con navegador real (agent-browser + Chromium) | Flujo completo: bienvenida → onboarding (validación de nombre, avatar, objetivo, experiencia) → evaluación (8 ítems, 6 mecánicas, expiración de tiempo) → resultados → dashboard → sesión SRS (mostrar/autoevaluar) → mapa → ficha de región → entrenamiento trivia (camino de error) → cuaderno de errores → repaso → confirmación de salida → ajustes (tema oscuro, tamaño de texto) → colección → biblioteca → misiones reclamadas → estadísticas → **recarga con persistencia verificada** → viewport móvil 390×844 (nav inferior de 5, sin desbordamiento horizontal) → escritorio 1440×900 (barra lateral) → assets PWA (manifest, sw, offline, iconos) |
| Bug detectado y corregido durante E2E | La validación de trivia comparaba con sensibilidad de mayúsculas («Sustantivo» ≠ «sustantivo»): corregido en `engine/validation.ts` + **prueba de regresión añadida** |

---

## 6. Hoja de ruta (resumen)

Los **25 módulos del catálogo** y los **26 módulos innovadores** tienen su etapa asignada (ver la pantalla *Biblioteca → Hoja de ruta* dentro del juego, o `src/data/roadmap.ts`):

- **Etapa 1 — MVP jugable** ✅ *disponible*: SRS, trivia, puzzles sintácticos, cloze, caza de errores, tribunal de tildes, constructor de párrafos.
- **Etapa 2 — Experiencia avanzada** 🧭: lectura inmersiva con audio, dictados cruzados, cuestionarios auditivos, transcripción por voz (Web Speech API, según navegador), grabación voluntaria y autoevaluación, historias ramificadas, colección ampliada, sprint de vocabulario, tarjetas rasca-rasca, batallas de sinónimos, tinder de sinónimos, karaoke literario, duelos de tipeo, jeroglíficos modernos, laboratorio de puntuación, conectores, pleonasmos, refranes, fonética visual, minuto en blanco, lecturas nocturnas, modismos.
- **Etapa 3 — IA y experiencias especiales** 🧭: role-play conversacional con IA (vía backend seguro, sin claves en el cliente), editor fantasma de estilo, modo escritor, debate virtual, retos de fluidez, entrevistas y exposiciones, cómics de texto, trivia de figuras retóricas, mapas mentales de familias, adivinanzas etimológicas, crucigramas adaptativos, podcast interactivo, detective de fake news, traducción de memes, misiones de corrección urbana, archivista de neologismos, rincón del orador, biblioteca de mitos.
- **Etapa 4 — Comunidad y expansión** 🧭: retos por enlace, corrección colaborativa moderada, mural de vocabulario, duelos en tiempo real, sincronización de cuentas, traducción inversa rápida, nuevos idiomas y paquetes.

---

## 7. Limitaciones conocidas (transparencia)

1. **Voz**: la lectura en voz alta de las tarjetas usa la síntesis del navegador (`speechSynthesis`); su disponibilidad y calidad varían por navegador/SO. No hay reconocimiento de voz ni evaluación fonética real en esta etapa — y cuando lleguen (Etapa 2), se distinguirá con claridad entre *transcripción reconocida* y *evaluación fonética real*; nunca se afirmará que se mide la pronunciación comparando ondas de audio.
2. **Modo offline**: el contenido y el progreso funcionan sin conexión; la primera visita (y cada nueva versión) requiere conexión. La página offline solo se guarda tras la primera carga con conexión.
3. **Sesiones mixtas en el Bosque**: la misión de la región incluye tarjetas SRS + trivia; si no hay tarjetas vencidas ni cupo de nuevas, la misión se rellena con más trivia.
4. **Alcance del contenido**: 48 palabras y ~115 ejercicios de autoría propia. La arquitectura de paquetes está pensada para crecer sin tocar el motor.
5. **Sincronización**: todo es local por diseño (privacidad). No hay cuentas ni sincronización entre dispositivos: eso llega en la Etapa 4 (la estructura de estado único ya lo deja preparado, junto con la exportación/importación manual actual).
6. **MCER**: las etiquetas A1-C2 son estimaciones orientativas basadas en el rendimiento; VerbalIA no certifica niveles oficiales (se advierte en la evaluación, el perfil y los ajustes).
7. **IA**: ninguna en esta etapa. Las funciones de IA de la Etapa 3 requerirán un backend seguro (las claves nunca irán en el frontend) y tendrán alternativas predefinidas si el servicio no está disponible.
8. **Rendimiento medido**: no se ha hecho aún una auditoría formal de Core Web Vitals; las decisiones de diseño (cero dependencias de UI pesadas, animaciones CSS con `transform`/`opacity`, sonidos sintetizados, sin imágenes de mapa rasterizadas) apuntan a una carga ligera, pero no se promete una cifra sin medir.

---

## 8. Privacidad

- Sin cuentas, sin registro, sin datos personales pedidos más allá de un nombre opcional guardado **en tu dispositivo**.
- Sin rastreadores ni analítica de terceros.
- Todo el progreso vive en IndexedDB (con espejo en localStorage) y se puede exportar o borrar desde **Perfil → Tus datos**.
- Los sonidos se sintetizan localmente; la síntesis de voz (opcional) la aporta el navegador y no envía audio a ningún servidor.

---

**VerbalIA** — porque aprender una lengua debería sentirse como jugar, no como hacer los deberes. 🧭
