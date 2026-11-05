# VERBALIA · La aventura del lenguaje

**VerbalIA** es un videojuego educativo de entrenamiento lingüístico en español. El jugador explora el **Archipiélago de las Palabras**: seis regiones (una por habilidad) llenas de minijuegos, misiones y progresión adaptativa, en sesiones de 3 a 5 minutos.

> Estado actual: **v3 · Gran renovación estética** — botones de juguete 3D, tarjetas aurora, muelle flotante, música generativa por región y reloj en contratiempo (incluye Etapas 1-2 al completo). Todo lo que se ve en la interfaz funciona de verdad; lo que está previsto para etapas futuras se muestra bloqueado y etiquetado con honestidad (nunca simulado).

---

## 1. Qué incluye (Etapas 1 y 2)

| Área | Entregado |
|---|---|
| **Identidad visual** | Paleta verde profundo con crema cálido y dorado de XP, modo claro y modo oscuro, **modo lectura nocturna cálida**, tipografía Fredoka + Nunito, emblema propio, animaciones ligeras que respetan `prefers-reduced-motion` |
| **Onboarding** | 4 pasos (nombre, avatar, objetivo, experiencia) + evaluación inicial «La prueba del faro» (8 ítems calibrados, saltable) |
| **Mundo** | Mapa SVG interactivo del Archipiélago con **las 6 islas jugables** (Puerto niv. 5, Torre niv. 6), desbloqueo por nivel y lista accesible alternativa |
| **15 minijuegos** | **Bosque:** Jardín de Tarjetas (SRS), Trivia Relámpago, Sprint de Vocabulario, Batalla de Sinónimos · **Ciudad:** Puentes de Palabras, Puentes de Contexto · **Fortaleza:** Caza de Errores, Tribunal de las Tildes · **Biblioteca:** Cronista (párrafos), Cloze, **Lectura Inmersiva** (frase a frase con voz) · **Puerto:** **Dictado del Faro** (voz + escritura con diff), **Ecos del Puerto** (tono e intención) · **Torre:** **Historias Ramificadas**, **Sabiduría Popular** (refranes), **Reto del Minuto** (escritura libre + autoevaluación honesta) |
| **Progresión** | XP con desglose, niveles, 7 rangos, **24 logros**, misiones diarias (3, deterministas por fecha) y semanales (con Escudo de Racha), combos, tope diario suave anti-farmeo, decaimiento por repetición |
| **Adaptación** | Nivel 1-10 por cada una de las **6 habilidades**; selección de dificultad 55/25/20; SRS SM-2 simplificado configurable |
| **Contenido** | **160 palabras SRS** (A1-C1, con regionalismos) + **~460 ejercicios** de autoría propia (30 dictados, 30 matices, 12 lecturas, 40 sprint, 40 sinónimos, 6 historias ramificadas, 40 refranes regionales, 24 retos del minuto, 45 tildes, 40 cloze, 36 caza de errores, 36 puentes, 18 párrafos) |
| **15 pantallas** | Bienvenida, onboarding, evaluación, dashboard, mapa, ficha de región, partida, resultados, perfil, estadísticas (radar de 6 habilidades e historial), colección, cuaderno de errores, misiones/logros, ajustes, biblioteca + hoja de ruta |
| **Voz y audio** | Síntesis del navegador (TTS) en tarjetas, dictados, matices y lectura sincronizada; **siempre con alternativa visual** si el navegador no ofrece voz; sonidos WebAudio sintetizados |
| **Persistencia** | IndexedDB (con espejo en localStorage), guardado diferido + volcado inmediato; exportar/importar JSON; borrado total |
| **PWA** | Manifest, service worker *network-first* conservador (cache v2), página offline, iconos (incl. maskable), aviso de nueva versión; **sin registro de SW en desarrollo** (evita caches obsoletas) |
| **Compañero** | **Tinta, la lechuza bibliotecaria**: interviene solo en momentos clave, con consejos de las mecánicas nuevas |
| **Accesibilidad** | Navegación por teclado, etiquetas ARIA, contrastes AA en todas las paletas (claro, oscuro, nocturno), tamaño de texto configurable, alternativa a todo arrastre, estados no solo por color |
| **Pruebas** | **97 pruebas unitarias del motor** (`bun test`) + auditoría automática de integridad de datos (grafos de historias, índices, duplicados) + verificación E2E con navegador real |

### v3 · Gran renovación estética (lenguaje unificado)

| Frente | Mejora |
|---|---|
| **Botones de juguete 3D** | Todas las acciones primarias (Button v3) tienen canto inferior sólido que **se hunde al pulsar**, brillo de porcelana en la cara superior y variantes de color (primario, XP, destructivo, secundario). En opciones de juego, cada respuesta entra con pop 3D y muestra ✓/✗ según el resultado. |
| **De-greening + evolución** | El verde de bienvenida es solo el arranque: cada región/estación rota el matiz del primario (esmeralda → ámbar → terracota → violeta → azul → coral) y el Inicio se tiñe de la región activa del jugador. Nada de «todo verde». |
| **Lenguaje unificado** | Tarjetas **aurora** (tinte de escena + halo de color) en las 15 pantallas, barras de progreso en **surco** con destello, iconos en **relieve** (chip-icon), títulos con **degradado vivo** (title-sheen), cabeceras héroe con **destello viajero** (hero-sheen) y entradas escalonadas (stagger) en listas. |
| **Muelle flotante (móvil)** | La navegación inferior es ahora un dock de cristal redondeado y flotante con píldora activa; el sidebar de escritorio estrena relieve y acentos de escena. |
| **Sonido en TODO** | Motor de audio v3 con **~40 efectos** sintetizados, **música ambiental generativa por región** (escala, tempo y textura propios, con fundido cruzado al cambiar de escena) y el **Gran Reloj en Contratiempo**: tic-tac que suena en los contratiempos del pulso musical, que `setTension()` acelera y agudiza en los últimos segundos de los retos cronometrados. Onboarding, filtros, detalles/accordions, exportar/importar, edición de nombre… todo suena. |
| **A11y endurecida** | Arreglado `role="listitem"` sobre botones (los entrenamientos rápidos vuelven a ser botones reales para lectores de pantalla), foco visible en todos los controles nuevos y contraste AA mantenido en claro, oscuro y modo lectura. |
| **Robustez** | 172 pruebas del motor (antes 95) incluyendo una misión diaria que ya no depende de la fecha del sistema; TypeScript estricto con 0 errores; build de producción verificada. |

### v1.1 · Pulido y variedad (sobre la Etapa 2)

| Frente | Mejora |
|---|---|
| **Contenido ×2.5** | De ~300 a **~460 ejercicios** y de 73 a **160 palabras SRS**. Todos los bancos ampliados con dificultad 1-5, MCER A1-C1 y posiciones de respuesta variadas (auditoría automática: 0 incidencias). |
| **Privacidad de desarrollo** | El botón flotante «Open Next.js Dev Tools» desaparece de la vista del jugador (`devIndicators: false`); se eliminó `ignoreBuildErrors` de la configuración (TypeScript estricto de verdad, 0 errores). |
| **Ambientación** | Fondo vivo en todas las pantallas: manchas de color que respiran, «polvo de letras» ascendiendo y mareas que derivan al pie. Mapa: **barco que navega la ruta**, gaviotas flotando, sol con halo, halos regionales tras las islas desbloqueadas e islas con balanceo suave. |
| **Sonido** | De 7 a **12 efectos** WebAudio sintetizados (navegación, desbloqueo, fin de sesión, tic de reloj, volteo de tarjeta, racha…), cableados a toda la navegación y botones. Se silencian desde Ajustes como antes. |
| **Movimiento** | Transición suave entre pantallas, micro-interacción táctil en botones (escala al pulsar), barra de XP con destello viajero. Todo se apaga solo con `prefers-reduced-motion` o el ajuste del jugador. |
| **Compañero** | Tinta estrena repertorio: 18 consejos y **frases de resultados variadas por franja de exactitud** (pools aleatorios, nunca la misma frase dos días seguidos). |

### Correcciones sobre la Etapa 1 (auditoría propia)

1. **Trivia**: acertar mostraba el botón elegido como incorrecto (comparaba «Sustantivo» ≠ «sustantivo»); ahora compara por identificador.
2. **Tipos**: la unión `Exercise` usa discriminantes literales → el `switch` de la partida hace *narrowing* real de TypeScript.
3. **Puzzle sintáctico**: robustez ante fragmentos repetidos (índices únicos en lugar de `indexOf`).
4. **Dato ti-16**: la frase de contexto usaba «país» (con tilde) y la palabra nunca se resaltaba; corregido.
5. **Router**: las URLs aceptan también nombres en español (`#/mapa`, `#/ajustes`…) y la pantalla se restaura bien al recargar.
6. **Service worker**: no se registra en desarrollo y la caché de producción pasó a v2 (antes podía servir una versión obsolea).
7. **Caza de errores**: las correcciones elegidas muestran ahora estado correcto/elegido, como el resto de juegos.
8. **Duplicaciones**: el store reutiliza `isLearned`/`isMastered` del motor (una sola fuente de verdad).

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
│   ├── achievements.ts   #  24 logros con evaluadores puros
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
4. **Reductor de sesión puro** (`engine/core.ts`): `reduceSessionComplete(core, input) → { core, result }` aplica XP, habilidades, racha, misiones, logros y errores en una sola función inmutable — más de la mitad de las 95 pruebas cubren este flujo y las mecánicas de la Etapa 2.
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

# 3) Pruebas unitarias del motor (172 pruebas)
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
| `bun test tests/engine.test.ts` | **97/97 aprobadas** — todo el repertorio de la Etapa 1 (niveles/rangos, MCER, dificultad objetivo, SRS completo, puntuación con combo/velocidad/anti-farmeo, validación de los 6 tipos originales, rachas, misiones deterministas, reductor de sesión, evaluación inicial, RNG) **más la Etapa 2**: dictado (normalización tolerante, tilde que falta falla, diff palabra a palabra), opción por índice, minuto (gradación honesta por esfuerzo), sesiones de puerto/torre/biblioteca, grafos de historias (next válidos, finales alcanzables), cobertura de dificultad de los 7 packs nuevos, no concentración de respuestas y logros nuevos |
| `npx tsc --noEmit` | **0 errores** (verificación real de tipos; el build las ignora, aquí no) |
| `bun run scripts/audit-data.ts` | **Auditoría de integridad de datos sin problemas** — 209 ejercicios con IDs únicos, índices en rango, opciones sin duplicar, grafos de historias con todos los nodos alcanzables y final accesible, metas del minuto razonables, coherencia dificultad/MCER |
| `bun run lint` (ESLint 9 + reglas React Compiler) | **0 errores, 0 avisos** |
| E2E con navegador real (agent-browser + Chromium) | **Etapa 1** (verificado en su momento): onboarding completo, evaluación, SRS, mapa, ficha de región, trivia con camino de error, cuaderno de errores, repaso, ajustes, persistencia tras recarga, móvil 390×844 y escritorio. **Etapa 2 (verificado ahora)**: dictado con diff palabra a palabra, sprint con timeout explicado, sinónimos, **historia completa con decisiones y pregunta final**, **reto del minuto de principio a fin (escritura → autoevaluación → XP honesto)**, **misión completa de la Torre registrada en historial con XP**, mapa con Puerto (niv. 5) y Torre (niv. 6), radar de 6 habilidades, **modo lectura nocturna verificado por análisis de píxeles (paleta oscura y cálida)**, 24 logros en galería, colección con 160 palabras, biblioteca con 15 juegos, rutas en español (#/mapa…) y restauración tras recarga |
| Bugs detectados y corregidos durante la auditoría | 1) El botón correcto de Trivia se pintaba como fallo al acertar (comparación por etiqueta capitalizada). 2) El dato ti-16 mostraba «país» con tilde y no resaltaba la palabra. 3) El service worker podía servir una versión obsoleta en desarrollo (ahora no se registra en dev y la caché de producción es v2). 4) Las URLs en español caían en Home (alias añadidos). 5) Un nodo de historia quedó inalcanzable tras una corrección narrativa (detectado por la auditoría automática de grafos y reparado) |

---

## 6. Hoja de ruta (resumen)

Los **25 módulos del catálogo** y los **26 módulos innovadores** tienen su etapa asignada (ver la pantalla *Biblioteca → Hoja de ruta* dentro del juego, o `src/data/roadmap.ts`):

- **Etapa 1 — MVP jugable** ✅ *disponible*: SRS, trivia, puzzles sintácticos, cloze, caza de errores, tribunal de tildes, constructor de párrafos.
- **Etapa 2 — Experiencia avanzada** ✅ *disponible*: dictados con voz del navegador, cuestionarios auditivos de matices, lectura inmersiva sincronizada, historias ramificadas, refranes y modismos con variante regional, sprint de vocabulario, batallas de sinónimos, reto del minuto (escritura libre con autoevaluación honesta), modo lectura nocturna y colección ampliada. *Quedan para la Etapa 2 siguiente versión:* transcripción por voz (micrófono), grabación y autoevaluación oral, tarjetas rasca-rasca, tinder de sinónimos, duelos de tipeo, jeroglíficos modernos, laboratorio de puntuación, conectores, pleonasmos y fonética visual (ver la pantalla *Biblioteca → Hoja de ruta*).
- **Etapa 3 — IA y experiencias especiales** 🧭: role-play conversacional con IA (vía backend seguro, sin claves en el cliente), editor fantasma de estilo, modo escritor, debate virtual, retos de fluidez, entrevistas y exposiciones, cómics de texto, trivia de figuras retóricas, mapas mentales de familias, adivinanzas etimológicas, crucigramas adaptativos, podcast interactivo, detective de fake news, traducción de memes, misiones de corrección urbana, archivista de neologismos, rincón del orador, biblioteca de mitos.
- **Etapa 4 — Comunidad y expansión** 🧭: retos por enlace, corrección colaborativa moderada, mural de vocabulario, duelos en tiempo real, sincronización de cuentas, traducción inversa rápida, nuevos idiomas y paquetes.

---

## 7. Limitaciones conocidas (transparencia)

1. **Voz**: tarjetas, dictados, matices y lectura inmersiva usan la síntesis del navegador (`speechSynthesis`); su disponibilidad y calidad varían por navegador/SO, y sin voz el dictado ofrece el modo alternativo «copia y acentúa» (etiquetado con honestidad). No hay reconocimiento por micrófono ni evaluación fonética real en esta versión — cuando lleguen, se distinguirá con claridad entre *transcripción reconocida* y *evaluación fonética real*; nunca se afirmará que se mide la pronunciación comparando ondas de audio.
2. **Modo offline**: el contenido y el progreso funcionan sin conexión; la primera visita (y cada nueva versión) requiere conexión. La página offline solo se guarda tras la primera carga con conexión.
3. **Sesiones mixtas en el Bosque**: la misión de la región incluye tarjetas SRS + trivia + sprint + sinónimos; si no hay tarjetas vencidas ni cupo de nuevas, se rellena con más ejercicios del Bosque.
4. **Alcance del contenido**: 160 palabras y ~460 ejercicios de autoría propia. La arquitectura de paquetes está pensada para crecer sin tocar el motor.
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
