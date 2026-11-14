#!/usr/bin/env bash
# ============================================================
# Medición Lighthouse de VERBALIA (Área 17 · rendimiento).
# ------------------------------------------------------------
# Este entorno de trabajo NO tiene Chromium ni lighthouse (sandbox
# sin navegador): la medición no es ejecutable aquí y se reporta
# como pendiente con su razón. Este guion deja el procedimiento
# exacto para ejecutarla en local o en el despliegue.
#
# Uso (donde SÍ haya Chrome): bash scripts/measure-lighthouse.sh <URL>
# ============================================================
set -euo pipefail
URL="${1:-http://localhost:3000}"

if ! command -v lighthouse >/dev/null 2>&1; then
  echo "Instala lighthouse: npm i -g lighthouse  (o usa npx lighthouse)"
  exit 1
fi

run() { # $1 perfil
  local name="$1"
  lighthouse "$URL" \
    --only-categories=performance,accessibility,best-practices,seo \
    --preset=desktop \
    --output=json --output=html \
    --chrome-flags="--headless=new" \
    --quiet \
    --output-path="lighthouse-${name}"
  echo "-> lighthouse-${name}.report.html"
}

echo "Objetivos acordados: móvil > 90 · escritorio > 85 (rendimiento)."
echo "Nota: lighthouse --preset=desktop ya incluye throttling de referencia;"
echo "para móvil, repite sin --preset y con --form-factor=mobile."
run desktop
