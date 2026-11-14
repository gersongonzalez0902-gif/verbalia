import { describe, expect, test } from "bun:test";
import { effectiveBackTo, originChipLabel, sameScreen } from "@/lib/navigation";
import type { Screen } from "@/types";

/**
 * Área 12 · flujo de navegación: destino del «Volver» y chip de origen,
 * como lógica pura (el 12.1 venía hecho en Ola E · 2; aquí se hace
 * testeable y visible).
 */

const WELCOME: Screen = { name: "welcome" };
const SETTINGS: Screen = { name: "settings" };
const ACCOUNT: Screen = { name: "account" };
const PROFILE: Screen = { name: "profile" };
const GAME: Screen = { name: "game", gameId: "trivia", mode: "training" };
const GAME2: Screen = { name: "game", gameId: "srs", mode: "training" };

describe("Área 12 · sameScreen", () => {
  test("la misma pantalla es la misma; el juego depende de sus parámetros", () => {
    expect(sameScreen(ACCOUNT, { name: "account" })).toBe(true);
    expect(sameScreen(ACCOUNT, PROFILE)).toBe(false);
    expect(sameScreen(GAME, GAME)).toBe(true);
    expect(sameScreen(GAME, GAME2)).toBe(false);
    expect(sameScreen(null, SETTINGS)).toBe(false);
  });
});

describe("Área 12 · effectiveBackTo", () => {
  test("portada → «Entrar con cuenta» → Cuenta: atrás = portada (P0-1)", () => {
    expect(effectiveBackTo(WELCOME, SETTINGS, ACCOUNT)).toEqual(WELCOME);
  });

  test("sin origen (carga directa): manda el respaldo de la pantalla", () => {
    expect(effectiveBackTo(null, SETTINGS, ACCOUNT)).toEqual(SETTINGS);
  });

  test("la flecha nunca reentra en una partida", () => {
    expect(effectiveBackTo(GAME, SETTINGS, ACCOUNT)).toEqual(SETTINGS);
  });

  test("re-pinchar la pantalla actual no borra el origen recordado", () => {
    // Navegar a Perfil de nuevo no debe confundir al Volver: el origen
    // (Ajustes) sigue mandando aunque lastScreen === current se evite.
    expect(effectiveBackTo(SETTINGS, SETTINGS, SETTINGS)).toEqual(SETTINGS);
  });

  test("cadena Inicio → Ajustes → Cuenta → atrás = Ajustes", () => {
    expect(effectiveBackTo(SETTINGS, SETTINGS, ACCOUNT)).toEqual(SETTINGS);
  });
});

describe("Área 12 · chip de origen (breadcrumb honesto)", () => {
  const name = (s: Screen) => (s.name === "welcome" ? "la Portada" : s.name);

  test("solo hay chip cuando el origen manda de verdad y es distinto del respaldo", () => {
    expect(originChipLabel(WELCOME, SETTINGS, ACCOUNT, name)).toBe("vienes de la Portada");
    expect(originChipLabel(null, SETTINGS, ACCOUNT, name)).toBeNull();
    expect(originChipLabel(GAME, SETTINGS, ACCOUNT, name)).toBeNull();
    // Si el respaldo ya coincide con el origen, no se descubre nada:
    expect(originChipLabel(SETTINGS, SETTINGS, ACCOUNT, name)).toBeNull();
  });
});
