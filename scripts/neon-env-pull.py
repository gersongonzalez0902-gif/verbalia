#!/usr/bin/env python3
"""Equivalente directo de `neon env pull` para VerbalIA (la CLI se cuelga en este sandbox).

API v2 de Neon (host: console.neon.tech/api/v2, rutas snake_case):
  1. Lee la API key de .neon-key (gitignored, nunca se imprime).
  2. Descubre la branch "production" del proyecto round-mouse-35849092.
  3. Obtiene endpoint (host), rol por defecto y base de datos.
  4. Revela el password del rol vía /roles/{role}/reveal_password.
  5. Escribe .env.local con DATABASE_URL (chmod 600, gitignored).

SOLO imprime información no sensible: ids, host, región, versión de PG.
Nunca imprime el password ni la URI completa.
"""

import json
import os
import stat
import sys
import urllib.parse
import urllib.request

BASE = "https://console.neon.tech/api/v2"
PROJECT = "round-mouse-35849092"
BRANCH_NAME = "production"
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KEY_PATH = os.path.join(ROOT, ".neon-key")
ENV_PATH = os.path.join(ROOT, ".env.local")


def api(path: str) -> dict:
    with open(KEY_PATH) as f:
        key = f.read().strip()
    req = urllib.request.Request(
        f"{BASE}{path}", headers={"Authorization": f"Bearer {key}"}
    )
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read().decode())


try:
    pdata = api(f"/projects/{PROJECT}").get("project", {})
    print(f"Proyecto: {pdata.get('id')} · Región: {pdata.get('region_id')} · PG: {pdata.get('pg_version')}")

    branches = api(f"/projects/{PROJECT}/branches").get("branches", [])
    prod = next((b for b in branches if b.get("name") == BRANCH_NAME), None)
    if not prod:
        print(f"❌ No se encontró la branch {BRANCH_NAME}")
        sys.exit(1)
    bid = prod["id"]
    print(f"Branch: {prod.get('name')} (id={bid}, primary={prod.get('primary')})")

    endpoints = api(f"/projects/{PROJECT}/branches/{bid}/endpoints").get("endpoints", [])
    if not endpoints:
        print("❌ La branch no tiene endpoint activo")
        sys.exit(1)
    ep = endpoints[0]
    host = ep.get("host", "")
    print(f"Endpoint: {ep.get('id')} → {host} (state={ep.get('state', '?')})")

    roles = api(f"/projects/{PROJECT}/branches/{bid}/roles").get("roles", [])
    app_roles = [r for r in roles if r.get("name", "").startswith("neondb_owner")]
    role = (app_roles or roles)[0].get("name")
    print(f"Rol: {role}")

    databases = api(f"/projects/{PROJECT}/branches/{bid}/databases").get("databases", [])
    db = databases[0].get("name") if databases else "neondb"
    print(f"Base de datos: {db}")

    revealed = api(f"/projects/{PROJECT}/branches/{bid}/roles/{role}/reveal_password")
    password = revealed.get("password", "")
    if not password:
        print("❌ reveal_password no devolvió password")
        sys.exit(1)
    print("Password: obtenido (no se muestra)")

    uri = (
        f"postgresql://{urllib.parse.quote(role, safe='')}"
        f":{urllib.parse.quote(password, safe='')}"
        f"@{host}/{db}?sslmode=require"
    )

    with open(ENV_PATH, "w") as f:
        f.write(
            "# Generado por scripts/neon-env-pull.py (equivalente a `neon env pull`).\n"
            "# NO COMMITEAR — cubierto por .gitignore (.env*).\n"
            f"DATABASE_URL={uri}\n"
        )
    os.chmod(ENV_PATH, stat.S_IRUSR | stat.S_IWUSR)
    print(f"✅ .env.local escrito (permisos 600) con DATABASE_URL → {host}")
except urllib.error.HTTPError as e:
    print(f"❌ HTTP {e.code}: {e.reason}")
    sys.exit(1)
except Exception as e:  # noqa: BLE001
    print(f"❌ Error: {e}")
    sys.exit(1)
