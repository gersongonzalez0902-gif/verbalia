#!/bin/bash
# ============================================================
# Ola D · Área 3 · Banco de audio real de VERBALIA
# ------------------------------------------------------------
# Produce public/sfx/*.ogg (+ .mp3 de respaldo) y public/music/*.ogg
# a partir de paquetes CC0/CC-BY descargados (Kenney, OpenGameArt).
# Cada archivo fuente queda documentado en public/sfx/CREDITS.md.
#
# Fuentes (descargadas una vez a /tmp):
#   - Kenney «Interface Sounds» (CC0)        -> kenney-interface/
#   - Kenney «Casino Audio» (CC0)            -> casino/
#   - «51 UI sound effects» de Kenney (CC0)  -> ui51/
#   - «Level up, power up, Coin get» (CC0)   -> lvl/
#   - Loops de música verificados de OGA     -> verified/ (ver CREDITS.md)
#
# Uso: bash scripts/build-audio.sh [/tmp/audio-dl] [/tmp/audio-verified]
# ============================================================
set -euo pipefail
SRC="${1:-/tmp/audio-dl}"
VER="${2:-/tmp/audio-verified}"
OUT="$(dirname "$0")/.."
SFX="$OUT/public/sfx"
MUS="$OUT/public/music"
K="$SRC/kenney-interface/Audio"        # Kenney · Interface Sounds · CC0
C="$SRC/casino/Audio"                  # Kenney · Casino Audio · CC0
U="$SRC/ui51"                          # UI SFX Set · CC0
L="$SRC/lvl"                           # Level Up Power Up Coin Get · CC0
M="$SRC/music"                         # musica antigua NO verificada (solo some)
V="$VER"                               # musica verificada (ver CREDITS.md)
rm -rf "$SFX" "$MUS"
mkdir -p "$SFX" "$MUS"

# ---- SFX: efecto -> archivos fuente (1.º = favorito) ----
# Cada archivo se copia/enciende como <efecto>.ogg, <efecto>2.ogg, ...
# y se genera su gemelo .mp3 de respaldo (navegadores sin Vorbis).
mapfile -t MAP <<'EOF'
tap|$K/select_001.ogg|$K/select_002.ogg|$K/select_003.ogg
click|$K/click_001.ogg|$K/click_002.ogg|$K/click_003.ogg
toggle|$K/switch_001.ogg|$K/switch_002.ogg|$K/switch_003.ogg
pop|$K/drop_001.ogg|$K/drop_002.ogg|$K/drop_003.ogg
correct|$K/confirmation_001.ogg|$K/confirmation_002.ogg|$K/confirmation_003.ogg
wrong|$K/error_004.ogg|$K/error_005.ogg|$K/error_006.ogg
error|$K/error_001.ogg|$K/error_002.ogg
whoosh|$L/Rise01.aif|$L/Rise02.aif|$L/Rise03.aif
slide|$K/scroll_001.ogg|$K/scroll_002.ogg
page|$C/card-slide-5.ogg|$C/card-slide-6.ogg
flip|$C/card-slide-2.ogg|$C/card-slide-4.ogg
deal|$C/card-shove-1.ogg|$C/card-shove-2.ogg
place|$C/chip-lay-1.ogg|$C/chip-lay-2.ogg
snap|$K/click_004.ogg|$K/click_005.ogg
open|$K/open_001.ogg|$K/open_002.ogg
close|$K/close_001.ogg|$K/close_002.ogg
back|$K/back_001.ogg|$K/back_002.ogg
navigate|$K/select_004.ogg|$K/select_005.ogg
coin|$L/Coin01.aif|$C/chips-collide-1.ogg
coins|$C/chips-collide-1.ogg|$C/chips-collide-2.ogg|$C/chips-collide-3.ogg
tinta|$K/pluck_001.ogg|$K/pluck_002.ogg
buy|$K/confirmation_004.ogg|$C/chip-lay-3.ogg
unlock|$L/Upper01.aif
levelUp|$L/Rise04.aif|$L/Rise05.aif
achievement|$L/Rise01.aif|$L/Rise02.aif
gift|$L/Rise07.aif
claim|$L/Coin01.aif|$L/Rise06.aif
streak|$L/Rise03.aif
stepUp|$L/Rise06.aif
sparkle|$L/FX01.aif|$L/FX02.aif
confetti|$L/FX02.aif|$K/glass_001.ogg
chime|$K/bong_001.ogg|$K/glass_003.ogg
sessionEnd|$K/glass_005.ogg|$K/drop_004.ogg
sessionLose|$L/Downer01.aif
go|$K/confirmation_001.ogg|$K/confirmation_002.ogg
combo|$K/glass_001.ogg|$K/glass_002.ogg
countdown|$K/select_006.ogg|$K/select_007.ogg
tick|$K/tick_001.ogg|$K/tick_002.ogg
tock|$K/tick_002.ogg|$K/tick_004.ogg
stamp|$C/card-shove-3.ogg
buoy|$K/glass_004.ogg
typeKey|$K/click_005.ogg
typeWord|$K/select_003.ogg
clockTick|$K/tick_001.ogg|$K/tick_002.ogg|$K/tick_004.ogg
EOF

# sessionWin: sting de victoria = arranque (0-3,5 s) de Children's March
# Theme (Cleyton Kauffman, CC0) con fundido de salida; verificado.
ffmpeg -v error -y -i "$V/results_src.ogg" -t 3.5 -af "afade=t=out:st=2.7:d=0.8" \
  -c:a libvorbis -q:a 4 "$SFX/sessionWin.ogg"
ffmpeg -v error -y -i "$V/results_src.ogg" -t 3.5 -af "afade=t=out:st=2.7:d=0.8" \
  -c:a libmp3lame -b:a 64k -ac 1 "$SFX/sessionWin.mp3"

for line in "${MAP[@]}"; do
  IFS='|' read -r name rest <<<"$line"
  i=0
  for f in ${rest//|/ }; do
    i=$((i+1))
    f="${f//\$K/$K}"; f="${f//\$C/$C}"; f="${f//\$L/$L}"; f="${f//\$M/$M}"
    if [ "$i" -gt 1 ]; then stem="$name$i"; else stem="$name"; fi
    if [[ "$f" == *.ogg ]]; then
      cp "$f" "$SFX/$stem.ogg"
    else
      ffmpeg -v error -y -i "$f" -c:a libvorbis -q:a 4 "$SFX/$stem.ogg"
    fi
    ffmpeg -v error -y -i "$f" -c:a libmp3lame -b:a 64k -ac 1 "$SFX/$stem.mp3"
  done
done

# ---- Música: escena -> loop verificado (ogg vorbis q0, ~64 kbps) ----
# $VER contiene SOLO archivos con página de origen y licencia verificadas.
# Los temas largos se recortan al tamaño indicado (el reproductor hace el
# fundido cruzado al repetir, así el corte nunca se oye en seco).
encode_music() { # destino origen [duracion_max_s]
  local args=()
  if [ -n "${3:-}" ]; then args=(-t "$3"); fi
  ffmpeg -v error -y -i "$2" "${args[@]}" -c:a libvorbis -q:a 0 "$MUS/$1.ogg"
}
encode_music bosque       "$VER/bosque_src.ogg"        # I think I'd stay (jungle chill)
encode_music ciudad       "$VER/ciudad_src.mp3"   100  # One Horse Town
encode_music fortaleza    "$VER/fortaleza_src.wav"      # The Bard's Tale (loop)
encode_music biblioteca   "$VER/biblioteca_src.ogg"     # Magician Village (loop)
encode_music puerto       "$VER/puerto_src.ogg"         # Port Town (loop)
encode_music torre        "$VER/torre_src.flac"   104  # Harmony in the Mists (loop)
encode_music observatorio "$VER/observatorio_src.flac"  # HEAVEN
encode_music forja        "$VER/forja_src.ogg"          # Crystal Caverns (geode)
encode_music arcade       "$VER/arcade_src.wav"         # Minstrel Dance (loop 8-bit)
encode_music welcome      "$VER/welcome_src.flac"       # MEADOW
encode_music map          "$VER/map_src.ogg"       96  # Exploration Theme
encode_music missions     "$VER/missions_src.wav"       # A Busy Day at the Market (loop)
encode_music results      "$VER/results_src.ogg"        # Children's March Theme
encode_music errors       "$VER/errors_src.ogg"   100  # Mysterious Calm
encode_music stats        "$VER/stats_src.mp3"     96  # Contemplation

echo "== TOTALES =="
du -sb "$SFX" "$MUS"
