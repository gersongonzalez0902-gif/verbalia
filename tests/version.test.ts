import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { APP_VERSION } from "@/lib/version";

/**
 * Área 15 · Ajustes: la versión de «Acerca de» y la de package.json son
 * la misma verdad. Si se separan, la batería avisa.
 */

describe("Área 15 · versión única", () => {
  test("APP_VERSION coincide con package.json", () => {
    const pkg = JSON.parse(readFileSync("package.json", "utf8")) as { version: string };
    expect(APP_VERSION).toBe(pkg.version);
  });

  test("la versión tiene forma de versión", () => {
    expect(APP_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
  });
});
