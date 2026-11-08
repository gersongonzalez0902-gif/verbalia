"use client";

/**
 * Minijuegos de cálculo y letras · Salón de Juegos.
 * Mates Relámpago, Códice Romano, Faro Binario, Memoria de Dígitos,
 * Pluma Veloz, Anagramas del Ancla y Ahorcado de la Fauna.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { sfx } from "@/services/audio";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArcadePanel, BigChoice, ComboBadge, FlashMsg, useCountdown, useInterval, shuffle, type ArcadeGameProps } from "./shared";
import { Lightbulb, Send } from "lucide-react";

/* ============================ Mates Relámpago ============================ */

interface MathQ { q: string; a: number }

function randMathQ(level: number): MathQ {
  const t = Math.floor(Math.random() * (level < 4 ? 2 : 4));
  const n = (a: number, b: number) => Math.floor(a + Math.random() * (b - a + 1));
  if (t === 0) { const a = n(2, 12 + level * 6), b = n(2, 12 + level * 6); return { q: `${a} + ${b}`, a: a + b }; }
  if (t === 1) { const a = n(10, 30 + level * 8), b = n(2, a - 1); return { q: `${a} − ${b}`, a: a - b }; }
  if (t === 2) { const a = n(2, 6 + level), b = n(2, 9); return { q: `${a} × ${b}`, a: a * b }; }
  const b = n(2, 9), r = n(2, 9); return { q: `${b * r} ÷ ${b}`, a: r };
}

export function MathGame({ def, onFinish, onExit }: ArcadeGameProps) {
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [level, setLevel] = useState(1);
  const [q, setQ] = useState<MathQ>(() => randMathQ(1));
  const [draft, setDraft] = useState("");
  const [flash, setFlash] = useState<{ m: string; ok: boolean } | null>(null);
  const time = useCountdown(60, true, () => onFinish(score));

  const submit = () => {
    const v = Number(draft.trim());
    if (draft.trim() === "" || Number.isNaN(v)) return;
    if (v === q.a) {
      const gained = 10 + combo * 2 + level;
      setScore((s) => s + gained);
      setCombo((c) => { const nc = c + 1; if (nc % 5 === 0) { sfx.combo(Math.min(4, nc / 5)); setLevel((l) => Math.min(8, l + 1)); } return nc; });
      sfx.correct(Math.min(3, combo / 3));
      setFlash({ m: `+${gained}`, ok: true });
    } else {
      setCombo(0);
      sfx.wrong(true);
      setFlash({ m: `Era ${q.a}`, ok: false });
    }
    setDraft("");
    setQ(randMathQ(level));
    setTimeout(() => setFlash(null), 800);
  };

  return (
    <ArcadePanel def={def} onExit={onExit} score={score} timeLeft={time} timeMax={60} accentVar="--region-ciudad">
      <div className="relative flex h-full flex-col items-center justify-center gap-5">
        <FlashMsg msg={flash?.m ?? null} tone={flash?.ok ? "ok" : "ko"} />
        <ComboBadge combo={combo} />
        <p className="numeric font-display text-5xl font-black sm:text-6xl" aria-live="polite">{q.q}</p>
        <div className="flex w-full max-w-xs items-center gap-2">
          <Input
            autoFocus
            inputMode="numeric"
            value={draft}
            onChange={(e) => setDraft(e.target.value.replace(/[^\d-]/g, ""))}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Tu resultado"
            aria-label="Resultado de la operación"
            className="numeric h-12 text-center text-xl font-bold"
          />
          <Button size="lg" onClick={submit} aria-label="Comprobar" className="h-12 px-4">
            <Send className="h-5 w-5" aria-hidden />
          </Button>
        </div>
        <p className="text-[11px] text-muted-foreground">Aciertos seguidos suben la dificultad y el combo.</p>
      </div>
    </ArcadePanel>
  );
}

/* ============================ Códice Romano ============================ */

const R_NUM: [number, string][] = [
  [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"], [90, "XC"],
  [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
];

function toRoman(n: number): string {
  let out = "";
  for (const [v, s] of R_NUM) while (n >= v) { out += s; n -= v; }
  return out;
}

function randRomanRound(): { q: string; a: string; hint: string } {
  const n = Math.floor(1 + Math.random() * 2000);
  if (Math.random() < 0.5) return { q: toRoman(n), a: String(n), hint: "Pasa el numeral a número arábigo" };
  return { q: String(n), a: toRoman(n), hint: "Escribe el número en romanos (mayúsculas)" };
}

export function RomanGame({ def, onFinish, onExit }: ArcadeGameProps) {
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [round, setRound] = useState(randRomanRound);
  const [draft, setDraft] = useState("");
  const [flash, setFlash] = useState<{ m: string; ok: boolean } | null>(null);

  useEffect(() => {
    if (lives <= 0) onFinish(score, { subtitle: `Aguantaste ${score} puntos con numerales de emperador.` });
  }, [lives, onFinish, score]);

  const submit = () => {
    const v = draft.trim().toUpperCase();
    if (!v) return;
    if (v === round.a) {
      setScore((s) => s + 25);
      sfx.correct();
      setFlash({ m: "✓ +25", ok: true });
    } else {
      setLives((l) => l - 1);
      sfx.wrong();
      setFlash({ m: `Era ${round.a}`, ok: false });
    }
    setDraft("");
    setRound(randRomanRound());
    setTimeout(() => setFlash(null), 900);
  };

  return (
    <ArcadePanel def={def} onExit={onExit} score={score} lives={lives} accentVar="--region-biblioteca">
      <div className="relative flex h-full flex-col items-center justify-center gap-5">
        <FlashMsg msg={flash?.m ?? null} tone={flash?.ok ? "ok" : "ko"} />
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{round.hint}</p>
        <p className="font-display text-5xl font-black tracking-widest sm:text-6xl" aria-live="polite">{round.q}</p>
        <div className="flex w-full max-w-xs items-center gap-2">
          <Input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value.slice(0, 16))}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Tu respuesta"
            aria-label="Respuesta en romano o arábigo"
            className="h-12 text-center text-xl font-bold uppercase"
          />
          <Button size="lg" onClick={submit} className="h-12 px-4" aria-label="Comprobar">
            <Send className="h-5 w-5" aria-hidden />
          </Button>
        </div>
      </div>
    </ArcadePanel>
  );
}

/* ============================ Faro Binario ============================ */

function randBinaryRound(): { q: string; a: string; toBin: boolean } {
  const n = Math.floor(2 + Math.random() * 62);
  if (Math.random() < 0.5) return { q: String(n), a: n.toString(2), toBin: true };
  return { q: n.toString(2), a: String(n), toBin: false };
}

export function BinaryGame({ def, onFinish, onExit }: ArcadeGameProps) {
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [round, setRound] = useState(randBinaryRound);
  const [draft, setDraft] = useState("");
  const [flash, setFlash] = useState<{ m: string; ok: boolean } | null>(null);

  useEffect(() => {
    if (lives <= 0) onFinish(score, { subtitle: `El faro parpadeó ${score} puntos a tu favor.` });
  }, [lives, onFinish, score]);

  const submit = () => {
    const v = draft.trim();
    if (!v) return;
    if (v === round.a) {
      setScore((s) => s + 25);
      sfx.correct();
      setFlash({ m: "✓ +25", ok: true });
    } else {
      setLives((l) => l - 1);
      sfx.wrong();
      setFlash({ m: `Era ${round.a}`, ok: false });
    }
    setDraft("");
    setRound(randBinaryRound());
    setTimeout(() => setFlash(null), 900);
  };

  return (
    <ArcadePanel def={def} onExit={onExit} score={score} lives={lives} accentVar="--region-fortaleza">
      <div className="relative flex h-full flex-col items-center justify-center gap-5">
        <FlashMsg msg={flash?.m ?? null} tone={flash?.ok ? "ok" : "ko"} />
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          {round.toBin ? "Convierte a binario (base 2)" : "Convierte a decimal (base 10)"}
        </p>
        <p className="numeric anim-twinkle font-display text-5xl font-black tracking-[0.2em] sm:text-6xl" aria-live="polite">
          {round.q.replace(/[01]/g, (d) => (round.toBin ? d : d))}
        </p>
        <div className="flex w-full max-w-xs items-center gap-2">
          <Input
            autoFocus
            inputMode={round.toBin ? "numeric" : "text"}
            value={draft}
            onChange={(e) => setDraft(round.toBin ? e.target.value.replace(/[^01]/g, "") : e.target.value.replace(/[^\d]/g, ""))}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder={round.toBin ? "0 1 0 1…" : "Número decimal"}
            aria-label="Respuesta binaria o decimal"
            className="numeric h-12 text-center text-xl font-bold"
          />
          <Button size="lg" onClick={submit} className="h-12 px-4" aria-label="Comprobar">
            <Send className="h-5 w-5" aria-hidden />
          </Button>
        </div>
        <p className="text-[11px] text-muted-foreground">Pista: 1·2·4·8·16·32… cada posición vale el doble.</p>
      </div>
    </ArcadePanel>
  );
}

/* ============================ Memoria de Dígitos ============================ */

export function DigitMemoryGame({ def, onFinish, onExit }: ArcadeGameProps) {
  const [len, setLen] = useState(3);
  const [num, setNum] = useState(() => String(Math.floor(100 + Math.random() * 900)));
  const [showing, setShowing] = useState(true);
  const [draft, setDraft] = useState("");
  const [score, setScore] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setShowing(false), 900 + len * 350);
    return () => clearTimeout(t);
  }, [num, len]);

  const submit = () => {
    if (!draft.trim()) return;
    if (draft.trim() === num) {
      sfx.correct(Math.min(3, len / 3));
      setScore((s) => s + len * 10);
      setLen((l) => l + 1);
    } else {
      sfx.wrong();
      onFinish(score + (draft.trim() === num ? 0 : 0), { subtitle: `Recordaste ${len - 1} dígitos seguidos. La cifra era ${num}.` });
      return;
    }
    setDraft("");
    setNum(String(Math.floor(Math.random() * Math.pow(10, len + 1))).padStart(len + 1, "1"));
    setShowing(true);
  };

  return (
    <ArcadePanel def={def} onExit={onExit} score={score} accentVar="--region-observatorio">
      <div className="flex h-full flex-col items-center justify-center gap-5">
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          {showing ? `Memoriza… (${len} dígitos)` : "Escribe lo que viste"}
        </p>
        <p
          className={cn(
            "numeric font-display text-6xl font-black tracking-[0.25em] transition-all duration-300",
            showing ? "opacity-100 scale-100" : "opacity-0 scale-95",
          )}
          aria-live="polite"
        >
          {num}
        </p>
        {!showing && (
          <div className="anim-slide-up flex w-full max-w-xs items-center gap-2">
            <Input
              autoFocus
              inputMode="numeric"
              value={draft}
              onChange={(e) => setDraft(e.target.value.replace(/\D/g, ""))}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="La cifra completa"
              aria-label="Cifra memorizada"
              className="numeric h-12 text-center text-xl font-bold"
            />
            <Button size="lg" onClick={submit} className="h-12 px-4" aria-label="Comprobar">
              <Send className="h-5 w-5" aria-hidden />
            </Button>
          </div>
        )}
        <p className="numeric text-xs text-muted-foreground">Ronda de {len} dígitos · +{len * 10} puntos</p>
      </div>
    </ArcadePanel>
  );
}

/* ============================ Pluma Veloz (mecanografía) ============================ */

const TYPING_QUOTES = [
  "La palabras son como semillas: caen, esperan y un día florecen.",
  "Escribir es la manera más lenta de pensar y la más profunda.",
  "El mar no pide permiso para escribir en la orilla.",
  "Cada lengua es un archipiélago de mundos posibles.",
  "Leer es viajar sin mover los pies del suelo.",
  "La ortografía es la cortesía de la escritura.",
  "Quien bien escribe, dos veces piensa.",
  "Las metáforas son puentes entre islas lejanas.",
  "Un acento mal puesto cambia el rumbo de la frase.",
  "La gramática es el mapa; el estilo, la brújula.",
];

export function TypingGame({ def, onFinish, onExit }: ArcadeGameProps) {
  const [started, setStarted] = useState(false);
  const [text] = useState(() => TYPING_QUOTES[Math.floor(Math.random() * TYPING_QUOTES.length)]);
  const [typed, setTyped] = useState("");
  const t0 = useRef(0);
  const [elapsed, setElapsed] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useInterval(() => setElapsed((performance.now() - t0.current) / 1000), started ? 100 : null);

  const done = typed.length >= text.length;
  useEffect(() => {
    if (done && started) {
      const minutes = Math.max(0.2, (performance.now() - t0.current) / 60000);
      const wpm = Math.round((text.split(" ").length / minutes) * 60);
      const errors = [...typed].filter((c, i) => c !== text[i]).length;
      const accuracy = Math.max(0, 100 - (errors / text.length) * 100);
      const score = Math.max(5, Math.round(wpm * 1.5 + accuracy * 0.8));
      sfx.sessionWin();
      onFinish(score, { subtitle: `${wpm} palabras/min · ${Math.round(accuracy)}% de precisión` });
    }
  }, [done, started]);  

  const correctSoFar = (i: number) => typed[i] === text[i];

  return (
    <ArcadePanel def={def} onExit={onExit} accentVar="--region-bosque">
      <div className="flex h-full flex-col items-center justify-center gap-4" onClick={() => inputRef.current?.focus()}>
        {!started ? (
          <>
            <p className="text-center text-sm text-muted-foreground">
              Copia la frase lo más rápido y limpio que puedas. ¡Empieza a escribir y el reloj corre!
            </p>
            <Button className="font-bold" onClick={() => { setStarted(true); t0.current = performance.now(); inputRef.current?.focus(); }}>
              Empezar
            </Button>
          </>
        ) : (
          <>
            <p className="numeric text-2xl font-black tabular-nums" aria-live="off">{elapsed.toFixed(1)}s</p>
            <p className="max-w-lg text-center text-xl leading-relaxed tracking-wide">
              {text.split("").map((ch, i) => (
                <span
                  key={i}
                  className={cn(
                    "border-b-2",
                    i < typed.length
                      ? correctSoFar(i)
                        ? "border-transparent text-primary"
                        : "border-[--region-torre] text-[--region-torre] line-through"
                      : "border-border/60 text-muted-foreground/70",
                  )}
                >
                  {ch}
                </span>
              ))}
            </p>
            <Input
              ref={inputRef}
              value={typed}
              onChange={(e) => setTyped(e.target.value.slice(0, text.length))}
              aria-label="Frase a copiar"
              className="h-12 text-center text-base"
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
            />
            <p className="numeric text-[11px] text-muted-foreground">
              {typed.length}/{text.length} caracteres · los fallos restan precisión
            </p>
          </>
        )}
      </div>
    </ArcadePanel>
  );
}

/* ============================ Anagramas del Ancla ============================ */

const ANAGRAM_WORDS = [
  "murciélago", "estrella", "archipiélago", "brújula", "farolero", "marea", "timonel",
  "bitácora", "horizonte", "escollo", "velamen", "naufragio", "calar", "puerto",
  "atracar", "rumbo", "saloma", "espuma", "orilla", "cantil", "dinguir", "zarpar",
  "mastelerío", "copeo", "entena", "bordada", "lancha", "escotilla", "botalón", "empopada",
];

function scrambleWord(w: string): string {
  let out = w;
  let guard = 0;
  while (out === w && guard++ < 20) {
    out = shuffle(w.split("")).join("");
  }
  return out;
}

export function AnagramGame({ def, onFinish, onExit }: ArcadeGameProps) {
  const [target, setTarget] = useState(() => ANAGRAM_WORDS[Math.floor(Math.random() * ANAGRAM_WORDS.length)]);
  const [draft, setDraft] = useState("");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [flash, setFlash] = useState<{ m: string; ok: boolean } | null>(null);
  // Ronda nueva = cuenta atrás nueva (el propio fin de cuenta dispara la
  // transición desde un callback, no desde un efecto sincrónico).
  const [roundKey, setRoundKey] = useState(0);

  const puzzle = useMemo(() => scrambleWord(target), [target]);
  const timeLeft = useCountdown(
    25,
    lives > 0,
    () => {
      sfx.wrong();
      setFlash({ m: `Era «${target}»`, ok: false });
      setLives((l) => l - 1);
      setTarget(ANAGRAM_WORDS[Math.floor(Math.random() * ANAGRAM_WORDS.length)]);
      setRoundKey((k) => k + 1);
      setTimeout(() => setFlash(null), 1200);
    },
    roundKey,
  );

  useEffect(() => {
    if (lives <= 0) onFinish(score, { subtitle: "La marea se llevó tres palabras." });
  }, [lives, onFinish, score]);

  const submit = () => {
    if (!draft.trim()) return;
    if (draft.trim().toLowerCase() === target) {
      const gained = 15 + timeLeft;
      setScore((s) => s + gained);
      sfx.correct();
      setFlash({ m: `+${gained}`, ok: true });
      setTarget(ANAGRAM_WORDS[Math.floor(Math.random() * ANAGRAM_WORDS.length)]);
      setRoundKey((k) => k + 1);
    } else {
      sfx.wrong(true);
      setFlash({ m: "Casi… intenta de nuevo", ok: false });
    }
    setDraft("");
    setTimeout(() => setFlash(null), 900);
  };

  return (
    <ArcadePanel def={def} onExit={onExit} score={score} lives={lives} timeLeft={timeLeft} timeMax={25} accentVar="--region-puerto">
      <div className="relative flex h-full flex-col items-center justify-center gap-5">
        <FlashMsg msg={flash?.m ?? null} tone={flash?.ok ? "ok" : "ko"} />
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Ordena las letras</p>
        <p className="font-display anim-sway select-none text-3xl font-black uppercase tracking-[0.3em] sm:text-4xl" aria-live="polite">
          {puzzle}
        </p>
        <div className="flex w-full max-w-xs items-center gap-2">
          <Input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="La palabra escondida"
            aria-label="Palabra ordenada"
            className="h-12 text-center text-lg font-bold lowercase"
          />
          <Button size="lg" onClick={submit} className="h-12 px-4" aria-label="Comprobar">
            <Send className="h-5 w-5" aria-hidden />
          </Button>
        </div>
        <p className="text-[11px] text-muted-foreground">{target.length} letras · del léxico marinero</p>
      </div>
    </ArcadePanel>
  );
}

/* ============================ Ahorcado de la Fauna ============================ */

const FAUNA: { w: string; hint: string }[] = [
  { w: "delfín", hint: "Salta en bandadas junto al barco" },
  { w: "gaviota", hint: "Reina del muelle al amanecer" },
  { w: "tortuga", hint: "Nadadora milenaria del archipiélago" },
  { w: "cangrejo", hint: "Camina de lado por la orilla" },
  { w: "ballena", hint: "La cantora del mar profundo" },
  { w: "pulpo", hint: "Ocho brazos y mucha tinta" },
  { w: "medusa", hint: "Paraguas transparente y pican mucho" },
  { w: "foca", hint: "Descansa en las rocas del norte" },
  { w: "atún", hint: "Veloz plateado del open sea" },
  { w: "albatros", hint: "El viajero de las alas largas" },
  { w: "erizo", hint: "Pinchos negros entre las rocas" },
  { w: "estrella de mar", hint: "Cinco brazos en la piscina natural" },
];

const MAX_ERR = 7;

/** Vocales con tilde → vocal base (la ñ sigue siendo ñ). */
const VOWEL_BASE: Record<string, string> = { á: "a", é: "e", í: "i", ó: "o", ú: "u", ü: "u" };
const baseOf = (c: string) => VOWEL_BASE[c] ?? c;

export function HangmanGame({ def, onFinish, onExit }: ArcadeGameProps) {
  const [round, setRound] = useState(() => FAUNA[Math.floor(Math.random() * FAUNA.length)]);
  const [guessed, setGuessed] = useState<string[]>([]);
  const [errors, setErrors] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);

  const letters = useMemo(() => "abcdefghijklmnñopqrstuvwxyz".split(""), []);

  const won = round.w.split("").every((c) => c === " " || guessed.includes(baseOf(c)));
  const lost = errors >= MAX_ERR;

  const guess = (letter: string) => {
    if (guessed.includes(letter) || won || lost) return;
    const nextGuessed = [...guessed, letter];
    setGuessed(nextGuessed);
    if (round.w.split("").some((c) => baseOf(c) === letter)) {
      sfx.correct(1);
      // ¿Palabra completa? La victoria se celebra desde el propio evento.
      const nowWon = round.w.split("").every((c) => c === " " || nextGuessed.includes(baseOf(c)));
      if (nowWon) {
        const gained = 40 - errors * 4 + streak * 5;
        setScore((s) => s + Math.max(10, gained));
        setStreak((s) => s + 1);
        sfx.sessionWin();
        setTimeout(() => {
          setRound(FAUNA[Math.floor(Math.random() * FAUNA.length)]);
          setGuessed([]);
          setErrors(0);
        }, 1300);
      }
    } else {
      sfx.wrong(true);
      const nextErrors = errors + 1;
      setErrors(nextErrors);
      if (nextErrors >= MAX_ERR) {
        sfx.sessionLose();
        setTimeout(() => {
          if (streak === 0 && score === 0) {
            onFinish(Math.max(5, score), { subtitle: `La palabra era «${round.w}».` });
          } else {
            onFinish(score, { subtitle: `Racha de ${streak} animales. La última era «${round.w}».` });
          }
        }, 1300);
      }
    }
  };

  return (
    <ArcadePanel def={def} onExit={onExit} score={score} lives={MAX_ERR - errors} livesMax={MAX_ERR} accentVar="--region-bosque">
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          Pista: {round.hint}
        </p>
        <p className="font-display flex flex-wrap justify-center gap-x-2 text-4xl font-black tracking-widest" aria-live="polite">
          {round.w.split("").map((c, i) =>
            c === " " ? (
              <span key={i} className="w-6" />
            ) : guessed.includes(baseOf(c)) ? (
              <span key={i} className="anim-pop text-primary">{c}</span>
            ) : (
              <span key={i} className="text-muted-foreground/40">_</span>
            ),
          )}
        </p>
        <div className="grid max-w-md grid-cols-9 gap-1">
          {letters.map((l) => {
            const hit = guessed.includes(l);
            const good = hit && round.w.split("").some((c) => baseOf(c) === l);
            return (
              <button
                key={l}
                onClick={() => guess(l)}
                disabled={hit || won || lost}
                aria-label={`Letra ${l}`}
                className={cn(
                  "tap-target flex h-9 w-9 items-center justify-center rounded-lg border text-sm font-bold uppercase transition active:scale-90",
                  good ? "gloss border-primary bg-primary/20 text-primary" : hit ? "border-transparent bg-muted text-muted-foreground/40 line-through" : "border-border bg-card hover:border-primary/50",
                )}
              >
                {l}
              </button>
            );
          })}
        </div>
        <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Lightbulb className="h-3.5 w-3.5" aria-hidden /> {MAX_ERR - errors} fallos restantes · racha {streak}
        </p>
      </div>
    </ArcadePanel>
  );
}
