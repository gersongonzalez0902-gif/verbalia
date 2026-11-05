"use client";

/**
 * Misiones y logros · Diarias con reinicio a medianoche, semanales con
 * escudo de racha, y galería completa de logros con progreso.
 */

import { useEffect, useState } from "react";
import { useGameStore } from "@/store/game-store";
import { ScreenHeader } from "@/components/game/app-shell";
import { dailyProgress, weeklyProgress, daysOfWeek, weekKey, dateKey } from "@/engine/missions";
import { ACHIEVEMENTS } from "@/data/achievements";
import { getIcon } from "@/components/game/icons";
import { useSoundEffects } from "@/components/game/game-shell";
import { Confetti } from "@/components/game/widgets";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { sfx } from "@/services/audio";
import { CalendarCheck, ListChecks, Shield, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

export function MissionsScreen() {
  const core = useGameStore((s) => s.core);
  const [tab, setTab] = useState("misiones");
  const [, setTick] = useState(0);
  const sounds = useSoundEffects();
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

  const daily = dailyProgress(core, today);
  const weekly = weeklyProgress(core, wKey, weekDays);
  const unlockedAchievements = Object.keys(core.achievements);

  // Detecta reclamos nuevos desde la última visita a la pantalla (efecto ligero).
  useEffect(() => {
    const claimed = daily.find((d) => d.done && d.claimed);
    if (claimed && !justClaimed) {
      setJustClaimed(claimed.mission.id);
      sounds.achievement();
      const t = setTimeout(() => setJustClaimed(null), 3500);
      return () => clearTimeout(t);
    }
  }, [core.missions.daily.claimed.length]);

  return (
    <div>
      {justClaimed && <Confetti pieces={24} />}
      <ScreenHeader title="Misiones y logros" backTo={{ name: "home" }} />

      <main className="mx-auto w-full max-w-2xl px-4 pb-10">
        <Tabs value={tab} onValueChange={(v) => { sfx.tap(); setTab(v); }} className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="misiones" className="font-bold">
              <ListChecks className="mr-1.5 h-4 w-4" aria-hidden /> Misiones
            </TabsTrigger>
            <TabsTrigger value="logros" className="font-bold">
              <Trophy className="mr-1.5 h-4 w-4" aria-hidden /> Logros
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
                {daily.map((m) => {
                  const Icon = getIcon(m.mission.icon);
                  return (
                    <MissionRow
                      key={m.mission.id}
                      icon={<Icon className="h-5 w-5" aria-hidden />}
                      title={m.mission.title}
                      description={m.mission.description}
                      current={m.current}
                      target={m.target}
                      done={m.done}
                      claimed={m.claimed}
                      reward={`${m.mission.xpReward} XP`}
                    />
                  );
                })}
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
                {weekly.map((m) => {
                  const Icon = getIcon(m.mission.icon);
                  return (
                    <MissionRow
                      key={m.mission.id}
                      icon={<Icon className="h-5 w-5" aria-hidden />}
                      title={m.mission.title}
                      description={m.mission.description}
                      current={m.current}
                      target={m.target}
                      done={m.done}
                      claimed={m.claimed}
                      reward={m.mission.shieldReward ? "Escudo + XP" : `${m.mission.xpReward} XP`}
                      highlight={m.isShieldMission}
                    />
                  );
                })}
              </div>
              <div className="mt-3 flex items-center gap-3 rounded-2xl border border-primary/25 bg-primary/5 px-4 py-3 text-xs leading-relaxed text-foreground">
                <Shield className="anim-bob h-5 w-5 shrink-0 text-primary" aria-hidden />
                <p>
                  <strong>Escudos de racha:</strong> tienes <strong>{core.streak.shields}</strong> de 2. Si un día no
                  puedes jugar, un escudo mantiene tu racha viva. Se ganan con la misión semanal.
                </p>
              </div>
            </section>
          </TabsContent>

          {/* ===== Logros ===== */}
          <TabsContent value="logros" className="mt-4">
            <p className="mb-3 text-sm text-muted-foreground">
              {unlockedAchievements.length} de {ACHIEVEMENTS.length} desbloqueados
            </p>
            <ul className="stagger grid gap-2.5 sm:grid-cols-2" aria-label="Lista de logros">
              {ACHIEVEMENTS.map((a) => {
                const got = Boolean(core.achievements[a.id]);
                const Icon = getIcon(a.icon);
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
                      {got && (
                        <p className="mt-1 text-[11px] font-bold uppercase tracking-wide text-[var(--xp)]">
                          Conseguido · +{a.xpReward} XP
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
  icon,
  title,
  description,
  current,
  target,
  done,
  claimed,
  reward,
  highlight = false,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  current: number;
  target: number;
  done: boolean;
  claimed: boolean;
  reward: string;
  highlight?: boolean;
}) {
  const pct = Math.min(1, current / target);
  return (
    <div
      className={cn(
        "card-aurora rounded-2xl border bg-card p-4",
        done && claimed && "border-primary/60 bg-primary/5",
        highlight && !claimed && "border-primary/40",
      )}
    >
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "gloss flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
            done ? "chip-icon" : "bg-secondary text-secondary-foreground",
          )}
        >
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold leading-snug">{title}</p>
          <p className="truncate text-xs text-muted-foreground">{description}</p>
        </div>
        <span
          className={cn(
            "numeric shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold",
            claimed ? "gloss bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
          )}
        >
          {claimed ? "✓ reclamada" : reward}
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
    </div>
  );
}
