"use client";

/**
 * Perfil del jugador 2.0 · Estilo ficha de navegante (Discord-like):
 * banner personalizable, foto con predeterminada, bio, rango con género,
 * habilidades (las 7 ciudades) e insignias con tiers. La gestión de datos
 * vive en Ajustes; la copia de seguridad la hace la cuenta (sync automático).
 */

import { createElement, useRef, useState } from "react";
import { useGameStore } from "@/store/game-store";
import { useUiStore } from "@/store/ui-store";
import { ScreenHeader } from "@/components/game/app-shell";
import { levelProgress, rankForLevel, rankName, cefrFromSkill, skillMasteryLabel } from "@/engine/xp";
import { isAdminName, ADMIN_TINTA_LABEL } from "@/engine/admin";
import { SKILL_LABELS, SKILL_COLORS } from "@/data/regions";
import { ACHIEVEMENTS } from "@/data/achievements";
import { FRAMES, PREMIUM_BANNERS, premiumBannerCss, frameCss, titleText } from "@/engine/shop";
import { LevelBadge, XpBar, ProgressRing } from "@/components/game/widgets";
import { getIcon } from "@/components/game/icons";
import { LexicoMascot } from "@/components/game/lexico";
import { resizeImageFile } from "@/lib/image-tools";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { sfx } from "@/services/audio";
import { cn } from "@/lib/utils";
import type { AchievementDef } from "@/types";
import { formatPlaytime } from "@/lib/format-time";
import {
  Camera,
  Check,
  Droplets,
  Image as ImageIcon,
  Keyboard,
  Lock,
  Medal,
  PenLine,
  Star,
  X,
} from "lucide-react";

/** Banners predefinidos: composiciones escénicas por capas, nada de
 *  gradientes planos. Cada banner cuenta un lugar del Archipiélago. */
const BANNER_PRESETS: { id: string; label: string; css: string }[] = [
  { id: "aurora", label: "Aurora", css: "linear-gradient(115deg, oklch(0.55 0.17 285), oklch(0.72 0.13 210) 60%, oklch(0.82 0.13 85))" },
  { id: "faro", label: "Faro al anochecer", css: "radial-gradient(circle at 80% 25%, oklch(0.92 0.11 95) 0%, oklch(0.7 0.14 55) 18%, oklch(0.35 0.1 300) 60%, oklch(0.22 0.05 280))" },
  { id: "marea", label: "Marea baja", css: "linear-gradient(180deg, oklch(0.75 0.1 215) 0%, oklch(0.88 0.07 190) 45%, oklch(0.55 0.1 160) 46%, oklch(0.38 0.09 150) 100%)" },
  { id: "bosque", label: "Sendero del bosque", css: "radial-gradient(80% 70% at 25% 0%, oklch(0.7 0.12 135 / 70%), transparent 65%), linear-gradient(160deg, oklch(0.42 0.11 150), oklch(0.55 0.12 120) 55%, oklch(0.28 0.06 150))" },
  { id: "ciudad", label: "Ciudad dorada", css: "radial-gradient(circle at 70% 90%, oklch(0.85 0.13 75) 0%, transparent 55%), linear-gradient(140deg, oklch(0.4 0.09 60), oklch(0.72 0.12 65) 60%, oklch(0.9 0.09 90))" },
  { id: "biblioteca", label: "Anaqueles", css: "repeating-linear-gradient(90deg, oklch(0.35 0.07 55) 0 14%, oklch(0.5 0.09 42) 14% 17%, oklch(0.82 0.1 80) 17% 22%), linear-gradient(180deg, oklch(0.85 0.09 85), oklch(0.7 0.08 60))" },
  { id: "observatorio", label: "Cúpula estrellada", css: "radial-gradient(circle at 30% 30%, oklch(0.9 0.08 90 / 80%) 0%, transparent 12%), radial-gradient(circle at 68% 55%, oklch(0.85 0.09 200 / 60%) 0%, transparent 10%), linear-gradient(160deg, oklch(0.2 0.05 285), oklch(0.42 0.1 290) 65%, oklch(0.85 0.12 85) 130%)" },
  { id: "forja", label: "Forja encendida", css: "radial-gradient(90% 80% at 50% 115%, oklch(0.72 0.19 32) 0%, transparent 62%), linear-gradient(180deg, oklch(0.22 0.04 30), oklch(0.36 0.11 26) 65%, oklch(0.58 0.17 30))" },
];

/** Nivel de insignia según recompensa: bronce / plata / oro / platino. */
function badgeTier(xpReward: number): { label: string; from: string; to: string } {
  if (xpReward >= 150) return { label: "Platino", from: "oklch(0.85 0.06 240)", to: "oklch(0.95 0.03 240)" };
  if (xpReward >= 100) return { label: "Oro", from: "oklch(0.75 0.15 85)", to: "oklch(0.88 0.12 95)" };
  if (xpReward >= 50) return { label: "Plata", from: "oklch(0.62 0.05 250)", to: "oklch(0.82 0.03 250)" };
  return { label: "Bronce", from: "oklch(0.55 0.09 55)", to: "oklch(0.72 0.09 65)" };
}

export function ProfileScreen() {
  const { profile, core, srs, updateProfile } = useGameStore();
  const navigate = useUiStore((s) => s.navigate);
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [nameDraft, setNameDraft] = useState(profile.name);
  const [bioDraft, setBioDraft] = useState(profile.bio);
  const photoRef = useRef<HTMLInputElement>(null);
  const bannerRef = useRef<HTMLInputElement>(null);
  const [bannerPicker, setBannerPicker] = useState(false);

  const { level, into, needed } = levelProgress(core.xp);
  const rank = rankForLevel(level);
  const unlockedCount = Object.keys(core.achievements).length;
  const wordsLearned = Object.values(srs).filter((c) => c.reps >= 2).length;
  const wordsMastered = Object.values(srs).filter((c) => c.state === "review" && c.intervalDays >= 21).length;
  const totalWords = Object.keys(srs).length || 1;

  const saveIdentity = () => {
    updateProfile({ name: nameDraft.trim() || profile.name, bio: bioDraft.slice(0, 160) });
    setEditing(false);
    sfx.stamp();
    toast({ title: "Perfil actualizado", description: "La bitácora ya luce tus cambios." });
  };

  const onPhotoPicked = async (file: File) => {
    try {
      const dataUrl = await resizeImageFile(file, 256, 256);
      updateProfile({ photo: dataUrl });
      sfx.pop();
      toast({ title: "Foto actualizada", description: "Tu rostro ya viaja en la bitácora (solo en este dispositivo)." });
    } catch {
      toast({ title: "No se pudo cargar la imagen", variant: "destructive" });
    }
  };

  const onBannerPicked = async (file: File) => {
    try {
      const dataUrl = await resizeImageFile(file, 1200, 400, 0.82);
      updateProfile({ banner: dataUrl });
      setBannerPicker(false);
      sfx.pop();
    } catch {
      toast({ title: "No se pudo cargar el banner", variant: "destructive" });
    }
  };

  // Guard defensivo: un dato corrupto o muy antiguo nunca debe romper la ficha.
  const bannerId = typeof profile.banner === "string" && profile.banner
    ? profile.banner
    : "preset:aurora";
  const bannerCss = (() => {
    if (bannerId.startsWith("data:")) return undefined;
    if (bannerId.startsWith("premium:")) {
      return { background: premiumBannerCss(bannerId.replace("premium:", "")) || undefined };
    }
    const preset = BANNER_PRESETS.find((b) => b.id === bannerId.replace("preset:", "")) ?? BANNER_PRESETS[0];
    return { background: preset.css };
  })();
  const isCustomBanner = bannerId.startsWith("data:");
  // Banners premium comprados en el Bazar (se equipan aquí).
  const ownedPremiumBanners = PREMIUM_BANNERS.filter(
    (b) => core.wallet?.owned?.includes(b.id),
  );

  const memberSince = new Date(profile.createdAt).toLocaleDateString("es-ES", {
    month: "long",
    year: "numeric",
  });

  const allSkills = ["vocabulario", "gramatica", "ortografia", "lectura", "audicion", "expresion", "cultura"] as const;

  // Cosméticos equipados (Etapa 4): marco y título del Bazar.
  const equipFrameCss = frameCss(core.wallet?.frame ?? "frame-none");
  const equipTitle = titleText(core.wallet?.title ?? "title-none");
  const tintaTotal = (core.wallet?.tinta ?? 0) + (core.wallet?.spent ?? 0);
  const featured = ACHIEVEMENTS.find((a) => a.id === profile.featuredBadge && core.achievements[a.id]);
  const toggleFeatured = (id: string) => {
    updateProfile({ featuredBadge: profile.featuredBadge === id ? "" : id });
    sfx.pop();
  };

  return (
    <div>
      <ScreenHeader
        title="Perfil del navegante"
        backTo={{ name: "home" }}
        right={
          <Button
            variant="ghost"
            size="sm"
            className="font-bold"
            onClick={() => { sfx.click(); setEditing(!editing); setNameDraft(profile.name); setBioDraft(profile.bio); }}
          >
            <PenLine className="mr-1.5 h-4 w-4" aria-hidden />
            {editing ? "Cancelar" : "Editar"}
          </Button>
        }
      />

      <main className="mx-auto w-full max-w-2xl px-4 pb-28">
        {/* ===== Banner estilo ficha ===== */}
        <section className="card-aurora relative mt-4 overflow-hidden rounded-3xl border">
          <div
            className="relative h-32 sm:h-40"
            style={bannerCss}
            role="img"
            aria-label={isCustomBanner ? "Banner personalizado" : `Banner ${bannerId.replace("preset:", "")}`}
          >
            {isCustomBanner && (
              <img src={bannerId} alt="" className="h-full w-full object-cover" />
            )}
            <span className="anim-twinkle absolute left-3 top-3 text-xl opacity-70" aria-hidden>✦</span>
            <button
              onClick={() => { sfx.tap(); setBannerPicker(!bannerPicker); }}
              className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-1.5 text-[11px] font-bold text-white backdrop-blur transition hover:bg-black/55"
              aria-label="Cambiar banner del perfil"
            >
              <ImageIcon className="h-3.5 w-3.5" aria-hidden />
              Banner
            </button>
          </div>

          {/* Selector de banners */}
          {bannerPicker && (
            <div className="anim-slide-up absolute inset-x-3 top-16 z-10 rounded-2xl border bg-card p-3 shadow-xl">
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">Elige tu horizonte</p>
              <div className="grid grid-cols-4 gap-2">
                {BANNER_PRESETS.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => { sfx.tap(); updateProfile({ banner: `preset:${b.id}` }); setBannerPicker(false); }}
                    aria-label={`Banner ${b.label}`}
                    aria-pressed={bannerId === `preset:${b.id}`}
                    className={cn(
                      "h-10 rounded-xl border-2 transition hover:scale-[1.03]",
                      bannerId === `preset:${b.id}` ? "border-primary" : "border-transparent",
                    )}
                    style={{ background: b.css }}
                  />
                ))}
              </div>

              {/* Banners premium del Bazar */}
              {ownedPremiumBanners.length > 0 && (
                <>
                  <p className="mb-1.5 mt-3 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                    ✦ Banners premium del Bazar
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    {ownedPremiumBanners.map((b) => (
                      <button
                        key={b.id}
                        onClick={() => { sfx.unlock(); updateProfile({ banner: `premium:${b.id}` }); setBannerPicker(false); }}
                        aria-label={`Banner premium ${b.name}`}
                        aria-pressed={bannerId === `premium:${b.id}`}
                        className={cn(
                          "relative h-10 overflow-hidden rounded-xl border-2 transition hover:scale-[1.03]",
                          bannerId === `premium:${b.id}` ? "border-primary" : "border-[var(--xp)]/40",
                        )}
                        style={{ background: b.css }}
                      >
                        <span className="anim-twinkle absolute right-1 top-0.5 text-[9px] text-white/80" aria-hidden>✦</span>
                      </button>
                    ))}
                  </div>
                </>
              )}

              <div className="mt-2.5 flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 text-xs font-bold"
                  onClick={() => bannerRef.current?.click()}
                >
                  <ImageIcon className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                  Subir imagen
                </Button>
                <Button size="sm" variant="ghost" className="text-xs" onClick={() => setBannerPicker(false)}>
                  <X className="h-4 w-4" aria-hidden />
                </Button>
              </div>
              <input
                ref={bannerRef}
                type="file"
                accept="image/*"
                className="hidden"
                aria-hidden
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void onBannerPicked(f);
                  e.target.value = "";
                }}
              />
            </div>
          )}

          {/* Identidad sobre el banner: avatar con doble anillo (tipo Discord) */}
          <div className="relative -mt-12 flex items-end gap-3 px-4 pb-4">
            <div className="relative shrink-0">
              <span
                className={cn("block shadow-lg", equipFrameCss ? "p-[5px]" : "p-[3px]")}
                style={
                  equipFrameCss
                    ? {
                        background: equipFrameCss,
                        borderRadius: "38%",
                        boxShadow: "0 6px 18px -6px color-mix(in oklch, var(--primary) 40%, transparent)",
                      }
                    : {
                        background: "color-mix(in oklch, var(--primary) 30%, var(--card))",
                        borderRadius: "38%",
                      }
                }
                aria-hidden
              >
                <span
                  className="block overflow-hidden bg-card"
                  style={{ borderRadius: "35%", padding: 3, background: "color-mix(in oklch, var(--card) 94%, #000 6%)" }}
                >
                  <span
                    className="block h-[88px] w-[88px] overflow-hidden bg-card"
                    style={{ borderRadius: "33%" }}
                  >
                    {profile.photo ? (
                      <img src={profile.photo} alt={`Foto de ${profile.name}`} className="h-full w-full object-cover" />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center">
                        <LexicoMascot size={82} mood="happy" />
                      </span>
                    )}
                  </span>
                </span>
              </span>
              <button
                onClick={() => photoRef.current?.click()}
                className="tap-target absolute -bottom-1.5 -right-1.5 flex h-8 w-8 items-center justify-center rounded-full border-2 bg-primary text-primary-foreground shadow-md transition hover:scale-105"
                aria-label="Cambiar foto de perfil"
              >
                <Camera className="h-4 w-4" aria-hidden />
              </button>
              <input
                ref={photoRef}
                type="file"
                accept="image/*"
                className="hidden"
                aria-hidden
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void onPhotoPicked(f);
                  e.target.value = "";
                }}
              />
            </div>

            <div className="min-w-0 flex-1 pb-1">
              {editing ? (
                <Input
                  autoFocus
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && saveIdentity()}
                  maxLength={20}
                  aria-label="Nuevo nombre"
                  className="h-10"
                />
              ) : (
                <h2 className="font-display title-sheen truncate text-2xl font-bold leading-tight drop-shadow-sm">{profile.name}</h2>
              )}
              <p className="mt-0.5 text-xs font-semibold leading-snug text-foreground/85 drop-shadow-sm">
                {rankName(rank, profile.gender)} · desde {memberSince}
              </p>
              {equipTitle && (
                <p className="mt-1 inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
                  <Star className="h-3 w-3" aria-hidden /> {equipTitle}
                </p>
              )}
            </div>
            <div className="shrink-0 pb-1">
              <LevelBadge level={level} size="lg" />
            </div>
          </div>
        </section>

        {/* ===== Bio ===== */}
        <section className="mt-3">
          {editing ? (
            <div className="anim-slide-up space-y-2">
              <Textarea
                value={bioDraft}
                onChange={(e) => setBioDraft(e.target.value)}
                maxLength={160}
                rows={3}
                placeholder="Preséntate a la tripulación… (160 caracteres)"
                aria-label="Descripción del perfil"
                className="rounded-2xl"
              />
              <div className="flex items-center gap-2">
                <p className="numeric flex-1 text-[11px] text-muted-foreground">{bioDraft.length}/160</p>
                <Button size="sm" onClick={saveIdentity} className="font-bold">
                  <Check className="mr-1.5 h-4 w-4" aria-hidden />
                  Guardar
                </Button>
              </div>
            </div>
          ) : (
            <div className="card-aurora rounded-3xl border bg-card p-4">
              <p className="text-sm leading-relaxed">
                {profile.bio || (
                  <span className="italic text-muted-foreground">
                    Navegante sin biografía… por ahora. Edita el perfil y preséntate a la tripulación.
                  </span>
                )}
              </p>
            </div>
          )}
        </section>

        {/* ===== Progreso global ===== */}
        <section className="mt-4 grid grid-cols-4 gap-2.5">
          <StatCard value={`${core.xp}`} label="XP total" />
          <StatCard value={`${core.streak.best}`} label="Mejor racha" />
          <StatCard value={formatPlaytime(core.stats.totalTimeMs ?? 0)} label="Jugado" />
          <StatCard value={`${core.stats.totalSessions}`} label="Sesiones" />
        </section>

        <section className="card-aurora mt-3 rounded-3xl border bg-card p-4">
          <div className="mb-2 flex items-baseline justify-between">
            <p className="text-sm font-bold">Nivel {level} · {rankName(rank, profile.gender)}</p>
            <p className="numeric text-xs text-muted-foreground">{into}/{needed} XP</p>
          </div>
          <XpBar into={into} needed={needed} />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <p className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs font-bold text-muted-foreground">
              <Droplets className="h-3.5 w-3.5 text-primary" aria-hidden />
              <span>Tinta del Bazar:</span>
              <span className="numeric text-foreground">{isAdminName(profile.name) ? ADMIN_TINTA_LABEL : core.wallet?.tinta ?? 0}</span>
              <span>en el tintero</span>
              <span className="text-muted-foreground/70">· {tintaTotal} ganada en total</span>
            </p>
            <Button variant="link" className="h-auto p-0 text-xs font-bold" onClick={() => { sfx.click(); navigate({ name: "shop" }); }}>
              Visitar el Bazar →
            </Button>
          </div>
        </section>

        {/* ===== Taller de escritura y logros ===== */}
        <section className="card-aurora mt-3 grid gap-3 rounded-3xl border bg-card p-4 sm:grid-cols-2">
          <button
            onClick={() => { sfx.whoosh(); navigate({ name: "writing" }); }}
            className="tap-3d flex items-center gap-3 rounded-2xl border bg-card p-3 text-left transition hover:border-primary/50"
          >
            <span className="gloss flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white" style={{ background: "var(--region-biblioteca)" }} aria-hidden>
              <Keyboard className="h-6 w-6" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-bold">Taller de Escritura</span>
              <span className="numeric block text-[11px] text-muted-foreground">
                {core.arcade.typing?.bestWpm ?? 0} PPM · {core.arcade.typing?.bestAccuracy ?? 0}% precisión · racha {core.arcade.typing?.streak ?? 0} día(s)
              </span>
            </span>
            <span className="shrink-0 text-xs font-black text-primary">Abrir →</span>
          </button>
          <button
            onClick={() => { sfx.whoosh(); navigate({ name: "missions" }); }}
            className="tap-3d flex items-center gap-3 rounded-2xl border bg-card p-3 text-left transition hover:border-primary/50"
          >
            <ProgressRing value={unlockedCount / ACHIEVEMENTS.length} size={56} stroke={6}>
              <span className="numeric text-[11px] font-black">{unlockedCount}/{ACHIEVEMENTS.length}</span>
            </ProgressRing>
            <span className="min-w-0 text-left">
              <span className="block text-sm font-bold">Logros del navegante</span>
              <span className="block text-[11px] text-muted-foreground">
                {ACHIEVEMENTS.length - unlockedCount} tesoros por descubrir
              </span>
            </span>
          </button>
        </section>

        {/* ===== Habilidades (las 7 islas) ===== */}
        <section className="mt-6" aria-labelledby="skills-title">
          <h3 id="skills-title" className="font-display text-lg font-bold">Tus habilidades</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Estimación orientativa. VerbalIA no certifica niveles oficiales.
          </p>
          <div className="mt-3 space-y-2.5">
            {allSkills.map((skill) => {
              const lvl = core.skills[skill] ?? 2;
              const cefr = cefrFromSkill(lvl);
              return (
                <div key={skill} className="card-aurora flex items-center gap-3 rounded-2xl border bg-card p-3.5">
                  <span
                    className="gloss h-3.5 w-3.5 shrink-0 rounded-full"
                    style={{ background: SKILL_COLORS[skill], boxShadow: `0 0 8px color-mix(in oklch, ${SKILL_COLORS[skill]} 60%, transparent)` }}
                    aria-hidden
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between">
                      <p className="text-sm font-bold">{SKILL_LABELS[skill]}</p>
                      <p className="text-xs font-bold text-muted-foreground">
                        {skillMasteryLabel(lvl)} · <span className="text-foreground">{cefr}</span>
                      </p>
                    </div>
                    <div className="groove mt-1.5 h-2 overflow-hidden rounded-full">
                      <div
                        className="h-full rounded-full transition-[width] duration-500"
                        style={{ width: `${(lvl / 10) * 100}%`, background: SKILL_COLORS[skill] }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ===== Colección ===== */}
        <section className="card-aurora mt-6 flex items-center gap-4 rounded-3xl border bg-card p-4">
          <ProgressRing value={wordsLearned / Math.max(totalWords, 48)} size={80} stroke={8}>
            <span className="numeric font-display text-base font-bold">{wordsLearned}</span>
          </ProgressRing>
          <div>
            <p className="text-sm font-bold">Palabras aprendidas</p>
            <p className="text-xs text-muted-foreground">{wordsMastered} dominadas</p>
            <Button variant="link" className="h-auto p-0 text-xs font-bold" onClick={() => { sfx.click(); navigate({ name: "collection" }); }}>
              Ver la colección →
            </Button>
          </div>
        </section>

        {/* ===== Insignias: vitrina compacta (sin saturar la ficha) ===== */}
        <section className="mt-6" aria-labelledby="badges-title">
          <h3 id="badges-title" className="font-display flex items-center gap-2 text-lg font-bold">
            <Medal className="h-5 w-5 text-primary" aria-hidden />
            Insignias: {unlockedCount} / {ACHIEVEMENTS.length}
          </h3>

          {/* Insignia destacada */}
          {featured && <FeaturedBadgeCard badge={featured} onRemove={() => toggleFeatured(featured.id)} />}

          {/* Distribución por tiers: resumen elegante de toda la colección */}
          <div className="mt-3 grid grid-cols-4 gap-2">
            {(["Bronce", "Plata", "Oro", "Platino"] as const).map((tierName) => {
              const total = ACHIEVEMENTS.filter((a) => badgeTier(a.xpReward).label === tierName).length;
              const got = ACHIEVEMENTS.filter((a) => core.achievements[a.id] && badgeTier(a.xpReward).label === tierName).length;
              const tier = tierName === "Platino" ? { from: "oklch(0.85 0.06 240)", to: "oklch(0.95 0.03 240)" }
                : tierName === "Oro" ? { from: "oklch(0.75 0.15 85)", to: "oklch(0.88 0.12 95)" }
                : tierName === "Plata" ? { from: "oklch(0.62 0.05 250)", to: "oklch(0.82 0.03 250)" }
                : { from: "oklch(0.55 0.09 55)", to: "oklch(0.72 0.09 65)" };
              return (
                <div key={tierName} className="card-aurora rounded-2xl border bg-card p-2.5 text-center">
                  <span
                    className="mx-auto flex h-8 w-8 items-center justify-center rounded-full"
                    style={{ background: `linear-gradient(140deg, ${tier.from}, ${tier.to})`, opacity: got > 0 ? 1 : 0.35 }}
                    aria-hidden
                  >
                    <Medal className="h-4 w-4" style={{ color: "oklch(0.25 0.03 260)" }} />
                  </span>
                  <p className="numeric mt-1.5 text-sm font-black leading-none">{got}<span className="text-muted-foreground/70">/{total}</span></p>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{tierName}</p>
                </div>
              );
            })}
          </div>

          {/* Vitrina: las últimas 10 conseguidas (la colección completa
              vive en Misiones y logros, que es donde se recogen). */}
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            {[...ACHIEVEMENTS]
              .filter((a) => core.achievements[a.id])
              .sort((a, b) => (core.achievements[b.id] ?? 0) - (core.achievements[a.id] ?? 0))
              .slice(0, 10)
              .map((a) => {
                const tier = badgeTier(a.xpReward);
                const Icon = getIcon(a.icon);
                const isStarred = profile.featuredBadge === a.id;
                return (
                  <button
                    key={a.id}
                    title={`${a.name}: ${a.description}`}
                    onClick={() => toggleFeatured(a.id)}
                    aria-label={`${a.name}. Tocar para ${isStarred ? "quitar el" : "fijarlo como"} destacado.`}
                    className={cn(
                      "tap-target relative flex h-10 w-10 items-center justify-center rounded-xl border transition hover:scale-110",
                      isStarred && "border-primary ring-2 ring-primary/50",
                    )}
                    style={{ background: `linear-gradient(140deg, ${tier.from}, ${tier.to})` }}
                  >
                    <Icon className="h-4.5 w-4.5" style={{ color: "oklch(0.25 0.03 260)" }} aria-hidden />
                    {isStarred && <Star className="absolute -right-1 -top-1 h-3.5 w-3.5 fill-primary text-primary drop-shadow" aria-hidden />}
                  </button>
                );
              })}
            {unlockedCount > 10 && (
              <button
                onClick={() => { sfx.click(); navigate({ name: "missions" }); }}
                className="numeric tap-target flex h-10 items-center gap-1 rounded-xl border border-dashed px-3 text-[11px] font-bold text-muted-foreground transition hover:border-primary/50 hover:text-foreground"
              >
                +{unlockedCount - 10} más <Star className="h-3.5 w-3.5" aria-hidden />
              </button>
            )}
            {unlockedCount === 0 && (
              <p className="text-xs leading-snug text-muted-foreground">
                Aún sin insignias: la primera llega pronto. Juega misiones y recoge logros.
              </p>
            )}
          </div>
          <Button variant="link" className="mt-1.5 h-auto p-0 text-xs font-bold" onClick={() => { sfx.click(); navigate({ name: "missions" }); }}>
            Ver misiones y logros →
          </Button>
        </section>

        <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
          <Button variant="outline" className="font-bold" onClick={() => { sfx.click(); navigate({ name: "settings" }); }}>
            Ajustes de temas, sonido y datos →
          </Button>
          <Button variant="outline" className="font-bold" onClick={() => { sfx.page(); navigate({ name: "legal" }); }}>
            Privacidad y cookies →
          </Button>
        </div>
      </main>
    </div>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="gloss card-aurora rounded-2xl border bg-card p-2.5 text-center">
      <p className="numeric font-display title-sheen truncate text-base font-bold sm:text-lg">{value}</p>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
    </div>
  );
}

/** Tarjeta de la insignia destacada (componente de módulo, sin estado). */
function FeaturedBadgeCard({ badge, onRemove }: { badge: AchievementDef; onRemove: () => void }) {
  return (
    <div className="card-aurora anim-pop mt-3 flex items-center gap-3.5 rounded-3xl border border-primary/30 bg-card p-4">
      <span
        className="gloss flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-md"
        style={{ background: "linear-gradient(140deg, var(--xp), color-mix(in oklch, var(--primary) 60%, var(--card)))", color: "oklch(0.25 0.03 260)" }}
        aria-hidden
      >
        {createElement(getIcon(badge.icon), { className: "h-7 w-7" })}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Insignia destacada</p>
        <p className="font-display text-base font-bold leading-tight">{badge.name}</p>
        <p className="text-xs text-muted-foreground">{badge.description}</p>
      </div>
      <Button variant="ghost" size="sm" className="shrink-0 text-xs" onClick={onRemove}>
        <X className="h-3.5 w-3.5" aria-hidden /> Quitar
      </Button>
    </div>
  );
}
