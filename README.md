# VERBALIA · La aventura del lenguaje

**VerbalIA** es un videojuego educativo de entrenamiento lingüístico en español. El jugador explora el **Archipiélago de las Palabras**: **ocho islas** (una por habilidad, incluida la **cultura lingüística** y la nueva **Forja del Escritor** de estilo) con **56 minijuegos**, misiones, economía de tinta y progresión adaptativa, en sesiones de 3 a 5 minutos.

> Estado actual: **v4.0 · Etapa 4 «El Códice Infinito»** — la octava isla (**Forja del Escritor**) con 5 formatos de estilo y retórica (metáforas, registro, conectores, ironía, redundancias), **economía de tinta** con el **Bazar del Copista** (marcos, títulos, escudos), **5 081 ejercicios** (+60), **1 310 palabras** (+150), **328 frases del día** (+108), perfil 3.0 con **marco, título e insignia destacada**, **palabra del día** y saludo por hora en el inicio, **estadísticas 3.0** (proyección de nivel, tinta, mejor isla, constancia de 16 semanas), **colección con filtro MCER**, cuaderno por habilidad, **paisajes sonoros sintetizados** (lluvia, olas, chimenea, noche), ajustes de **velocidad de voz y háptics**, paleta elegida desde el onboarding, atajos PWA y **migración automática de partidas antiguas** que repara perfiles sin banner. Total: **209 pruebas** del motor pasando. (v4.1: 226 pruebas, ver 1.cuater)

---

## 1. Qué incluye (Etapas 1 y 2)

| Área | Entregado |
|---|---|
| **Identidad visual** | Paleta verde profundo con crema cálido y dorado de XP, modo claro y modo oscuro, **modo lectura nocturna cálida**, tipografía Fredoka + Nunito, emblema propio, animaciones ligeras que respetan `prefers-reduced-motion` |
| **Onboarding** | 4 pasos (nombre, avatar, objetivo, experiencia) + evaluación inicial «La prueba del faro» (8 ítems calibrados, saltable) |
| **Mundo** | Mapa SVG interactivo del Archipiélago con **las 8 islas jugables** (Observatorio niv. 7, **Forja niv. 8**), desbloqueo por nivel y lista accesible alternativa |
| **51 minijuegos** (15 de Etapas 1-2 + 35 de la Etapa 3 + 5 de la Forja en la Etapa 4 = 56 · ver 1.bis y 1.ter) | **Bosque:** Jardín de Tarjetas (SRS), Trivia Relámpago, Sprint de Vocabulario, Batalla de Sinónimos · **Ciudad:** Puentes de Palabras, Puentes de Contexto · **Fortaleza:** Caza de Errores, Tribunal de las Tildes · **Biblioteca:** Cronista (párrafos), Cloze, **Lectura Inmersiva** (frase a frase con voz) · **Puerto:** **Dictado del Faro** (voz + escritura con diff), **Ecos del Puerto** (tono e intención) · **Torre:** **Historias Ramificadas**, **Sabiduría Popular** (refranes), **Reto del Minuto** (escritura libre + autoevaluación honesta) · **Etapa 4 · Forja:** metáforas, registro, conectores, ironía y censura de redundancias |
| **Progresión** | XP con desglose, niveles, 7 rangos, **40 logros**, misiones diarias (3, deterministas por fecha) y semanales (con Escudo de Racha), combos, tope diario suave anti-farmeo, decaimiento por repetición |
| **Adaptación** | Nivel 1-10 por cada una de las **7 habilidades**; selección de dificultad 55/25/20; SRS SM-2 simplificado configurable |
| **Contenido** | **1 310 palabras SRS** (A1-C2, con regionalismos y retórica) + **209 ejercicios** de autoría propia de las Etapas 1-2 (14 dictados, 12 matices, 6 lecturas, 16 sprint, 16 sinónimos, 4 historias ramificadas con 4-5 nodos, 16 refranes, 10 retos del minuto, además de todo el catálogo de la Etapa 1) |
| **16 pantallas** | Bienvenida, onboarding, evaluación, dashboard, mapa, ficha de región, partida, resultados, perfil, estadísticas, colección, cuaderno de errores, misiones/logros, ajustes, **Bazar del Copista**, estación de música, biblioteca + hoja de ruta |
| **Voz y audio** | Síntesis del navegador (TTS) en tarjetas, dictados, matices y lectura sincronizada; **siempre con alternativa visual** si el navegador no ofrece voz; sonidos WebAudio sintetizados |
| **Persistencia** | IndexedDB (con espejo en localStorage), guardado diferido + volcado inmediato; exportar/importar JSON; borrado total |
| **PWA** | Manifest, service worker *network-first* conservador (cache v2), página offline, iconos (incl. maskable), aviso de nueva versión; **sin registro de SW en desarrollo** (evita caches obsoletas) |
| **Compañero** | **Léxico, el búho bibliotecario**: interviene solo en momentos clave, con consejos de las mecánicas nuevas |
| **Accesibilidad** | Navegación por teclado, etiquetas ARIA, contrastes AA en todas las paletas (claro, oscuro, nocturno), tamaño de texto configurable, alternativa a todo arrastre, estados no solo por color |
| **Pruebas** | **209 pruebas unitarias del motor** (`bun test`) + auditoría automática de integridad de datos (grafos de historias, índices, duplicados) + verificación E2E con navegador real |

## 1.bis Qué incluye la Etapa 3 (super actualización)

| Área | Entregado |
|---|---|
| **35 minijuegos nuevos (5 por isla)** | **Memoria de pares** (palabra↔significado, homófonos, cultismos, regionalismos, sinónimos, etimologías), **El intruso** (families semánticas y etimológicas), **Clasifica** (ser/estar, por/para, agudas/llanas/esdrújulas, hecho/opinión, formal/coloquial, literal/figurado, mapa hispano), **Verdadero o falso** (7 variantes temáticas), **Escribe la palabra** (conjugación, ortografía trampa, palabra evocada), **Oye** (escucha y elige la escritura, con generador de errores fonéticos verosímiles), **Conecta** (inicio↔final, refrán↔significado, palabra↔origen, frase↔intención) |
| **Nueva isla** | **Observatorio de la Palabra** (nivel 7): etimologías reales (árabe, náhuatl, quechua, taíno, griego, latín, guaraní…), regionalismos de toda la hispanofonía y 7.ª habilidad: **cultura lingüística** |
| **Mascota Léxico** | Rediseñada con 6 estados de ánimo; reacciona EN DIRECTO en el HUD de las partidas (celebra combos, consuela rachas malas) y saluda en resultados, onboarding, mapa y estadísticas |
| **Jugosidad** | Tarjeta SRS **volteable 3D** (toca la carta, sin botones), animaciones de entrada/salida por elemento, feedback con mascota, **música del menú silenciada en partidas** (configurable), sonidos propios de cada nuevo formato |
| **Temas** | **6 paletas** (aurora índigo —predeterminada—, coral, miel, lavanda, océano, magenta) × claro/oscuro/sistema, sin verde como color principal, modo nocturno conservado; dark rediseñado con más contraste y profundidad |
| **Perfil 2.0** | **Banner** (8 predefinidos o imagen propia), **foto de perfil con predeterminada de Léxico** al quitarla, **bio** de 160 caracteres, rangos con género elegido en el onboarding, insignias con niveles (bronce/plata/oro/platino), las 7 habilidades |
| **Estadísticas 2.0** | Récords (mejor día, combo más largo, juego favorito, respuesta media, formatos probados), **mapa de constancia de 12 semanas**, tiempo jugado, exactitud por isla, historial con duración |
| **Estación de música** | El jugador carga sus canciones (MP3/OGG/WAV…), se guardan **solo en su dispositivo** (IndexedDB), reprodución con **aleatorio, repetición (una/todas), pasar, anterior, volumen**, sigue sonando al navegar y se pausa en partidas si se prefiere; la música ambiental cede el paso |
| **Frases del día** | **220 citas** (escritores, refranes y sabiduría del Archipiélago) que rotan con cada navegación |
| **Datos** | Gestión completa en Ajustes: exportar/importar JSON, **migración guiada a otro dispositivo**, borrados finos (solo progreso / solo jardín SRS), uso de espacio del navegador, y **bóveda cifrada zero-knowledge** |
| **Backend seguro** | `POST/GET /api/vault` con validación **zod** estricta (422 para sobres malformados), **rate-limit** por IP (5 subidas/30 descargas por hora → 429), expiración a 30 días, IDs no enumerables, **middleware** con CSP estricta, X-Frame-Options DENY, anti-MIME-sniffing, Permissions-Policy y CORS same-origin; cifrado **AES-GCM 256 con PBKDF2 600 000** íntegramente en el cliente |
| **Progresión** | Entrenamiento rápido **bloqueado por nivel de isla** (solo juegos de islas desbloqueadas) y contador de desbloqueados; logros nuevos (7 islas, coleccionista de formatos, etimólogo) |

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

## 1.ter Qué incluye la Etapa 4 · «El Códice Infinito» (mayor actualización)

| Área | Entregado |
|---|---|
| **Corrección crítica** | **Migración automática de partidas antiguas** (`engine/migrate.ts`): perfiles sin `banner`/`bio`/`wallet` y núcleos sin `skills.cultura`/métricas modernas se reparan al cargar — la clase entera de crashes «campo indefinido» queda extinta, con 6 pruebas dedicadas |
| **8.ª isla** | **Forja del Escritor** (nivel 8): isla volcánica en el mapa (con yunque, brasas y chispas animadas) para entrenar estilo y retórica |
| **5 formatos nuevos (56 juegos)** | **Forja de Metáforas** (la imagen literaria exacta), **Registro Correcto** (formal/coloquial/neutro según la situación), **Taller de Conectores** (contraste, causa, concesión…), **Detector de Ironía** (literal vs. irónico con contexto), **Censura del Editor** (tacha la redundancia: «subir arriba», «ambos dos»… con trampas honestas de texto limpio) |
| **Economía** | Moneda **«tinta»** (1 por cada 10 XP de sesión) + **Bazar del Copista** (16.ª pantalla): 6 marcos de avatar, 7 títulos y escudos de racha comprables; lógica pura en `engine/shop.ts` con 12 pruebas (fondos, duplicados, tope de escudos, inmutabilidad) |
| **Contenido** | **+60 ejercicios** de estilo (5 081 en total), **+150 palabras SRS** (1 310; literatura y retórica: «pleonasmo», «anáfora», «greguersía», «palimpsesto»…), **+108 frases del día** (328: de Borges a Benedetti, con la sabiduría de la Forja) |
| **Perfil 3.0** | **Marco equipado** en la foto, **título** bajo el nombre, **insignia destacada** (toca un logro para lucirlo), saldo de tinta visible y acceso directo al Bazar |
| **Inicio 3.0** | Saludo por hora (buenos días/tardes/noches), **Palabra del Día** determinista (prioriza palabras sin descubrir), tarjeta de la Forja con estado de desbloqueo y accesos a Bazar/Tintero |
| **Estadísticas 3.0** | **Proyección de nivel** (días estimados a tu ritmo), **tinta ganada/gastada**, **isla más afilada**, mapa de constancia ampliado a **16 semanas** |
| **Colección y cuaderno** | Filtro **MCER** (A1-C2) en la colección (además de búsqueda y estado) y **filtro por habilidad** en el cuaderno de errores |
| **Sonido y voz** | **Paisajes sonoros sintetizados** sin descargas (lluvia, olas, chimenea con crepitar, noche con grillos) en la estación; **velocidad de voz** ajustable (×0.5-×1.3) y **háptics** (vibración en aciertos y fanfarrias) |
| **Léxico 2.0** | Dos estados nuevos (**curioso** al entrar en la Forja, **dormido** si te ausentas 40 s) sobre los 6 existentes |
| **Onboarding y PWA** | Paso 6 para elegir **paleta con vista previa en vivo**; **atajos de app** (sesión rápida, misiones, Bazar, estación) |
| **Progresión** | **+13 logros** (40 en total: forja, tinta, ocho islas, racha 30, combo 15, 10 h, 100 sesiones, nivel 15 «Leyenda del Códice»), **misiones de tinta** diarias y semanales, métrica `tinta` en el motor |

---

## 1.cuater · Qué incluye la Mega-6 · «El Salón de Juegos» (tanda 3)

| Área | Entregado |
|---|---|
| **Salón de Juegos Educativos** | Sección nueva (navegable como «Juegos» en el muelle móvil, la barra lateral de PC y el dashboard) con **23 juegos**: ajedrez, damas y 21 minijuegos de cálculo, memoria, lógica, letras y reflejos. Desbloqueo con **tinta** (nunca cuesta nivel ni XP), XP por partida con tope diario anti-farmeo, récords personales y 6 logros nuevos |
| **Ajedrez con motor local** | Motor completo en TypeScript dentro del dispositivo: jugadas legales (enroque, al paso, promoción), jaque/mate/ahogado/tablas, IA negamax con poda alfa-beta y 4 niveles (~800-2000 ELO). **Verificado con perft canónico** (inicial 20/400/8902, Kiwipete 48/2039, posición 3: 14/191/2812) |
| **Revisión de partidas** | Al terminar el ajedrez, el motor repite cada posición y compara tu jugada con la mejor línea: precisión por bando, jugada a jugada clasificada (óptima/buena/dudosa/error/desastre), barra de evaluación y tablero reproducible |
| **Damas españolas** | Captura obligatoria, cadenas de captura y damas voladoras; IA minimax a 3 profundidades con 3 rivales |
| **21 minijuegos** | Mates Relámpago, Códice Romano, Faro Binario, Mayor o Menor, Simón de la Marea, Pares de Letras, Memoria de Dígitos, Luces del Muelle, Torres de la Fortaleza, Sudoku 4×4, Caza de Minas, Puzle Deslizable, Tres en Raya (rival perfecto), Conecta Cuatro, Pluma Veloz (mecanografía), Anagramas, Palabra Secreta, Ahorcado de la Fauna, Test de Stroop, Reflejo del Faro y Danza de Flechas |
| **Bazar 2.0** | **Decoraciones de avatar de doble anillo (estilo Discord)** con rarezas (común/raro/épico/legendario), **banners premium** equipables en la ficha, 5 marcos nuevos (hasta legendarios), 4 títulos nuevos del salón, vistas previas reales en cada tarjeta |
| **Perfil 3.5** | Avatar con **doble anillo tipo Discord** (gradiente + separador oscuro), botón de banner arriba a la derecha (ya no lo tapa el nivel), banners premium en el selector, texto de tinta con mejor ajuste |
| **Mapa con más vida** | Escena **más alta en móvil** (68dvh, islas más grandes y separadas), iconos de islas bloqueadas **con color** (ya no en gris), nubes que cruzan, delfines saltando, ballena con soplo, pececitos, estrella fugaz, ondas concéntricas y botella a la deriva |
| **Dashboard emparejado** | **Tira de estadísticas siempre visible** (XP hoy, exactitud, racha, sesiones, palabras) también en móvil, **maquetación a dos columnas en PC**, acceso directo a Juegos y estadísticas desde el inicio |
| **Sonido** | Retiradas las texturas de ruido ambiental (lluvia, viento, olas de fondo, chimenea): la banda sonora queda solo con la parte melódica; nueva escena musical propia del salón |
| **Vocabulario** | **1 844 palabras** (+534): fusionados los packs C1 y D1 que habían quedado huérfanos (330 recuperadas) y nuevo paquete E1 con finanzas, ciencia, arte, clima, ley, oficios, salud, emociones, colores matizados, geografía y léxico marinero — deduplicado por palabra |
| **Estabilidad** | Corregidos: el enrutador ignoraba la pantalla «juegos» (hash `#/juegos`), 3 bugs del motor de ajedrez detectados por perft (ataques de peón, deslizamiento vertical, casillas de enroque), textos corruptos en el paquete nuevo. **226 pruebas** del motor pasando |

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
│   ├── regions.ts        #  8 regiones: metadatos, mapa, desbloqueo
│   ├── games.ts          #  registro de 56 minijuegos (instrucciones, tiempos)
│   ├── words-srs.ts / words-srs-b.ts  #  1 310 palabras (definición, ejemplo, MCER)
│   ├── trivia.ts / puzzles.ts / cloze.ts
│   ├── errors-hunt.ts / tildes.ts / paragraphs.ts
│   ├── placement.ts (en content.ts)  # evaluación inicial
│   ├── achievements.ts   #  40 logros con evaluadores puros
│   ├── missions.ts       #  plantillas diarias/semanales (incluye métrica de tinta)
│   ├── forja.ts          #  60 ejercicios de estilo y retórica (Etapa 4)
│   ├── frases-a/b/c.ts   #  328 frases del día
│   ├── roadmap.ts        #  25 mecánicas + 26 módulos con etapa asignada
│   └── companion.ts      #  repertorio de Léxico
├── engine/               # LÓGICA PURA (testeable sin navegador)
│   ├── core.ts           #  reductor de sesión: XP, racha, misiones, logros, tinta
│   ├── migrate.ts        #  migración de partidas antiguas (perfil/núcleo)
│   ├── shop.ts           #  Bazar: catálogo, tinta, compras y equipaje (puro)
│   ├── xp.ts             #  niveles, rangos, MCER, dificultad objetivo
│   ├── srs.ts            #  SM-2 simplificado
│   ├── scoring.ts        #  XP por ítem: dificultad, combo, velocidad, topes
│   ├── validation.ts     #  validación por tipo de ejercicio (incluida la Forja)
│   ├── session.ts        #  constructores de sesión (misión/entreno/repaso)
│   ├── missions.ts       #  generación determinista + métricas
│   ├── streak.ts         #  rachas flexibles con escudos
│   └── rng.ts            #  RNG determinista (mulberry32) + barajado
├── services/
│   ├── storage.ts        #  IndexedDB + espejo localStorage + export/import
│   ├── audio.ts           #  sonidos WebAudio sintetizados, TTS, háptics
│   ├── music-station.ts   #  estación de música del jugador (IndexedDB)
│   └── soundscapes.ts     #  paisajes sonoros sintetizados (lluvia, olas…)
├── store/
│   ├── game-store.ts     #  Zustand: perfil, ajustes, core, SRS, Bazar, persistencia
│   └── ui-store.ts       #  enrutador por hash (botón atrás funcional)
├── components/
│   ├── game/             #  carcasa, HUD, Léxico, feedback, widgets, iconos, PWA
│   └── ui/               #  shadcn/ui
├── games/                #  LOS 56 MINIJUEGOS (componentes por ejercicio)
└── screens/              #  LAS 17 PANTALLAS
```

### Decisiones técnicas clave

1. **Next.js 16 + React 19 + TypeScript** (en lugar de Vite): el entorno de despliegue de este proyecto está construido alrededor de Next.js, y su App Router deja preparadas rutas de API para la IA de la Etapa 3. El juego en sí es una SPA cliente 100 % React + TS, exactamente la propuesta técnica original.
2. **Ruta única con enrutador propio por hash**: la interfaz completa vive bajo `/` (requisito del entorno), pero el botón atrás del navegador funciona porque el router sincroniza `location.hash` (`#/home`, `#/juego/trivia/training`…). Al recargar, se restaura la pantalla.
3. **Separación estricta contenido / lógica / interfaz**: `data/` no importa React; `engine/` es puro (sin DOM) y por eso se puede probar con `bun test` sin navegador; `games/` y `screens/` solo orquestan.
4. **Reductor de sesión puro** (`engine/core.ts`): `reduceSessionComplete(core, input) → { core, result }` aplica XP, habilidades, racha, misiones, logros, errores y **tinta del Bazar** en una sola función inmutable — más de la mitad de las 209 pruebas cubren este flujo y las mecánicas de la Etapa 2.
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

# 3) Pruebas unitarias del motor (209 pruebas)
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
| `bun test tests/engine.test.ts` | **173/173 aprobadas** — todo el repertorio de la Etapa 1 (niveles/rangos, MCER, dificultad objetivo, SRS completo, puntuación con combo/velocidad/anti-farmeo, validación de los 6 tipos originales, rachas, misiones deterministas, reductor de sesión, evaluación inicial, RNG) **más la Etapa 2**: dictado (normalización tolerante, tilde que falta falla, diff palabra a palabra), opción por índice, minuto (gradación honesta por esfuerzo), sesiones de puerto/torre/biblioteca, grafos de historias (next válidos, finales alcanzables), cobertura de dificultad de los 7 packs nuevos, no concentración de respuestas y logros nuevos |
| `npx tsc --noEmit` | **0 errores** (verificación real de tipos; el build las ignora, aquí no) |
| `bun run scripts/audit-data.ts` | **Auditoría de integridad de datos sin problemas** — 209 ejercicios con IDs únicos, índices en rango, opciones sin duplicar, grafos de historias con todos los nodos alcanzables y final accesible, metas del minuto razonables, coherencia dificultad/MCER |
| `bun run lint` (ESLint 9 + reglas React Compiler) | **0 errores, 0 avisos** |
| E2E con navegador real (agent-browser + Chromium) | **Etapa 1** (verificado en su momento): onboarding completo, evaluación, SRS, mapa, ficha de región, trivia con camino de error, cuaderno de errores, repaso, ajustes, persistencia tras recarga, móvil 390×844 y escritorio. **Etapa 2 (verificado ahora)**: dictado con diff palabra a palabra, sprint con timeout explicado, sinónimos, **historia completa con decisiones y pregunta final**, **reto del minuto de principio a fin (escritura → autoevaluación → XP honesto)**, **misión completa de la Torre registrada en historial con XP**, mapa con Puerto (niv. 5) y Torre (niv. 6), radar de 6 habilidades, **modo lectura nocturna verificado por análisis de píxeles (paleta oscura y cálida)**, 24 logros en galería, colección con 73 palabras, biblioteca con 15 juegos, rutas en español (#/mapa…) y restauración tras recarga |
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
4. **Alcance del contenido**: 73 palabras y 209 ejercicios de autoría propia. La arquitectura de paquetes está pensada para crecer sin tocar el motor.
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
