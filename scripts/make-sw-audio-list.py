#!/usr/bin/env python3
"""Regenera la lista AUDIO_FILES de public/sw.js con los archivos de
public/sfx/ y public/music/ (Ola D: banco de audio real precacheado).
Ejecutar tras cualquier cambio en esas carpetas."""

import os
import re

SW = "public/sw.js"

sfx = sorted(f"/sfx/{f}" for f in os.listdir("public/sfx") if f.endswith((".ogg", ".mp3")))
music = sorted(f"/music/{f}" for f in os.listdir("public/music") if f.endswith((".ogg", ".mp3")))
files = sfx + music

body = "".join('  "%s",\n' % f for f in files)

with open(SW) as f:
    sw = f.read()

new_block = "const AUDIO_FILES = [\n%s];" % body
sw, n = re.subn(r"const AUDIO_FILES = \[\n(?:  \"[^\"]+\",\n)*\];", new_block, sw, count=1)
if n != 1:
    raise SystemExit("No se encontró el bloque AUDIO_FILES en sw.js")

with open(SW, "w") as f:
    f.write(sw)
print(f"sw.js: {len(files)} archivos de audio en AUDIO_FILES")
