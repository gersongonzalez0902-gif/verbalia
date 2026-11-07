"use client";

/**
 * El Salón de Juegos Educativos · VERBALIA
 * ----------------------------------------------------------------
 * Un ala del Archipiélago para entrenar la mente: cálculo mental,
 * memoria, lógica, letras veloces y reflejos (21 minijuegos).
 *
 * - Desbloqueo con TINTA (nunca cuesta nivel ni XP: la tinta se gana
 *   jugando y el nivel queda intacto — economía honesta).
 * - Cada partida da XP según la puntuación, con tope diario por juego.
 * - Partida a pantalla completa, resultados con récord y otra ronda.
 */

import { useMemo, useState } from "react";
import { useGameStore } from "@/store/game-store";
import { ScreenHeader } from "@/components/game/app-shell";
import { getIcon } from "@/components/game/icons";
import { setSceneMusic, sfx, stopSceneMusic } from "@/services/audio";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  ARCADE_BY_ID,
  ARCADE_CATEGORY_COLOR,
  ARCADE_CATEGORY_LABEL,
  ARCADE_GAMES,
  arcadeAvailable,
  type ArcadeCategory,
  type ArcadeGameDef,
} from "@/engine/arcade";
import { levelProgress } from "@/engine/xp";
import { MathGame, RomanGame, BinaryGame, DigitMemoryGame, TypingGame, AnagramGame, HangmanGame } from "@/games/arcade/quiz-games";
import {
  LightsOutGame, HanoiGame, SudokuGame, MinesweeperGame,
  SlidingPuzzleGame, TicTacToeGame, Connect4Game,
} from "@/games/arcade/logic-games";
import {
  HighLowGame, SimonGame, MemoryPairsGame, StroopGame,
  ReactionGame, ArrowsDanceGame, WordSecretGame,
} from "@/games/arcade/reflex-games";
import { GameOverPanel, type FinishInfo } from "@/games/arcade/shared";
import { Coins, Droplets, Gamepad2, Lock, Play, Sparkles, Trophy, Zap } from "lucide-react";

const CATEGORY_ORDER: ArcadeCategory[] = ["calculo", "memoria", "logica", "palabras", "reflejos"];

const GAME_COMPONENTS: Record<string, React.ComponentType<{ def: ArcadeGameDef; best: number; onFinish: (score: number, extra?: { subtitle?: string }) => void; onExit: () => void }>> = {
  "mates-relampago": MathGame,
  "numeros-romanos": RomanGame,
  binario: BinaryGame,
  "mayor-menor": HighLowGame,
  "simon-marea": SimonGame,
  "pares-letras": MemoryPairsGame,
  "memoria-digitos": DigitMemoryGame,
  "luces-fuera": LightsOutGame,
  "torres-hanoi": HanoiGame,
  "sudoku-4": SudokuGame,
  buscaminas: MinesweeperGame,
  "puzzle-deslizable": SlidingPuzzleGame,
  "tres-raya": TicTacToeGame,
  "conecta-4": Connect4Game,
  mecanografia: TypingGame,
  anagramas: AnagramGame,
  "palabra-secreta": WordSecretGame,
  "ahorcado-animales": HangmanGame,
  stroop: StroopGame,
  reaccion: ReactionGame,
  "flechas-danza": ArrowsDanceGame,
};

export function ArcadeScreen() {
  const core = useGameStore((s) => s.core);
  const unlockArcade = useGameStore((s) => s.unlockArcade);
  const recordArcadeScore = useGameStore((s) => s.recordArcadeScore);
  const { toast } = useToast();
  const { level } = levelProgress(core.xp);

  const [openId, setOpenId] = useState<string | null>(null);
  const [runKey, setRunKey] = useState(0);
  const [finish, setFinish] = useState<(FinishInfo & { def: ArcadeGameDef }) | null>(null);
  const [confirmBuy, setConfirmBuy] = useState<string | null>(null);

  const def = openId ? ARCADE_BY_ID[openId] : null;
  const GameComp = openId ? GAME_COMPONENTS[openId] : null;

  const stats = useMemo(() => {
    const unlocked = ARCADE_GAMES.filter((g) => arcadeAvailable(core, g.id, level)).length;
    const plays = Object.values(core.arcade.plays).reduce((a, b) => a + b, 0);
    const records = Object.keys(core.arcade.best).length;
    return { unlocked, plays, records, total: ARCADE_GAMES.length };
  }, [core, level]);

  const openGame = (id: string) => {
    sfx.whoosh();
    stopSceneMusic(); // dentro del juego, sin música (como los minijuegos)
    setOpenId(id);
    setRunKey((k) => k + 1);
    setFinish(null);
  };

  const closeGame = () => {
    setOpenId(null);
    setFinish(null);
    setSceneMusic("arcade");
  };

  const handleFinish = (score: number, extra?: { subtitle?: string }) => {
    if (!openId) return;
    const res = recordArcadeScore(openId, score);
    const best = core.arcade.best[openId] ?? 0;
    setFinish({ score, xp: res.xp, tinta: res.tinta, isRecord: res.isRecord, best, subtitle: extra?.subtitle, def: ARCADE_BY_ID[openId] });
  };

  const buy = (id: string) => {
    const result = unlockArcade(id);
    const d = ARCADE_BY_ID[id];
    if (result === "ok") {
      sfx.unlock();
      toast({ title: `¡${d.name} desbloqueado!`, description: `Has gastado ${d.price} de tinta. Que disfrutes la partida.` });
    } else if (result === "sin-fondos") {
      sfx.wrong(true);
      toast({
        title: "Tinta insuficiente",
        description: `Te faltan ${d.price - core.wallet.tinta} gotas. Gana tinta jugando misiones y sesiones.`,
        variant: "destructive",
      });
    }
    setConfirmBuy(null);
  };

  /* ---------- partida a pantalla completa ---------- */
  if (openId && def && GameComp) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-background">
        <div className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col">
          {finish ? (
            <div className="flex min-h-dvh items-center justify-center px-4">
              <GameOverPanel
                info={finish}
                onReplay={() => { setRunKey((k) => k + 1); setFinish(null); }}
                onExit={closeGame}
                extraAction={
                    <Button
                      variant="ghost"
                      className="w-full text-xs"
                      onClick={() => { closeGame(); }}
                    >
                      <Coins className="mr-1.5 h-3.5 w-3.5" aria-hidden /> Tinta ganada total: {finish.tinta}
                    </Button>
                }
              />
            </div>
          ) : (
            <div className="flex min-h-dvh flex-col pt-3">
              <GameComp key={runKey} def={def} best={core.arcade.best[openId] ?? 0} onFinish={handleFinish} onExit={closeGame} />
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ---------- catálogo del salón ---------- */
  return (
    <div>
      <ScreenHeader
        title="Salón de Juegos"
        subtitle="21 retos de cálculo, memoria, lógica y reflejos"
        backTo={{ name: "home" }}
      />

      <main className="mx-auto w-full max-w-4xl px-4 pb-28 pt-4">
        {/* Resumen del salón */}
        <section className="card-aurora relative overflow-hidden rounded-3xl border bg-card p-4">
          <div className="flex flex-wrap items-center gap-4">
            <span className="gloss flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white" style={{ background: "linear-gradient(150deg, color-mix(in oklch, var(--region-fortaleza) 76%, white 18%), var(--region-fortaleza))" }} aria-hidden>
              <Gamepad2 className="h-7 w-7" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-lg font-bold leading-tight">Entrena la mente, no solo la lengua</h2>
              <p className="text-xs leading-snug text-muted-foreground">
                Se desbloquea con <strong>tinta</strong>: nunca te baja el nivel ni gasta XP.
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-2xl bg-primary/10 px-3 py-2">
              <Droplets className="h-4 w-4 text-primary" aria-hidden />
              <span className="numeric text-lg font-black text-primary">{core.wallet.tinta}</span>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-4 gap-2 text-center">
            <StatMini icon={<Play className="h-3.5 w-3.5" aria-hidden />} value={`${stats.unlocked}/${stats.total}`} label="abiertos" />
            <StatMini icon={<Trophy className="h-3.5 w-3.5" aria-hidden />} value={String(stats.records)} label="récords" />
            <StatMini icon={<Zap className="h-3.5 w-3.5" aria-hidden />} value={String(core.arcade.xpEarned ?? 0)} label="XP aquí" />
            <StatMini icon={<Sparkles className="h-3.5 w-3.5" aria-hidden />} value={String(core.arcade.typing?.bestWpm ?? 0)} label="PPM récord" />
          </div>
        </section>

        {/* Categorías */}
        {CATEGORY_ORDER.map((cat) => {
          const games = ARCADE_GAMES.filter((g) => g.category === cat);
          return (
            <section key={cat} className="mt-6" aria-labelledby={`cat-${cat}`}>
              <div className="mb-2.5 flex items-center gap-2">
                <span className="h-3 w-3 rounded-full" style={{ background: `var(${ARCADE_CATEGORY_COLOR[cat]})` }} aria-hidden />
                <h3 id={`cat-${cat}`} className="font-display text-base font-bold">
                  {ARCADE_CATEGORY_LABEL[cat]}
                </h3>
                <span className="text-[11px] font-semibold text-muted-foreground">
                  {games.filter((g) => arcadeAvailable(core, g.id, level)).length}/{games.length} abiertos
                </span>
              </div>
              <ul className="stagger grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                {games.map((g) => {
                  const Icon = getIcon(g.icon);
                  const available = arcadeAvailable(core, g.id, level);
                  const best = core.arcade.best[g.id] ?? 0;
                  const plays = core.arcade.plays[g.id] ?? 0;
                  const canAfford = core.wallet.tinta >= g.price;
                  return (
                    <li key={g.id}>
                      <div
                        className={cn(
                          "card-aurora tilt-hover group relative flex h-full flex-col gap-2.5 rounded-2xl border p-3.5 transition",
                          available ? "bg-card hover:border-primary/50" : "border-dashed bg-muted/30",
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <span
                            className={cn("gloss flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl", available ? "text-white" : "text-white/70")}
                            style={{
                              background: available
                                ? `linear-gradient(150deg, color-mix(in oklch, var(${ARCADE_CATEGORY_COLOR[g.category]}) 76%, white 18%), var(${ARCADE_CATEGORY_COLOR[g.category]}))`
                                : `linear-gradient(150deg, color-mix(in oklch, var(${ARCADE_CATEGORY_COLOR[g.category]}) 40%, #666), color-mix(in oklch, var(${ARCADE_CATEGORY_COLOR[g.category]}) 20%, #444))`,
                            }}
                            aria-hidden
                          >
                            <Icon className="h-5 w-5" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold leading-tight">{g.name}</p>
                            <p className="truncate text-[11px] text-muted-foreground">{g.tagline}</p>
                          </div>
                          {!available && <Lock className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />}
                        </div>

                        <p className="line-clamp-2 text-[11px] leading-snug text-muted-foreground/90">{g.description}</p>

                        <div className="mt-auto flex items-center justify-between gap-2">
                          <span className="numeric text-[10px] font-bold text-muted-foreground">
                            {plays > 0 ? <>Récord <span className="text-foreground">{best}</span> · {plays} partidas</> : "Sin partidas aún"}
                          </span>
                          {available ? (
                            <Button size="sm" className="h-8 font-bold" onClick={() => openGame(g.id)}>
                              <Play className="mr-1 h-3.5 w-3.5" aria-hidden /> Jugar
                            </Button>
                          ) : confirmBuy === g.id ? (
                            <span className="flex items-center gap-1.5">
                              <Button size="sm" className="h-8" disabled={!canAfford} onClick={() => buy(g.id)}>
                                <Droplets className="mr-1 h-3.5 w-3.5" aria-hidden /> {g.price}
                              </Button>
                              <Button size="sm" variant="ghost" className="h-8 px-2" aria-label="Cancelar compra" onClick={() => setConfirmBuy(null)}>
                                ✕
                              </Button>
                            </span>
                          ) : (
                            <Button
                              size="sm"
                              variant={canAfford ? "default" : "outline"}
                              className="h-8 text-xs font-bold"
                              onClick={() => { sfx.tap(); setConfirmBuy(g.id); }}
                            >
                              <Droplets className="mr-1 h-3.5 w-3.5" aria-hidden /> {g.price}
                            </Button>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}

        <p className="mt-6 text-center text-[11px] leading-relaxed text-muted-foreground">
          Cada partida suma XP con tope diario para que el salón no sustituya al estudio del idioma.
          La tinta se gana en misiones y sesiones (1 por cada 10 XP).
        </p>
      </main>
    </div>
  );
}

function StatMini({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="rounded-2xl bg-secondary/70 px-2 py-2">
      <p className="flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
        {icon} <span className="numeric text-sm font-black text-foreground">{value}</span>
      </p>
      <p className="mt-0.5 text-[10px] font-semibold text-muted-foreground">{label}</p>
    </div>
  );
}
