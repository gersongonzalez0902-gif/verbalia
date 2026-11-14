import { describe, expect, test } from "bun:test";
import { formatBytes, localDataLines, wipeWarning } from "@/lib/local-data";

/**
 * Área 16 · datos locales: la ficha «Tus datos en este aparato» dice la
 * verdad y el aviso de borrado depende de si hay cuenta.
 */

describe("Área 16 · ficha de datos locales", () => {
  test("formatBytes: honesto en B, KB y MB; desconocido = nada", () => {
    expect(formatBytes(null)).toBeNull();
    expect(formatBytes(500)).toBe("500 B");
    expect(formatBytes(2048)).toBe("2.0 KB");
    expect(formatBytes(3 * 1024 * 1024)).toBe("3.0 MB");
    expect(formatBytes(-1)).toBeNull();
  });

  test("la ficha lista jardín, XP, historial y ejercicios vistos", () => {
    const lines = localDataLines({
      gardenWords: 42,
      xp: 1234,
      historySessions: 17,
      seenExercises: 331,
      storageBytes: 4096,
      lastSyncedAt: null,
      hasAccount: false,
    });
    const map = Object.fromEntries(lines.map((l) => [l.label, l.value]));
    expect(map["Palabras en el jardín"]).toBe("42");
    expect(map["XP acumulado"]).toBe("1234");
    expect(map["Sesiones en el historial"]).toBe("17");
    expect(map["Ejercicios ya vistos"]).toBe("331");
    expect(map["Espacio ocupado"]).toBe("4.0 KB");
    expect(map["Última sincronización"]).toContain("solo vive aquí");
  });

  test("con cuenta, la línea de sincronización cuenta otra historia", () => {
    const lines = localDataLines({
      gardenWords: 0,
      xp: 0,
      historySessions: 0,
      seenExercises: 0,
      storageBytes: null,
      lastSyncedAt: Date.now(),
      hasAccount: true,
    });
    const sync = lines.find((l) => l.label === "Última sincronización")!;
    expect(sync.value).toBe("con el barco ya al día");
    expect(lines.find((l) => l.label === "Espacio ocupado")).toBeUndefined();
  });

  test("el aviso de borrado cambia según haya cuenta (P0-3)", () => {
    expect(wipeWarning(true)).toContain("a salvo en el barco");
    expect(wipeWarning(false)).toContain("se pierde para siempre");
  });
});
