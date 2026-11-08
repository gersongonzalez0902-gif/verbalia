"use client";

/**
 * Misiones y logros · Diarias con reinicio a medianoche, semanales con
 * escudo de racha, y galería completa de logros con progreso.
 *
 * Mega-8: las recompensas NO se reclaman solas. Las misiones y logros
 * completados quedan «listos para recoger» y es el jugador quien pulsa
 * el botón (con su fanfarria y su confeti) desde este apartado.
 */

import { useEffect, useMemo, useState } from "react";
import { useGameStore } from "@/store/game-store";
import { ScreenHeader } from "@/components/game/app-shell";
import { dailyProgress, weeklyProgress, daysOfWeek, weekKey, dateKey, type MissionProgress } from "@/engine/missions";
import { ACHIEVEMENTS, ACHIEVEMENTS_BY_ID, LEVEL_ACHIEVEMENTS } from "@/data/achievements";
import { ICONS } from "@/components/game/icons";
import { Sparkles } from "lucide-react";
import { useSoundEffects } from "@/components/game/game-shell";
import { Confetti } from "@/components/game/widgets";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { sfx } from "@/services/audio";
import { CalendarCheck, Droplets, Gift, ListChecks, Shield, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

export function MissionsScreen() {
  const core = useGameStore((s) => s.core);
  const claimMission = useGameStore((s) => s.claimMission);
  const claimAchievement = useGameStore((s) => s.claimAchievement);
  const [tab, setTab] = useState("misiones");
  const sounds = useSoundEffects();
  const [celebrate, setCelebrate] = useState(false);
  const [justClaimed, setJustClaimed] = useState<string | null>(null);

  // Cuenta atrás para el reinicio diario.
  const [countdown, setCountdown] = useState("");
  useEffect(() => {
    const update = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight.getTime() - now.getTime();
      const h = Math.floor(diff / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      setCountdown(`${h} h ${m} min`);
    };
    update();
    const t = setInterval(update, 30_000);
    return () => clearInterval(t);
  }, []);

  const now = new Date();
  const today = dateKey(now);
  const wKey = weekKey(now);
  const weekDays = daysOfWeek(now);

  const weekKeyJoined = weekDays.join();
  const daily = useMemo(() => dailyProgress(core, today), [core, today]);
  const weekly = useMemo(() => weeklyProgress(core, wKey, weekDays), [core, wKey, weekKeyJoined]);

  const readyDaily = daily.filter((m) => m.done && !m.claimed);
  const readyWeekly = weekly.filter((m) => m.done && !m.claimed);

  /** Logros desbloqueados cuya recompensa sigue por recoger. */
  const unclaimedAchievements = useMemo(
    () =>
      Object.keys(core.achievements)
        .filter((id) => !(core.achievementsClaimed ?? []).includes(id))
        .map((id) => ACHIEVEMENTS_BY_ID[id])
        .filter(Boolean),
    [core.achievements, core.achievementsClaimed],
  );

  const unlockedAchievements = Object.keys(core.achievements);
  const totalReady = readyDaily.length + readyWeekly.length + unclaimedAchievements.length;

  const doClaimMission = (scope: "daily" | "weekly", id: string) => {
    const res = claimMission(scope, id);
    if (res.ok) {
      sfx.claim();
      sounds.achievement();
      setCelebrate(true);
      setJustClaimed(id);
      window.setTimeout(() => { setCelebrate(false); setJustClaimed(null); }, 2600);
    } else {
      sfx.error();
    }
  };

  const doClaimAchievement = (id: string) => {
    const res = claimAchievement(id);
    if (res.ok) {
      sfx.claim();
      sounds.achievement();
      setCelebrate(true);
      setJustClaimed(id);
      window.setTimeout(() => { setCelebrate(false); setJustClaimed(null); }, 2600);
    } else {
      sfx.error();
    }
  };

  const claimAll = () => {
    let any = false;
    for (const m of readyDaily) { if (claimMission("daily", m.mission.id).ok) any = true; }
    for (const m of readyWeekly) { if (claimMission("weekly", m.mission.id).ok) any = true; }
    for (const a of unclaimedAchievements) { if (claimAchievement(a.id).ok) any = true; }
    if (any) {
      sfx.claim();
      sounds.achievement();
      setCelebrate(true);
      window.setTimeout(() => setCelebrate(false), 2600);
    }
  };

  return (
    <div>
      {celebrate && <Confetti pieces={32} />}
      <ScreenHeader title="Misiones y logros" backTo={{ name: "home" }} />

      <main className="mx-auto w-full max-w-2xl px-4 pb-28">
        {/* Aviso de recompensas esperando: el centro de recogida */}
        {totalReady > 0 && (
          <section
            aria-live="polite"
            className="card-aurora anim-pop mt-4 overflow-hidden rounded-3xl border border-primary/40 bg-card p-4"
          >
            <div className="flex flex-wrap items-center gap-3">
              <span className="gloss anim-bob flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-primary-foreground" style={{ background: "linear-gradient(150deg, color-mix(in oklch, var(--primary) 78%, white 18%), var(--primary))" }} aria-hidden>
                <Gift className="h-6 w-6" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display text-base font-bold leading-tight">
                  {totalReady} {totalReady === 1 ? "recompensa lista" : "recompensas listas"}
                </p>
                <p className="text-xs leading-snug text-muted-foreground">
                  {readyDaily.length + readyWeekly.length > 0 && `${readyDaily.length + readyWeekly.length} misión(es) · `}
                  {unclaimedAchievements.length} logro(s). Recógelas aquí.
                </p>
              </div>
              <Button className="shrink-0 font-bold" onClick={claimAll}>
                <Gift className="mr-1.5 h-4 w-4" aria-hidden /> Recoger todo
              </Button>
            </div>
          </section>
        )}

        <Tabs value={tab} onValueChange={(v) => { sfx.tap(); setTab(v); }} className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="misiones" className="font-bold">
              <ListChecks className="mr-1.5 h-4 w-4" aria-hidden /> Misiones
            </TabsTrigger>
            <TabsTrigger value="logros" className="font-bold">
              <Trophy className="mr-1.5 h-4 w-4" aria-hidden /> Logros
              {unclaimedAchievements.length > 0 && (
                <span className="numeric ml-1.5 rounded-full bg-primary px-1.5 text-[10px] font-black text-primary-foreground">
                  {unclaimedAchievements.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* ===== Misiones ===== */}
          <TabsContent value="misiones" className="mt-4 space-y-6">
            <section aria-labelledby="daily-title">
              <div className="mb-2.5 flex items-center justify-between">
                <h2 id="daily-title" className="font-display text-lg font-bold">
                  Diarias
                </h2>
                <p className="text-xs font-semibold text-muted-foreground">
                  Se renuevan en {countdown}
                </p>
              </div>
              <div className="stagger space-y-2.5">
                {daily.map((m) => (
                  <MissionRow
                    key={m.mission.id}
                    progress={m}
                    justClaimed={justClaimed === m.mission.id}
                    onClaim={() => doClaimMission("daily", m.mission.id)}
                  />
                ))}
              </div>
            </section>

            <section aria-labelledby="weekly-title">
              <div className="mb-2.5 flex items-center justify-between">
                <h2 id="weekly-title" className="font-display text-lg font-bold">
                  Semanales
                </h2>
                <p className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                  <CalendarCheck className="h-3.5 w-3.5" aria-hidden />
                  Lunes a domingo
                </p>
              </div>
              <div className="stagger space-y-2.5">
                {weekly.map((m) => (
                  <MissionRow
                    key={m.mission.id}
                    progress={m}
                    justClaimed={justClaimed === m.mission.id}
                    onClaim={() => doClaimMission("weekly", m.mission.id)}
                  />
                ))}
              </div>
              <div className="mt-3 flex items-center gap-3 rounded-2xl border border-primary/25 bg-primary/5 px-4 py-3 text-xs leading-relaxed text-foreground">
                <Shield className="anim-bob h-5 w-5 shrink-0 text-primary" aria-hidden />
                <p>
                  <strong>Escudos de racha:</strong> tienes <strong>{core.streak.shields}</strong> de 3. Si un día no
                  puedes jugar, un escudo mantiene tu racha viva. Se ganan con la misión semanal o en el Bazar.
                </p>
              </div>
            </section>
          </TabsContent>

          {/* ===== Logros ===== */}
          <TabsContent value="logros" className="mt-4">
            <p className="mb-3 text-sm text-muted-foreground">
              {unlockedAchievements.length} de {ACHIEVEMENTS.length} desbloqueados
              {unclaimedAchievements.length > 0 && (
                <span className="font-bold text-primary"> · {unclaimedAchievements.length} sin recoger</span>
              )}
            </p>
            <ul className="stagger grid gap-2.5 sm:grid-cols-2" aria-label="Lista de logros">
              {ACHIEVEMENTS.map((a) => {
                const got = Boolean(core.achievements[a.id]);
                const claimed = got && (core.achievementsClaimed ?? []).includes(a.id);
                const canClaim = got && !claimed;
                const Icon = ICONS[a.icon] ?? Sparkles;
                const prog = Math.min(1, a.progress ? a.progress(core, { masteredWords: 0, learnedWords: 0, now: Date.now() }) : got ? 1 : 0);
                return (
                  <li
                    key={a.id}
                    className={cn(
                      "card-aurora flex items-start gap-3 rounded-2xl border p-3.5",
                      got ? "border-[var(--xp)]/50 bg-[var(--xp)]/5" : "border-border bg-card",
                    )}
                  >
                    <span
                      className={cn(
                        "gloss flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
                        got ? "anim-bob" : "bg-muted text-muted-foreground/60 grayscale",
                      )}
                      style={got
                        ? {
                            background: "linear-gradient(150deg, color-mix(in oklch, var(--xp) 72%, white 22%), var(--xp) 58%, color-mix(in oklch, var(--xp) 78%, #000 18%))",
                            color: "white",
                            boxShadow: "0 3px 0 0 color-mix(in oklch, var(--xp) 52%, #000 30%), inset 0 1px 0 oklch(1 0 0 / 30%)",
                          }
                        : undefined}
                    >
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className={cn("text-sm font-bold leading-snug", !got && "text-muted-foreground")}>
                        {a.name}
                      </p>
                      <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{a.description}</p>
                      {!got && prog > 0 && (
                        <div className="groove mt-2 h-1.5 overflow-hidden rounded-full">
                          <div className="h-full rounded-full bg-primary/70" style={{ width: `${prog * 100}%` }} />
                        </div>
                      )}
                      {got && canClaim && (
                        <Button
                          size="sm"
                          className="anim-pop mt-2 h-8 w-full font-bold"
                          onClick={() => doClaimAchievement(a.id)}
                        >
                          <Gift className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                          Recoger +{a.xpReward} XP{a.tintaReward ? ` · +${a.tintaReward} tinta` : ""}
                        </Button>
                      )}
                      {claimed && (
                        <p className="mt-1 text-[11px] font-bold uppercase tracking-wide text-[var(--xp)]">
                          Recompensa recogida
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function MissionRow({
  progress,
  justClaimed,
  onClaim,
}: {
  progress: MissionProgress;
  justClaimed: boolean;
  onClaim: () => void;
}) {
  const { mission: m, current, target, done, claimed } = progress;
  const pct = Math.min(1, current / target);
  const Icon = ICONS[m.icon] ?? Sparkles;
  return (
    <div
      className={cn(
        "card-aurora rounded-2xl border bg-card p-4 transition",
        done && claimed && "border-primary/60 bg-primary/5",
        done && !claimed && "border-primary/70 shadow-[0_0_0_2px_color-mix(in_oklch,var(--primary)_25%,transparent)]",
        progress.isShieldMission && !claimed && "border-primary/40",
      )}
    >
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "gloss flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
            done ? "chip-icon" : "bg-secondary text-secondary-foreground",
          )}
        >
          <Icon className="h-5 w-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold leading-snug">{m.title}</p>
          <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">{m.description}</p>
        </div>
        <span
          className={cn(
            "numeric shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold",
            claimed ? "gloss bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
          )}
        >
          {claimed ? "✓ recogida" : `+${m.xpReward} XP`}
        </span>
      </div>
      <div className="mt-3 flex items-center gap-2.5">
        <div className="groove h-2 flex-1 overflow-hidden rounded-full">
          <div
            className="h-full rounded-full transition-[width] duration-500"
            style={{
              width: `${pct * 100}%`,
              background: done
                ? "var(--primary)"
                : "linear-gradient(180deg, color-mix(in oklch, var(--xp) 78%, white 20%), var(--xp) 60%)",
            }}
          />
        </div>
        <span className="numeric text-xs font-bold text-muted-foreground">
          {done ? "completada" : `${current}/${target}`}
        </span>
      </div>
      {done && !claimed && (
        <Button className="anim-pop mt-3 h-9 w-full font-bold" onClick={onClaim} aria-live="polite">
          <Gift className="mr-1.5 h-4 w-4" aria-hidden />
          {justClaimed ? "¡Recogida!" : `Recoger recompensa${m.shieldReward ? " + escudo" : ""}`}
          {m.tintaReward ? <><Droplets className="ml-1.5 h-3.5 w-3.5" aria-hidden /> +{m.tintaReward}</> : null}
        </Button>
      )}
    </div>
  );
}
