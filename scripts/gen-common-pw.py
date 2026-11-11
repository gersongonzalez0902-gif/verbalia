#!/usr/bin/env python3
"""Genera src/server/auth/common-passwords.ts desde la lista Pwdb top-10000.

Normaliza: minúsculas, sin espacios, únicas, longitud 4-40.
Salida: array TS embebido (dedupe case-insensitive).
"""
import pathlib
import sys

SRC = pathlib.Path("/tmp/common-pw.txt")
DST = pathlib.Path("/home/z/my-project/src/server/auth/common-passwords.ts")

seen = set()
out = []
for line in SRC.read_text(encoding="utf-8", errors="ignore").splitlines():
    pw = line.strip().lower()
    if not (4 <= len(pw) <= 40):
        continue
    if pw in seen:
        continue
    seen.add(pw)
    out.append(pw)

DST.parent.mkdir(parents=True, exist_ok=True)
with DST.open("w", encoding="utf-8") as f:
    f.write("// AUTO-GENERADO por scripts/gen-common-pw.py — NO EDITAR A MANO.\n")
    f.write("// Fuente: SecLists/Passwords/Common-Credentials/Pwdb_top-10000.txt\n")
    f.write("// (candidatas más filtradas; dedupe case-insensitive, 4-40 caracteres).\n")
    f.write("// Checker anti-contraseñas-comunes de 02-cuentas-auth.md §2.\n\n")
    f.write("/** ~10 000 contraseñas filtradas más comunes (minúsculas). */\n")
    f.write("export const COMMON_PASSWORDS: readonly string[] = [\n")
    for i in range(0, len(out), 10):
        chunk = ", ".join(json_str := '"' + p.replace('\\', '\\\\').replace('"', '\\"') + '"' for p in out[i:i+10])
        f.write(f"  {chunk},\n")
    f.write("];\n")

print(f"OK: {len(out)} contraseñas únicas → {DST} ({DST.stat().st_size} bytes)")
sys.exit(0)
