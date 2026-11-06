"use client";

/**
 * Mapa del Archipiélago · Escena SVG con islas posicionadas como botones
 * accesibles + lista alternativa para lectores de pantalla. Al tocar una
 * isla se abre la ficha de región (misión, juegos y estadísticas).
 */

import { useMemo, useState } from "react";
import { createElement } from "react";
import { useGameStore } from "@/store/game-store";
import { useUiStore } from "@/store/ui-store";
import { sfx } from "@/services/audio";
import { REGIONS, REGION_BY_ID, SKILL_LABELS } from "@/data/regions";
import { GAMES } from "@/data/games";
import { levelProgress } from "@/engine/xp";
import { getIcon } from "@/components/game/icons";
import { ScreenHeader } from "@/components/game/app-shell";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { ProgressRing } from "@/components/game/widgets";
import { cn } from "@/lib/utils";
import { Lock, Play, Sparkles } from "lucide-react";
import type { GameId, RegionId } from "@/types";

export function MapScreen() {
  const core = useGameStore((s) => s.core);
  const navigate = useUiStore((s) => s.navigate);
  const [openRegion, setOpenRegion] = useState<RegionId | null>(null);
  const { level } = levelProgress(core.xp);

  const regionProgress = (regionId: RegionId) => {
    const region = REGION_BY_ID[regionId];
    const days = Object.keys(core.stats.sessionsByDay);
    const played = days.filter((d) => (core.stats.regionsByDay[d] ?? []).includes(regionId)).length;
    // Progreso relativo: sesiones jugadas de esa región sobre 10 (sensación de avance).
    return { played, pct: Math.min(1, played / 10) };
  };

  const regionAccuracy = (regionId: RegionId) => {
    const region = REGION_BY_ID[regionId];
    let answers = 0;
    let correct = 0;
    for (const g of region.games) {
      const s = core.stats.byGame[g];
      if (s) {
        answers += s.answers;
        correct += s.correct;
      }
    }
    return answers > 0 ? Math.round((correct / answers) * 100) : null;
  };

  return (
    <div>
      <ScreenHeader title="El Archipiélago de las Palabras" subtitle="Ocho regiones, ocho caminos" backTo={{ name: "home" }} />

      <main className="mx-auto w-full max-w-4xl px-4 pb-28">
        {/* ===== Escena del mapa ===== */}
        <div
          className="relative mt-4 aspect-[4/3] w-full overflow-hidden rounded-3xl border-2 border-primary/20 shadow-md sm:aspect-[16/10]"
          role="img"
          aria-label="Mapa del Archipiélago de las Palabras con ocho regiones"
        >
          <IslandScene />

          {/* Botones-isla superpuestos (accesibles y táctiles) */}
          {REGIONS.map((r, index) => {
            const shipped = r.games.length > 0;
            const unlocked = shipped && level >= r.unlockLevel;
            const prog = regionProgress(r.id);
            const Icon = getIcon(r.icon);
            return (
              <button
                key={r.id}
                onClick={() => { if (unlocked) { sfx.buoy(); setOpenRegion(r.id); } }}
                disabled={!unlocked}
                aria-label={`${r.name}. ${unlocked ? `${prog.played} sesiones jugadas. Tocar para abrir la región.` : shipped ? `Se desbloquea al alcanzar el nivel ${r.unlockLevel}.` : `Región en desarrollo: llegará en la Etapa ${r.stage}.`}`}
                className={cn(
                  "group absolute z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 rounded-2xl p-2 transition-all duration-200",
                  unlocked ? "hover:scale-110 focus-visible:scale-110 focus-visible:outline-2 focus-visible:outline-primary" : "cursor-default",
                )}
                style={{ left: `${r.map.x}%`, top: `${r.map.y}%` }}
              >
                {/* Halo regional tras la isla desbloqueada */}
                {unlocked && (
                  <span
                    aria-hidden
                    className="anim-glow absolute left-1/2 top-1/2 -z-10 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full"
                    style={{ background: `color-mix(in oklch, var(${r.colorVar}) 32%, transparent)`, filter: "blur(18px)" }}
                  />
                )}
                <span
                  className={cn(
                    "gloss anim-bob relative flex h-14 w-14 items-center justify-center rounded-full border-4 text-white sm:h-16 sm:w-16",
                    unlocked ? "border-white/90" : "border-white/60 grayscale",
                  )}
                  style={{
                    background: `linear-gradient(150deg, color-mix(in oklch, var(${r.colorVar}) 74%, white 18%), var(${r.colorVar}) 55%, color-mix(in oklch, var(${r.colorVar}) 80%, #000 18%))`,
                    boxShadow: unlocked
                      ? `0 4px 0 0 color-mix(in oklch, var(${r.colorVar}) 50%, #000 30%), 0 8px 16px -8px color-mix(in oklch, var(${r.colorVar}) 55%, transparent)`
                      : undefined,
                    animationDelay: `${index * 0.7}s`,
                  }}
                >
                  <Icon className="h-6 w-6 sm:h-7 sm:w-7" aria-hidden />
                  {!unlocked && (
                    <span className="absolute -bottom-1.5 -right-2 flex items-center gap-0.5 rounded-full bg-card px-1 py-0.5 text-[9px] font-black shadow" aria-hidden>
                      <Lock className="h-3 w-3" />
                      <span className="numeric text-foreground">{r.unlockLevel}</span>
                    </span>
                  )}
                </span>
                <span
                  className={cn(
                    "font-display max-w-28 rounded-full px-2 py-0.5 text-center text-[10px] font-bold leading-tight shadow-sm sm:text-xs",
                    unlocked ? "bg-card text-foreground" : "bg-muted text-muted-foreground",
                  )}
                >
                  {r.name.replace(" de la ", " · ").replace(" del ", " · ")}
                </span>
              </button>
            );
          })}

          {/* Brújula decorativa */}
          <div className="pointer-events-none absolute right-4 top-4 flex h-12 w-12 items-center justify-center rounded-full border-2 border-foreground/15 bg-card/70 backdrop-blur-sm" aria-hidden>
            <span className="text-lg">🧭</span>
          </div>
        </div>

        {/* ===== Leyenda de estados ===== */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-primary" aria-hidden /> Ocho islas jugables
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full" style={{ background: "var(--region-forja)" }} aria-hidden /> Etapa 4 · la Forja del Escritor
          </span>
          <span className="flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5" aria-hidden /> Sube de nivel para desbloquear
          </span>
        </div>

        {/* ===== Lista accesible de regiones ===== */}
        <section className="mt-6" aria-label="Lista de regiones">
          <h2 className="font-display mb-2.5 text-lg font-bold">Vista de lista</h2>
          <ul className="grid gap-2.5 sm:grid-cols-2">
            {REGIONS.map((r) => {
              const shipped = r.games.length > 0;
              const unlocked = shipped && level >= r.unlockLevel;
              const prog = regionProgress(r.id);
              const Icon = getIcon(r.icon);
              return (
                <li key={r.id}>
                  <button
                    onClick={() => { sfx.buoy(); setOpenRegion(r.id); }}
                    disabled={!unlocked}
                    className={cn(
                      "tap-3d flex w-full items-center gap-3.5 rounded-2xl border bg-card p-4 text-left",
                      unlocked ? "hover:border-primary/40" : "cursor-default opacity-60",
                    )}
                  >
                    <span
                      className={cn("gloss flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white", !unlocked && "grayscale")}
                      style={{
                        background: `linear-gradient(150deg, color-mix(in oklch, var(${r.colorVar}) 76%, white 18%), var(${r.colorVar}) 58%, color-mix(in oklch, var(${r.colorVar}) 82%, #000 16%))`,
                        boxShadow: `0 3px 0 0 color-mix(in oklch, var(${r.colorVar}) 52%, #000 30%)`,
                      }}
                      aria-hidden
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold">{r.name}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {unlocked
                          ? `${prog.played} sesiones · disponible`
                          : !shipped
                            ? `Llega en la Etapa ${r.stage}`
                            : `Nivel ${r.unlockLevel} necesario`}
                      </span>
                    </span>
                    {unlocked && <Sparkles className="h-4 w-4 shrink-0 text-primary" aria-hidden />}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      </main>

      {/* ===== Ficha de región ===== */}
      <RegionSheet
        regionId={openRegion}
        onClose={() => setOpenRegion(null)}
        onPlayMissions={(rid) => {
          setOpenRegion(null);
          navigate({ name: "game", gameId: "trivia", mode: "mission", regionId: rid });
        }}
        onTrainGame={(gid) => {
          setOpenRegion(null);
          navigate({ name: "game", gameId: gid, mode: "training" });
        }}
        progressOf={regionProgress}
        accuracyOf={regionAccuracy}
      />
    </div>
  );
}

/* ============ Ficha de región (hoja lateral) ============ */

function RegionSheet({
  regionId,
  onClose,
  onPlayMissions,
  onTrainGame,
  progressOf,
  accuracyOf,
}: {
  regionId: RegionId | null;
  onClose: () => void;
  onPlayMissions: (regionId: RegionId) => void;
  onTrainGame: (gameId: GameId) => void;
  progressOf: (regionId: RegionId) => { played: number; pct: number };
  accuracyOf: (regionId: RegionId) => number | null;
}) {
  const region = regionId ? REGION_BY_ID[regionId] : null;
  const byGame = useGameStore((s) => s.core.stats.byGame);
  if (!region) return null;
  const prog = progressOf(region.id);
  const accuracy = accuracyOf(region.id);
  const skillLabel = SKILL_LABELS[region.skill] ?? region.skill;

  return (
    <Sheet open={regionId !== null} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="bottom" className="safe-bottom max-h-[85dvh] overflow-y-auto rounded-t-3xl sm:max-w-lg sm:mx-auto sm:rounded-3xl sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2">
        <SheetHeader className="pb-0 text-left">
          <div className="flex items-center gap-3.5">
            <span
              className="gloss flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl p-3 text-white"
              style={{
                background: `linear-gradient(150deg, color-mix(in oklch, var(${region.colorVar}) 76%, white 18%), var(${region.colorVar}) 58%, color-mix(in oklch, var(${region.colorVar}) 82%, #000 16%))`,
                boxShadow: `0 3px 0 0 color-mix(in oklch, var(${region.colorVar}) 52%, #000 30%)`,
              }}
              aria-hidden
            >
              {createElement(getIcon(region.icon), { className: "h-6 w-6" })}
            </span>
            <div>
              <SheetTitle className="font-display text-xl font-bold leading-tight">{region.name}</SheetTitle>
              <SheetDescription>{region.subtitle}</SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-5 px-4 pb-6 pt-3">
          <p className="text-sm leading-relaxed text-muted-foreground">{region.description}</p>

          <p className="rounded-2xl bg-secondary px-4 py-2.5 text-xs font-semibold text-secondary-foreground">
            Habilidad que entrena: {skillLabel}
          </p>

          <div className="flex items-center gap-4">
            <ProgressRing value={prog.pct} size={86} stroke={8} color={`var(${region.colorVar})`}>
              <span className="numeric font-display text-lg font-bold">{Math.round(prog.pct * 100)}%</span>
            </ProgressRing>
            <div className="text-sm">
              <p className="font-bold">{prog.played} sesiones jugadas</p>
              <p className="text-muted-foreground">
                {accuracy !== null ? `Exactitud media: ${accuracy}%` : "Aún sin datos en esta región"}
              </p>
            </div>
          </div>

          <Button
            size="lg"
            className="w-full text-base"
            style={{
              background: `var(${region.colorVar})`,
              color: "white",
              ["--btn-edge" as string]: `color-mix(in oklch, var(${region.colorVar}) 50%, #000 32%)`,
            }}
            onClick={() => { sfx.whoosh(); onPlayMissions(region.id); }}
          >
            <Play className="mr-2 h-5 w-5" aria-hidden />
            Misión de la región (3-5 min)
          </Button>

          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Entrenamientos
            </p>
            <div className="space-y-2">
              {region.games.map((gid) => {
                const g = GAMES[gid];
                if (!g) return null;
                const Icon = getIcon(g.icon);
                const stats = byGame[gid];
                return (
                  <button
                    key={gid}
                    onClick={() => { sfx.whoosh(); onTrainGame(gid); }}
                    className="tap-3d flex w-full items-center gap-3 rounded-2xl border bg-card p-3.5 text-left"
                  >
                    <span className="chip-icon flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-bold">{g.name}</span>
                      <span className="block truncate text-xs text-muted-foreground">{g.tagline}</span>
                    </span>
                    <span className="shrink-0 text-right text-[11px] text-muted-foreground">
                      {stats ? `${stats.plays} partidas` : "nuevo"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

/* ============ Escena SVG de fondo ============ */

function IslandScene() {
  return (
    <svg
      viewBox="0 0 800 600"
      className="absolute inset-0 h-full w-full"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <defs>
        <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--region-puerto)" stopOpacity="0.22" />
          <stop offset="1" stopColor="var(--region-puerto)" stopOpacity="0.38" />
        </linearGradient>
        <linearGradient id="sand" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--xp)" stopOpacity="0.5" />
          <stop offset="1" stopColor="var(--xp)" stopOpacity="0.25" />
        </linearGradient>
      </defs>

      {/* Mar */}
      <rect width="800" height="600" fill="url(#sea)" />
      {/* Olas decorativas */}
      <g stroke="var(--region-puerto)" strokeOpacity="0.35" strokeWidth="3" fill="none" strokeLinecap="round">
        <path className="wave-line" d="M40 90 q20 -12 40 0 q20 12 40 0" />
        <path className="wave-line" style={{ animationDelay: "1.2s" }} d="M600 120 q18 -10 36 0 q18 10 36 0" />
        <path className="wave-line" style={{ animationDelay: "2s" }} d="M120 520 q22 -12 44 0 q22 12 44 0" />
        <path className="wave-line" style={{ animationDelay: "0.6s" }} d="M640 480 q20 -11 40 0 q20 11 40 0" />
        <path className="wave-line" style={{ animationDelay: "1.8s" }} d="M380 320 q18 -10 36 0 q18 10 36 0" />
        <path className="wave-line" style={{ animationDelay: "2.6s" }} d="M660 330 q18 -10 36 0 q18 10 36 0" />
      </g>

      {/* Islas (formas orgánicas) */}
      {/* Bosque */}
      <g transform="translate(144,156)">
        <path d="M0 60 Q-18 28 8 6 Q34 -14 62 4 Q88 20 78 52 Q68 82 30 84 Q-2 86 0 60 Z" fill="url(#sand)" />
        <path d="M12 58 Q0 34 22 18 Q44 4 66 18 Q84 32 74 54 Q62 74 34 74 Q14 74 12 58 Z" fill="var(--region-bosque)" opacity="0.55" />
        <path d="M28 40 l10 -18 l10 18 Z M44 34 l8 -14 l8 14 Z" fill="var(--region-bosque)" opacity="0.8" />
      </g>
      {/* Ciudad */}
      <g transform="translate(360,84)">
        <path d="M0 40 Q-14 16 10 2 Q34 -10 58 4 Q80 16 72 40 Q64 62 32 62 Q4 62 0 40 Z" fill="url(#sand)" />
        <path d="M14 38 Q4 20 24 10 Q44 0 62 12 Q76 24 68 40 Q58 56 32 56 Q16 56 14 38 Z" fill="var(--region-ciudad)" opacity="0.5" />
        <g fill="var(--region-ciudad)" opacity="0.85">
          <rect x="22" y="18" width="7" height="26" /><rect x="32" y="10" width="8" height="34" />
          <rect x="44" y="22" width="7" height="22" /><rect x="53" y="14" width="6" height="30" />
        </g>
      </g>
      {/* Fortaleza */}
      <g transform="translate(592,144)">
        <path d="M0 56 Q-20 26 6 8 Q32 -8 64 6 Q92 20 84 50 Q76 78 36 80 Q4 80 0 56 Z" fill="url(#sand)" />
        <path d="M14 52 Q2 30 24 18 Q46 8 68 20 Q86 32 78 52 Q68 72 36 72 Q16 72 14 52 Z" fill="var(--region-fortaleza)" opacity="0.45" />
        <path d="M30 54 L30 30 L36 30 L36 24 L42 24 L42 30 L48 30 L48 24 L54 24 L54 30 L60 30 L60 54 Z" fill="var(--region-fortaleza)" opacity="0.9" />
      </g>
      {/* Biblioteca */}
      <g transform="translate(256,330)">
        <path d="M0 50 Q-16 24 8 10 Q32 -4 60 6 Q86 18 80 46 Q74 72 36 74 Q6 74 0 50 Z" fill="url(#sand)" />
        <path d="M12 48 Q2 28 24 18 Q46 8 66 20 Q82 32 74 50 Q64 68 34 68 Q16 68 12 48 Z" fill="var(--region-biblioteca)" opacity="0.45" />
        <g fill="var(--region-biblioteca)" opacity="0.85">
          <rect x="26" y="26" width="30" height="28" rx="2" />
          <rect x="30" y="20" width="22" height="6" rx="2" />
          <g stroke="white" strokeOpacity="0.5" strokeWidth="1.5">
            <path d="M31 30 h20 M31 36 h20 M31 42 h20 M31 48 h20" />
          </g>
        </g>
      </g>
      {/* Puerto */}
      <g transform="translate(504,288)">
        <path d="M0 56 Q-18 28 6 10 Q30 -6 60 4 Q88 18 82 48 Q76 76 38 78 Q6 78 0 56 Z" fill="url(#sand)" />
        <path d="M12 52 Q2 32 22 20 Q44 10 66 22 Q84 34 76 52 Q66 70 34 70 Q14 70 12 52 Z" fill="var(--region-puerto)" opacity="0.4" />
        <g stroke="var(--region-puerto)" strokeWidth="4" strokeLinecap="round" opacity="0.85">
          <path d="M34 40 L44 14" />
        </g>
        <path d="M44 14 Q56 18 58 30 L44 28 Z" fill="var(--region-puerto)" opacity="0.85" />
      </g>
      {/* Torre */}
      <g transform="translate(672,408)">
        <path d="M0 52 Q-16 26 8 10 Q30 -4 56 6 Q80 18 74 46 Q68 72 32 74 Q6 74 0 52 Z" fill="url(#sand)" />
        <path d="M12 48 Q2 30 22 20 Q42 10 62 22 Q78 34 70 50 Q60 66 32 66 Q16 66 12 48 Z" fill="var(--region-torre)" opacity="0.4" />
        <g fill="var(--region-torre)" opacity="0.85">
          <path d="M30 56 L30 26 L40 16 L50 26 L50 56 Z" />
          <path d="M26 26 L40 12 L54 26 Z" opacity="0.6" />
        </g>
      </g>
      {/* Observatorio */}
      <g transform="translate(96,456)">
        <path d="M0 50 Q-16 24 8 10 Q32 -4 60 6 Q86 18 80 46 Q74 72 36 74 Q6 74 0 50 Z" fill="url(#sand)" />
        <path d="M12 46 Q2 26 24 16 Q46 6 66 18 Q82 30 74 48 Q64 66 34 66 Q16 66 12 46 Z" fill="var(--region-observatorio)" opacity="0.35" />
        <g fill="var(--region-observatorio)" opacity="0.85">
          <path d="M22 56 A 24 24 0 0 1 70 56 Z" />
          <rect x="48" y="10" width="4" height="26" rx="2" transform="rotate(24 50 10)" />
        </g>
      </g>
      {/* Forja del Escritor (Etapa 4): isla volcánica con resplandor */}
      <g transform="translate(360,455)">
        <path d="M0 56 Q-20 26 8 6 Q36 -12 68 4 Q94 20 86 52 Q78 80 38 82 Q2 82 0 56 Z" fill="url(#sand)" />
        <path d="M14 52 Q4 30 26 16 Q50 4 70 18 Q88 32 80 52 Q70 72 38 72 Q18 72 14 52 Z" fill="var(--region-forja)" opacity="0.28" />
        {/* Volcán */}
        <path d="M18 66 L36 22 L44 12 L52 22 L70 66 Z" fill="var(--region-forja)" opacity="0.75" />
        {/* Cráter con brasa */}
        <path d="M36 22 L44 12 L52 22 Q44 27 36 22 Z" fill="var(--region-forja)" />
        <circle cx="44" cy="17" r="3.5" fill="var(--xp)" opacity="0.9" className="anim-glow" />
        {/* Chispas ascendiendo */}
        <g fill="var(--xp)" opacity="0.85">
          <circle cx="40" cy="6" r="1.8" className="anim-float" style={{ animationDuration: "5s" }} />
          <circle cx="50" cy="-2" r="1.4" className="anim-float" style={{ animationDuration: "6s", animationDelay: "-2s" }} />
          <circle cx="46" cy="0" r="1.1" className="anim-float" style={{ animationDuration: "7s", animationDelay: "-4s" }} />
        </g>
        {/* Yunque estilizado al pie */}
        <g fill="var(--region-forja)" opacity="0.85">
          <path d="M58 60 h14 v4 h-14 Z" />
          <path d="M62 64 h6 v6 h-6 Z" />
        </g>
      </g>

      {/* Ruta de navegación (línea de puntos que fluye) */}
      <path
        id="route-path"
        d="M150 170 C 220 90, 300 80, 360 110 C 430 145, 520 130, 600 165 C 640 185, 610 230, 540 300 C 480 355, 400 330, 330 370 C 280 400, 300 430, 350 470 C 480 545, 620 520, 690 450"
        className="route-flow"
        stroke="var(--foreground)"
        strokeOpacity="0.28"
        strokeWidth="3"
        strokeDasharray="2 12"
        strokeLinecap="round"
        fill="none"
      />

      {/* Barco de vela que recorre la ruta del Archipiélago */}
      <g opacity="0.9">
        <path
          d="M-7 4 Q0 7 7 4 L5 4 L-5 4 Z M0 4 L0 -6 L6 1 L0 1"
          fill="var(--foreground)"
          fillOpacity="0.55"
          stroke="var(--foreground)"
          strokeOpacity="0.55"
          strokeWidth="0.8"
          strokeLinejoin="round"
        >
          <animateMotion dur="26s" repeatCount="indefinite" rotate="auto">
            <mpath href="#route-path" />
          </animateMotion>
        </path>
      </g>

      {/* Gaviotas perezosas */}
      <g stroke="var(--foreground)" strokeOpacity="0.3" strokeWidth="2.2" fill="none" strokeLinecap="round">
        <path className="anim-float" style={{ animationDuration: "7s" }} d="M620 70 q7 -7 14 0 q7 -7 14 0" />
        <path className="anim-float" style={{ animationDuration: "9s", animationDelay: "-3s" }} d="M100 260 q6 -6 12 0 q6 -6 12 0" />
        <path className="anim-float" style={{ animationDuration: "8s", animationDelay: "-5s" }} d="M480 520 q5 -5 10 0 q5 -5 10 0" />
      </g>

      {/* Sol de tarde con halo suave */}
      <circle cx="706" cy="64" r="26" fill="var(--xp)" opacity="0.16" className="anim-glow" />
      <circle cx="706" cy="64" r="15" fill="var(--xp)" opacity="0.38" />
    </svg>
  );
}
