import { describe, expect, test } from "bun:test";
import { countAt, easeOutCubic, shouldAnimate } from "@/lib/animation";

/**
 * Área 14 · microinteracciones: los contadores animados se deciden con
 * mates puras — el componente solo dibuja lo que esto ordena.
 */

describe("Área 14 · contadores animados", () => {
  test("easeOutCubic arranca rápido y aterriza exacto", () => {
    expect(easeOutCubic(0)).toBe(0);
    expect(easeOutCubic(1)).toBe(1);
    expect(easeOutCubic(0.5)).toBeGreaterThan(0.8); // la mitad del tiempo, más del 80 % del camino
    expect(easeOutCubic(-1)).toBe(0);
    expect(easeOutCubic(2)).toBe(1);
  });

  test("countAt interpola y aterriza en el objetivo", () => {
    expect(countAt(100, 500, 0, 600)).toBe(100);
    expect(countAt(100, 500, 600, 600)).toBe(500);
    expect(countAt(100, 500, 10_000, 600)).toBe(500); // vencida: llega ya
    const mid = countAt(100, 500, 300, 600);
    expect(mid).toBeGreaterThan(100);
    expect(mid).toBeLessThan(500);
  });

  test("sin duración no hay animación: el valor llega de golpe", () => {
    expect(countAt(100, 500, 1, 0)).toBe(500);
  });

  test("con movimiento reducido no se anima; deltas triviales tampoco", () => {
    expect(shouldAnimate(true, 500)).toBe(false);
    expect(shouldAnimate(false, 500)).toBe(true);
    expect(shouldAnimate(false, 0)).toBe(false);
    expect(shouldAnimate(false, 0.4)).toBe(false);
  });
});
