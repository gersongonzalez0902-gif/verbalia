#!/usr/bin/env bash
# Prueba la clave de IA (leída de .env, nunca escrita aquí) contra varios
# endpoints compatibles OpenAI de Z.ai/BigModel y descubre un modelo válido.
set -u
cd /home/z/my-project
KEY=$(grep '^AI_API_KEY=' .env | cut -d= -f2- | tr -d '[:space:]')
if [ -z "$KEY" ]; then echo "No hay AI_API_KEY en .env"; exit 1; fi

PROMPT='Responde solo: listo'

# 1) Descubrir modelos listados por cada base (si el endpoint existe)
for base in "https://api.z.ai/api/paas/v4" "https://api.z.ai/api/coding/paas/v4" "https://open.bigmodel.cn/api/paas/v4"; do
  echo "== modelos en $base =="
  curl -sS -m 15 "$base/models" -H "Authorization: Bearer $KEY" | head -c 600
  echo ""
done

# 2) Probar chat/completions por combinación; 401/403 corta la base entera
try() {
  local base="$1" model="$2"
  local out code body
  out=$(curl -sS -m 30 -w $'\n__HTTP:%{http_code}' "$base/chat/completions" \
    -H "Authorization: Bearer $KEY" -H "Content-Type: application/json" \
    -d "{\"model\":\"$model\",\"messages\":[{\"role\":\"user\",\"content\":\"$PROMPT\"}],\"max_tokens\":16,\"temperature\":0}" 2>&1)
  code="${out##*__HTTP:}"
  body="${out%$'\n'__HTTP:*}"
  case "$code" in
    200)
      echo "OK   -> $base | $model"
      echo "     $(echo "$body" | head -c 200)"
      return 0 ;;
    401|403)
      echo "AUTH rechazada en $base (HTTP $code): $(echo "$body" | head -c 150)"
      return 2 ;;
    *)
      echo "fallo $base | $model (HTTP $code): $(echo "$body" | head -c 150)"
      return 1 ;;
  esac
}

for base in "https://api.z.ai/api/paas/v4" "https://api.z.ai/api/coding/paas/v4" "https://open.bigmodel.cn/api/paas/v4"; do
  for model in glm-4.6 glm-4.5-air glm-4.5-flash glm-5.3 glm-5; do
    try "$base" "$model"; rc=$?
    [ $rc -eq 0 ] && { echo "COMBO_GANADOR: base=$base model=$model"; exit 0; }
    [ $rc -eq 2 ] && break
  done
done
echo "NINGUNA_COMBINACION_FUNCIONO"
exit 1
