"use client";

/**
 * Quiz Relámpago · motor genérico del Salón (Mega-actualización 6).
 * ----------------------------------------------------------------
 * Un solo motor de pregunta rápida (60 s, combos, niveles) alimenta
 * dos docenas de juegos: cada juego aporta su generador de preguntas
 * (banco temático o procedural) y su acento de color. Las preguntas
 * se eligen sin repetir hasta agotar el banco (barajado por ronda).
 */

import { useCallback, useMemo, useState } from "react";
import { sfx } from "@/services/audio";
import { ArcadePanel, BigChoice, ComboBadge, FlashMsg, useCountdown, shuffle, type ArcadeGameProps } from "./shared";
import type { BlitzItem } from "./blitz-banks";

export interface BlitzConfig {
  /** Genera la siguiente pregunta según el nivel (1-8). */
  gen: (level: number) => BlitzItem;
  /** Variable CSS de acento regional. */
  accentVar: string;
  /** Pista breve bajo la pregunta (opcional). */
  hint?: string;
}

export function QuizBlitz({ def, onFinish, onExit, config }: ArcadeGameProps & { config: BlitzConfig }) {
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [level, setLevel] = useState(1);
  const [round, setRound] = useState(0);
  const [flash, setFlash] = useState<{ m: string; ok: boolean } | null>(null);
  const [answered, setAnswered] = useState<number | null>(null);
  const time = useCountdown(60, true, () => onFinish(score));

  // Pregunta actual, barajada de opciones estable por ronda.
  const item = useMemo(() => {
    const it = config.gen(level);
    const indexed = it.options.map((label, i) => ({ label, correct: i === it.correct }));
    const mixed = shuffle(indexed);
    return { ...it, options: mixed, answerAt: mixed.findIndex((o) => o.correct) };
  }, [round, level, config]);

  const nextRound = useCallback(() => {
    setAnswered(null);
    setFlash(null);
    setRound((r) => r + 1);
  }, []);

  const answer = (i: number) => {
    if (answered !== null) return;
    setAnswered(i);
    const ok = i === item.answerAt;
    if (ok) {
      const gained = 10 + combo * 2 + level;
      setScore((s) => s + gained);
      setCombo((c) => {
        const nc = c + 1;
        if (nc % 5 === 0) { sfx.combo(Math.min(4, nc / 5)); setLevel((l) => Math.min(8, l + 1)); }
        return nc;
      });
      sfx.correct(Math.min(3, combo / 3));
      setFlash({ m: `+${gained}`, ok: true });
    } else {
      setCombo(0);
      sfx.wrong(true);
      setFlash({ m: `Era: ${item.options[item.answerAt].label}`, ok: false });
    }
    setTimeout(nextRound, 850);
  };

  return (
    <ArcadePanel def={def} onExit={onExit} score={score} timeLeft={time} timeMax={60} accentVar={config.accentVar}>
      <div className="relative flex h-full flex-col items-center justify-center gap-4">
        <FlashMsg msg={flash?.m ?? null} tone={flash?.ok ? "ok" : "ko"} />
        <ComboBadge combo={combo} />
        {config.hint && <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{config.hint}</p>}
        <p className="max-w-md text-center font-display text-xl font-black leading-snug sm:text-2xl" aria-live="polite">{item.q}</p>
        <div className="grid w-full max-w-lg grid-cols-1 gap-2 sm:grid-cols-2">
          {item.options.map((o, i) => (
            <BigChoice
              key={`${round}-${i}`}
              onClick={() => answer(i)}
              variant={answered === null ? "card" : i === item.answerAt ? "primary" : "ghost"}
              disabled={answered !== null}
            >
              <span className="text-sm leading-snug sm:text-base">{o.label}</span>
            </BigChoice>
          ))}
        </div>
        <p className="text-[11px] text-muted-foreground">Aciertos seguidos suben la dificultad y el combo.</p>
      </div>
    </ArcadePanel>
  );
}

/* ==================== fábrica de juegos por banco ==================== */

import {
  MEMES_BANK, SINONIMOS_BANK, ANTONIMOS_BANK, ORTOGRAFIA_BANK, GENERO_BANK, REFANES_BANK,
  COLECTIVOS_BANK, SUFIJOS_BANK, CONECTORES_BANK, CURIOSIDADES_BANK, MAYUSCULAS_BANK,
  genFracciones, genPotencias, genPorcentajes, genSeries, genUnidades, genTiempos,
  genAnalogiasNum, genSiguienteLetra, genMemoriaPalabras, genInversos, genCompras,
  genParImpar, genVocalConsonante, genCuentaLetras,
} from "./blitz-banks";

/** Generador que recorre un banco barajado (sin repetir hasta agotarlo). */
function bankGen(bank: BlitzItem[]) {
  let bag: BlitzItem[] = [];
  return (level: number): BlitzItem => {
    if (bag.length === 0) bag = shuffle(bank);
    void level;
    return bag.pop()!;
  };
}

function makeBankGame(bank: BlitzItem[], accentVar: string, hint?: string) {
  const gen = bankGen(bank);
  return function BankBlitz(props: ArcadeGameProps) {
    return <QuizBlitz {...props} config={{ gen, accentVar, hint }} />;
  };
}

function makeProceduralGame(gen: (level: number) => BlitzItem, accentVar: string, hint?: string) {
  return function ProcBlitz(props: ArcadeGameProps) {
    return <QuizBlitz {...props} config={{ gen, accentVar, hint }} />;
  };
}

/* ------- Palabras ------- */
export const MemesBlitz = makeBankGame(MEMES_BANK, "--region-biblioteca", "Traduce el registro coloquial al estándar");
export const SinonimosBlitz = makeBankGame(SINONIMOS_BANK, "--region-biblioteca");
export const AntonimosBlitz = makeBankGame(ANTONIMOS_BANK, "--region-biblioteca");
export const OrtografiaBlitz = makeBankGame(ORTOGRAFIA_BANK, "--region-torre", "Elige la escritura correcta");
export const GeneroBlitz = makeBankGame(GENERO_BANK, "--region-torre");
export const RefranesBlitz = makeBankGame(REFANES_BANK, "--region-fortaleza");
export const ColectivosBlitz = makeBankGame(COLECTIVOS_BANK, "--region-bosque");
export const SufijosBlitz = makeBankGame(SUFIJOS_BANK, "--region-ciudad");
export const ConectoresBlitz = makeBankGame(CONECTORES_BANK, "--region-ciudad");
export const MayusculasBlitz = makeBankGame(MAYUSCULAS_BANK, "--region-torre");

/* ------- Cálculo ------- */
export const FraccionesBlitz = makeProceduralGame(genFracciones, "--region-ciudad");
export const PotenciasBlitz = makeProceduralGame(genPotencias, "--region-ciudad");
export const PorcentajesBlitz = makeProceduralGame(genPorcentajes, "--region-ciudad");
export const SeriesBlitz = makeProceduralGame(genSeries, "--region-fortaleza");
export const UnidadesBlitz = makeProceduralGame(genUnidades, "--region-ciudad");
export const TiemposBlitz = makeProceduralGame(genTiempos, "--region-puerto");

/* ------- Lógica ------- */
export const CuriosidadesBlitz = makeBankGame(CURIOSIDADES_BANK, "--region-fortaleza");
export const AnalogiasNumBlitz = makeProceduralGame(genAnalogiasNum, "--region-fortaleza");
export const SiguienteLetraBlitz = makeProceduralGame(genSiguienteLetra, "--region-biblioteca");

/* ------- Memoria ------- */
export const MemoriaPalabrasBlitz = makeProceduralGame(genMemoriaPalabras, "--region-bosque");
export const InversosBlitz = makeProceduralGame(genInversos, "--region-bosque");
export const ComprasBlitz = makeProceduralGame(genCompras, "--region-bosque");

/* ------- Reflejos y atención ------- */
export const ParImparBlitz = makeProceduralGame(genParImpar, "--region-puerto");
export const VocalConsonanteBlitz = makeProceduralGame(genVocalConsonante, "--region-puerto");
export const CuentaLetrasBlitz = makeProceduralGame(genCuentaLetras, "--region-puerto");

/* ------- Tres últimos de la docena ------- */
import { genSumasEncadenadas, genMayorMenor, genLetraVecina } from "./blitz-banks";
export const SumasEncadenadasBlitz = makeProceduralGame(genSumasEncadenadas, "--region-ciudad");
export const MayorMenorBlitz = makeProceduralGame(genMayorMenor, "--region-puerto");
export const LetraVecinaBlitz = makeProceduralGame(genLetraVecina, "--region-biblioteca");
