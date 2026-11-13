"use client";

/**
 * El Bazar del Copista 2.0 · Tienda de la Forja (Mega-6).
 * Tinta ganada jugando ↔ estilo honesto: decoraciones de avatar de
 * doble anillo (tipo Discord), banners premium, títulos y escudos.
 * Cada tarjeta enseña su rareza y una vista previa real.
 */

import { useEffect, useMemo, useState } from "react";
import { useGameStore } from "@/store/game-store";
import { useUiStore } from "@/store/ui-store";
import { ScreenHeader } from "@/components/game/app-shell";
import { LexicoMascot } from "@/components/game/lexico";
import {
  FRAMES,
  PREMIUM_BANNERS,
  RARITY_META,
  SHOP_ITEMS,
  TITLES,
  frameCss,
  titleText,
  type Rarity,
  type ShopKind,
} from "@/engine/shop";
import { useToast } from "@/hooks/use-toast";
import { DAILY_GIFT_TINTA, dailyGiftPending, featuredShopItem, msUntilNextGift, PREMIUM_PALETTES } from "@/engine/shop";
import { isAdminName, ADMIN_TINTA_LABEL } from "@/engine/admin";
import { Gift, Star } from "lucide-react";
import { sfx } from "@/services/audio";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Droplets, Frame, Award, Shield, Image as ImageIcon, Palette, Sparkles } from "lucide-react";

const KIND_META: Record<ShopKind, { label: string; icon: React.ElementType; blurb: string }> = {
  frame: { label: "Decoraciones de avatar", icon: Frame, blurb: "Doble anillo alrededor de tu foto, estilo ficha de navegante." },
  banner: { label: "Banners premium", icon: ImageIcon, blurb: "Cabeceras exclusivas para tu ficha: se equipan desde el perfil." },
  title: { label: "Títulos", icon: Award, blurb: "La frase que te distingue bajo tu nombre." },
  shield: { label: "Escudos de racha", icon: Shield, blurb: "Protege tu racha un día de descanso (máx. 3 apilados)." },
  palette: { label: "Paletas de interfaz", icon: Palette, blurb: "Temas completos de color para toda la aventura: se eligen en Ajustes." },
};

/** Anillo decorado estilo Discord con Léxico asomando dentro. */
function FramePreview({ css, size = 72 }: { css?: string; size?: number }) {
  const inner = size - 14;
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center"
      style={{
        width: size,
        height: size,
        borderRadius: "38%",
        padding: 5,
        background: css
          ? css
          : "color-mix(in oklch, var(--primary) 22%, var(--card))",
        boxShadow: css ? "0 4px 14px -6px color-mix(in oklch, var(--primary) 45%, transparent)" : undefined,
      }}
      aria-hidden
    >
      <span
        className="flex items-center justify-center overflow-hidden"
        style={{
          width: inner,
          height: inner,
          borderRadius: "34%",
          background: "color-mix(in oklch, var(--card) 92%, #000 8%)",
        }}
      >
        <LexicoMascot size={inner - 8} mood="happy" />
      </span>
    </span>
  );
}

function RarityChip({ rarity }: { rarity: Rarity }) {
  const meta = RARITY_META[rarity];
  return (
    <span className={cn("rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wide", meta.chip)}>
      {meta.label}
    </span>
  );
}

export function ShopScreen() {
  const core = useGameStore((s) => s.core);
  const profile = useGameStore((s) => s.profile);
  const buyShopItem = useGameStore((s) => s.buyShopItem);
  const equipShopItem = useGameStore((s) => s.equipShopItem);
  const claimDailyTinta = useGameStore((s) => s.claimDailyTinta);
  const navigate = useUiStore((s) => s.navigate);
  const { toast } = useToast();
  const [justBought, setJustBought] = useState<string | null>(null);

  const wallet = core.wallet;
  const owned = useMemo(() => new Set(wallet.owned), [wallet.owned]);
  const giftPending = dailyGiftPending(core);
  const featured = useMemo(() => featuredShopItem(), []);

  /** Cuenta atrás hasta el próximo regalo diario (se actualiza cada 30 s). */
  const [giftCountdown, setGiftCountdown] = useState("");
  useEffect(() => {
    const fmt = () => {
      const ms = msUntilNextGift();
      const h = Math.floor(ms / 3_600_000);
      const m = Math.floor((ms % 3_600_000) / 60_000);
      const sec = Math.floor((ms % 60_000) / 1000);
      setGiftCountdown(h > 0 ? `${h} h ${m} min` : m > 0 ? `${m} min ${sec} s` : `${sec} s`);
    };
    fmt();
    const t = setInterval(fmt, 30_000);
    return () => clearInterval(t);
  }, [giftPending]);

  const handleBuy = (id: string, name: string) => {
    const result = buyShopItem(id);
    if (result === "ok") {
      sfx.buy();
      setJustBought(id);
      window.setTimeout(() => setJustBought(null), 1400);
      toast({ title: "¡Ya es tuyo!", description: `«${name}» ha entrado en tu bitácora.` });
    } else if (result === "sin-fondos") {
      sfx.wrong(true);
      toast({
        title: "Tinta insuficiente",
        description: "Juega sesiones para llenar el tintero: 1 de tinta por cada 10 XP.",
        variant: "destructive",
      });
    } else if (result === "ya-propietario") {
      toast({ title: "Ya lo tienes", description: "Equípalo desde tu perfil cuando quieras." });
    } else if (result === "escudo-lleno") {
      toast({ title: "Escudos al máximo", description: "Ya tienes 3 escudos apilados: úsalos antes de comprar más." });
    }
  };

  const isEquipped = (id: string) => wallet.frame === id || wallet.title === id || profile.banner === `premium:${id}`;
  const priceOf = (id: string) => SHOP_ITEMS.find((s) => s.id === id)?.price ?? 0;

  const renderCard = (
    id: string,
    name: string,
    description: string,
    price: number,
    kind: ShopKind,
    css?: string,
    rarity: Rarity = "comun",
  ) => {
    const has = owned.has(id) || id === "frame-none" || id === "title-none";
    const equipped = isEquipped(id);
    const meta = RARITY_META[rarity];
    return (
      <div
        id={`shop-item-${id}`}
        key={id}
        className={cn(
          "card-aurora tilt-hover relative flex flex-col rounded-2xl border-2 bg-card p-3.5 transition",
          equipped && "border-primary/70 bg-primary/5",
          justBought === id && "anim-pop border-primary",
        )}
        style={!equipped ? { borderColor: meta.ring + "55" } : undefined}
      >
        <span className="absolute right-2.5 top-2.5"><RarityChip rarity={rarity} /></span>

        {/* Vista previa */}
        <div className="mb-3 mt-1 flex h-[76px] items-center justify-center">
          {kind === "frame" ? (
            <FramePreview css={css} />
          ) : kind === "banner" ? (
            <span
              className="relative flex h-[68px] w-full items-end overflow-hidden rounded-xl border"
              style={{ background: css }}
              aria-hidden
            >
              <span className="absolute inset-x-2 top-2 flex justify-between">
                <span className="anim-twinkle text-xs opacity-70">✦</span>
                <span className="anim-twinkle text-[10px] opacity-50" style={{ animationDelay: "-1.5s" }}>✧</span>
              </span>
              <span className="flex items-end gap-1.5 p-2">
                <FramePreview css={undefined} size={34} />
                <span className="rounded-lg bg-black/35 px-2 py-1 text-[10px] font-bold text-white backdrop-blur-sm">
                  {profile.name}
                </span>
              </span>
            </span>
          ) : kind === "title" ? (
            <span className="flex h-full max-w-full items-center justify-center rounded-xl bg-secondary px-3 text-center font-display text-sm font-bold text-secondary-foreground">
              «{name}»
            </span>
          ) : kind === "palette" ? (
            <span className="relative flex h-[68px] w-full items-center justify-center overflow-hidden rounded-xl border" aria-hidden>
              <span className="h-full w-full" style={{ background: css }} />
            </span>
          ) : (
            <span className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <Shield className="h-8 w-8 text-primary" aria-hidden />
              <span className="numeric absolute -bottom-1 -right-1 rounded-full border bg-card px-1.5 text-[10px] font-bold">
                {core.streak.shields}/3
              </span>
            </span>
          )}
        </div>

        <p className="font-display text-sm font-bold leading-tight">{name}</p>
        <p className="mt-0.5 flex-1 text-[11px] leading-snug text-muted-foreground">{description}</p>

        <div className="mt-3">
          {kind === "shield" ? (
            <Button
              size="sm"
              className="w-full text-xs font-bold"
              variant="outline"
              onClick={() => handleBuy(id, name)}
            >
              <Droplets className="mr-1.5 h-3.5 w-3.5 text-primary" aria-hidden />
              {price} de tinta
            </Button>
          ) : has ? (
            kind === "palette" ? (
              <Button
                size="sm"
                className="w-full text-xs font-bold"
                onClick={() => {
                  sfx.tap();
                  navigate({ name: "settings" });
                }}
              >
                Elegir en Ajustes
              </Button>
            ) : kind === "banner" ? (
              <Button
                size="sm"
                variant={equipped ? "default" : "secondary"}
                className="w-full text-xs font-bold"
                disabled={equipped}
                onClick={() => {
                  sfx.tap();
                  navigate({ name: "profile" });
                }}
              >
                {equipped ? "En tu ficha" : "Equipar en el perfil"}
              </Button>
            ) : (
              <Button
                size="sm"
                variant={equipped ? "default" : "secondary"}
                className="w-full text-xs font-bold"
                disabled={equipped}
                onClick={() => {
                  sfx.tap();
                  equipShopItem(id);
                  toast({ title: equipped ? "Ya equipado" : "Equipado", description: equipped ? undefined : name });
                }}
              >
                {equipped ? "Equipado" : "Equipar"}
              </Button>
            )
          ) : (
            <Button size="sm" className="w-full text-xs font-bold" onClick={() => handleBuy(id, name)}>
              <Droplets className="mr-1.5 h-3.5 w-3.5" aria-hidden />
              {price}
            </Button>
          )}
        </div>
      </div>
    );
  };

  const section = (kind: ShopKind, children: React.ReactNode) => {
    const meta = KIND_META[kind];
    const MetaIcon = meta.icon;
    return (
      <section key={kind} className="mt-6" aria-labelledby={`shop-${kind}`}>
        <div className="flex items-baseline justify-between gap-2">
          <h2 id={`shop-${kind}`} className="type-h2 flex items-center gap-2">
            <MetaIcon className="h-4.5 w-4.5 text-primary" aria-hidden />
            {meta.label}
          </h2>
          <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            {kind === "frame" && (wallet.frame === "frame-none" ? "equipado: ninguno" : `equipado: ${FRAMES.find((f) => f.id === wallet.frame)?.name ?? ""}`)}
            {kind === "banner" && (profile.banner.startsWith("premium:") ? `equipado: ${PREMIUM_BANNERS.find((b) => `premium:${b.id}` === profile.banner)?.name ?? ""}` : "")}
            {kind === "title" && (wallet.title === "title-none" ? "equipado: ninguno" : `equipado: ${titleText(wallet.title)}`)}
          </span>
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">{meta.blurb}</p>
        <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3">{children}</div>
      </section>
    );
  };

  return (
    <div>
      <ScreenHeader
        title="El Bazar del Copista"
        subtitle="La tinta ganada jugando se cambia por estilo"
        backTo={{ name: "home" }}
      />

      <main className="mx-auto w-full max-w-2xl px-4 pb-28">
        {/* Mega-7 · Regalo diario del Copista */}
        <section className="card-aurora mt-3 flex flex-wrap items-center gap-3 rounded-3xl border bg-card p-4">
          <span className="gloss flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white" style={{ background: "var(--xp)" }} aria-hidden>
            <Gift className="h-6 w-6" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold">Regalo diario del Copista</p>
            <p className="text-xs leading-snug text-muted-foreground">
              {giftPending
                ? `Hoy te tocan ${DAILY_GIFT_TINTA} gotas de tinta, cortesía del taller.`
                : <>Regalo nuevamente en: <span className="numeric font-bold text-foreground">{giftCountdown}</span></>}
            </p>
          </div>
          <Button
            size="sm"
            disabled={!giftPending}
            className="font-bold"
            onClick={() => {
              if (!claimDailyTinta()) return;
              sfx.tinta();
              sfx.gift();
              toast({ title: `+${DAILY_GIFT_TINTA} de tinta`, description: "El Copista sonríe: mañana habrá más." });
            }}
          >
            <Droplets className="mr-1.5 h-4 w-4" aria-hidden />
            {giftPending ? `Reclamar ${DAILY_GIFT_TINTA}` : `En ${giftCountdown}`}
          </Button>
        </section>

        {/* Mega-7 · Destacado del día */}
        {featured && (
          <button
            onClick={() => { sfx.tap(); document.getElementById(`shop-item-${featured.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" }); }}
            className="card-aurora mt-3 flex w-full items-center gap-3 rounded-3xl border border-primary/40 bg-card p-3.5 text-left transition hover:border-primary/70"
          >
            <span className="gloss flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white" style={{ background: "var(--primary)" }} aria-hidden>
              <Star className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[10px] font-bold uppercase tracking-widest text-primary">Destacado de hoy</span>
              <span className="block truncate text-sm font-bold">{featured.name} · {featured.price} de tinta</span>
            </span>
            <span className="shrink-0 text-xs font-black text-primary">Ver →</span>
          </button>
        )}

        <section className="card-aurora relative mt-4 flex items-center gap-4 overflow-hidden rounded-3xl border bg-card p-4">
          <LexicoMascot size={64} mood="cheer" className="shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold">Tu tintero, {profile.name}</p>
            <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
              1 de tinta por cada 10 XP de sesión. El conocimiento no se compra: el estilo, a veces.
            </p>
            <p className="numeric mt-1 text-[11px] font-bold text-muted-foreground">
              {wallet.tinta + wallet.spent} de tinta ganada en total · {wallet.spent} gastada
            </p>
          </div>
          <div className="gloss flex shrink-0 flex-col items-center rounded-2xl border bg-background px-3 py-2">
            <span className="numeric font-display title-sheen text-xl font-bold">{isAdminName(profile.name) ? ADMIN_TINTA_LABEL : wallet.tinta}</span>
            <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
              <Droplets className="h-3 w-3 text-primary" aria-hidden /> tinta
            </span>
          </div>
        </section>

        {section(
          "frame",
          FRAMES.map((f) =>
            renderCard(
              f.id,
              f.name,
              f.id === "frame-none"
                ? "Vuelve a la sencillez de borda a borda."
                : SHOP_ITEMS.find((s) => s.id === f.id)?.description ?? "",
              priceOf(f.id),
              "frame",
              f.css,
              f.rarity,
            ),
          ),
        )}

        {section(
          "banner",
          PREMIUM_BANNERS.map((b) =>
            renderCard(b.id, b.name, SHOP_ITEMS.find((s) => s.id === b.id)?.description ?? "", b.price, "banner", b.css, b.rarity),
          ),
        )}

        {section(
          "title",
          TITLES.map((t) =>
            renderCard(
              t.id,
              t.text || "Sin título",
              t.id === "title-none"
                ? "Navega sin etiquetas, como el mar."
                : SHOP_ITEMS.find((s) => s.id === t.id)?.description ?? "",
              priceOf(t.id),
              "title",
              undefined,
              SHOP_ITEMS.find((s) => s.id === t.id)?.rarity ?? "comun",
            ),
          ),
        )}

        {section(
          "shield",
          SHOP_ITEMS.filter((s) => s.kind === "shield").map((s) => renderCard(s.id, s.name, s.description, s.price, s.kind, undefined, "comun")),
        )}

        {section(
          "palette",
          PREMIUM_PALETTES.map((p) =>
            renderCard(p.id, `Tema · ${p.name}`, SHOP_ITEMS.find((s) => s.id === p.id)?.description ?? "", p.price, "palette", p.swatch, p.rarity),
          ),
        )}

        <p className="mt-6 flex items-center justify-center gap-1.5 text-center text-[11px] leading-relaxed text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
          El Bazar no vende ventajas: todo lo que compra tu tinta es estilo o comodidad.
          Los escudos también se ganan con la misión semanal.
        </p>
      </main>
    </div>
  );
}
