"use client";

/**
 * El Bazar del Copista · Tienda de la Forja (Etapa 4).
 * La tinta ganada jugando (1 por cada 10 XP) se cambia por marcos
 * de avatar, títulos de navegante y escudos de racha. Todo es
 * cosmético o de conveniencia honesta: el conocimiento no se compra.
 */

import { useMemo, useState } from "react";
import { useGameStore } from "@/store/game-store";
import { useUiStore } from "@/store/ui-store";
import { ScreenHeader } from "@/components/game/app-shell";
import { LexicoMascot } from "@/components/game/lexico";
import { FRAMES, SHOP_ITEMS, TITLES, frameCss, titleText, type ShopKind } from "@/engine/shop";
import { useToast } from "@/hooks/use-toast";
import { sfx } from "@/services/audio";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Droplets, Frame, Award, Shield } from "lucide-react";

const KIND_META: Record<ShopKind, { label: string; icon: React.ElementType; blurb: string }> = {
  frame: { label: "Marcos de avatar", icon: Frame, blurb: "El borde que luce tu foto en la ficha del navegante." },
  title: { label: "Títulos", icon: Award, blurb: "La frase que te distingue bajo tu nombre." },
  shield: { label: "Escudos de racha", icon: Shield, blurb: "Protege tu racha un día de descanso (máx. 3 apilados)." },
};

export function ShopScreen() {
  const core = useGameStore((s) => s.core);
  const profile = useGameStore((s) => s.profile);
  const buyShopItem = useGameStore((s) => s.buyShopItem);
  const equipShopItem = useGameStore((s) => s.equipShopItem);
  const navigate = useUiStore((s) => s.navigate);
  const { toast } = useToast();
  const [justBought, setJustBought] = useState<string | null>(null);

  const wallet = core.wallet;
  const owned = useMemo(() => new Set(wallet.owned), [wallet.owned]);

  const handleBuy = (id: string, name: string) => {
    const result = buyShopItem(id);
    if (result === "ok") {
      sfx.pop();
      setJustBought(id);
      window.setTimeout(() => setJustBought(null), 1200);
      toast({ title: "¡Equipado!", description: `«${name}» ya es tuyo y está equipado.` });
    } else if (result === "sin-fondos") {
      sfx.error();
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

  const isEquipped = (id: string) => wallet.frame === id || wallet.title === id;

  const renderCard = (id: string, name: string, description: string, price: number, kind: ShopKind, css?: string) => {
    const has = owned.has(id) || id === "frame-none" || id === "title-none";
    const equipped = isEquipped(id);
    const shieldCount = core.streak.shields;
    return (
      <div
        key={id}
        className={cn(
          "card-aurora relative flex flex-col rounded-2xl border bg-card p-4 transition",
          justBought === id && "anim-pop ring-2 ring-primary",
          equipped && "border-primary/60",
        )}
      >
        {/* Vista previa */}
        <div className="mb-3 flex items-center justify-center">
          {kind === "frame" ? (
            <span
              className="flex h-16 w-16 items-center justify-center rounded-2xl border-4 bg-card"
              style={{ borderColor: css ? "transparent" : "var(--border)", background: css || undefined }}
              aria-hidden
            >
              {css ? null : <Frame className="h-6 w-6 text-muted-foreground" />}
            </span>
          ) : kind === "title" ? (
            <span className="flex h-16 max-w-full items-center justify-center rounded-2xl bg-secondary px-3 text-center font-display text-sm font-bold text-secondary-foreground">
              «{name}»
            </span>
          ) : (
            <span className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <Shield className="h-8 w-8 text-primary" aria-hidden />
              <span className="numeric absolute -bottom-1 -right-1 rounded-full border bg-card px-1.5 text-[10px] font-bold">
                {shieldCount}/3
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

  return (
    <div>
      <ScreenHeader
        title="El Bazar del Copista"
        subtitle="La tinta ganada jugando se cambia por estilo"
        backTo={{ name: "home" }}
      />

      <main className="mx-auto w-full max-w-2xl px-4 pb-28">
        {/* Saldo */}
        <section className="card-aurora mt-4 flex items-center gap-4 rounded-3xl border bg-card p-4">
          <LexicoMascot size={64} mood="cheer" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold">Tu tintero, {profile.name}</p>
            <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
              1 de tinta por cada 10 XP de sesión. El conocimiento no se compra: el estilo, a veces.
            </p>
          </div>
          <div className="gloss flex shrink-0 flex-col items-center rounded-2xl border bg-background px-3 py-2">
            <span className="numeric font-display title-sheen text-xl font-bold">{wallet.tinta}</span>
            <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
              <Droplets className="h-3 w-3 text-primary" aria-hidden /> tinta
            </span>
          </div>
        </section>

        {/* Marcos: incluir el gratuito «ninguno» para re-equipar */}
        {(["frame", "title", "shield"] as ShopKind[]).map((kind) => {
          const meta = KIND_META[kind];
          const MetaIcon = meta.icon;
          return (
            <section key={kind} className="mt-6" aria-labelledby={`shop-${kind}`}>
              <div className="flex items-baseline justify-between gap-2">
                <h2 id={`shop-${kind}`} className="flex items-center gap-2 font-display text-lg font-bold">
                  <MetaIcon className="h-4.5 w-4.5 text-primary" aria-hidden />
                  {meta.label}
                </h2>
                {kind === "frame" && (
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    equipado: {wallet.frame === "frame-none" ? "ninguno" : FRAMES.find((f) => f.id === wallet.frame)?.name}
                  </span>
                )}
                {kind === "title" && (
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    equipado: {wallet.title === "title-none" ? "ninguno" : titleText(wallet.title)}
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">{meta.blurb}</p>
              <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                {kind === "frame" &&
                  FRAMES.map((f) =>
                    renderCard(
                      f.id,
                      f.name,
                      f.id === "frame-none" ? "Vuelve a la sencillez de borda a borda." : SHOP_ITEMS.find((s) => s.id === f.id)?.description ?? "",
                      SHOP_ITEMS.find((s) => s.id === f.id)?.price ?? 0,
                      "frame",
                      f.css,
                    ),
                  )}
                {kind === "title" &&
                  TITLES.map((t) =>
                    renderCard(
                      t.id,
                      t.text || "Sin título",
                      t.id === "title-none" ? "Navega sin etiquetas, como el mar." : SHOP_ITEMS.find((s) => s.id === t.id)?.description ?? "",
                      SHOP_ITEMS.find((s) => s.id === t.id)?.price ?? 0,
                      "title",
                    ),
                  )}
                {kind === "shield" &&
                  SHOP_ITEMS.filter((s) => s.kind === "shield").map((s) => renderCard(s.id, s.name, s.description, s.price, s.kind))}
              </div>
            </section>
          );
        })}

        <p className="mt-6 text-center text-[11px] leading-relaxed text-muted-foreground">
          El Bazar no vende ventajas: todo lo que compra tu tinta es estilo o comodidad.
          <br />
          Los escudos también se ganan con la misión semanal.
        </p>
      </main>
    </div>
  );
}
