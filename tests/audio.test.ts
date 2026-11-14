import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { sfxBankSnapshot, sfxShowcase, AMBIENT_VOLUME_DEFAULT } from "@/services/audio";

/**
 * Ola E · 5 · ambiente único de estudio.
 * El sonido del juego es una familia: un solo pop de navegación, una
 * sola variante de acierto/fallo/reloj, variantes al azar solo en
 * celebraciones, y el mismo ambiente en todas las pantallas.
 */

const bank = sfxBankSnapshot();

const RETIRADAS = new Set([
  "tap", "tap2", "tap3",
  "click", "click2", "click3",
  "back", "back2",
  "toggle", "toggle2", "toggle3",
  "navigate", "navigate2",
  "pop2", "pop3",
  "correct2", "correct3",
  "wrong2", "wrong3",
  "error2", "whoosh2", "whoosh3", "slide2", "page2", "flip2", "deal2",
  "place2", "snap2", "open2", "close2", "coin2", "coins2", "coins3",
  "tinta2", "buy2", "claim2", "sparkle2", "confetti2", "chime2",
  "sessionEnd2", "go2", "combo2", "countdown2",
  "tick", "tick2", "tock", "tock2",
  "clockTick2", "clockTick3",
]);

describe("Ola E · 5 · banco de audio", () => {
  test("la navegación es un único pop de burbuja (siempre el mismo archivo)", () => {
    for (const key of ["tap", "click", "back", "toggle", "navigate", "pop"]) {
      expect(bank.sfx[key]).toEqual(["pop"]);
    }
  });

  test("acierto, fallo y reloj tienen una sola variante fija", () => {
    expect(bank.sfx.correct).toEqual(["correct"]);
    expect(bank.sfx.wrong).toEqual(["wrong"]);
    expect(bank.sfx.clockTick).toEqual(["clockSoft"]);
    expect(bank.sfx.tick).toEqual(["clockSoft"]);
    expect(bank.sfx.tock).toEqual(["clockSoft"]);
  });

  test("solo logro y subir de nivel alternan variantes al azar", () => {
    const multi = Object.entries(bank.sfx).filter(([, bases]) => bases.length > 1);
    expect(multi.map(([k]) => k).sort()).toEqual(["achievement", "levelUp"]);
    expect(bank.sfx.achievement.length).toBe(2);
    expect(bank.sfx.levelUp.length).toBe(2);
  });

  test("ningún efecto referencia un archivo retirado del repo", () => {
    for (const [, bases] of Object.entries(bank.sfx)) {
      for (const base of bases) {
        expect(RETIRADAS.has(base)).toBe(false);
      }
    }
  });

  test("todo archivo referenciado existe realmente en public/sfx (ogg y mp3)", () => {
    for (const [, bases] of Object.entries(bank.sfx)) {
      for (const base of bases) {
        expect(readFileSync(join("public", "sfx", `${base}.ogg`)).byteLength).toBeGreaterThan(0);
        expect(readFileSync(join("public", "sfx", `${base}.mp3`)).byteLength).toBeGreaterThan(0);
      }
    }
  });

  test("el ambiente es uno: las dos capas de estudio, sin loops por región", () => {
    expect(bank.ambient).toEqual(["estudio-olas", "estudio-brisa"]);
    for (const name of bank.ambient) {
      expect(readFileSync(join("public", "music", `${name}.ogg`)).byteLength).toBeGreaterThan(0);
    }
    expect(bank.ambient).not.toContain("bosque");
    expect(bank.ambient).not.toContain("welcome");
  });

  test("los archivos de ambiente quedan por debajo del tope de 2 MB", () => {
    for (const name of bank.ambient) {
      expect(readFileSync(join("public", "music", `${name}.ogg`)).byteLength).toBeLessThanOrEqual(2 * 1024 * 1024);
    }
  });

  test("el volumen del ambiente arranca por defecto a medio-bajo (0,35)", () => {
    expect(AMBIENT_VOLUME_DEFAULT).toBe(0.35);
  });

  test("«Probar sonidos» refleja el banco nuevo (pop de navegación y latido lejano)", () => {
    const keys = sfxShowcase().map((s) => s.key);
    expect(keys).toContain("pop");
    expect(keys).toContain("clockTick");
    expect(keys).not.toContain("tap");
    const reloj = sfxShowcase().find((s) => s.key === "clockTick");
    expect(reloj?.label).toContain("latido");
  });
});
