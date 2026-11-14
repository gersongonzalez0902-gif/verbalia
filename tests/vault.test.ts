import { describe, expect, test } from "bun:test";
import { summarizeVault, vaultCatalog } from "@/lib/vault";
import { SHOP_ITEMS } from "@/engine/shop";

/**
 * Área 9 · la Bóveda del Bazar: inventario de coleccionables poseídos,
 * por clase y rareza, con porcentaje de colección.
 */

describe("Área 9 · la Bóveda", () => {
  test("el catálogo coleccionable son marcos, banners y títulos (sin consumibles)", () => {
    const catalog = vaultCatalog();
    expect(catalog.length).toBeGreaterThan(0);
    for (const e of catalog) {
      expect(["frame", "banner", "title"]).toContain(e.kind);
      expect(e.name.length).toBeGreaterThan(0);
    }
    const shopCollectibles = SHOP_ITEMS.filter((s) => ["frame", "banner", "title"].includes(s.kind)).length;
    expect(catalog.length).toBe(shopCollectibles);
  });

  test("bóveda vacía: sin piezas y 0 % sin inventar nada", () => {
    const v = summarizeVault([]);
    expect(v.entries).toEqual([]);
    expect(v.completionPct).toBe(0);
    expect(v.byKind.frame).toBe(0);
  });

  test("cada pieza poseída entra con su clase y rareza; el % es honesto", () => {
    const catalog = vaultCatalog();
    const dos = catalog.slice(0, 2).map((e) => e.id);
    const v = summarizeVault(dos);
    expect(v.entries.length).toBe(2);
    expect(v.completionPct).toBe(Math.round((2 / v.totalCatalog) * 100));
    // La suma por clases coincide con el total poseído.
    const kindSum = v.byKind.frame + v.byKind.banner + v.byKind.title + v.byKind.otro;
    expect(kindSum).toBe(2);
    const raritySum = v.byRarity.comun + v.byRarity.raro + v.byRarity.epico + v.byRarity.legendario;
    expect(raritySum).toBe(2);
  });

  test("los consumibles (escudos) y los gratuitos no cuentan como colección", () => {
    const shields = SHOP_ITEMS.filter((s) => s.kind === "shield").map((s) => s.id);
    const v = summarizeVault([...shields, "frame-none", "title-none"]);
    expect(v.entries.length).toBe(0);
    expect(v.completionPct).toBe(0);
  });

  test("las piezas legendarias se distinguen en el resumen", () => {
    const legendarias = vaultCatalog().filter((e) => e.rarity === "legendario");
    const v = summarizeVault(legendarias.map((e) => e.id));
    expect(v.legendarias.length).toBe(legendarias.length);
    expect(v.byRarity.legendario).toBe(legendarias.length);
  });
});
