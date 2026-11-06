import type { GameCore, Wallet } from "@/types";

/**
 * El Bazar del Copista · Economía de la Forja (Etapa 4).
 *
 * La tinta se gana jugando (1 por cada 10 XP de sesión) y se gasta en
 * marcos de avatar, títulos de navegante y escudos de racha. Toda la
 * lógica es pura y se prueba en tests/engine.test.ts.
 */

/** Ratio de conversión XP → tinta. */
export const TINTA_PER_XP = 10;

export type ShopKind = "frame" | "title" | "shield";

export interface ShopItem {
  id: string;
  kind: ShopKind;
  name: string;
  description: string;
  price: number;
  icon: string;
  /** Marco: gradiente CSS del borde. Título: texto a mostrar. */
  data?: string;
}

/** Marcos de avatar (gradientes decorativos del borde de la foto). */
export const FRAMES: { id: string; name: string; css: string }[] = [
  { id: "frame-none", name: "Sin marco", css: "" },
  { id: "frame-rustico", name: "Rústico", css: "linear-gradient(135deg, oklch(0.62 0.12 55), oklch(0.78 0.11 80))" },
  { id: "frame-marea", name: "Marea", css: "linear-gradient(135deg, oklch(0.55 0.12 215), oklch(0.72 0.10 195))" },
  { id: "frame-faro", name: "Faro", css: "conic-gradient(from 20deg, oklch(0.75 0.14 85), oklch(0.45 0.11 255), oklch(0.75 0.14 85))" },
  { id: "frame-auroral", name: "Auroral", css: "linear-gradient(135deg, oklch(0.6 0.17 300), oklch(0.8 0.13 200), oklch(0.9 0.1 140))" },
  { id: "frame-ceniza", name: "Ceniza volcánica", css: "linear-gradient(135deg, oklch(0.3 0.03 270), oklch(0.55 0.06 270))" },
  { id: "frame-codice", name: "Códice dorado", css: "linear-gradient(135deg, oklch(0.8 0.13 85), oklch(0.6 0.12 55), oklch(0.85 0.1 95))" },
];

/** Títulos de navegante (se muestran bajo el nombre del perfil). */
export const TITLES: { id: string; text: string }[] = [
  { id: "title-none", text: "" },
  { id: "title-tinta", text: "Mano de tinta" },
  { id: "title-faro", text: "Luz de faro" },
  { id: "title-eco", text: "Eco de las voces" },
  { id: "title-cronista", text: "Cronista paciente" },
  { id: "title-errante", text: "Errante del Archipiélago" },
  { id: "title-forjador", text: "Forjador de metáforas" },
  { id: "title-codice", text: "Guardián del Códice" },
];

/** Catálogo completo del Bazar (los gratuitos «none» no se compran: se equipan). */
export const SHOP_ITEMS: ShopItem[] = [
  ...FRAMES.filter((f) => f.id !== "frame-none").map<ShopItem>((f) => ({
    id: f.id,
    kind: "frame",
    name: f.name,
    description: "Marco decorativo para la foto de tu ficha.",
    price: f.id === "frame-codice" ? 120 : f.id === "frame-auroral" ? 90 : 60,
    icon: "Frame",
    data: f.css,
  })),
  ...TITLES.filter((t) => t.id !== "title-none").map<ShopItem>((t) => ({
    id: t.id,
    kind: "title",
    name: t.text,
    description: "Título que luce bajo tu nombre en la ficha del navegante.",
    price: t.id === "title-codice" ? 150 : t.id === "title-forjador" ? 100 : 70,
    icon: "Award",
    data: t.text,
  })),
  {
    id: "shield-1",
    kind: "shield",
    name: "Escudo de racha",
    description: "Protege tu racha un día de descanso (se apila hasta 3).",
    price: 80,
    icon: "Shield",
  },
];

export function shopItemById(id: string): ShopItem | undefined {
  return SHOP_ITEMS.find((i) => i.id === id);
}

/** Máximo de escudos simultáneos que se pueden acumular comprando. */
export const MAX_SHIELDS = 3;

export interface PurchaseOutcome {
  ok: boolean;
  reason?: "sin-fondos" | "ya-propietario" | "escudo-lleno" | "item-desconocido";
  core?: GameCore;
}

/** Coste en tinta de un marco/título por su id de catálogo. */
export function applyPurchase(core: GameCore, itemId: string): PurchaseOutcome {
  const item = shopItemById(itemId);
  if (!item) return { ok: false, reason: "item-desconocido" };

  const wallet: Wallet = { ...core.wallet, owned: [...core.wallet.owned] };

  if (item.kind === "shield") {
    if (core.streak.shields >= MAX_SHIELDS) return { ok: false, reason: "escudo-lleno" };
    if (wallet.tinta < item.price) return { ok: false, reason: "sin-fondos" };
    return {
      ok: true,
      core: {
        ...core,
        streak: { ...core.streak, shields: core.streak.shields + 1 },
        wallet: { ...wallet, tinta: wallet.tinta - item.price, spent: wallet.spent + item.price },
      },
    };
  }

  if (wallet.owned.includes(itemId)) return { ok: false, reason: "ya-propietario" };
  if (wallet.tinta < item.price) return { ok: false, reason: "sin-fondos" };

  const next: GameCore = {
    ...core,
    wallet: {
      ...wallet,
      tinta: wallet.tinta - item.price,
      owned: [...wallet.owned, itemId],
      spent: wallet.spent + item.price,
      // Comprar equipa al instante (se puede re-equipar desde el perfil).
      ...(item.kind === "frame" ? { frame: itemId } : { title: itemId }),
    },
  };
  return { ok: true, core: next };
}

/** Equipa un cosmético ya comprado (o el gratuito por defecto). */
export function applyEquip(core: GameCore, itemId: string): GameCore {
  if (itemId === "frame-none" || itemId === "title-none" || core.wallet.owned.includes(itemId)) {
    const isFrame = itemId.startsWith("frame-");
    return {
      ...core,
      wallet: {
        ...core.wallet,
        frame: isFrame ? itemId : core.wallet.frame,
        title: !isFrame ? itemId : core.wallet.title,
      },
    };
  }
  return core;
}

/** Tinta ganada por una sesión (1 por cada 10 XP, mínimo 0). */
export function tintaForXp(xpTotal: number): number {
  return Math.max(0, Math.floor(xpTotal / TINTA_PER_XP));
}

/** Texto legible de un marco o título equipado. */
export function titleText(id: string): string {
  return TITLES.find((t) => t.id === id)?.text ?? "";
}

/** CSS del marco equipado ("" si no hay). */
export function frameCss(id: string): string {
  return FRAMES.find((f) => f.id === id)?.css ?? "";
}
