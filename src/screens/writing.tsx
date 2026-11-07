"use client";

/**
 * Taller de Escritura · VERBALIA
 * La parte de escritura del Archipiélago: tipeo rápido, mecanografía
 * progresiva (filas del teclado) y entrenamiento de precisión.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useGameStore } from "@/store/game-store";
import { useUiStore } from "@/store/ui-store";
import { ScreenHeader } from "@/components/game/app-shell";
import { sfx } from "@/services/audio";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { REFRANES_BANK, TYPING_QUOTES, DRILL_LEVELS } from "@/data/typing";
import {
  AlarmClock,
  Check,
  Crown,
  Droplets,
  Gauge,
  Keyboard,
  Play,
  RotateCcw,
  Sparkles,
  Target,
  Volume2,
} from "lucide-react";
import { createRng } from "@/engine/rng";

type Mode = "speed" | "drill" | "precision";

const MODES: { id: Mode; name: string; tagline: string; description: string; icon: React.ElementType }[] = [
  {
    id: "speed",
    name: "Tinta Veloz",
    tagline: "Tipeo rápido cronometrado",
    description: "Copia una cita de escritores en español a toda velocidad. Se miden tus palabras por minuto y tu precisión.",
    icon: Gauge,
  },
  {
    id: "drill",
    name: "Filas del Teclado",
    tagline: "Mecanografía progresiva",
    description: "Ejercicios por niveles: fila guía, fila superior, fila inferior… aprende el teclado con calma y sin reloj.",
    icon: Keyboard,
  },
  {
    id: "precision",
    name: "Pluma de Cirujano",
    tagline: "Precisión sin prisa",
    description: "Refranes del Archipiélago sin tachar ni borrar: cada error cuenta. La exactitud manda sobre la velocidad.",
    icon: Target,
  },
];

export function WritingScreen() {
  const core = useGameStore((s) => s.core);
  const navigate = useUiStore((s) => s.navigate);
  const [mode, setMode] = useState<Mode>("speed");
  const [running, setRunning] = useState(false);
  const typing = core.arcade.typing ?? { bestWpm: 0, bestAccuracy: 0, testsDone: 0, totalWords: 0, streak: 0, lastDay: "", drillsDone: 0 };

  const start = (m: Mode) => {
    sfx.whoosh();
    setMode(m);
    setRunning(true);
  };

  const exit = () => {
    setRunning(false);
  };

  return (
    <div>
      <ScreenHeader title="Taller de Escritura" subtitle="Tipeo rápido, mecanografía y precisión" backTo={{ name: "home" }} />

      <main className="mx-auto w-full max-w-4xl px-4 pb-28 pt-4">
        {/* Récords del taller */}
        <section className="card-aurora relative overflow-hidden rounded-3xl border bg-card p-4">
          <div className="flex flex-wrap items-center gap-4">
            <span className="gloss flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white" style={{ background: "linear-gradient(150deg, color-mix(in oklch, var(--region-biblioteca) 76%, white 18%), var(--region-biblioteca))" }} aria-hidden>
              <Keyboard className="h-7 w-7" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-lg font-bold leading-tight">Escribe como los copistas</h2>
              <p className="text-xs leading-snug text-muted-foreground">
                La velocidad llega sola; la costumbre se construye a diario. Tu racha del taller: {typing.streak} día(s).
              </p>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
            <RecordChip icon={<Gauge className="h-3.5 w-3.5" aria-hidden />} value={`${typing.bestWpm}`} label="PPM récord" />
            <RecordChip icon={<Target className="h-3.5 w-3.5" aria-hidden />} value={`${typing.bestAccuracy}%`} label="mejor precisión" />
            <RecordChip icon={<Check className="h-3.5 w-3.5" aria-hidden />} value={`${typing.testsDone}`} label="pruebas hechas" />
            <RecordChip icon={<Crown className="h-3.5 w-3.5" aria-hidden />} value={`${typing.totalWords}`} label="palabras tecleadas" />
          </div>
        </section>

        {running ? (
          mode === "drill" ? (
            <DrillGame onExit={exit} />
          ) : (
            <TimedTyping precision={mode === "precision"} onExit={exit} />
          )
        ) : (
          <>
            {/* Modos del taller */}
            <ul className="stagger mt-5 grid gap-2.5 sm:grid-cols-3" aria-label="Modos del taller de escritura">
              {MODES.map((m) => {
                const Icon = m.icon;
                return (
                  <li key={m.id}>
                    <button
                      onClick={() => start(m.id)}
                      className="tap-3d card-aurora flex h-full w-full flex-col gap-2 rounded-2xl border bg-card p-4 text-left transition hover:border-primary/50"
                    >
                      <span className="chip-icon flex h-10 w-10 items-center justify-center rounded-xl">
                        <Icon className="h-5 w-5" aria-hidden />
                      </span>
                      <span className="font-display text-base font-bold leading-tight">{m.name}</span>
                      <span className="text-[11px] font-semibold text-primary">{m.tagline}</span>
                      <span className="text-[11px] leading-snug text-muted-foreground">{m.description}</span>
                    </button>
                  </li>
                );
              })}
            </ul>

            {/* Enlaces a escritura del juego principal */}
            <section className="mt-6" aria-labelledby="write-links">
              <h2 id="write-links" className="font-display mb-2.5 text-lg font-bold">También en el Archipiélago</h2>
              <div className="grid gap-2.5 sm:grid-cols-3">
                <WriteLink
                  title="Dictado del Faro"
                  description="Escucha la frase y escríbela sin fallar una coma."
                  onClick={() => { sfx.whoosh(); navigate({ name: "game", gameId: "dictado", mode: "training" }); }}
                />
                <WriteLink
                  title="Reto del Minuto"
                  description="Escritura libre cronometrada con autoevaluación."
                  onClick={() => { sfx.whoosh(); navigate({ name: "game", gameId: "minuto", mode: "training" }); }}
                />
                <WriteLink
                  title="Cronista de la Biblioteca"
                  description="Ordena las frases para reconstruir el párrafo."
                  onClick={() => { sfx.whoosh(); navigate({ name: "game", gameId: "parrafos", mode: "training" }); }}
                />
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

function RecordChip({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="rounded-2xl bg-secondary/70 px-2 py-2">
      <p className="flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
        {icon} <span className="numeric text-sm font-black text-foreground">{value}</span>
      </p>
      <p className="mt-0.5 text-[10px] font-semibold text-muted-foreground">{label}</p>
    </div>
  );
}

function WriteLink({ title, description, onClick }: { title: string; description: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="tap-3d flex items-center gap-3 rounded-2xl border bg-card p-3.5 text-left transition hover:border-primary/50"
    >
      <span className="chip-icon flex h-9 w-9 shrink-0 items-center justify-center rounded-xl">
        <Volume2 className="h-4.5 w-4.5" aria-hidden />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-bold">{title}</span>
        <span className="block text-[11px] leading-snug text-muted-foreground">{description}</span>
      </span>
    </button>
  );
}

/* ============ Prueba cronometrada (tinta veloz / precisión) ============ */

const SPEED_SECONDS = 60;
const PRECISION_SECONDS = 90;

function TimedTyping({ precision, onExit }: { precision: boolean; onExit: () => void }) {
  const recordTypingTest = useGameStore((s) => s.recordTypingTest);
  const best = useGameStore((s) => s.core.arcade.typing?.bestWpm ?? 0);
  const totalSeconds = precision ? PRECISION_SECONDS : SPEED_SECONDS;

  const [phase, setPhase] = useState<"ready" | "run" | "done">("ready");
  const [text, setText] = useState("");
  const [typed, setTyped] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const [result, setResult] = useState<{ wpm: number; accuracy: number; words: number; xp: number } | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const startedAt = useRef(0);
  const keystrokes = useRef({ total: 0, correct: 0 });

  const loadText = useCallback(() => {
    const bank = precision ? REFRANES_BANK : TYPING_QUOTES;
    const rng = createRng(`typing-${Date.now()}-${Math.floor(Math.random() * 1e6)}`);
    setText(bank[Math.floor(rng() * bank.length)]);
  }, [precision]);

  useEffect(() => {
    loadText();
  }, [loadText]);

  // Reloj de la prueba.
  useEffect(() => {
    if (phase !== "run") return;
    const t = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(t);
          finish();
          return 0;
        }
        if (s <= 6) sfx.tick(true);
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const start = () => {
    setTyped("");
    setResult(null);
    setSecondsLeft(totalSeconds);
    keystrokes.current = { total: 0, correct: 0 };
    setPhase("run");
    startedAt.current = Date.now();
    sfx.go();
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const finish = () => {
    setPhase((p) => {
      if (p === "done") return p;
      const elapsedMin = Math.max(0.008, (Date.now() - startedAt.current) / 60000);
      let correctChars = 0;
      for (let i = 0; i < typed.length && i < text.length; i++) {
        if (typed[i] === text[i]) correctChars += 1;
      }
      const k = keystrokes.current;
      const accuracy = k.total > 0 ? Math.round((k.correct / k.total) * 100) : typed.length > 0 ? Math.round((correctChars / typed.length) * 100) : 0;
      const words = Math.round(correctChars / 5);
      const wpm = Math.max(0, Math.round(words / elapsedMin));
      const res = recordTypingTest({ wpm, accuracy, words });
      setResult({ wpm, accuracy, words, xp: res.xp });
      sfx.sessionWin();
      return "done";
    });
  };

  const onType = (value: string) => {
    if (phase !== "run") return;
    const prev = typed;
    if (value.length > prev.length) {
      const i = value.length - 1;
      keystrokes.current.total += 1;
      if (value[i] === text[i]) {
        keystrokes.current.correct += 1;
        if (value[i] === " ") sfx.typeWord();
        else sfx.typeKey();
      }
    }
    setTyped(value);
    if (value.length >= text.length) finish();
  };

  const liveWpm = useMemo(() => {
    if (phase !== "run") return 0;
    const elapsedMin = Math.max(0.008, (Date.now() - startedAt.current) / 60000);
    let correct = 0;
    for (let i = 0; i < typed.length && i < text.length; i++) if (typed[i] === text[i]) correct += 1;
    return Math.round(correct / 5 / elapsedMin);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typed, phase, secondsLeft]);

  return (
    <section className="card-aurora mt-5 rounded-3xl border bg-card p-4 sm:p-5" aria-label="Prueba de tipeo">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" size="sm" onClick={onExit}>
          <RotateCcw className="mr-1.5 h-3.5 w-3.5" aria-hidden /> Salir
        </Button>
        <div className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs font-bold">
          <AlarmClock className={cn("h-3.5 w-3.5", secondsLeft <= 10 && "text-destructive animate-pulse")} aria-hidden />
          <span className="numeric">{phase === "ready" ? totalSeconds : secondsLeft} s</span>
        </div>
        {phase === "run" && (
          <div className="flex items-center gap-1.5 rounded-full bg-[color-mix(in_oklch,var(--xp)_16%,transparent)] px-3 py-1.5 text-xs font-bold text-[var(--xp)]">
            <Gauge className="h-3.5 w-3.5" aria-hidden />
            <span className="numeric">{liveWpm} PPM</span>
          </div>
        )}
        <span className="ml-auto text-[11px] font-semibold text-muted-foreground">
          Récord: <span className="numeric font-bold text-foreground">{best} PPM</span>
        </span>
      </div>

      <Progress value={(1 - secondsLeft / totalSeconds) * 100} className="mt-3 h-1.5" />

      {/* Texto a copiar */}
      <div
        className="mt-4 rounded-2xl border bg-background p-4 font-mono text-base leading-relaxed sm:text-lg"
        aria-label="Texto a copiar"
      >
        {text.split("").map((ch, i) => {
          const state =
            i < typed.length ? (typed[i] === ch ? "ok" : "bad") : i === typed.length ? "cursor" : "pend";
          return (
            <span
              key={i}
              className={cn(
                "whitespace-pre-wrap",
                state === "ok" && "text-foreground",
                state === "bad" && "bg-destructive/20 text-destructive underline decoration-destructive/60",
                state === "cursor" && "bg-primary/25 rounded-sm",
                state === "pend" && "text-muted-foreground/60",
              )}
            >
              {ch}
            </span>
          );
        })}
      </div>

      {/* Entrada */}
      {phase === "run" ? (
        <textarea
          ref={inputRef}
          value={typed}
          onChange={(e) => onType(e.target.value)}
          onPaste={(e) => e.preventDefault()}
          spellCheck={false}
          autoCapitalize="none"
          autoCorrect="off"
          rows={3}
          aria-label="Escribe aquí el texto"
          className="mt-3 w-full rounded-2xl border bg-background p-4 font-mono text-base leading-relaxed outline-none focus-visible:ring-2 focus-visible:ring-primary"
          placeholder="Empieza a escribir aquí…"
        />
      ) : phase === "ready" ? (
        <Button size="lg" className="mt-4 w-full text-base font-bold" onClick={start}>
          <Play className="mr-2 h-5 w-5" aria-hidden />
          {precision ? "Empezar (90 s sin tachar)" : "¡Que empiece la prueba! (60 s)"}
        </Button>
      ) : (
        result && <TypingResult wpm={result.wpm} accuracy={result.accuracy} words={result.words} xp={result.xp} onReplay={start} onExit={onExit} />
      )}
    </section>
  );
}

function TypingResult({
  wpm,
  accuracy,
  words,
  xp,
  onReplay,
  onExit,
}: {
  wpm: number;
  accuracy: number;
  words: number;
  xp: number;
  onReplay: () => void;
  onExit: () => void;
}) {
  const isBest = wpm > 0 && accuracy >= 85;
  return (
    <div className="anim-pop mt-4 rounded-2xl border border-primary/30 bg-primary/5 p-4 text-center">
      <p className="font-display text-lg font-bold">
        {isBest ? "¡Pluma afilada!" : "Prueba terminada"}
      </p>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <div className="rounded-xl bg-card p-2.5">
          <p className="numeric font-display text-xl font-black text-[var(--xp)]">{wpm}</p>
          <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">PPM</p>
        </div>
        <div className="rounded-xl bg-card p-2.5">
          <p className="numeric font-display text-xl font-black text-primary">{accuracy}%</p>
          <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">precisión</p>
        </div>
        <div className="rounded-xl bg-card p-2.5">
          <p className="numeric font-display text-xl font-black">{words}</p>
          <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">palabras</p>
        </div>
      </div>
      <p className="mt-3 flex items-center justify-center gap-1.5 text-xs font-bold text-[var(--xp)]">
        <Sparkles className="h-3.5 w-3.5" aria-hidden /> +{xp} XP
        <Droplets className="ml-2 h-3.5 w-3.5 text-primary" aria-hidden /> tinta incluida
      </p>
      <div className="mt-4 flex gap-2.5">
        <Button className="flex-1 font-bold" onClick={onReplay}>
          <RotateCcw className="mr-1.5 h-4 w-4" aria-hidden /> Otra prueba
        </Button>
        <Button variant="outline" className="flex-1 font-bold" onClick={onExit}>
          Volver al taller
        </Button>
      </div>
    </div>
  );
}

/* ============== Mecanografía por filas (sin reloj) ============== */

function DrillGame({ onExit }: { onExit: () => void }) {
  const recordTypingTest = useGameStore((s) => s.recordTypingTest);
  const drillsDone = useGameStore((s) => s.core.arcade.typing?.drillsDone ?? 0);
  const [levelIdx, setLevelIdx] = useState(() => Math.min(DRILL_LEVELS.length - 1, Math.floor(drillsDone / 3)));
  const level = DRILL_LEVELS[levelIdx];

  const [prompt, setPrompt] = useState("");
  const [typed, setTyped] = useState("");
  const [state, setState] = useState<"typing" | "ok">("typing");
  const [streak, setStreak] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const nextPrompt = useCallback(() => {
    const rng = createRng(`drill-${levelIdx}-${Date.now()}-${Math.floor(Math.random() * 1e6)}`);
    const words = [...level.words].sort(() => rng() - 0.5).slice(0, 5);
    setPrompt(words.join(" "));
    setTyped("");
    setState("typing");
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [level, levelIdx]);

  useEffect(() => {
    nextPrompt();
  }, [nextPrompt]);

  const onType = (value: string) => {
    if (state === "ok") return;
    // En los drills el error no avanza: el jugador debe corregir.
    if (value.length > 0 && value[value.length - 1] !== prompt[value.length - 1]) {
      sfx.wrong(true);
      return;
    }
    setTyped(value);
    if (value.length >= prompt.length && value === prompt) {
      setState("ok");
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      recordTypingTest({ wpm: 0, accuracy: 100, words: prompt.split(" ").length, isDrill: true });
      sfx.sparkle();
      if (nextStreak % 3 === 0) {
        window.setTimeout(() => {
          sfx.stepUp();
          if (levelIdx < DRILL_LEVELS.length - 1) setLevelIdx((i) => i + 1);
        }, 450);
      }
      window.setTimeout(nextPrompt, 650);
    }
  };

  return (
    <section className="card-aurora mt-5 rounded-3xl border bg-card p-4 sm:p-5" aria-label="Ejercicio de filas del teclado">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" size="sm" onClick={onExit}>
          <RotateCcw className="mr-1.5 h-3.5 w-3.5" aria-hidden /> Salir
        </Button>
        <div className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs font-bold">
          <Keyboard className="h-3.5 w-3.5" aria-hidden />
          Nivel {levelIdx + 1}/{DRILL_LEVELS.length} · {level.name}
        </div>
        <span className="ml-auto text-[11px] font-semibold text-muted-foreground">
          Racha de líneas: <span className="numeric font-bold text-foreground">{streak}</span> · cada 3 sube de nivel
        </span>
      </div>

      <p className="mt-3 text-xs leading-snug text-muted-foreground">{level.tip}</p>

      <div className="mt-3 rounded-2xl border bg-background p-4 text-center font-mono text-xl tracking-wide sm:text-2xl" aria-label="Secuencia a copiar">
        {prompt.split("").map((ch, i) => {
          const state = i < typed.length ? "ok" : i === typed.length ? "cursor" : "pend";
          return (
            <span
              key={i}
              className={cn(
                "whitespace-pre",
                state === "ok" && "text-foreground",
                state === "cursor" && "rounded-sm bg-primary/25",
                state === "pend" && "text-muted-foreground/50",
              )}
            >
              {ch}
            </span>
          );
        })}
        {state === "ok" && <span className="ml-2 text-success">✓</span>}
      </div>

      <input
        ref={inputRef}
        value={typed}
        onChange={(e) => onType(e.target.value)}
        spellCheck={false}
        autoCapitalize="none"
        autoCorrect="off"
        aria-label="Escribe la secuencia"
        className="mt-3 w-full rounded-2xl border bg-background p-4 text-center font-mono text-lg outline-none focus-visible:ring-2 focus-visible:ring-primary"
        placeholder="Escribe la línea sin mirar el teclado…"
      />
    </section>
  );
}
