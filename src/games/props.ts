import type { SrsWord, Exercise } from "@/types";

/** Tipos de props que reciben los componentes de minijuego. */
export type useGameProps<T> = {
  item: T;
  onAnswer: (payload: {
    correct: boolean | null;
    grade?: "again" | "hard" | "good" | "easy";
    userAnswer: string;
    correctAnswer: string;
  }) => void;
  disabled: boolean;
};

export type ExerciseGameProps<E extends Exercise> = useGameProps<E>;
export type SrsGameProps = useGameProps<SrsWord>;
