#!/usr/bin/env bash
# Prueba de humo E2E de la Ola 0+1 contra el servidor local (puerto 3100).
# Cubre: health, registro, anti-enumeración, CSRF, login, me, progreso,
# events idempotente, stats, import (email_unverified → verificado),
# sesiones, rate limit y borrado con anonimización.
# Orden cuidadoso: el rate limit de registro (5/h) se agota al final.
set -u
BASE="http://localhost:3100/api/v1"
JAR_A="/tmp/jar-a.txt"; JAR_B="/tmp/jar-b.txt"; rm -f "$JAR_A" "$JAR_B"
PASS=0; FAIL=0
ok()   { PASS=$((PASS+1)); echo "✅ $1"; }
bad()  { FAIL=$((FAIL+1)); echo "❌ $1"; }
check() { # check <desc> <esperado(subcadena)> <obtenido>
  if [[ "$3" == *"$2"* ]]; then ok "$1"; else bad "$1 — esperaba [$2] obtuve [$3]"; fi
}

EMAIL_A="ola1-test-a@verbalia.dev"
EMAIL_B="ola1-test-b@verbalia.dev"
PW="vela-de-trinquete-9"

echo "── 1. Health"
R=$(curl -s $BASE/health)
check "health ok+db" '"ok":true,"db":true' "$R"

echo "── 2. Registro cuenta A"
R=$(curl -s -c "$JAR_A" -H "Content-Type: application/json" -H "x-verbalia-csrf: 1" \
  -d "{\"email\":\"$EMAIL_A\",\"password\":\"$PW\",\"displayName\":\"Marina Test\"}" $BASE/auth/register)
check "registro → user+needsVerification" '"needsVerification":true' "$R"
check "registro devuelve handle" '"handle":"marina-test-' "$R"

echo "── 3. /auth/me con cookie y sin cookie"
R=$(curl -s -b "$JAR_A" $BASE/auth/me)
check "me con cookie → usuario" '"email":"'"$EMAIL_A"'"' "$R"
R=$(curl -s $BASE/auth/me)
check "me sin cookie → user null (pública, sin 401)" '"user":null' "$R"

echo "── 4. CSRF: mutación sin cabecera"
R=$(curl -s -o /dev/null -w "%{http_code}" -H "Content-Type: application/json" \
  -d '{"email":"x@x.com","password":"12345678"}' $BASE/auth/login)
check "login sin x-verbalia-csrf → 403" "403" "$R"

echo "── 5. Content-Type no JSON"
R=$(curl -s -o /dev/null -w "%{http_code}" -H "Content-Type: text/plain" -H "x-verbalia-csrf: 1" \
  -d 'hola' $BASE/auth/login)
check "login con text/plain → 400" "400" "$R"

echo "── 6. Login: contraseña mala, email inexistente (mismo mensaje) y buena"
R=$(curl -s -H "Content-Type: application/json" -H "x-verbalia-csrf: 1" \
  -d "{\"email\":\"$EMAIL_A\",\"password\":\"contrasena-mala\"}" $BASE/auth/login)
MSG_MALA=$(echo "$R" | grep -o '"message":"[^"]*"')
R=$(curl -s -H "Content-Type: application/json" -H "x-verbalia-csrf: 1" \
  -d '{"email":"noexiste-nunca@verbalia.dev","password":"lo-que-sea-123"}' $BASE/auth/login)
MSG_INEX=$(echo "$R" | grep -o '"message":"[^"]*"')
check "login mala → unauthorized" '"code":"unauthorized"' "$R"
if [ "$MSG_MALA" = "$MSG_INEX" ] && [ -n "$MSG_MALA" ]; then ok "anti-enumeración: mensaje IDÉNTICO ($MSG_MALA)"; else bad "mensajes difieren: [$MSG_MALA] vs [$MSG_INEX]"; fi
R=$(curl -s -c "$JAR_B" -H "Content-Type: application/json" -H "x-verbalia-csrf: 1" \
  -d "{\"email\":\"$EMAIL_A\",\"password\":\"$PW\"}" $BASE/auth/login)
check "login buena → user" '"displayName":"Marina Test"' "$R"

echo "── 7. Contraseña común rechazada al registrar"
R=$(curl -s -H "Content-Type: application/json" -H "x-verbalia-csrf: 1" \
  -d "{\"email\":\"comun@verbalia.dev\",\"password\":\"password1\",\"displayName\":\"Comun\"}" $BASE/auth/register)
check "password1 → rechazada" '"code":"validation_error"' "$R"

echo "── 8. Anti-enumeración: registrar email YA existente"
R=$(curl -s -D /tmp/headers-a.txt -H "Content-Type: application/json" -H "x-verbalia-csrf: 1" \
  -d "{\"email\":\"$EMAIL_A\",\"password\":\"$PW\",\"displayName\":\"Atacante\"}" $BASE/auth/register)
check "registro duplicado → misma respuesta genérica" '"needsVerification":true' "$R"
if grep -qi "set-cookie" /tmp/headers-a.txt; then bad "duplicado NO debe setear cookie"; else ok "duplicado SIN cookie de sesión"; fi

echo "── 9. PUT /progress (primera sincronización: crea + MIGRATION)"
PAYLOAD='{"version":1,"profile":{"name":"Marina Test","avatar":"preset:buhito","goal":"fluir","experience":"principiante","gender":"x","bio":"","banner":"preset:aurora","photo":"","featuredBadge":"","createdAt":1000,"onboarded":true,"placementDone":true},"settings":{"sound":true},"core":{"xp":420,"stats":{"totalSessions":3,"totalAnswers":30,"totalCorrect":25,"xpByDay":{"2026-11-11":420}},"wallet":{"tinta":33}},"srs":{},"savedAt":1770000000000}'
R=$(curl -s -b "$JAR_A" -X PUT -H "Content-Type: application/json" -H "x-verbalia-csrf: 1" \
  -d "{\"baseUpdatedAt\":null,\"payload\":$PAYLOAD,\"deltas\":null}" $BASE/progress)
check "PUT progress → merged" '"updatedAt"' "$R"

echo "── 10. GET /progress devuelve el estado"
R=$(curl -s -b "$JAR_A" $BASE/progress)
check "GET progress → payload con xp 420" '"xp":420' "$R"

echo "── 11. GET /progress sin sesión → 401"
R=$(curl -s -o /dev/null -w "%{http_code}" $BASE/progress)
check "progress sin sesión → 401" "401" "$R"

echo "── 12. POST /progress/events (transcripción válida)"
EVENT='{"session":{"formatId":"trivia","origin":"freeplay","seed":null,"durationMs":30000,"transcript":{"answers":[{"i":0,"choice":2,"ms":3000},{"i":1,"choice":0,"ms":2500}]},"result":{"xp":20,"correct":2,"total":2,"bestCombo":2}}}'
R=$(curl -s -b "$JAR_A" -H "Content-Type: application/json" -H "x-verbalia-csrf: 1" \
  -H "Idempotency-Key: smoke-event-0001" -d "$EVENT" $BASE/progress/events)
check "events → validated xp 20 tinta 2" '"xp":20' "$R"
check "events → statDelta del día" '"statDelta"' "$R"

echo "── 13. Idempotencia: mismo Idempotency-Key no duplica"
R=$(curl -s -b "$JAR_A" -H "Content-Type: application/json" -H "x-verbalia-csrf: 1" \
  -H "Idempotency-Key: smoke-event-0001" -d "$EVENT" $BASE/progress/events)
check "replay → mismos 20 XP (sin doble conteo)" '"xp":20' "$R"
R=$(curl -s -b "$JAR_A" "$BASE/stats/me?window=7d")
check "stats: 1 sesión acumulada (no 2)" '"sessions":1' "$R"

echo "── 14. Suelos (flag) y rechazos (422)"
BAD_EVENT='{"session":{"formatId":"trivia","origin":"freeplay","seed":null,"durationMs":10,"transcript":{"answers":[{"i":0,"choice":1,"ms":5}]},"result":{"xp":50,"correct":1,"total":1,"bestCombo":1}}}'
R=$(curl -s -b "$JAR_A" -H "Content-Type: application/json" -H "x-verbalia-csrf: 1" \
  -H "Idempotency-Key: smoke-event-0003" -d "$BAD_EVENT" $BASE/progress/events)
check "ms=5 (<suelo) → aceptada con flag timing_floor" '"timing_floor"' "$R"
BAD_EVENT2='{"session":{"formatId":"trivia","origin":"freeplay","seed":null,"durationMs":10,"transcript":{"answers":[{"i":7,"choice":1,"ms":5000}]},"result":{"xp":5,"correct":1,"total":1,"bestCombo":1}}}'
R=$(curl -s -b "$JAR_A" -H "Content-Type: application/json" -H "x-verbalia-csrf: 1" \
  -d "$BAD_EVENT2" $BASE/progress/events)
check "índice fuera de rango → 422 rejected_invalid_transcript" '"rejected_invalid_transcript"' "$R"

echo "── 15. Origen no-freeplay rechazado en Ola 1"
DAILY_EVENT=$(echo "$EVENT" | sed 's/"origin":"freeplay"/"origin":"daily"/')
R=$(curl -s -b "$JAR_A" -H "Content-Type: application/json" -H "x-verbalia-csrf: 1" \
  -d "$DAILY_EVENT" $BASE/progress/events)
check "origin daily → validation_error (llega en Ola 2)" '"code":"validation_error"' "$R"

echo "── 16. Import sin email verificado → 403 email_unverified"
R=$(curl -s -b "$JAR_A" -H "Content-Type: application/json" -H "x-verbalia-csrf: 1" \
  -d "{\"payload\":$PAYLOAD}" $BASE/progress/import)
check "import sin verificar → email_unverified" '"email_unverified"' "$R"

echo "── 17. Dispositivos (GET /auth/sessions)"
R=$(curl -s -b "$JAR_A" $BASE/auth/sessions)
check "sessions → items con current" '"current":true' "$R"

echo "── 18. Verificar email con el enlace del dry-run (un solo uso)"
VTOKEN=$(grep -o 'verify=[A-Za-z0-9_-]*' /tmp/next-start.log | head -1 | cut -d= -f2)
if [ -n "$VTOKEN" ]; then
  R=$(curl -s -H "Content-Type: application/json" -H "x-verbalia-csrf: 1" -d "{\"token\":\"$VTOKEN\"}" $BASE/auth/verify)
  check "verify con token del email → ok" '"ok":true' "$R"
  R=$(curl -s -H "Content-Type: application/json" -H "x-verbalia-csrf: 1" -d "{\"token\":\"$VTOKEN\"}" $BASE/auth/verify)
  check "token reusado → rechazado (un solo uso)" '"code":"validation_error"' "$R"
else
  bad "no se encontró token de verificación en el log del mailer"
fi

echo "── 19. Import AHORA verificado → merged"
R=$(curl -s -b "$JAR_A" -H "Content-Type: application/json" -H "x-verbalia-csrf: 1" \
  -d "{\"payload\":$PAYLOAD}" $BASE/progress/import)
check "import verificado → merged" '"merged"' "$R"

echo "── 20. Registro cuenta B (antes de agotar el rate limit)"
R=$(curl -s -c "$JAR_B" -H "Content-Type: application/json" -H "x-verbalia-csrf: 1" \
  -d "{\"email\":\"$EMAIL_B\",\"password\":\"$PW\",\"displayName\":\"Borrame Test\"}" $BASE/auth/register)
check "registro B → ok" '"needsVerification":true' "$R"

echo "── 21. Cambio de contraseña + login con la nueva"
R=$(curl -s -b "$JAR_A" -H "Content-Type: application/json" -H "x-verbalia-csrf: 1" \
  -d "{\"current\":\"$PW\",\"next\":\"bitacora-nueva-77\"}" $BASE/auth/password/change)
check "cambio de contraseña → ok" '"ok":true' "$R"
R=$(curl -s -H "Content-Type: application/json" -H "x-verbalia-csrf: 1" \
  -d "{\"email\":\"$EMAIL_A\",\"password\":\"bitacora-nueva-77\"}" $BASE/auth/login)
check "login con la nueva → ok" '"email":"'"$EMAIL_A"'"' "$R"

echo "── 22. Logout y estado final"
R=$(curl -s -b "$JAR_A" -c "$JAR_A" -H "x-verbalia-csrf: 1" -X POST $BASE/auth/logout)
check "logout → ok" '"ok":true' "$R"
R=$(curl -s -b "$JAR_A" $BASE/auth/me)
check "tras logout me → null" '"user":null' "$R"

echo "── 23. Rate limit: martillo de registros (5/h por IP)"
LAST=""
for i in 1 2 3 4 5 6; do
  LAST=$(curl -s -o /dev/null -w "%{http_code}" -H "Content-Type: application/json" -H "x-verbalia-csrf: 1" \
    -d "{\"email\":\"rl-$i@verbalia.dev\",\"password\":\"$PW\",\"displayName\":\"RL $i\"}" $BASE/auth/register)
done
check "6º registro seguido → 429 rate_limited" "429" "$LAST"

echo "── 24. Borrado de cuenta B con anonimización"
R=$(curl -s -b "$JAR_B" -H "Content-Type: application/json" -H "x-verbalia-csrf: 1" \
  -d "{\"password\":\"$PW\"}" -X DELETE $BASE/auth/account)
check "borrado B → ok" '"ok":true' "$R"
R=$(curl -s -b "$JAR_B" $BASE/auth/me)
check "tras borrado me → null" '"user":null' "$R"
R=$(curl -s -H "Content-Type: application/json" -H "x-verbalia-csrf: 1" \
  -d "{\"email\":\"$EMAIL_B\",\"password\":\"$PW\"}" $BASE/auth/login)
check "login de cuenta borrada → 401 genérico" '"code":"unauthorized"' "$R"

echo "── 25. Limpieza: cuenta A y cuentas del rate limit (rl-1)"
R=$(curl -s -c /tmp/jar-c.txt -H "Content-Type: application/json" -H "x-verbalia-csrf: 1" \
  -d "{\"email\":\"$EMAIL_A\",\"password\":\"bitacora-nueva-77\"}" $BASE/auth/login) >/dev/null
R=$(curl -s -b /tmp/jar-c.txt -H "Content-Type: application/json" -H "x-verbalia-csrf: 1" \
  -d '{"password":"bitacora-nueva-77"}' -X DELETE $BASE/auth/account)
check "cuenta A borrada → ok" '"ok":true' "$R"
R=$(curl -s -c /tmp/jar-rl.txt -H "Content-Type: application/json" -H "x-verbalia-csrf: 1" \
  -d "{\"email\":\"rl-1@verbalia.dev\",\"password\":\"$PW\"}" $BASE/auth/login)
if [[ "$R" == *"displayName"* ]]; then
  R=$(curl -s -b /tmp/jar-rl.txt -H "Content-Type: application/json" -H "x-verbalia-csrf: 1" \
    -d "{\"password\":\"$PW\"}" -X DELETE $BASE/auth/account)
  check "rl-1 borrada → ok" '"ok":true' "$R"
else
  ok "rl-1 no llegó a crearse (429 temprano): nada que limpiar"
fi

echo
echo "════════ RESUMEN: $PASS ✅ / $FAIL ❌ ════════"
exit $([ "$FAIL" -eq 0 ] && echo 0 || echo 1)
