/**
 * Microinteracciones (Área 14) — contadores animados, lógica pura y
 * testeable. El componente vive en widgets; aquí solo las mates.
 */

/** Curva de desaceleración estándar (rápida al inicio, suave al llegar). */
export function easeOutCubic(t: number): number {
  const x = Math.min(1, Math.max(0, t));
  return 1 - Math.pow(1 - x, 3);
}

/** El valor que toca mostrar en el fotograma dado de una animación de
 *  contador. Pura: el componente solo la llama desde requestAnimationFrame. */
export function countAt(
  from: number,
  to: number,
  elapsedMs: number,
  durationMs = 600,
): number {
  if (durationMs <= 0 || elapsedMs >= durationMs) return to;
  const t = easeOutCubic(elapsedMs / durationMs);
  return Math.round(from + (to - from) * t);
}

/** ¿Conviene animar? Con movimiento reducido los contadores saltan de
 *  golpe: honestidad ante todo (y menos CPU). */
export function shouldAnimate(reduceMotion: boolean, delta: number): boolean {
  if (reduceMotion) return false;
  return Math.abs(delta) >= 1;
}
