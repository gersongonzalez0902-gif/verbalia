/**
 * La Bóveda del Bazar (Área 9 · medallas y coleccionables) — resumen puro
 * y testeable de lo poseído, por clase y rareza, con el porcentaje de
 * colección completada. Sin datos nuevos: solo lee el catálogo del Bazar
 * (SHOP_ITEMS es la única fuente de verdad de clase, nombre y rareza).
 */

import { SHOP_ITEMS, type Rarity } from "@/engine/shop";

export interface VaultEntry {
  id: string;
  name: string;
  kind: "frame" | "banner" | "title" | "otro";
  rarity: Rarity;
}

export interface VaultSummary {
  entries: VaultEntry[];
  /** Total de piezas coleccionables del catálogo (marcos, banners y títulos). */
  totalCatalog: number;
  /** Porcentaje de colección poseída (0-100, redondeado). */
  completionPct: number;
  byKind: { frame: number; banner: number; title: number; otro: number };
  byRarity: Record<Rarity, number>;
  legendarias: VaultEntry[];
}

const COLLECTIBLE_KINDS = new Set(["frame", "banner", "title"]);

function kindOf(id: string): VaultEntry["kind"] {
  const item = SHOP_ITEMS.find((s) => s.id === id);
  if (item && COLLECTIBLE_KINDS.has(item.kind)) return item.kind as VaultEntry["kind"];
  return "otro";
}

/** El catálogo coleccionable: marcos, banners y títulos (sin consumibles). */
export function vaultCatalog(): VaultEntry[] {
  return SHOP_ITEMS.filter((s) => COLLECTIBLE_KINDS.has(s.kind)).map((s) => ({
    id: s.id,
    name: s.name,
    kind: s.kind as VaultEntry["kind"],
    rarity: s.rarity ?? "comun",
  }));
}

/** Resumen de la bóveda a partir de los ids poseídos en la cartera. */
export function summarizeVault(ownedIds: string[]): VaultSummary {
  const catalog = vaultCatalog();
  const catalogIds = new Set(catalog.map((e) => e.id));
  const entries = catalog
    .filter((e) => ownedIds.includes(e.id))
    .sort((a, b) => a.name.localeCompare(b.name, "es"));

  const byRarity: Record<Rarity, number> = { comun: 0, raro: 0, epico: 0, legendario: 0 };
  const byKind: VaultSummary["byKind"] = { frame: 0, banner: 0, title: 0, otro: 0 };
  for (const e of entries) {
    byRarity[e.rarity]++;
    byKind[e.kind]++;
  }
  return {
    entries,
    totalCatalog: catalog.length,
    completionPct: catalog.length > 0 ? Math.round((entries.length / catalog.length) * 100) : 0,
    byKind,
    byRarity,
    legendarias: entries.filter((e) => e.rarity === "legendario"),
  };
}
