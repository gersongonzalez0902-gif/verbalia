# VERBALIA · La aventura del lenguaje

**VerbalIA** es un videojuego educativo de español construido como una **SPA 100 % offline**: el progreso se guarda **solo en el dispositivo** (sin cuentas, sin servidores, sin rastreadores) y la política de privacidad y cookies está integrada en el propio juego (pantalla Legal). El jugador explora el **Archipiélago de las Palabras**: ocho regiones, una por habilidad, con más de 100 minijuegos de lenguaje, misiones, logros y una economía de tinta.

> Estado actual: **+100 minijuegos de lenguaje** en 8 regiones + Jardín de Tarjetas SRS · **~64.700 ejercicios** (6.515 curados a mano + 58.171 generados con reglas lingüísticas) · **1.844 palabras** con repetición espaciada · **1.003 frases del día** · **67 logros** · **50 minijuegos de mente** en el Salón de Juegos (Memes y Cultura Pop, Crucigrama y Sopa de Letras adaptativos incluidos) · Taller de Escritura · **14 temas** de color · **SFX reales en archivos** (48 efectos licencia libre) · PWA instalable · **255 tests del motor en verde**.

---

## 1. Características principales

| Área | Detalle |
|---|---|
| **Minijuegos de lenguaje** | Más de 100 minijuegos en las 8 regiones del Archipiélago — Bosque del Vocabulario, Ciudad de la Gramática, Fortaleza de la Ortografía, Biblioteca Infinita, Puerto de las Voces, Torre de la Expresión, Forja del Escritor y Observatorio de la Palabra — más el **Jardín de Tarjetas SRS** (1.844 palabras con repetición espaciada SM-2) |
| **Contenido** | **~64.700 ejercicios**: 6.515 curados a mano (`src/data`) + 58.171 generados con reglas lingüísticas en paquetes **Mega-8** (`src/data/gen/mega8/*.ts`) que se cargan **bajo demanda** con `import()` dinámico (`src/data/pool-loader.ts`). Los entrenamientos de tipo drill **garantizan ≥500 variantes** (los paquetes `pk-*` + el expansor `src/data/gen/variants.ts` derivan variantes sólidas del jardín SRS, de refranes y del pack de sinónimos) |
| **Salón de Juegos** | **50 minijuegos de mente** en 5 categorías (cálculo, memoria, lógica, palabras, reflejos). Destacados: **Memes y Cultura Pop** (traducción del registro coloquial e internet al español estándar), **Crucigrama del Copista** (cruces generadas al vuelo y adaptadas al nivel), **Sopa de Letras** (rejilla que crece con el jugador), Sinónimos/Antónimos/Ortografía/Refranes Relámpago, Fracciones, Porcentajes, Series, Analogías, memoria de palabras y números inversos, reflejos Par-Impar y Vocal-Consonante… El motor común es el **Quiz Relámpago** (`games/arcade/quiz-blitz.tsx`) con bancos temáticos en `games/arcade/blitz-banks.ts` |
| **Cuaderno de errores** | Cada ejercicio fallado se anota con su explicación; **al acertarlo en cualquier juego sale del cuaderno** (repaso dirigido con el botón «Practicar») |
| **Misiones y logros** | Misiones diarias y semanales + **67 logros** con recompensas que el jugador **recoge manualmente** (las notificaciones informan, no reclaman solas) |
| **Mapa del Archipiélago** | Ocho islas; **las regiones bloqueadas también se pueden visitar**: su ficha muestra descripción, habilidad y estadísticas, pero misión y juegos quedan guardados hasta el nivel requerido |
| **Perfil** | Banners escénicos (8 + 8 premium), marcos, títulos, insignias con tiers y vitrina. **Modo AdminG**: un perfil llamado `AdminG` arranca con nivel máximo, tinta «∞» y todo el archipiélago abierto — pensado para probar y testear cada rincón |
| **Bazar del Copista** | Economía de **tinta** (1 por cada 10 XP + 12 de regalo diario): marcos, banners premium, títulos, escudos y 4 paletas premium |
| **Temas** | **14 temas de color** (10 gratis + 4 premium), cada uno con modo claro y oscuro |
| **Frases del día** | **1.003 frases** únicas (literatura + refranero) que rotan en cada visita |
| **Audio** | **SFX reales en archivos** (`public/sounds/*.mp3`, 48 efectos de [Mixkit](https://mixkit.co) con licencia libre; créditos en `public/sounds/CREDITOS-SONIDOS.md`) servidos con caché del service worker y **respaldo sintetizado** automático si un archivo no llega: el juego nunca se queda mudo. Música generativa por escena + estación de música propia del jugador + TTS del navegador |
| **PWA** | Instalable (manifest + service worker v3) con iconos del logo y página offline |
| **Accesibilidad** | Reduce-motion, 3 tamaños de texto, modo noche y TTS del navegador |
| **Motor** | Lógica pura testeable (`src/engine`): XP y niveles (1-60, 11 rangos), misiones deterministas por fecha, SRS, economía y **255 tests** (`tests/engine.test.ts`) |

---

## 2. Correcciones recientes (Mega-actualización 6)

- 🗒️ El cuaderno de errores ahora **borra los ejercicios resueltos** al acertarlos.
- 🎫 Las tarjetas rasca-rasca ya **no dejan ver la palabra** por detrás (mezclas `color-mix` ahora opacas).
- 🦉 **Léxico vuelve a tener ojos en PC**: los párpados del parpadeo quedan ocultos de forma intrínseca (sin depender de que las animaciones CSS estén activas).
- 🔒 Clickar una **ciudad bloqueada abre su ficha informativa** (sin acceso a sus juegos).
- 🧪 Modo **AdminG** para pruebas sin grind.
- 🔊 SFX sustituidos por **archivos reales** con respaldo sintético.
- 🎮 El Salón pasa de 21 a **50 juegos**, con dos formatos nuevos de rejilla y el juego de memes.
- 🧪 Pool de variantes: 6 formatos reciben expansiones deterministas hasta superar las 500 variantes.

---

## 3. Cómo ejecutar

Requisitos: **Bun** (o Node.js 20+ con npm).

```bash
# 1) Instalar dependencias
bun install

# 2) Desarrollo (http://localhost:3000)
bun run dev

# 3) Build de producción (standalone)
bun run build
```

### Scripts útiles

```bash
bun test tests/engine.test.ts        # pruebas del motor (255)
bunx tsc --noEmit                    # chequeo de tipos estricto
bash scripts/revive.sh               # reanimar el servidor de producción (:3000)
bash scripts/download-sfx.sh         # regenerar la colección de SFX (Mixkit → MP3)
```

### Generador de contenido (opcional)

Los paquetes Mega-8 ya están generados y versionados en `src/data/gen/mega8/`. Solo si se quiere regenerarlos:

```bash
bun run scripts/mega8/generate.ts
```

---

## 4. Stack técnico

- **Next.js 16** (App Router; toda la app vive en una ruta única tipo SPA) + **React 19**
- **TypeScript** en estricto
- **Tailwind CSS 4** + **shadcn/ui** (Radix) para la interfaz
- **Zustand** para el estado, con persistencia local (IndexedDB)
- **WebAudio API**: SFX desde archivos (con respaldo sintetizado) + música generativa + `speechSynthesis` (TTS)
- **PWA**: `manifest.webmanifest` + service worker + iconos (incl. maskable)
- **Bun** como gestor de paquetes y runtime de pruebas y generadores

---

## 5. Arquitectura (resumen)

El proyecto separa de forma estricta **motor puro, datos e interfaz**:

1. **Motor puro** (`src/engine`): sin DOM ni React, testeable con `bun test` sin navegador. Cubre XP y niveles (1-60, 11 rangos), misiones deterministas por fecha, SRS (SM-2), la economía de tinta, el modo AdminG (`engine/admin.ts`) y el reductor de sesión.
2. **Datos** (`src/data`): contenido curado a mano + paquetes **Mega-8** generados con reglas lingüísticas + el expansor de variantes (`gen/variants.ts`).
3. **Carga diferida** (`src/data/pool-loader.ts`): 9 grupos perezosos se cargan bajo demanda con `import()` dinámico —con reintento si la descarga falla—; 13 pantallas usan lazy-load.
4. **Interfaz** (`src/screens`, `src/components`, `src/games`): pantallas que solo orquestan; cada formato de minijuego es un componente en `games/`.

---

## 6. Estructura del proyecto

```
src/
├── app/            # Raíz SPA + layout PWA (metadatos, manifest)
├── screens/        # Pantallas (mapa, partida, perfil, salón, taller…)
├── components/     # game/ (carcasa, HUD, widgets, iconos, PWA) + ui/ (shadcn)
├── games/          # Minijuegos: formats/ (regiones) + arcade/ (salón de 50)
├── engine/         # Lógica pura: XP, misiones, SRS, economía, admin
├── data/           # Contenido curado + gen/ (mega8, packs y variantes)
│   └── pool-loader.ts   # Carga diferida de paquetes con import() dinámico
├── store/          # Zustand: perfil, ajustes, progreso
├── services/       # audio (SFX archivos + sintetizador respaldo), storage, música
├── hooks/ · lib/ · types/
public/
├── sounds/         # 48 SFX reales (MP3) + CREDITOS-SONIDOS.md
└── …               # manifest, service worker, iconos, offline.html
scripts/            # Generadores, auditoría y utilidades (revive.sh, download-sfx.sh…)
tests/              # tests/engine.test.ts (255 tests del motor)
```

---

## 7. Licencia

Este proyecto no declara una licencia pública: el paquete está marcado como privado y todo el contenido lingüístico es de autoría propia del proyecto. Los efectos de sonido proceden de [Mixkit](https://mixkit.co/free-sound-effects/) bajo la [Mixkit Sound Effect Free License](https://mixkit.co/license/#sfxFree) (ver `public/sounds/CREDITOS-SONIDOS.md`).

---

**VerbalIA** — porque aprender una lengua debería sentirse como jugar, no como hacer los deberes. 🧭
