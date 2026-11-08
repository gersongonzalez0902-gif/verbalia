# VERBALIA · La aventura del lenguaje

**VerbalIA** es un videojuego educativo de español construido como una **SPA 100 % offline**: el progreso se guarda **solo en el dispositivo** (sin cuentas, sin servidores, sin rastreadores) y la política de privacidad y cookies está integrada en el propio juego (pantalla Legal). El jugador explora el **Archipiélago de las Palabras**: ocho regiones, una por habilidad, con **100 minijuegos de lenguaje**, misiones, logros y una economía de tinta.

> Estado actual: **100 minijuegos de lenguaje** en 8 regiones + Jardín de Tarjetas SRS · **~64.700 ejercicios** (6.515 curados a mano + 58.171 generados con reglas lingüísticas) · **1.844 palabras** con repetición espaciada · **1.003 frases del día** (sin repetición de texto) · **67 logros** · **21 minijuegos de mente** en el Salón de Juegos · Taller de Escritura · **14 temas** de color · PWA instalable. **Los 100 minijuegos superan los 500 ejercicios** cada uno.

---

## 1. Características principales

| Área | Detalle |
|---|---|
| **Minijuegos** | **100 minijuegos de lenguaje** en las 8 regiones del Archipiélago — Bosque del Vocabulario, Ciudad de la Gramática, Fortaleza de la Ortografía, Biblioteca Infinita, Puerto de las Voces, Torre de la Expresión, Forja del Escritor y Observatorio de la Palabra — más el **Jardín de Tarjetas SRS** (1.844 palabras con repetición espaciada SM-2) |
| **Contenido** | **~64.700 ejercicios**: 6.515 curados a mano (`src/data`) + 58.171 generados con reglas lingüísticas (silabación, acentuación y numerales calculados por algoritmo) en paquetes **Mega-8** (`src/data/gen/mega8/*.ts`, 7 grupos) que se cargan **bajo demanda** con `import()` dinámico (`src/data/pool-loader.ts`) para no engordar el paquete inicial. **Los 100 minijuegos tienen ≥500 ejercicios** cada uno (piso verificado con `scripts/check-pools.ts`) |
| **Misiones y logros** | Misiones diarias y semanales + **67 logros** (con recompensas de XP y tinta) que el jugador **recoge manualmente** en el apartado Misiones y logros (botón «Recoger»: las notificaciones informan, no reclaman solas) |
| **Entrenamientos** | Pantalla propia con buscador, filtros por habilidad, instrucciones de cada formato y estadísticas |
| **Salón de Juegos** | **21 minijuegos de mente** (cálculo, memoria, lógica, letras veloces, reflejos) desbloqueables con tinta |
| **Taller de Escritura** | Pantalla propia: tipeo rápido (PPM/precisión), mecanografía por filas del teclado (7 niveles) y modo precisión con refranes; récords persistentes y logros propios |
| **Perfil** | Banners escénicos personalizables (8 predefinidos + 8 premium), marcos de avatar, títulos, insignias con tiers (bronce/plata/oro/platino) y vitrina compacta |
| **Bazar del Copista** | Economía de **tinta** (1 por cada 10 XP + 12 de regalo diario con cuenta atrás «Regalo nuevamente en: X»): marcos, banners premium, títulos, escudos y 4 paletas de tema premium |
| **Temas** | **14 temas de color** (10 gratis: Aurora, Coral, Miel, Lavanda, Océano, Magenta, Bosque, Atardecer, Turquesa y Ciruela + 4 premium: Medianoche, Selva, Brasa y Perla), cada uno con modo claro y oscuro |
| **Frases del día** | **1.003 frases** únicas (citas reales de literatura + refranero popular) que rotan en cada visita |
| **Audio** | Música generativa por escena + estación de música del jugador (sube canciones propias) + SFX WebAudio propios |
| **PWA** | Instalable (manifest + service worker) con iconos del logo |
| **Accesibilidad** | Reduce-motion, 3 tamaños de texto, modo noche y TTS del navegador para el audio |
| **Motor** | Lógica pura testeable (`src/engine`): XP y niveles (1-60, 11 rangos), misiones deterministas por fecha, SRS, economía y 21 pantallas (13 con lazy-load) |
| **Privacidad** | 100 % offline: sin cuentas, sin servidores, sin rastreadores; política de privacidad y cookies integrada (pantalla Legal) |

---

## 2. Cómo ejecutar

Requisitos: **Bun** (o Node.js 20+ con npm).

```bash
# 1) Instalar dependencias
bun install

# 2) Desarrollo (http://localhost:3000)
bun run dev

# 3) Build de producción (standalone)
bun run build
```

### Generador de contenido (opcional)

Los paquetes Mega-8 (58.171 ejercicios) ya están generados y versionados en `src/data/gen/mega8/`. Solo si se quiere regenerarlos:

```bash
bun run scripts/mega8/generate.ts
```

### Pruebas del motor (opcional)

```bash
bun test tests/engine.test.ts
```

---

## 3. Stack técnico

- **Next.js 16** (App Router; toda la app vive en una ruta única tipo SPA) + **React 19**
- **TypeScript** en estricto
- **Tailwind CSS 4** + **shadcn/ui** (Radix) para la interfaz
- **Zustand** para el estado, con persistencia local
- **WebAudio API** (SFX y música generativa) + `speechSynthesis` (TTS) del navegador
- **PWA**: `manifest.webmanifest` + service worker + iconos (incl. maskable)
- **Bun** como gestor de paquetes y runtime de pruebas y generadores
- Prisma queda como esquema heredado: **no se usa en runtime** (todo es local)

---

## 4. Arquitectura (resumen)

El proyecto separa de forma estricta **motor puro, datos e interfaz**:

1. **Motor puro** (`src/engine`): sin DOM ni React, testeable con `bun test` sin navegador. Cubre XP y niveles (1-60, 11 rangos), misiones deterministas por fecha, SRS (SM-2), la economía de tinta y el reductor de sesión.
2. **Datos** (`src/data`): contenido curado a mano (6.515 ejercicios) y paquetes **Mega-8** generados con reglas lingüísticas (silabación, acentuación y numerales calculados por algoritmo) a partir de los bancos de `scripts/mega8/`.
3. **Carga diferida** (`src/data/pool-loader.ts`): los 7 grupos Mega-8 (58.171 ejercicios) se cargan bajo demanda con `import()` dinámico —con reintento si la descarga falla—, de modo que el paquete inicial no engorda; 13 pantallas usan lazy-load.
4. **Interfaz** (`src/screens`, `src/components`, `src/games`): pantallas que solo orquestan; la carcasa, el HUD y los widgets viven en `components/game/` y cada formato de minijuego es un componente en `games/`.

---

## 5. Estructura del proyecto

```
src/
├── app/            # Raíz SPA + layout PWA (metadatos, manifest)
├── screens/        # 21 pantallas (mapa, partida, perfil, salón, taller…)
├── components/     # game/ (carcasa, HUD, widgets, PWA) + ui/ (shadcn)
├── games/          # Minijuegos: un componente por formato de ejercicio
├── engine/         # Lógica pura: XP, misiones, SRS, economía
├── data/           # Contenido curado + gen/mega8 (7 grupos generados)
│   └── pool-loader.ts   # Carga diferida de paquetes con import() dinámico
├── store/          # Zustand: perfil, ajustes, progreso
├── services/       # audio, storage, estación de música
├── hooks/ · lib/ · types/
public/             # PWA: manifest, service worker, iconos del logo
scripts/            # Generadores (mega8/) y utilidades de auditoría
prisma/             # Esquema heredado (sin uso en runtime)
```

---

## 6. Licencia

Este proyecto no declara una licencia pública: el paquete está marcado como privado y todo el contenido lingüístico es de autoría propia del proyecto.

---

**VerbalIA** — porque aprender una lengua debería sentirse como jugar, no como hacer los deberes. 🧭
