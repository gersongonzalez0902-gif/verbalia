import { describe, expect, test } from "bun:test";
import {
  PROFILE_BIO_MAX,
  PROFILE_NAME_MAX,
  isProfileNameValid,
  sessionAverages,
  syncAgoLabel,
} from "@/lib/profile-stats";

/**
 * Área 5 · Perfil: ayudas puras de la ficha del navegante.
 */

describe("Área 5 · ayudas del perfil", () => {
  test("el nombre visible no puede quedar vacío (ni de espacios)", () => {
    expect(isProfileNameValid("")).toBe(false);
    expect(isProfileNameValid("   ")).toBe(false);
    expect(isProfileNameValid("Marina")).toBe(true);
    expect(isProfileNameValid("  Marina ")).toBe(true);
  });

  test("los topes de nombre y bio son los que la ficha enseña", () => {
    expect(PROFILE_NAME_MAX).toBe(20);
    expect(PROFILE_BIO_MAX).toBe(160);
  });

  test("media por sesión honesta: sin sesiones, no hay media (ni NaN)", () => {
    expect(sessionAverages(0, 0)).toEqual({ avgMinutes: 0, ok: false });
    expect(sessionAverages(9_000_000, 3)).toEqual({ avgMinutes: 50, ok: true });
    expect(sessionAverages(90_000, 0)).toEqual({ avgMinutes: 0, ok: false });
  });

  test("«hace X» de la última sincronización", () => {
    const now = Date.now();
    expect(syncAgoLabel(null, now)).toBe("nunca");
    expect(syncAgoLabel(now - 20_000, now)).toBe("hace un momento");
    expect(syncAgoLabel(now - 5 * 60_000, now)).toBe("hace 5 min");
    expect(syncAgoLabel(now - 3 * 3_600_000, now)).toBe("hace 3 h");
    expect(syncAgoLabel(now - 2 * 86_400_000, now)).toBe("hace 2 d");
  });
});
