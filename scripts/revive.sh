#!/usr/bin/env bash
# Reanima VerbalIA tras el sueño del sandbox.
# Uso: bash scripts/revive.sh
set -e
cd /home/z/my-project

# 1. Mata instancias previas del servidor
pkill -f "standalone/server.js" 2>/dev/null || true
sleep 1

# 2. Si el build de producción no existe (el sandbox lo borra al dormir), reconstruye
if [ ! -f .next/standalone/server.js ]; then
  echo "→ Build de producción ausente: compilando…"
  bun run build
fi

# 3. Arranca el servidor standalone en :3000, bien despegado de esta terminal
setsid nohup env NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0 bun .next/standalone/server.js > server.log 2>&1 < /dev/null &

# 4. Espera a que responda (máx. 20 s)
for i in $(seq 1 20); do
  code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 2 http://localhost:3000/ || true)
  if [ "$code" = "200" ]; then
    echo "✓ VerbalIA despierto en :3000 (HTTP $code)"
    exit 0
  fi
  sleep 1
done
echo "✗ El servidor no respondió a tiempo; revisa server.log"
tail -5 server.log
exit 1
