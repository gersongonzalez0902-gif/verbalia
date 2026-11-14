import { describe, expect, test } from "bun:test";
import { readFileSync, existsSync } from "node:fs";
import { ROUTE_ALIASES } from "@/store/ui-store";
import { GAMES } from "@/data/games";

/**
 * Área 20 · PWA: el manifest miente si apunta a iconos o rutas que no
 * existen. Aquí se demide: iconos reales, campos obligatorios y atajos
 * que resuelven contra la MISMA tabla de rutas que usa el juego.
 */

const manifest = JSON.parse(readFileSync("public/manifest.webmanifest", "utf8")) as {
  name: string;
  short_name: string;
  start_url: string;
  display: string;
  lang: string;
  icons: { src: string; sizes: string; type: string; purpose: string }[];
  shortcuts: { name: string; url: string }[];
};

describe("Área 20 · manifest de la PWA", () => {
  test("los campos básicos son los prometidos", () => {
    expect(manifest.name).toContain("VERBALIA");
    expect(manifest.short_name).toBe("VERBALIA");
    expect(manifest.start_url).toBe("/");
    expect(manifest.display).toBe("standalone");
    expect(manifest.lang).toBe("es");
  });

  test("todo icono del manifest existe de verdad en public/ y tiene 192 y 512", () => {
    expect(manifest.icons.length).toBeGreaterThanOrEqual(3);
    const sizes = manifest.icons.map((i) => i.sizes);
    expect(sizes).toContain("192x192");
    expect(sizes).toContain("512x512");
    expect(manifest.icons.some((i) => i.purpose === "maskable")).toBe(true);
    for (const icon of manifest.icons) {
      expect(existsSync(`public${icon.src}`)).toBe(true);
    }
  });

  test("todo atajo resuelve contra la tabla real de rutas del juego", () => {
    expect(manifest.shortcuts.length).toBeGreaterThanOrEqual(3);
    for (const shortcut of manifest.shortcuts) {
      const hash = shortcut.url.split("#")[1] ?? "";
      expect(hash.startsWith("/")).toBe(true);
      const parts = hash.replace(/^\/?/, "").split("/").filter(Boolean);
      const head = ROUTE_ALIASES[parts[0] ?? ""] ?? parts[0];
      if (parts[0] === "juego") {
        // «#/juego/srs/training»: el gameId debe existir y el modo ser real
        expect(parts[1] in GAMES).toBe(true);
        expect(["mission", "training", "review", "placement"]).toContain(parts[2] ?? "training");
      } else {
        expect(head).toBeDefined();
        expect(head).not.toBe(parts[0]); // el alias resuelve a una pantalla real
      }
    }
  });

  test("el apple-touch-icon también está servido", () => {
    expect(existsSync("public/icons/apple-touch-icon.png")).toBe(true);
  });
});
