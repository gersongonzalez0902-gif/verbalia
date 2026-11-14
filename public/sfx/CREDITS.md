# Créditos del banco de audio de VerbalIA

Todo el sonido del juego son **archivos reales con licencia libre** (CC0).
Nada se genera por código. Este archivo documenta la fuente, el autor y la
licencia de cada archivo commiteado aquí y en `public/music/`.

Presupuesto servido: `public/sfx/` ≈ 1,2 MB (40 efectos × 2 formatos) +
`public/music/` ≈ 3,3 MB (2 loops de ambiente) ≈ **4,5 MB en total**
(límite autoimpuesto: 12 MB; cada SFX < 60 KB, cada loop < 2 MB).

Cada efecto existe en `.ogg` (preferido) y `.mp3` (respaldo para navegadores sin Vorbis,
p. ej. Safari/iOS), **normalizado por pico a −2 dBFS** para que ningún efecto pegue
un salto de volumen; el balance fino percibido vive en el motor
(`src/services/audio.ts`, ganancias float por efecto).

**Reglas de la Ola E · 5 (ambiente único de estudio):**

- **Una sola capa de ambiente** en todo el juego (portada, mapa, regiones y
  juegos): sin cambios de ambiente entre regiones ni fundidos cruzados entre
  escenas; solo el fundido suave de entrada al abrir la app. Al silenciar,
  silencio total.
- **La navegación es UN solo pop de burbuja** (`pop`, de Kenney drop_002):
  tap, click, back, toggle y navigate comparten ese único archivo. Una
  variante, siempre la misma.
- **Acierto, fallo y reloj tienen UNA sola variante fija** cada uno; nunca
  alternan al azar. Las variantes que se alternan quedan solo en las
  celebraciones poco frecuentes (logro, subir de nivel); victoria y racha se
  conservan tal cual.
- **El Gran Reloj** no es un tic-tac: es un «latido lejano» (`clockSoft`,
  tic real bajado 6 semitonos y filtrado por debajo de 600 Hz), a volumen
  menor que antes.

**Sobre el sintetizador:** el motor guarda un pequeño sintetizador de emergencia que solo
suena si un archivo real no llega (primera visita sin red, navegador caprichoso). Es
exclusivamente respaldo de emergencia: nunca reemplaza al banco y no forma parte del
sonido previsto del juego.

## Efectos (`public/sfx/`)

### Kenney · «Interface Sounds» — CC0
Por [Kenney Vleugels](https://kenney.nl) ([kenney.nl/interface-sounds](https://kenney.nl/assets/interface-sounds)),
licencia [Creative Commons Zero (CC0)](https://creativecommons.org/publicdomain/zero/1.0/).
Uso libre sin atribución obligatoria; el crédito se incluye por gratitud.

| Efecto del juego | Archivo fuente |
| --- | --- |
| `pop` (única voz de navegación: tap, click, back, toggle, navigate) | `drop_002.ogg` |
| `correct` (única variante) | `confirmation_001.ogg` |
| `wrong` (única variante) | `error_004.ogg` |
| `error` | `error_001.ogg` |
| `slide` | `scroll_001.ogg` |
| `open` | `open_001.ogg` |
| `close` | `close_001.ogg` |
| `tinta` | `pluck_001.ogg` |
| `combo` | `glass_001.ogg` |
| `chime` | `bong_001.ogg` |
| `buoy` | `glass_004.ogg` |
| `sessionEnd` | `glass_005.ogg` |
| `countdown` | `select_006.ogg` |
| `clockSoft` (latido lejano del Gran Reloj) | `tick_004.ogg`, bajado 6 semitonos (factor 0,7071) y filtrado bajo 600 Hz con ffmpeg |
| `typeWord` | `select_003.ogg` |
| `typeKey` | `click_005.ogg` |

### Kenney · «Casino Audio» — CC0
Por [Kenney Vleugels](https://kenney.nl) ([kenney.nl/casino-audio](https://kenney.nl/assets/casino-audio)),
licencia [CC0](https://creativecommons.org/publicdomain/zero/1.0/).

| Efecto del juego | Archivo fuente |
| --- | --- |
| `page` | `card-slide-5.ogg` |
| `flip` | `card-slide-2.ogg` |
| `deal` | `card-shove-1.ogg` |
| `place` | `chip-lay-1.ogg` |
| `coins` | `chips-collide-1.ogg` |
| `stamp` | `card-shove-3.ogg` |

### «Level up, power up, Coin get (13 Sounds)» — CC0
Por [wobbleboxx](https://opengameart.org/users/wobbleboxx), publicado en
[OpenGameArt](https://opengameart.org/content/level-up-power-up-coin-get-13-sounds),
licencia [CC0](https://creativecommons.org/publicdomain/zero/1.0/).

| Efecto del juego | Archivos fuente |
| --- | --- |
| `whoosh` | `Rise01.aif` |
| `coin`, `claim` | `Coin01.aif` |
| `unlock` | `Upper01.aif` |
| `levelUp` (2 variantes que se alternan: celebración poco frecuente) | `Rise04.aif`, `Rise05.aif` |
| `achievement` (2 variantes que se alternan: celebración poco frecuente) | `Rise01.aif`, `Rise02.aif` |
| `gift` | `Rise07.aif` |
| `stepUp` | `Rise06.aif` |
| `streak` | `Rise03.aif` |
| `sparkle` | `FX01.aif` |
| `confetti` | `FX02.aif` |
| `sessionLose` | `Downer01.aif` |

### «Children's March Theme» — CC0 (sting de victoria)
Por [Cleyton Kauffman](https://soundcloud.com/cleytonkauffman), publicado en
[OpenGameArt](https://opengameart.org/content/childrens-march-theme), licencia
[CC0](https://creativecommons.org/publicdomain/zero/1.0/).
`sessionWin` son los primeros 3,5 s del tema con fundido de salida.

## Ambiente único de estudio (`public/music/`)

Una sola capa de ambiente natural calmo —olas suaves + brisa con algún pájaro
muy esporádico— **sin melodía ni instrumentos**, en dos loops largos sin
costura construidos por «corte de gallo» (la cola se funde con la cabeza,
acrossfade de 10 s): suena igual en cualquier pantalla y el bucle no tiene
costura audible.

| Capa | Tema original | Autor | Licencia | Duración | Peso |
| --- | --- | --- | --- | --- | --- |
| `estudio-olas.ogg` | Sea and river wave sounds (VistulaShort, ventana 30–162 s) | RandomMind | CC0 | 124 s | 1,55 MB |
| `estudio-brisa.ogg` | Birds and Wind – Ambient | Spring Spring | CC0 | 75,8 s | 1,08 MB |

- Olas: [opengameart.org/content/sea-and-river-wave-sounds](https://opengameart.org/content/sea-and-river-wave-sounds)
  — grabación real de orilla; ventana calma recortada y bucle sin costura con ffmpeg.
- Brisa: [opengameart.org/content/birds-and-wind-ambient-birds-wind-and-synth](https://opengameart.org/content/birds-and-wind-ambient-birds-wind-and-synth)
  — pájaros y viento reales, sin sintetizadores (la variante «Birds and Wind – Ambient»,
  no la que lleva synth); bucle sin costura con ffmpeg. Va por debajo de las olas:
  solo las llamadas más fuertes asoman, así los pájaros quedan esporádicos.
- Las dos capas se reproducen a la vez y tienen longitudes distintas, así que la
  combinación tarda ~16 minutos en repetirse exacta.

## Créditos CC-BY (obligatorios)

Ninguno: desde la Ola E · 5 todo el banco (efectos y ambiente) es **CC0**.
Los créditos se mantienen por gratitud a los autores.

El guion de construcción reproducible está en `scripts/ola-e5-audio.sh`
(ambiente, latido y normalización por pico) y en `scripts/build-audio.sh`
(banco SFX histórico a partir de los paquetes CC0).
