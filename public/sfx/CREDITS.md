# Créditos del banco de audio de VerbalIA

Todo el sonido del juego son **archivos reales con licencia libre** (CC0 preferente,
CC-BY aceptable con crédito). Nada se genera por código. Este archivo documenta
la fuente, el autor y la licencia de cada archivo commiteado aquí y en `public/music/`.

Presupuesto servido: `public/sfx/` ≈ 2,0 MB + `public/music/` ≈ 6,6 MB ≈ **8,6 MB en total**
(límite autoimpuesto: 12 MB; cada SFX < 100 KB, cada loop de música < 1,5 MB).

Cada efecto existe en `.ogg` (preferido) y `.mp3` (respaldo para navegadores sin Vorbis,
p. ej. Safari/iOS). Los nombres con número (p. ej. `correct2.ogg`) son variantes del mismo
efecto: el juego las alterna al azar para que nunca suene igual dos veces seguidas.

**Sobre el sintetizador:** el motor guarda un pequeño sintetizador de emergencia que solo
suena si un archivo real no llega (primera visita sin red, navegador caprichoso). Es
exclusivamente respaldo de emergencia: nunca reemplaza al banco y no forma parte del
sonido previsto del juego.

## Efectos (`public/sfx/`)

### Kenney · «Interface Sounds» — CC0
Por [Kenney Vleugels](https://kenney.nl) ([kenney.nl/interface-sounds](https://kenney.nl/assets/interface-sounds)),
licencia [Creative Commons Zero (CC0)](https://creativecommons.org/publicdomain/zero/1.0/).
Uso libre sin atribución obligatoria; el crédito se incluye por gratitud.

| Efecto | Archivos fuente |
| --- | --- |
| `tap` | `select_001/002/003.ogg` |
| `click` | `click_001/002/003.ogg` |
| `toggle` | `switch_001/002/003.ogg` |
| `pop` | `drop_001/002/003.ogg` |
| `correct` | `confirmation_001/002/003.ogg` |
| `wrong` | `error_004/005/006.ogg` |
| `error` | `error_001/002.ogg` |
| `slide` | `scroll_001/002.ogg` |
| `snap` | `click_004/005.ogg` |
| `open` | `open_001/002.ogg` |
| `close` | `close_001/002.ogg` |
| `back` | `back_001/002.ogg` |
| `navigate` | `select_004/005.ogg` |
| `tinta` | `pluck_001/002.ogg` |
| `buy` (1.ª variante) | `confirmation_004.ogg` |
| `combo` | `glass_001/002.ogg` |
| `confetti` (2.ª variante) | `glass_001.ogg` |
| `chime` | `bong_001.ogg`, `glass_003.ogg` |
| `buoy` | `glass_004.ogg` |
| `sessionEnd` | `glass_005.ogg`, `drop_004.ogg` |
| `go` | `confirmation_001/002.ogg` |
| `countdown` | `select_006/007.ogg` |
| `tick`, `tock`, `clockTick` | `tick_001/002/004.ogg` |
| `typeWord` | `select_003.ogg` |
| `typeKey` | `click_005.ogg` |

### Kenney · «Casino Audio» — CC0
Por [Kenney Vleugels](https://kenney.nl) ([kenney.nl/casino-audio](https://kenney.nl/assets/casino-audio)),
licencia [CC0](https://creativecommons.org/publicdomain/zero/1.0/).

| Efecto | Archivos fuente |
| --- | --- |
| `page` | `card-slide-5/6.ogg` |
| `flip` | `card-slide-2/4.ogg` |
| `deal` | `card-shove-1/2.ogg` |
| `place` | `chip-lay-1/2.ogg` |
| `coins` | `chips-collide-1/2/3.ogg` |
| `coin` (2.ª variante) | `chips-collide-1.ogg` |
| `buy` (2.ª variante) | `chip-lay-3.ogg` |
| `stamp` | `card-shove-3.ogg` |

### «Level up, power up, Coin get (13 Sounds)» — CC0
Por [wobbleboxx](https://opengameart.org/users/wobbleboxx), publicado en
[OpenGameArt](https://opengameart.org/content/level-up-power-up-coin-get-13-sounds),
licencia [CC0](https://creativecommons.org/publicdomain/zero/1.0/).

| Efecto | Archivos fuente |
| --- | --- |
| `whoosh` | `Rise01/02/03.aif` |
| `coin` (1.ª variante), `claim` | `Coin01.aif` |
| `unlock` | `Upper01.aif` |
| `levelUp` | `Rise04/05.aif` |
| `achievement` | `Rise01/02.aif` |
| `gift` | `Rise07.aif` |
| `claim` (2.ª variante), `stepUp` | `Rise06.aif` |
| `streak` | `Rise03.aif` |
| `sparkle` | `FX01/02.aif` |
| `confetti` (1.ª variante) | `FX02.aif` |
| `sessionLose` | `Downer01.aif` |

### «Children's March Theme» — CC0 (sting de victoria)
Por [Cleyton Kauffman](https://soundcloud.com/cleytonkauffman), publicado en
[OpenGameArt](https://opengameart.org/content/childrens-march-theme), licencia
[CC0](https://creativecommons.org/publicdomain/zero/1.0/).
`sessionWin` son los primeros 3,5 s del tema con fundido de salida.

## Música ambiente (`public/music/`)

Un loop por escena, con fundido cruzado al cambiar de región. Todos verificados
página por página en OpenGameArt:

| Escena / región | Tema original | Autor | Licencia | Página |
| --- | --- | --- | --- | --- |
| `bosque` · Bosque del Vocabulario | I think I'd stay (jungle chill) | Emmntt | CC0 | [ver](https://opengameart.org/content/i-think-id-stay-jungle-chill) |
| `ciudad` · Ciudad de la Gramática | One Horse Town | tcarisland | CC-BY 4.0 | [ver](https://opengameart.org/content/one-horse-town) |
| `fortaleza` · Fortaleza de la Ortografía | The Bard's Tale (loop) | RandomMind | CC0 | [ver](https://opengameart.org/content/medieval-the-bards-tale) |
| `biblioteca` · Biblioteca Infinita | Magician Village (in-game loop) | beardalaxy | CC0 | [ver](https://opengameart.org/content/magician-village-loop) |
| `puerto` · Puerto de las Voces | Port Town (in-game loop) | beardalaxy | CC0 | [ver](https://opengameart.org/content/port-town-loop) |
| `torre` · Torre de la Expresión | Harmony in the Mists (loop) | Tsorthan Grove | CC-BY 4.0 | [ver](https://opengameart.org/content/harmony-in-the-mists) |
| `observatorio` · Observatorio de la Palabra | HEAVEN | GloryToTheMachine | CC-BY 4.0 | [ver](https://opengameart.org/content/heaven-glorytothemachine-angelicdeepdivine-loop) |
| `forja` · Forja del Escritor | Crystal Caverns (geode) | Tsorthan Grove | CC-BY 4.0 | [ver](https://opengameart.org/content/crystal-caverns) |
| `arcade` · Salón de Juegos | Chiptune Medieval: Minstrel Dance (loop) | RandomMind | CC0 | [ver](https://opengameart.org/content/chiptune-medieval-minstrel-dance) |
| `welcome` · Portada | MEADOW | GloryToTheMachine | CC-BY 4.0 | [ver](https://opengameart.org/content/meadow-glorytothemachine-ambientemotionalnostalgic-loop) |
| `map` · Mapa | Exploration Theme | Cleyton Kauffman | CC0 | [ver](https://opengameart.org/content/exploration-theme) |
| `missions` · Misiones | A Busy Day at the Market (loop) | ViRiX | CC-BY 3.0 | [ver](https://opengameart.org/content/busy-day-at-the-market) |
| `results` · Resultados | Children's March Theme | Cleyton Kauffman | CC0 | [ver](https://opengameart.org/content/childrens-march-theme) |
| `errors` · Cuaderno de errores | Mysterious Calm | bart | CC-BY 3.0 | [ver](https://opengameart.org/content/mysterious-calm) |
| `stats` · Estadísticas | Contemplation | Pro Sensory | CC0 | [ver](https://opengameart.org/content/contemplation-0) |

Las demás pantallas reutilizan el loop de una escena cercana (p. ej. Ajustes usa
`puerto`, Colección usa `biblioteca`, Perfil usa `map`): sin archivos extra.

## Créditos CC-BY (obligatorios)

- **GloryToTheMachine** — HEAVEN, MEADOW · [CC-BY 4.0](https://creativecommons.org/licenses/by/4.0/)
- **Tsorthan Grove** — Harmony in the Mists, Crystal Caverns · [CC-BY 4.0](https://creativecommons.org/licenses/by/4.0/)
- **tcarisland** — One Horse Town · [CC-BY 4.0](https://creativecommons.org/licenses/by/4.0/)
- **ViRiX** — A Busy Day at the Market · [CC-BY 3.0](https://creativecommons.org/licenses/by/3.0/)
- **bart** — Mysterious Calm · [CC-BY 3.0](https://creativecommons.org/licenses/by/3.0/)

El resto de archivos son CC0 (dominio público; crédito por gratitud, no obligación).
El guion de construcción reproducible está en `scripts/build-audio.sh`.
