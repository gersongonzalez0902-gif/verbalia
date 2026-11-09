#!/usr/bin/env bash
# Descarga la colección de SFX de VerbalIA desde Mixkit (licencia Mixkit:
# uso libre en proyectos, sin atribución obligatoria). Cada archivo se
# verifica como WAV real y se registra en el fichero de créditos.
set -u
cd "$(dirname "$0")/.."
OUT=public/sounds
mkdir -p "$OUT"
CRED="$OUT/CREDITOS-SONIDOS.md"

# nombre-archivo : id-mixkit
declare -A MAP=(
  [tap]=237          [tap-2]=2573      [click]=900       [click-2]=2580
  [toggle]=2866      [pop]=2358        [pop-2]=2357      [correct]=2870
  [correct-2]=952    [wrong]=946       [wrong-2]=896     [error]=473
  [whoosh]=1490      [whoosh-2]=1489   [slide]=1530      [page]=1104
  [page-2]=1107      [flip]=960        [deal]=3175       [place]=2073
  [snap]=2364        [open]=2574       [close]=2575      [back]=2576
  [navigate]=265     [coin]=2069       [coins]=2066      [tinta]=2060
  [buy]=210          [unlock]=253      [level-up]=2062   [achievement]=2067
  [gift]=2820        [claim]=2058      [streak]=2065     [combo]=2837
  [step-up]=2313     [sparkle]=2353    [confetti]=257    [chime]=933
  [session-win]=2059 [session-end]=2063 [session-lose]=2042 [go]=2861
  [countdown]=911    [tick]=2841       [stamp]=2356      [buoy]=2344
)

echo "# Créditos de sonidos de VerbalIA" > "$CRED"
echo "" >> "$CRED"
echo "Efectos descargados de [Mixkit](https://mixkit.co/free-sound-effects/) bajo la" >> "$CRED"
echo "[Mixkit Sound Effect Free License](https://mixkit.co/license/#sfxFree): uso gratuito" >> "$CRED" 
echo "en proyectos comerciales y personales, sin atribución obligatoria (la incluimos por gratitud)." >> "$CRED"
echo "" >> "$CRED"
echo "| Archivo | ID Mixkit | Título original |" >> "$CRED"
echo "| --- | --- | --- |" >> "$CRED"

ok=0; fail=0
for name in "${!MAP[@]}"; do
  id="${MAP[$name]}"
  dest="$OUT/$name.wav"
  url="https://assets.mixkit.co/active_storage/sfx/$id/$id.wav"
  if [ -s "$dest" ]; then
    ok=$((ok+1)); continue
  fi
  curl -sL --max-time 25 -o "$dest" "$url" || true
  # Verificación: debe ser RIFF/WAVE y pesar entre 2 KB y 3 MB
  if file "$dest" 2>/dev/null | grep -q "WAVE audio" && [ "$(stat -c%s "$dest")" -lt 3000000 ] && [ "$(stat -c%s "$dest")" -gt 2000 ]; then
    ok=$((ok+1))
    echo "| \`$name.wav\` | $id | [ver](https://mixkit.co/free-sound-effects/?q=$id) |" >> "$CRED"
  else
    fail=$((fail+1))
    echo "✗ $name (id $id) no es WAV válido: $(file -b "$dest" 2>/dev/null | cut -c1-40) ($(stat -c%s "$dest" 2>/dev/null) B)"
    rm -f "$dest"
  fi
done
echo "" >> "$CRED"
echo "Descargados: $ok · Fallidos: $fail · $(date -u +%F)" >> "$CRED"

# Compresión: MP3 mono 44.1 kHz 96 kbps (peso ÷10, mismo chispeante detalle).
# Los WAV originales se eliminan: el juego sirve solo los MP3.
if command -v ffmpeg >/dev/null 2>&1; then
  for w in "$OUT"/*.wav; do
    [ -e "$w" ] || continue
    m="${w%.wav}.mp3"
    ffmpeg -y -loglevel error -i "$w" -ac 1 -ar 44100 -codec:a libmp3lame -b:a 96k "$m"
    if [ -s "$m" ]; then rm -f "$w"; else echo "✗ ffmpeg no comprimió $w"; fi
  done
fi
echo "=== OK: $ok · FALLOS: $fail ==="
du -sh "$OUT" 2>/dev/null
