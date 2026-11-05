#!/bin/bash
# Juega el resto de la sesión SRS: mostrar → Bien → Continuar (via refs).
for i in $(seq 1 10); do
  SNAP=$(agent-browser snapshot 2>/dev/null)
  # ¿Ya no hay partida? (salimos si aparece la pantalla de resultados)
  if echo "$SNAP" | grep -q "Sesión completada\|Jardín regado"; then
    echo "RESULTADOS tras $i iteraciones"
    break
  fi
  SHOW=$(echo "$SNAP" | grep -oE 'button "Mostrar significado" \[ref=e[0-9]+\]' | grep -oE 'e[0-9]+' | head -1)
  if [ -n "$SHOW" ]; then
    agent-browser click "$SHOW" >/dev/null 2>&1
    sleep 0.4
    SNAP=$(agent-browser snapshot 2>/dev/null)
  fi
  BIEN=$(echo "$SNAP" | grep -oE 'button "Bien La recordaba" \[ref=e[0-9]+\]' | grep -oE 'e[0-9]+' | head -1)
  if [ -n "$BIEN" ]; then
    agent-browser click "$BIEN" >/dev/null 2>&1
    sleep 0.4
  fi
  CONT=$(agent-browser snapshot 2>/dev/null | grep -oE 'button "Continuar[^"]*" \[ref=e[0-9]+\]' | grep -oE 'e[0-9]+' | head -1)
  if [ -n "$CONT" ]; then
    agent-browser click "$CONT" >/dev/null 2>&1
    sleep 0.5
  else
    echo "Sin botón Continuar en iteración $i"
  fi
done
agent-browser snapshot 2>/dev/null | head -30
