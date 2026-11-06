"use client";

/**
 * Perfil del jugador 2.0 · Estilo ficha de navegante (Discord-like):
 * banner personalizable, foto con predeterminada, bio, rango con género,
 * habilidades (las 7 ciudades), insignias con tiers y gestión de datos.
 */

import { useRef, useState } from "react";
import { useGameStore } from "@/store/game-store";
import { useUiStore } from "@/store/ui-store";
import { ScreenHeader } from "@/components/game/app-shell";
import { levelProgress, rankForLevel, rankName, cefrFromSkill, skillMasteryLabel } from "@/engine/xp";
import { SKILL_LABELS, SKILL_COLORS } from "@/data/regions";
import { ACHIEVEMENTS } from "@/data/achievements";
import { LevelBadge, XpBar, ProgressRing } from "@/components/game/widgets";
import { getIcon } from "@/components/game/icons";
import { LexicoMascot } from "@/components/game/lexico";
import { resizeImageFile } from "@/lib/image-tools";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { sfx } from "@/services/audio";
import { cn } from "@/lib/utils";
import { formatPlaytime } from "@/lib/format-time";
import {
  Camera,
  Check,
  Image as ImageIcon,
  Lock,
  PenLine,
  Trash2,
  X,
} from "lucide-react";

/** Banners predefinidos: gradientes del propio sistema de temas. */
const BANNER_PRESETS: { id: string; label: string; css: string }[] = [
  { id: "aurora", label: "Aurora", css: "linear-gradient(135deg, oklch(0.55 0.17 285), oklch(0.72 0.13 210) 60%, oklch(0.82 0.13 85))" },
  { id: "coral", label: "Coral", css: "linear-gradient(135deg, oklch(0.6 0.17 25), oklch(0.75 0.13 50) 70%, oklch(0.9 0.08 85))" },
  { id: "miel", label: "Miel", css: "linear-gradient(135deg, oklch(0.7 0.14 70), oklch(0.82 0.13 90) 55%, oklch(0.95 0.05 95))" },
  { id: "lavanda", label: "Lavanda", css: "linear-gradient(135deg, oklch(0.5 0.16 305), oklch(0.7 0.13 280) 65%, oklch(0.88 0.08 320))" },
  { id: "oceano", label: "Océano", css: "linear-gradient(135deg, oklch(0.4 0.11 250), oklch(0.6 0.11 215) 60%, oklch(0.85 0.09 195))" },
  { id: "marea", label: "Marea", css: "linear-gradient(135deg, oklch(0.45 0.1 160), oklch(0.62 0.12 200) 55%, oklch(0.85 0.1 85))" },
  { id: "biblioteca", label: "Biblioteca", css: "linear-gradient(135deg, oklch(0.35 0.07 60), oklch(0.5 0.09 40) 55%, oklch(0.82 0.12 85))" },
  { id: "observatorio", label: "Observatorio", css: "linear-gradient(160deg, oklch(0.25 0.05 285), oklch(0.45 0.12 290) 60%, oklch(0.85 0.13 85))" },
];

/** Nivel de insignia según recompensa: bronce / plata / oro / platino. */
function badgeTier(xpReward: number): { label: string; from: string; to: string } {
  if (xpReward >= 150) return { label: "Platino", from: "oklch(0.85 0.06 240)", to: "oklch(0.95 0.03 240)" };
  if (xpReward >= 100) return { label: "Oro", from: "oklch(0.75 0.15 85)", to: "oklch(0.88 0.12 95)" };
  if (xpReward >= 50) return { label: "Plata", from: "oklch(0.62 0.05 250)", to: "oklch(0.82 0.03 250)" };
  return { label: "Bronce", from: "oklch(0.55 0.09 55)", to: "oklch(0.72 0.09 65)" };
}

export function ProfileScreen() {
  const { profile, core, srs, updateProfile, resetAll, resetProgress, resetSrs, exportJson, importJson } = useGameStore();
  const navigate = useUiStore((s) => s.navigate);
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [nameDraft, setNameDraft] = useState(profile.name);
  const [bioDraft, setBioDraft] = useState(profile.bio);
  const photoRef = useRef<HTMLInputElement>(null);
  const bannerRef = useRef<HTMLInputElement>(null);
  const importRef = useRef<HTMLInputElement>(null);
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
    sfx.pop();
    toast({ title: "Perfil actualizado", description: "La bitácora ya luce tus cambios." });
  };

  const doExport = () => {
    const json = exportJson();
    if (!json) return;
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `verbalia-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Copia exportada", description: "Archivo JSON descargado con todo tu progreso." });
  };

  const doImport = async (file: File) => {
    const text = await file.text();
    const ok = await importJson(text);
    toast({
      title: ok ? "Copia restaurada" : "Archivo no válido",
      description: ok
        ? "Tu progreso importado se ha cargado."
        : "No hemos podido leer esa copia. Comprueba que es una exportación de VerbalIA.",
      variant: ok ? undefined : "destructive",
    });
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

  const bannerCss = (() => {
    if (profile.banner.startsWith("data:")) return undefined;
    const preset = BANNER_PRESETS.find((b) => b.id === profile.banner.replace("preset:", "")) ?? BANNER_PRESETS[0];
    return { background: preset.css };
  })();
  const isCustomBanner = profile.banner.startsWith("data:");

  const memberSince = new Date(profile.createdAt).toLocaleDateString("es-ES", {
    month: "long",
    year: "numeric",
  });

  const allSkills = ["vocabulario", "gramatica", "ortografia", "lectura", "audicion", "expresion", "cultura"] as const;

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
            aria-label={isCustomBanner ? "Banner personalizado" : `Banner ${profile.banner.replace("preset:", "")}`}
          >
            {isCustomBanner && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.banner} alt="" className="h-full w-full object-cover" />
            )}
            <span className="anim-twinkle absolute right-3 top-3 text-xl opacity-70" aria-hidden>✦</span>
            <button
              onClick={() => { sfx.tap(); setBannerPicker(!bannerPicker); }}
              className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-1.5 text-[11px] font-bold text-white backdrop-blur transition hover:bg-black/55"
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
                    aria-pressed={profile.banner === `preset:${b.id}`}
                    className={cn(
                      "h-10 rounded-xl border-2 transition hover:scale-[1.03]",
                      profile.banner === `preset:${b.id}` ? "border-primary" : "border-transparent",
                    )}
                    style={{ background: b.css }}
                  />
                ))}
              </div>
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

          {/* Identidad sobre el banner */}
          <div className="relative -mt-12 flex items-end gap-3 px-4 pb-4">
            <div className="relative shrink-0">
              <span
                className="block h-24 w-24 overflow-hidden rounded-3xl border-4 bg-card shadow-lg"
                style={{ borderColor: "color-mix(in oklch, var(--primary) 35%, var(--card))" }}
              >
                {profile.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.photo} alt={`Foto de ${profile.name}`} className="h-full w-full object-cover" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center">
                    <LexicoMascot size={92} mood="happy" />
                  </span>
                )}
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

        {/* ===== Insignias por niveles ===== */}
        <section className="mt-6" aria-labelledby="badges-title">
          <h3 id="badges-title" className="font-display text-lg font-bold">
            Insignias: {unlockedCount} / {ACHIEVEMENTS.length}
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Bronce, plata, oro y platino según la talla del logro.
          </p>
          <div className="mt-3 grid grid-cols-4 gap-2.5 sm:grid-cols-6">
            {ACHIEVEMENTS.map((a) => {
              const got = Boolean(core.achievements[a.id]);
              const tier = badgeTier(a.xpReward);
              const Icon = getIcon(a.icon);
              return (
                <div
                  key={a.id}
                  title={`${a.name}: ${a.description}`}
                  className={cn(
                    "group relative flex aspect-square items-center justify-center rounded-2xl border p-1.5 transition",
                    got ? "border-border" : "border-border/60 bg-muted/40",
                  )}
                  style={
                    got
                      ? {
                          background: `linear-gradient(150deg, color-mix(in oklch, ${tier.from} 32%, var(--card)), var(--card))`,
                          boxShadow: `inset 0 0 0 1.5px color-mix(in oklch, ${tier.from} 55%, transparent)`,
                        }
                      : undefined
                  }
                >
                  {got ? (
                    <span
                      className="flex h-9 w-9 items-center justify-center rounded-xl shadow-inner"
                      style={{ background: `linear-gradient(140deg, ${tier.from}, ${tier.to})`, color: "oklch(0.25 0.03 260)" }}
                    >
                      <Icon className="h-4.5 w-4.5" aria-hidden />
                    </span>
                  ) : (
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-muted-foreground/60">
                      <Lock className="h-4 w-4" aria-hidden />
                    </span>
                  )}
                  <span className="sr-only">{a.name}</span>
                </div>
              );
            })}
          </div>
          <Button variant="link" className="mt-1.5 h-auto p-0 text-xs font-bold" onClick={() => { sfx.click(); navigate({ name: "missions" }); }}>
            Ver misiones y logros →
          </Button>
        </section>

        {/* ===== Tus datos (gestión completa) ===== */}
        <section className="mt-6" aria-labelledby="data-title">
          <h3 id="data-title" className="font-display text-lg font-bold">Tus datos</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Todo vive en este dispositivo (IndexedDB). Sin cuentas, sin rastreadores.
            Para migrar a otro aparato: exporta aquí, importa allí.
          </p>
          <div className="mt-3 flex flex-wrap gap-2.5">
            <Button variant="outline" onClick={() => { sfx.page(); doExport(); }}>
              Exportar copia
            </Button>
            <Button variant="outline" onClick={() => importRef.current?.click()}>
              Importar copia
            </Button>
            <input
              ref={importRef}
              type="file"
              accept="application/json"
              className="hidden"
              aria-hidden
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void doImport(f);
                e.target.value = "";
              }}
            />
            <Button variant="outline" onClick={() => { sfx.click(); navigate({ name: "settings" }); }}>
              Más opciones de datos →
            </Button>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="mt-2.5 w-full font-bold sm:w-auto">
                <Trash2 className="mr-2 h-4 w-4" aria-hidden /> Borrar todo
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Borrar todos tus datos?</AlertDialogTitle>
                <AlertDialogDescription>
                  Se eliminarán perfil, XP, niveles, palabras, logros e historial de este dispositivo.
                  Esta acción no se puede deshacer (a menos que tengas una copia exportada).
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Conservar mis datos</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() => {
                    sfx.error();
                    void resetAll();
                    navigate({ name: "welcome" });
                  }}
                >
                  Borrar todo
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </section>

        <Button variant="outline" className="mt-4 w-full font-bold" onClick={() => { sfx.click(); navigate({ name: "settings" }); }}>
          Ajustes de temas, sonido y datos →
        </Button>
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
