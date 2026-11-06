import type { GameCore, Wallet } from "@/types";

/**
 * El Bazar del Copista · Economía de la Forja (Etapa 4 → Mega-6).
 *
 * La tinta se gana jugando (1 por cada 10 XP de sesión) y se gasta en
 * marcos de avatar estilo decoración (doble anillo, tipo Discord),
 * banners premium para la ficha, títulos de navegante y escudos de
 * racha. Toda la lógica es pura y se prueba en tests/engine.test.ts.
 */

/** Ratio de conversión XP → tinta. */
export const TINTA_PER_XP = 10;

export type ShopKind = "frame" | "title" | "shield" | "banner";

/** Rareza de un artículo: define el color de su tarjeta. */
export type Rarity = "comun" | "raro" | "epico" | "legendario";

export interface ShopItem {
  id: string;
  kind: ShopKind;
  name: string;
  description: string;
  price: number;
  icon: string;
  /** Marco: gradiente CSS del anillo. Título: texto. Banner: css de fondo. */
  data?: string;
  rarity?: Rarity;
}

export const RARITY_META: Record<Rarity, { label: string; ring: string; chip: string }> = {
  comun: { label: "Común", ring: "var(--border)", chip: "bg-secondary text-secondary-foreground" },
  raro: { label: "Raro", ring: "var(--region-puerto)", chip: "bg-[color-mix(in_oklch,var(--region-puerto)_22%,transparent)] text-[var(--region-puerto)]" },
  epico: { label: "Épico", ring: "var(--region-observatorio)", chip: "bg-[color-mix(in_oklch,var(--region-observatorio)_22%,transparent)] text-[var(--region-observatorio)]" },
  legendario: { label: "Legendario", ring: "var(--xp)", chip: "bg-[color-mix(in_oklch,var(--xp)_25%,transparent)] text-[var(--xp)]" },
};

/**
 * Marcos de avatar · estilo decoración de perfil (doble anillo tipo
 * Discord): el css pinta el anillo exterior; el interior lo añade la
 * ficha del perfil. Los ids antiguos se conservan por compatibilidad.
 */
export const FRAMES: { id: string; name: string; css: string; rarity: Rarity }[] = [
  { id: "frame-none", name: "Sin marco", css: "", rarity: "comun" },
  // —— clásicos (ids conservados, estética renovada) ——
  { id: "frame-rustico", name: "Rústico", css: "linear-gradient(145deg, oklch(0.62 0.12 55), oklch(0.78 0.11 80))", rarity: "comun" },
  { id: "frame-marea", name: "Marea", css: "linear-gradient(145deg, oklch(0.55 0.12 215), oklch(0.72 0.10 195))", rarity: "comun" },
  { id: "frame-faro", name: "Faro", css: "conic-gradient(from 20deg, oklch(0.75 0.14 85), oklch(0.45 0.11 255), oklch(0.75 0.14 85))", rarity: "raro" },
  { id: "frame-auroral", name: "Auroral", css: "linear-gradient(145deg, oklch(0.6 0.17 300), oklch(0.8 0.13 200), oklch(0.9 0.1 140))", rarity: "raro" },
  { id: "frame-ceniza", name: "Ceniza volcánica", css: "linear-gradient(145deg, oklch(0.3 0.03 270), oklch(0.55 0.06 270))", rarity: "raro" },
  { id: "frame-codice", name: "Códice dorado", css: "linear-gradient(145deg, oklch(0.8 0.13 85), oklch(0.6 0.12 55), oklch(0.85 0.1 95))", rarity: "epico" },
  // —— Mega-6: decoraciones estilo Discord ——
  {
    id: "frame-bruma",
    name: "Bruma",
    css: "linear-gradient(145deg, oklch(0.7 0.1 240), oklch(0.85 0.06 210))",
    rarity: "raro",
  },
  {
    id: "frame-brasa",
    name: "Brasa",
    css: "conic-gradient(from 0deg, oklch(0.7 0.18 30), oklch(0.5 0.15 15), oklch(0.7 0.18 30))",
    rarity: "epico",
  },
  {
    id: "frame-eclipse",
    name: "Eclipse",
    css: "linear-gradient(145deg, oklch(0.25 0.02 280), oklch(0.45 0.05 280), oklch(0.25 0.02 280))",
    rarity: "epico",
  },
  {
    id: "frame-pluma",
    name: "Pluma arcoíris",
    css: "conic-gradient(from 0deg, oklch(0.75 0.18 30), oklch(0.75 0.18 140), oklch(0.75 0.18 260), oklch(0.75 0.18 30))",
    rarity: "legendario",
  },
  {
    id: "frame-nova",
    name: "Nova del faro",
    css: "conic-gradient(from 45deg, oklch(0.9 0.1 90), oklch(0.6 0.19 300), oklch(0.9 0.1 90))",
    rarity: "legendario",
  },
];

/** Banners premium para la ficha (se equipan desde el perfil). */
export const PREMIUM_BANNERS: { id: string; name: string; css: string; price: number; rarity: Rarity }[] = [
  {
    id: "pband-tinta",
    name: "Marea de tinta",
    css: "linear-gradient(120deg, oklch(0.35 0.12 280), oklch(0.55 0.16 300) 45%, oklch(0.8 0.12 330))",
    price: 60,
    rarity: "raro",
  },
  {
    id: "pband-faro",
    name: "Halo del faro",
    css: "radial-gradient(circle at 78% 22%, oklch(0.92 0.12 95) 0%, oklch(0.55 0.14 60) 34%, oklch(0.32 0.08 40) 68%, oklch(0.2 0.03 260))",
    price: 80,
    rarity: "epico",
  },
  {
    id: "pband-cosmos",
    name: "Archipiélago estelar",
    css: "radial-gradient(circle at 20% 80%, oklch(0.5 0.15 250) 0%, transparent 45%), radial-gradient(circle at 72% 30%, oklch(0.55 0.16 320) 0%, transparent 40%), linear-gradient(140deg, oklch(0.22 0.04 280), oklch(0.3 0.07 310))",
    price: 100,
    rarity: "epico",
  },
  {
    id: "pband-origen",
    name: "Aurora originaria",
    css: "linear-gradient(115deg, oklch(0.6 0.19 150), oklch(0.75 0.15 200) 30%, oklch(0.85 0.13 85) 62%, oklch(0.6 0.19 20))",
    price: 140,
    rarity: "legendario",
  },
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
  // Mega-6: títulos del Salón de Juegos
  { id: "title-tactico", text: "Mente del farero" },
  { id: "title-oracle", text: "Voz del tablero" },
  { id: "title-marea", text: "Memoria de marea" },
  { id: "title-comodin", text: "As de la bitácora" },
];

/** Precio de un artículo del catálogo (por id). */
const PRICE_BY_ID: Record<string, number> = {
  // marcos
  "frame-rustico": 40,
  "frame-marea": 40,
  "frame-faro": 60,
  "frame-auroral": 70,
  "frame-ceniza": 60,
  "frame-codice": 110,
  "frame-bruma": 60,
  "frame-brasa": 100,
  "frame-eclipse": 110,
  "frame-pluma": 180,
  "frame-nova": 220,
  // títulos
  "title-tinta": 50,
  "title-faro": 50,
  "title-eco": 60,
  "title-cronista": 60,
  "title-errante": 70,
  "title-forjador": 100,
  "title-codice": 140,
  "title-tactico": 70,
  "title-oracle": 90,
  "title-marea": 70,
  "title-comodin": 120,
  // escudo
  "shield-1": 70,
};

/** Catálogo completo del Bazar (los gratuitos «none» no se compran: se equipan). */
export const SHOP_ITEMS: ShopItem[] = [
  ...FRAMES.filter((f) => f.id !== "frame-none").map<ShopItem>((f) => ({
    id: f.id,
    kind: "frame",
    name: f.name,
    description: "Decoración de doble anillo para tu foto de ficha.",
    price: PRICE_BY_ID[f.id] ?? 60,
    icon: "Frame",
    data: f.css,
    rarity: f.rarity,
  })),
  ...PREMIUM_BANNERS.map<ShopItem>((b) => ({
    id: b.id,
    kind: "banner",
    name: b.name,
    description: "Banner exclusivo para la cabecera de tu ficha (se equipa en el perfil).",
    price: b.price,
    icon: "Image",
    data: b.css,
    rarity: b.rarity,
  })),
  ...TITLES.filter((t) => t.id !== "title-none").map<ShopItem>((t) => ({
    id: t.id,
    kind: "title",
    name: t.text,
    description: "Título que luce bajo tu nombre en la ficha del navegante.",
    price: PRICE_BY_ID[t.id] ?? 70,
    icon: "Award",
    data: t.text,
    rarity: t.id === "title-codice" || t.id === "title-comodin" ? "epico" : t.id === "title-forjador" || t.id === "title-oracle" ? "raro" : "comun",
  })),
  {
    id: "shield-1",
    kind: "shield",
    name: "Escudo de racha",
    description: "Protege tu racha un día de descanso (se apila hasta 3).",
    price: 70,
    icon: "Shield",
    rarity: "comun",
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
      // Comprar equipa al instante (los banners se equipan desde el perfil).
      ...(item.kind === "frame" ? { frame: itemId } : {}),
      ...(item.kind === "title" ? { title: itemId } : {}),
    },
  };
  return { ok: true, core: next };
}

/** Equipa un cosmético ya comprado (o el gratuito por defecto). */
export function applyEquip(core: GameCore, itemId: string): GameCore {
  if (itemId === "frame-none" || itemId === "title-none" || core.wallet.owned.includes(itemId)) {
    const isFrame = itemId.startsWith("frame-");
    const isTitle = itemId.startsWith("title-");
    return {
      ...core,
      wallet: {
        ...core.wallet,
        frame: isFrame ? itemId : core.wallet.frame,
        title: isTitle ? itemId : core.wallet.title,
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

/** CSS de un banner premium comprado ("" si no existe). */
export function premiumBannerCss(id: string): string {
  return PREMIUM_BANNERS.find((b) => b.id === id)?.css ?? "";
}
