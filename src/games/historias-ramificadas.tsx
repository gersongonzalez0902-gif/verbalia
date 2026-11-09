"use client";

/**
 * Historias Ramificadas (Torre) · Explorar decisiones libres y,
 * al llegar a un final, responder la pregunta de comprensión.
 * Las decisiones nunca se penalizan: el valor está en el recorrido.
 */

import { useState } from "react";
import type { HistoriasExercise, MitosExercise } from "@/types";
import { checkOptionIndex } from "@/engine/validation";
import { sfx } from "@/services/audio";
import { Button } from "@/components/ui/button";
import { GitBranch, MapPin } from "lucide-react";
import { useGameProps } from "./props";
import { OptionButton } from "./common";

interface Step {
  nodeId: string;
  choiceLabel?: string;
  feedback?: string;
}

/** Historias Ramificadas y Mitos comparten motor: cualquier relato
 *  ramificado con pregunta final pasa por aquí. */
export type StoryExercise = HistoriasExercise | MitosExercise;

export function HistoriasRamificadas(props: useGameProps<StoryExercise>) {
  const { item, onAnswer, disabled } = props;
  const [nodeIndex, setNodeIndex] = useState(item.start);
  const [trail, setTrail] = useState<Step[]>([{ nodeId: item.nodes[item.start].id }]);
  const [pendingFeedback, setPendingFeedback] = useState<string | null>(null);
  const [phase, setPhase] = useState<"historia" | "pregunta">("historia");
  const [chosen, setChosen] = useState<number | null>(null);

  const node = item.nodes[nodeIndex];

  const choose = (choiceIdx: number) => {
    if (disabled || phase !== "historia") return;
    // Cada decisión pasa una página de la historia.
    sfx.page();
    const choice = node.choices[choiceIdx];
    setTrail((t) => [
      ...t,
      { nodeId: choice.next >= 0 ? item.nodes[choice.next].id : "fin", choiceLabel: choice.label },
    ]);
    setPendingFeedback(choice.feedback ?? null);
    if (choice.next < 0) {
      setPhase("pregunta");
    } else {
      setNodeIndex(choice.next);
    }
  };

  const answer = (i: number) => {
    if (disabled || chosen !== null) return;
    sfx.tap();
    const v = checkOptionIndex(item, i);
    setChosen(i);
    const route = trail
      .slice(1)
      .map((s) => s.choiceLabel)
      .filter(Boolean)
      .join(" → ");
    onAnswer({
      correct: v.correct,
      userAnswer: `${route ? `Ruta: ${route} · ` : ""}Elegí: «${v.userAnswer}»`,
      correctAnswer: v.correctAnswer,
    });
  };

  const answered = chosen !== null;

  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-5">
      {/* Cabecera de la historia */}
      <div className="flex w-full flex-col items-start gap-1.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-primary">
          <GitBranch className="h-5 w-5 shrink-0" aria-hidden />
          <p className="font-display text-lg font-bold">{item.title}</p>
        </div>
        <p className="numeric flex items-center gap-2 text-xs font-bold text-muted-foreground" aria-label={`Paso ${trail.length} de la historia`}>
          {"origin" in item && (
            <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-secondary-foreground">
              {item.origin}
            </span>
          )}
          <MapPin className="h-3.5 w-3.5" aria-hidden />
          {trail.length}
        </p>
      </div>

      {phase === "historia" ? (
        <>
          {/* Narración */}
          <div className="paper-texture anim-slide-up w-full rounded-3xl border-2 border-border bg-card p-6 shadow-sm" aria-live="polite">
            <p className="text-base leading-relaxed sm:text-lg">{node.text}</p>
          </div>

          {/* Feedback de la decisión anterior */}
          {pendingFeedback && (
            <p className="anim-pop w-full rounded-2xl bg-secondary px-4 py-3 text-sm italic leading-relaxed text-secondary-foreground" role="status">
              {pendingFeedback}
            </p>
          )}

          {/* Decisiones */}
          <div className="flex w-full flex-col gap-2.5">
            {node.choices.map((c, i) => (
              <Button
                key={`${node.id}-${i}`}
                size="lg"
                variant="outline"
                className="h-auto justify-start whitespace-normal border-2 py-3.5 text-left font-semibold hover:-translate-y-0.5 hover:border-primary/70 hover:shadow-md"
                onClick={() => choose(i)}
                disabled={disabled}
              >
                <span className="numeric mr-3 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-black text-primary-foreground" aria-hidden>
                  {i + 1}
                </span>
                {c.label}
              </Button>
            ))}
          </div>
        </>
      ) : (
        <div className="anim-slide-up flex w-full flex-col items-center gap-4">
          {pendingFeedback && (
            <p className="w-full rounded-2xl bg-secondary px-4 py-3 text-sm italic leading-relaxed text-secondary-foreground" role="status">
              {pendingFeedback}
            </p>
          )}
          <p className="text-center font-display text-lg font-bold">— Fin de la historia —</p>
          <p className="text-center text-base font-semibold">{item.question}</p>
          <div className="grid w-full grid-cols-1 gap-2.5 sm:grid-cols-2">
            {item.options.map((opt, i) => (
              <OptionButton
                key={`${item.id}-q-${i}`}
                index={i + 1}
                label={<span className="text-sm leading-snug sm:text-base">{opt}</span>}
                state={
                  answered
                    ? i === item.answerIndex
                      ? "correct"
                      : i === chosen
                        ? "wrong"
                        : "idle"
                    : "idle"
                }
                onClick={() => answer(i)}
                disabled={disabled || answered}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
