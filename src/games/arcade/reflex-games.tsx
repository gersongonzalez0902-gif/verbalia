"use client";

/**
 * Minijuegos de memoria, reflejos y palabras veloces · Salón de Juegos.
 * Mayor o Menor, Simón de la Marea, Pares de Letras, Test de Stroop,
 * Reflejo del Faro, Danza de Flechas y Palabra Secreta.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { sfx } from "@/services/audio";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArcadePanel, BigChoice, FlashMsg, shuffle, useCountdown, type ArcadeGameProps } from "./shared";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Play, Sparkles } from "lucide-react";

/* ============================ Mayor o Menor ============================ */

export function HighLowGame({ def, onFinish, onExit }: ArcadeGameProps) {
  const [current, setCurrent] = useState(() => 2 + Math.floor(Math.random() * 97));
  const [upcoming, setUpcoming] = useState(() => 2 + Math.floor(Math.random() * 97));
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [flash, setFlash] = useState<{ m: string; ok: boolean } | null>(null);

  const guess = (higher: boolean) => {
    const ok = higher ? upcoming > current : upcoming < current;
    if (ok) {
      const gained = 10 + streak * 2;
      setScore((s) => s + gained);
      setStreak((t) => t + 1);
      sfx.correct(Math.min(3, streak / 3));
      setFlash({ m: `+${gained}`, ok: true });
    } else {
      sfx.sessionLose();
      onFinish(score, { subtitle: `Racha de ${streak} aciertos seguidos.` });
      return;
    }
    setCurrent(upcoming);
    setUpcoming(2 + Math.floor(Math.random() * 97));
    setTimeout(() => setFlash(null), 700);
  };

  return (
    <ArcadePanel def={def} onExit={onExit} score={score} accentVar="--region-torre">
      <div className="relative flex h-full flex-col items-center justify-center gap-6">
        <FlashMsg msg={flash?.m ?? null} tone="ok" />
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">¿La siguiente carta es mayor o menor?</p>
        <div className="flex items-center gap-6">
          <div className="card-aurora flex h-32 w-24 flex-col items-center justify-center rounded-2xl border-2">
            <span className="numeric font-display text-4xl font-black">{current}</span>
            <span className="text-[10px] font-bold uppercase text-muted-foreground">actual</span>
          </div>
          <div className="card-aurora flex h-32 w-24 flex-col items-center justify-center rounded-2xl border-2 border-dashed">
            <Sparkles className="anim-twinkle h-7 w-7 text-primary" aria-hidden />
            <span className="text-[10px] font-bold uppercase text-muted-foreground">¿?</span>
          </div>
        </div>
        <div className="grid w-full max-w-xs grid-cols-2 gap-3">
          <BigChoice variant="primary" onClick={() => guess(true)}>▲ Mayor</BigChoice>
          <BigChoice onClick={() => guess(false)}>▼ Menor</BigChoice>
        </div>
        <p className="numeric text-xs text-muted-foreground">Racha actual: {streak}</p>
      </div>
    </ArcadePanel>
  );
}

/* ============================ Simón de la Marea ============================ */

const SIMON_PADS = [
  { id: 0, label: "Marea", css: "var(--region-puerto)", tone: 392 },
  { id: 1, label: "Faro", css: "var(--xp)", tone: 523 },
  { id: 2, label: "Coral", css: "var(--region-torre)", tone: 659 },
  { id: 3, label: "Bosque", css: "var(--region-bosque)", tone: 784 },
] as const;

function playTone(freq: number) {
  sfx.countdown(Math.min(2, Math.floor(freq / 600)));
}

export function SimonGame({ def, onFinish, onExit }: ArcadeGameProps) {
  const [seq, setSeq] = useState<number[]>([]);
  const [step, setStep] = useState(0); // índice de reproducción/turno
  const [litPad, setLitPad] = useState<number | null>(null);
  const [phase, setPhase] = useState<"idle" | "show" | "input" | "over">("idle");

  // reproduce la secuencia con luces y tonos
  useEffect(() => {
    if (phase !== "show") return;
    let i = 0;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      if (i >= seq.length) {
        setLitPad(null);
        setPhase("input");
        setStep(0);
        return;
      }
      const pad = seq[i];
      setLitPad(pad);
      playTone(SIMON_PADS[pad].tone);
      timer = setTimeout(() => {
        setLitPad(null);
        i++;
        timer = setTimeout(tick, 260);
      }, 480);
    };
    timer = setTimeout(tick, 600);
    return () => clearTimeout(timer);
  }, [phase, seq]);

  const start = () => {
    setSeq([Math.floor(Math.random() * 4)]);
    setStep(0);
    setPhase("show");
    sfx.go();
  };

  const tap = (pad: number) => {
    if (phase !== "input") return;
    setLitPad(pad);
    playTone(SIMON_PADS[pad].tone);
    setTimeout(() => setLitPad(null), 240);
    if (seq[step] === pad) {
      if (step + 1 === seq.length) {
        // ronda completada
        setTimeout(() => {
          setSeq((s) => [...s, Math.floor(Math.random() * 4)]);
          setPhase("show");
          sfx.combo(2);
        }, 500);
      } else {
        setStep(step + 1);
      }
    } else {
      sfx.sessionLose();
      setPhase("over");
      const score = Math.max(0, (seq.length - 1) * 15);
      setTimeout(() => onFinish(score, { subtitle: `Secuencia de ${seq.length - 1} luces repetida.` }), 500);
    }
  };

  return (
    <ArcadePanel def={def} onExit={onExit} accentVar="--region-puerto">
      <div className="flex h-full flex-col items-center justify-center gap-5">
        {phase === "idle" && (
          <div className="flex flex-col items-center gap-3">
            <p className="max-w-xs text-center text-xs text-muted-foreground">
              El faro enciende una secuencia de luces con su campana. Repítela: crece una luz por ronda.
            </p>
            <Button className="font-bold" onClick={start}><Play className="mr-2 h-4 w-4" aria-hidden /> Empezar</Button>
          </div>
        )}
        {(phase === "show" || phase === "input" || phase === "over") && (
          <>
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
              {phase === "show" ? "Observa la secuencia…" : phase === "input" ? "¡Tu turno!" : "La marea te ganó"}
            </p>
            <div className="grid aspect-square w-full max-w-[min(100%,18rem)] grid-cols-2 gap-3">
              {SIMON_PADS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => tap(p.id)}
                  disabled={phase !== "input"}
                  aria-label={`Luz ${p.label}`}
                  className={cn(
                    "tap-target rounded-3xl border-2 transition-all duration-150",
                    litPad === p.id ? "scale-105 border-white/70" : "scale-100 border-transparent",
                  )}
                  style={{
                    background: litPad === p.id ? `color-mix(in oklch, ${p.css} 88%, white 12%)` : `color-mix(in oklch, ${p.css} 40%, var(--card))`,
                    boxShadow: litPad === p.id ? `0 0 24px color-mix(in oklch, ${p.css} 70%, transparent)` : undefined,
                  }}
                />
              ))}
            </div>
            <p className="numeric text-sm font-black">Ronda {seq.length}</p>
          </>
        )}
      </div>
    </ArcadePanel>
  );
}

/* ============================ Pares de Letras ============================ */

const PAIR_LETTERS = "ABCDEFGHIJKL".split("");

export function MemoryPairsGame({ def, onFinish, onExit }: ArcadeGameProps) {
  const [deck] = useState(() => shuffle([...PAIR_LETTERS.slice(0, 6), ...PAIR_LETTERS.slice(0, 6)]));
  const [open, setOpen] = useState<number[]>([]);
  const [found, setFound] = useState<number[]>([]);
  const [tries, setTries] = useState(0);
  const time = useCountdown(90, true, () => finishRef.current());

  const done = found.length === deck.length;

  const finishRef = useRef(() => {});
  const score = useMemo(() => Math.max(10, 140 - tries * 8), [tries]);
  finishRef.current = () => onFinish(score, { subtitle: `${found.length / 2} de 6 parejas con ${tries} intentos.` });

  useEffect(() => {
    if (done) {
      sfx.sessionWin();
      setTimeout(() => onFinish(score, { subtitle: `¡Todas las parejas en ${tries} intentos!` }), 600);
    }
  }, [done]); // eslint-disable-line react-hooks/exhaustive-deps

  const flip = (i: number) => {
    if (open.includes(i) || found.includes(i) || open.length === 2) return;
    const next = [...open, i];
    setOpen(next);
    sfx.flip();
    if (next.length === 2) {
      setTries((t) => t + 1);
      const [a, b] = next;
      if (deck[a] === deck[b]) {
        setTimeout(() => {
          setFound((f) => [...f, a, b]);
          setOpen([]);
          sfx.correct(1);
        }, 420);
      } else {
        setTimeout(() => setOpen([]), 750);
      }
    }
  };

  return (
    <ArcadePanel def={def} onExit={onExit} timeLeft={time} timeMax={90} accentVar="--region-bosque">
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          {found.length / 2}/6 parejas · {tries} intentos
        </p>
        <div className="grid aspect-square w-full max-w-[min(100%,20rem)] grid-cols-4 gap-2">
          {deck.map((letter, i) => {
            const shown = open.includes(i) || found.includes(i);
            return (
              <button
                key={i}
                onClick={() => flip(i)}
                aria-label={shown ? `Carta ${letter}` : `Carta boca abajo ${i + 1}`}
                className={cn(
                  "tap-target preserve-3d tap-3d flex items-center justify-center rounded-2xl border-2 text-2xl font-black transition-all duration-300",
                  shown ? "border-primary/60 bg-primary/10" : "border-border bg-card hover:border-primary/40",
                )}
              >
                <span className={cn("transition-opacity", shown ? "opacity-100 text-primary" : "opacity-0")}>{letter}</span>
                {!shown && <span className="absolute text-lg opacity-40" aria-hidden>✦</span>}
              </button>
            );
          })}
        </div>
      </div>
    </ArcadePanel>
  );
}

/* ============================ Test de Stroop ============================ */

const STROOP_COLORS = [
  { name: "ROJO", css: "var(--region-torre)" },
  { name: "AZUL", css: "var(--region-puerto)" },
  { name: "VERDE", css: "var(--region-bosque)" },
  { name: "ÁMBAR", css: "var(--xp)" },
] as const;

export function StroopGame({ def, onFinish, onExit }: ArcadeGameProps) {
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [round, setRound] = useState(() => makeStroop());
  const time = useCountdown(45, true, () => onFinish(score));

  function makeStroop() {
    const word = STROOP_COLORS[Math.floor(Math.random() * 4)];
    const ink = STROOP_COLORS[Math.floor(Math.random() * 4)];
    return { word, ink };
  }

  const answer = (i: number) => {
    if (STROOP_COLORS[i].name === round.ink.name) {
      const gained = 8 + combo * 2;
      setScore((s) => s + gained);
      setCombo((c) => c + 1);
      sfx.correct(Math.min(3, combo / 3));
    } else {
      setScore((s) => Math.max(0, s - 5));
      setCombo(0);
      sfx.wrong(true);
    }
    setRound(makeStroop());
  };

  return (
    <ArcadePanel def={def} onExit={onExit} score={score} timeLeft={time} timeMax={45} accentVar="--region-observatorio">
      <div className="flex h-full flex-col items-center justify-center gap-6">
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Responde al COLOR DE LA TINTA, no a la palabra</p>
        <p
          className="font-display anim-pop text-6xl font-black tracking-widest sm:text-7xl"
          style={{ color: round.ink.css }}
          key={`${round.word.name}-${round.ink.name}-${score}`}
          aria-live="polite"
        >
          {round.word.name}
        </p>
        <div className="grid grid-cols-2 gap-3">
          {STROOP_COLORS.map((c, i) => (
            <BigChoice key={c.name} onClick={() => answer(i)} className="w-36">
              <span className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 rounded-full" style={{ background: c.css }} aria-hidden />
                {c.name}
              </span>
            </BigChoice>
          ))}
        </div>
        {combo >= 3 && <p className="anim-pop text-xs font-black text-primary">¡Racha de {combo}! +bonus</p>}
      </div>
    </ArcadePanel>
  );
}

/* ============================ Reflejo del Faro ============================ */

export function ReactionGame({ def, onFinish, onExit }: ArcadeGameProps) {
  const [state, setState] = useState<"wait" | "go" | "early" | "done">("wait");
  const [times, setTimes] = useState<number[]>([]);
  const t0 = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ROUNDS = 5;

  const armGo = () => {
    const delay = 900 + Math.random() * 2300;
    timer.current = setTimeout(() => {
      t0.current = performance.now();
      setState("go");
      sfx.go();
    }, delay);
  };

  const startRound = () => {
    if (state === "early") return;
    setState("wait");
    armGo();
  };

  const press = () => {
    if (state === "wait") {
      if (timer.current) clearTimeout(timer.current);
      setState("early");
      sfx.wrong();
      return;
    }
    if (state === "go") {
      const ms = Math.round(performance.now() - t0.current);
      const next = [...times, ms];
      setTimes(next);
      if (next.length >= ROUNDS) {
        setState("done");
        const avg = next.reduce((a, b) => a + b, 0) / next.length;
        const score = Math.max(10, Math.round(400 - avg / 2));
        sfx.sessionWin();
        setTimeout(() => onFinish(score, { subtitle: `Media de ${Math.round(avg)} ms por reflejo.` }), 700);
      } else {
        setState("wait");
        armGo();
      }
    }
  };

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const best = times.length ? Math.min(...times) : null;

  return (
    <ArcadePanel def={def} onExit={onExit} round={times.length + 1} roundMax={ROUNDS} accentVar="--region-fortaleza">
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <button
          onClick={press}
          className={cn(
            "tap-target flex h-64 w-full max-w-sm flex-col items-center justify-center gap-2 rounded-3xl border-4 text-center transition-all active:scale-[0.98]",
            state === "wait" && "border-border bg-muted/40",
            state === "go" && "anim-glow border-[var(--xp)] bg-[color-mix(in_oklch,var(--xp)_30%,var(--card))]",
            state === "early" && "border-[--region-torre] bg-[color-mix(in_oklch,var(--region-torre)_25%,var(--card))]",
            state === "done" && "border-primary bg-primary/10",
          )}
          aria-label="Botón de reacción"
        >
          {state === "wait" && <><span className="text-4xl" aria-hidden>🌙</span><p className="text-sm font-bold text-muted-foreground">Espera al faro…</p><p className="text-[11px] text-muted-foreground">Si tocas antes, pierdes la ronda</p></>}
          {state === "go" && <><span className="anim-pop text-5xl" aria-hidden>⚡</span><p className="font-display text-xl font-black">¡AHORA!</p></>}
          {state === "early" && <><span className="text-4xl" aria-hidden>⚓</span><p className="font-display text-lg font-black">¡Demasiado pronto!</p><p className="text-[11px] text-muted-foreground">Pulsa para reintentar la ronda</p></>}
          {state === "done" && <p className="font-display text-lg font-black">Rondas completadas</p>}
        </button>
        <div className="flex gap-2">
          {Array.from({ length: ROUNDS }, (_, i) => (
            <span
              key={i}
              className={cn("numeric rounded-lg px-2 py-1 text-[11px] font-bold", times[i] ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground")}
            >
              {times[i] ? `${times[i]}ms` : "—"}
            </span>
          ))}
        </div>
        {best && <p className="text-[11px] text-muted-foreground">Mejor marca: {best} ms</p>}
        {state === "early" && <Button size="sm" variant="outline" onClick={startRound}>Reintentar ronda</Button>}
      </div>
    </ArcadePanel>
  );
}

/* ============================ Danza de Flechas ============================ */

const ARROWS = [ArrowUp, ArrowDown, ArrowLeft, ArrowRight] as const;
const ARROW_KEYS = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];

export function ArrowsDanceGame({ def, onFinish, onExit }: ArcadeGameProps) {
  const [seq, setSeq] = useState<number[]>([]);
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState<"show" | "input">("show");
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [active, setActive] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);

  const showArrow = useCallback((a: number) => {
    setActive(a);
    sfx.countdown(a);
    setTimeout(() => setActive(null), 220);
  }, []);

  useEffect(() => {
    if (!playing || phase !== "show") return;
    let i = 0;
    const id = setInterval(() => {
      if (i >= seq.length) {
        clearInterval(id);
        setPhase("input");
        setStep(0);
        return;
      }
      showArrow(seq[i]);
      i++;
    }, 520);
    return () => clearInterval(id);
  }, [phase, seq, playing, showArrow]);

  const start = () => {
    setPlaying(true);
    setLives(3);
    setScore(0);
    nextRound([]);
  };

  const nextRound = (cur: number[]) => {
    setSeq([...cur, Math.floor(Math.random() * 4)]);
    setPhase("show");
    sfx.go();
  };

  const hit = (a: number) => {
    if (!playing || phase !== "input") return;
    showArrow(a);
    if (seq[step] === a) {
      if (step + 1 === seq.length) {
        const gained = 12 + seq.length * 3;
        setScore((s) => s + gained);
        sfx.combo(Math.min(3, seq.length / 3));
        setTimeout(() => nextRound(seq), 550);
      } else {
        setStep(step + 1);
      }
    } else {
      sfx.wrong();
      const lv = lives - 1;
      setLives(lv);
      if (lv <= 0) {
        setPlaying(false);
        setTimeout(() => onFinish(score, { subtitle: `Bailaste ${seq.length - 1} flechas seguidas.` }), 500);
      } else {
        setTimeout(() => { setPhase("show"); setStep(0); }, 550);
      }
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const i = ARROW_KEYS.indexOf(e.key);
      if (i >= 0) { e.preventDefault(); hit(i); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <ArcadePanel def={def} onExit={onExit} score={score} lives={lives} accentVar="--region-biblioteca">
      <div className="flex h-full flex-col items-center justify-center gap-5">
        {!playing ? (
          <div className="flex flex-col items-center gap-3">
            <p className="max-w-xs text-center text-xs text-muted-foreground">
              Las flechas del compás señalan una secuencia cada vez más larga. Repítela con los botones o el teclado.
            </p>
            <Button className="font-bold" onClick={start}><Play className="mr-2 h-4 w-4" aria-hidden /> Empezar</Button>
          </div>
        ) : (
          <>
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
              {phase === "show" ? "Observa el compás…" : `Tu turno: ${step + 1}/${seq.length}`}
            </p>
            <div className="flex gap-3">
              {ARROWS.map((Icon, i) => (
                <button
                  key={i}
                  onClick={() => hit(i)}
                  aria-label={["Arriba", "Abajo", "Izquierda", "Derecha"][i]}
                  className={cn(
                    "tap-target flex h-16 w-16 items-center justify-center rounded-2xl border-2 transition-all active:scale-90",
                    active === i
                      ? "gloss scale-110 border-primary bg-primary/25 text-primary"
                      : "border-border bg-card text-foreground/80 hover:border-primary/40",
                  )}
                >
                  <Icon className="h-8 w-8" aria-hidden />
                </button>
              ))}
            </div>
            <p className="numeric text-xs font-bold text-muted-foreground">Secuencia de {seq.length} flechas</p>
          </>
        )}
      </div>
    </ArcadePanel>
  );
}

/* ============================ Palabra Secreta ============================ */

const SECRET_POOL = [
  "playa", "tinta", "marea", "pluma", "hojas", "bruma", "costa", "dunas",
  "velas", "puerto", "islas", "barco", "canoa", "mapas", "nauta", "salas",
  "letra", "verso", "prosa", "siglo", "gozos", "echar", "rutas", "pauta",
  "orcas", "mango", "hucha", "perla", "cifra", "brisa",
];

function pickSecret(): string {
  return SECRET_POOL[Math.floor(Math.random() * SECRET_POOL.length)];
}

const KEY_ROWS = ["qwertyuiop", "asdfghjklñ", "zxcvbnm"];

export function WordSecretGame({ def, onFinish, onExit }: ArcadeGameProps) {
  const [target] = useState(() => pickSecret());
  const [guesses, setGuesses] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [score, setScore] = useState(0);

  const won = guesses.includes(target);
  const lost = !won && guesses.length >= 6;
  useEffect(() => {
    if (!won && !lost) return;
    const t = setTimeout(() => {
      if (won) {
        sfx.sessionWin();
        const gained = 120 - guesses.length * 15;
        onFinish(Math.max(30, gained), { subtitle: `La palabra era «${target}»: ${guesses.length} de 6 intentos.` });
      } else {
        sfx.sessionLose();
        onFinish(Math.max(10, score), { subtitle: `La palabra secreta era «${target}».` });
      }
    }, 900);
    return () => clearTimeout(t);
  }, [won, lost]); // eslint-disable-line react-hooks/exhaustive-deps

  const submit = () => {
    const w = draft.trim().toLowerCase();
    if (!/^[a-záéíóúñ]{5}$/.test(w) || guesses.includes(w)) return;
    setGuesses((g) => [...g, w]);
    setDraft("");
    sfx.place();
  };

  const letterState = (letter: string): "hit" | "near" | "miss" | null => {
    let best: "hit" | "near" | "miss" | null = null;
    for (const g of guesses) {
      const idx = g.indexOf(letter);
      if (idx >= 0) {
        if (target[idx] === letter) return "hit";
        best = best === "hit" ? "hit" : target.includes(letter) ? "near" : "miss";
      }
    }
    return best;
  };

  return (
    <ArcadePanel def={def} onExit={onExit} accentVar="--region-observatorio">
      <div className="flex h-full flex-col items-center justify-center gap-3">
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          Palabra de 5 letras · 6 intentos {won ? "· ¡resuelta!" : lost ? "· sin intentos" : ""}
        </p>
        <div className="space-y-1.5">
          {Array.from({ length: 6 }, (_, r) => {
            const g = guesses[r];
            return (
              <div key={r} className="flex gap-1.5">
                {Array.from({ length: 5 }, (_, c) => {
                  const ch = g?.[c] ?? (r === guesses.length ? draft[c] : "");
                  const hit = g && target[c] === g[c];
                  const near = g && !hit && target.includes(g[c]);
                  return (
                    <span
                      key={c}
                      className={cn(
                        "flex h-11 w-11 items-center justify-center rounded-lg border-2 text-lg font-black uppercase transition",
                        hit ? "gloss border-transparent bg-[--region-bosque] text-white" : "",
                        near ? "border-transparent bg-[--region-ciudad] text-white" : "",
                        !g && ch ? "border-primary/60 text-primary" : "",
                        !ch && "border-border/70",
                        g && !hit && !near ? "border-transparent bg-muted text-muted-foreground" : "",
                      )}
                    >
                      {ch ?? ""}
                    </span>
                  );
                })}
              </div>
            );
          })}
        </div>
        {!won && !lost && (
          <>
            <div className="flex w-full max-w-xs items-center gap-2">
              <Input
                autoFocus
                value={draft}
                onChange={(e) => setDraft(e.target.value.slice(0, 5))}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                placeholder="5 letras"
                aria-label="Palabra de cinco letras"
                className="h-11 text-center text-lg font-bold uppercase tracking-widest"
              />
              <Button onClick={submit} className="h-11 font-bold">Probar</Button>
            </div>
            <div className="flex flex-col items-center gap-1">
              {KEY_ROWS.map((row) => (
                <div key={row} className="flex gap-1">
                  {row.split("").map((l) => {
                    const st = letterState(l);
                    return (
                      <button
                        key={l}
                        onClick={() => setDraft((d) => (d.length < 5 ? d + l : d))}
                        aria-label={`Letra ${l}`}
                        className={cn(
                          "tap-target flex h-8 w-7 items-center justify-center rounded text-[11px] font-bold uppercase transition active:scale-90",
                          st === "hit" ? "bg-[--region-bosque] text-white" : st === "near" ? "bg-[--region-ciudad] text-white" : st === "miss" ? "bg-muted text-muted-foreground/40" : "bg-card border border-border",
                        )}
                      >
                        {l}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </ArcadePanel>
  );
}
