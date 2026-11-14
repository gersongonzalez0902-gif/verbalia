#!/usr/bin/env bash
# ============================================================
# Ola E · 5 · Ambiente único de estudio + banco SFX uniforme
# ------------------------------------------------------------
# 1) public/music: los 15 loops por región se sustituyen por DOS
#    capas de ambiente natural calmo (olas + brisa con pájaros
#    esporádicos), sin melodía ni instrumentos, en loops largos
#    sin costura construidos con acrossfade (fin → inicio).
#    Fuentes CC0 (OpenGameArt):
#      - RandomMind, «Sea and river wave sounds» (VistulaShort.mp3)
#        https://opengameart.org/content/sea-and-river-wave-sounds
#      - Spring Spring, «Birds and Wind - Ambient»
#        https://opengameart.org/content/birds-and-wind-ambient-birds-wind-and-synth
# 2) public/sfx: el banco se normaliza por PICO a −2 dBFS (sin
#    limitador ni distorsión); el balance fino percibido entre
#    efectos vive en el motor (spec.gain por clave, src/services/
#    audio.ts). pop.ogg pasa a ser el pop de burbuja único (Kenney
#    drop_002); clockSoft.ogg es el latido lejano del Gran Reloj
#    (tick_004 bajado 6 semitonos y filtrado bajo 600 Hz). Cada
#    efecto conserva su gemelo .mp3 (libmp3lame 64 kbps mono) como
#    respaldo de Safari/iOS.
#    Nada se sintetiza: solo se recorta, funde, filtra y normaliza
#    audio real con licencia libre. Fuentes: public/sfx/CREDITS.md.
# Uso: bash scripts/ola-e5-audio.sh [/tmp/amb]
# ============================================================
set -euo pipefail
SRC="${1:-/tmp/amb}"
OUT="$(cd "$(dirname "$0")/.." && pwd)"
SFX="$OUT/public/sfx"
MUS="$OUT/public/music"

need() { command -v "$1" >/dev/null || { echo "falta $1"; exit 1; }; }
need ffmpeg

# ---------- 1) AMBIENTE ÚNICO (2 loops sin costura) ----------
# Bucle sin costura por el método clásico «corte de gallo» (long = L − d +
# cola), en tres pasos simples (el grafo de una pieza desordena las ramas
# en ffmpeg 7.1): pieza de fundido (cola → cabeza, acrossfade d=10),
# cuerpo, y concatenación con la ganancia final.
# Olas: ventana calma 30-162 s del registro de Vístula (132 s → bucle 124 s).
if [ ! -f "$MUS/estudio-olas.ogg" ]; then
  T=$(mktemp -d)
  ffmpeg -v error -y -i "$SRC/VistulaShort.mp3" -i "$SRC/VistulaShort.mp3" -filter_complex \
    "[0:a]aformat=sample_rates=44100:channel_layouts=stereo,atrim=146:162,asetpts=N/SR/TB[o1];
     [1:a]aformat=sample_rates=44100:channel_layouts=stereo,atrim=30:42,asetpts=N/SR/TB[o2];
     [o1][o2]acrossfade=d=10[o]" -map "[o]" -c:a pcm_s16le "$T/p.wav"
  ffmpeg -v error -y -i "$SRC/VistulaShort.mp3" \
    -af "aformat=sample_rates=44100:channel_layouts=stereo,atrim=40:146,asetpts=N/SR/TB" -c:a pcm_s16le "$T/b.wav"
  ffmpeg -v error -y -i "$T/b.wav" -i "$T/p.wav" \
    -filter_complex "[0:a][1:a]concat=n=2:v=0:a=1,volume=-9.4dB[o]" \
    -map "[o]" -c:a libvorbis -q:a 4 "$MUS/estudio-olas.ogg"
  rm -rf "$T"
fi
# Brisa con pájaros: mismo método sobre los 83,8 s de la grabación → 75,8 s.
if [ ! -f "$MUS/estudio-brisa.ogg" ]; then
  T=$(mktemp -d)
  ffmpeg -v error -y -i "$SRC/birds-wind-ambient.ogg" -i "$SRC/birds-wind-ambient.ogg" -filter_complex \
    "[0:a]aformat=sample_rates=44100:channel_layouts=stereo,atrim=71.78:83.78,asetpts=N/SR/TB[o1];
     [1:a]aformat=sample_rates=44100:channel_layouts=stereo,atrim=0:12,asetpts=N/SR/TB[o2];
     [o1][o2]acrossfade=d=10[o]" -map "[o]" -c:a pcm_s16le "$T/p.wav"
  ffmpeg -v error -y -i "$SRC/birds-wind-ambient.ogg" \
    -af "aformat=sample_rates=44100:channel_layouts=stereo,atrim=10:71.78,asetpts=N/SR/TB" -c:a pcm_s16le "$T/b.wav"
  ffmpeg -v error -y -i "$T/b.wav" -i "$T/p.wav" \
    -filter_complex "[0:a][1:a]concat=n=2:v=0:a=1,volume=6.5dB[o]" \
    -map "[o]" -c:a libvorbis -q:a 5 "$MUS/estudio-brisa.ogg"
  rm -rf "$T"
fi

# El tope es ~2 MB por loop: si las olas lo superan, baja un escalón de calidad.
OLAS=$(stat -c%s "$MUS/estudio-olas.ogg")
if [ "$OLAS" -gt 2048000 ]; then
  ffmpeg -v error -y -i "$MUS/estudio-olas.ogg" -c:a libvorbis -q:a 3 "$MUS/estudio-olas.tmp.ogg"
  mv "$MUS/estudio-olas.tmp.ogg" "$MUS/estudio-olas.ogg"
fi

# Fuera los 15 loops por región (el ambiente es uno en todo el juego).
find "$MUS" -name '*.ogg' ! -name 'estudio-*' -delete
find "$MUS" -name '*.mp3' -delete

# ---------- 2) POP DE BURBUJA ÚNICO ----------
# pop2 (Kenney drop_002) es el más redondo de los tres (agudos −37 dB
# frente a graves −22): pasa a ser pop.ogg, única variante de navegación.
cp "$SFX/pop2.ogg" "$SFX/pop.ogg"

# ---------- 3) LATIDO LEJANO DEL GRAN RELOJ ----------
# clockSoft = clockTick3 (55 ms, el de mayor decay) bajado 6 semitonos
# (factor 0,7071) y filtrado por debajo de 600 Hz: presencia de
# «latido lejano», no de reloj.
ffmpeg -v error -y -i "$SFX/clockTick3.ogg" \
  -af "asetrate=44100*0.7071,aresample=44100,lowpass=f=600" \
  -c:a libvorbis -q:a 5 "$SFX/clockSoft.ogg"

# ---------- 4) BANCO UNIFORME: retirar y normalizar por pico ----------
# Retirados: variantes repetidas de todo lo que no es celebración
# (logro y subir de nivel conservan la suya), voces de navegación
# unificadas en pop, y tic-tac sustituido por clockSoft.
RETIRADAS="tap tap2 tap3 click click2 click3 back back2 toggle toggle2 toggle3
  navigate navigate2 pop2 pop3 correct2 correct3 wrong2 wrong3 error2
  whoosh2 whoosh3 slide2 page2 flip2 deal2 place2 snap2 open2 close2
  coin2 coins2 coins3 tinta2 buy2 claim2 sparkle2 confetti2 chime2
  sessionEnd2 go2 combo2 countdown2 tick tick2 tock tock2
  clockTick clockTick2 clockTick3"
for b in $RETIRADAS; do
  rm -f "$SFX/$b.ogg" "$SFX/$b.mp3"
done

# Normaliza cada .ogg restante por PICO a −2 dBFS (cero distorsión:
# solo ganancia). Gemelo .mp3 (64 kbps mono) desde el ogg final.
for f in "$SFX"/*.ogg; do
  b=$(basename "$f" .ogg)
  peak=$(ffmpeg -i "$f" -af volumedetect -f null - 2>&1 | grep max_volume | awk '{print $5}')
  gain=$(awk -v p="$peak" 'BEGIN{printf "%.1f", -2-p}')
  ffmpeg -v error -y -i "$f" -af "volume=${gain}dB" \
    -c:a libvorbis -q:a 5 -ar 44100 -ac 2 "$f.tmp.ogg"
  mv "$f.tmp.ogg" "$f"
  ffmpeg -v error -y -i "$f" -c:a libmp3lame -b:a 64k -ac 1 "$SFX/$b.mp3"
  printf '%s: %+sdB\n' "$b" "$gain"
done

echo "---- inventario final ----"
ls "$MUS" && echo "sfx ogg: $(ls "$SFX"/*.ogg | wc -l)" && du -sh "$MUS" "$SFX"
