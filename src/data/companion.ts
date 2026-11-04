/**
 * Tinta, la lechuza bibliotecaria · Repertorio de intervenciones breves.
 * Solo aparece en momentos clave y nunca interrumpe una partida.
 */

export const TINTA = {
  name: "Tinta",
  role: "lechuza bibliotecaria del Archipiélago",
};

export interface TintaLine {
  id: string;
  text: string;
}

/** Bienvenida en el onboarding (paso a paso). */
export const TINTA_ONBOARDING: Record<string, string> = {
  welcome:
    "¡Bienvenido al Archipiélago de las Palabras! Yo soy Tinta, guardiana de este mapa. Aterrizar aquí ya te hace explorador.",
  name: "Los mapas antiguos dicen que cada explorador merece un nombre. ¿Cómo te llamamos en la bitácora?",
  avatar: "Elige la compañía de tu viaje. Yo ya tengo plumas de sobra.",
  goal: "Todo viaje tiene rumbo. El tuyo nos ayudará a recomendarte sesiones.",
  experience: "Sin trampas: no pasa nada por empezar desde la orilla. Adaptaremos la dificultad a tu ritmo.",
  theme: "Las lechuzas preferimos la noche, pero tú eliges. Podrás cambiarlo siempre en Ajustes.",
  placement:
    "Es hora de la prueba de faro: ocho preguntas para calibrar tu nivel. Si prefieres, sáltala y empezamos suave.",
};

/** Saludos del dashboard según el estado del jugador. */
export const TINTA_GREETINGS: {
  id: string;
  condition: (ctx: { streak: number; xpToday: number; dailyGoal: number; hasErrors: number; dueCards: number }) => boolean;
  text: (ctx: { name: string; streak: number; dueCards: number }) => string;
}[] = [
  {
    id: "g-goal-done",
    condition: (c) => c.xpToday >= c.dailyGoal,
    text: () => "¡Objetivo diario cumplido! El Archipiélago te da las buenas noches… o las buenas tardes. Tú mandas.",
  },
  {
    id: "g-due-cards",
    condition: (c) => c.dueCards >= 5,
    text: (c) => `El jardín tiene ${c.dueCards} tarjetas esperando riego. Las palabras son plantas: responden a la constancia.`,
  },
  {
    id: "g-errors",
    condition: (c) => c.hasErrors >= 5,
    text: () => "Tu cuaderno de errores se está llenando. No es mala señal: es exactamente ahí donde más se aprende.",
  },
  {
    id: "g-streak",
    condition: (c) => c.streak >= 3,
    text: (c) => `Racha de ${c.streak} días, ${c.name}. Las mareas respetan tu constancia.`,
  },
  {
    id: "g-warm",
    condition: () => true,
    text: (c) => `Hola de nuevo, ${c.name}. Una sesión de tres minutos basta para que el mapa se mueva un poco.`,
  },
];

/** Comentarios de Tinta en la pantalla de resultados. */
export function tintaResultQuip(accuracy: number | null, mode: string): string {
  if (mode === "review") {
    return accuracy !== null && accuracy >= 0.8
      ? "Los errores de hoy son los aciertos de mañana. Buen trabajo de corrección."
      : "Repasar duele menos que repetir el error. Vuelve al cuaderno cuando quieras.";
  }
  if (accuracy === null) {
    return "El jardín ya está ajustando el calendario de cada tarjeta. Volverá a preguntarte justo a tiempo.";
  }
  if (accuracy >= 0.9) return "Impecable. El faro principal te ha visto desde aquí.";
  if (accuracy >= 0.7) return "Buen pulso. Con un poco más de ritmo, la región entera será tuya.";
  if (accuracy >= 0.5) return "Mitad y mitad: el terreno exacto donde más se aprende. Toca reintentar lo fallado.";
  return "Día de marea baja. Respira, lee las explicaciones y vuelve: el Archipiélago no se mueve de sitio.";
}

/** Consejos puntuales (se muestran como máximo una vez al día). */
export const TINTA_TIPS: TintaLine[] = [
  { id: "tip-srs", text: "Truco de bibliotecaria: en el jardín, sé sincero al valorarte. Fin de cuento." },
  { id: "tip-combo", text: "Los combos suben el XP, pero un error no rompe nada importante. Arriesgar es gratis aquí." },
  { id: "tip-errors", text: "Todo lo que fallas va a tu cuaderno de errores. Reintentarlo vale XP casi completo." },
  { id: "tip-offline", text: "¿Sabías que VerbalIA funciona sin conexión? El barco sigue navegando sin internet." },
  { id: "tip-streak", text: "La racha tiene escudos: si un día no puedes, la misión semanal te protege. Sin ansiedad." },
  { id: "tip-dictado", text: "En el Dictado del Faro puedes escuchar tres veces. La segunda escucha oye mejor que la primera: bosteza menos." },
  { id: "tip-minuto", text: "En el Reto del Minuto no se borra ni se juzga: después llegará tu propia revisión con criterios. Primero, fluye." },
  { id: "tip-matices", text: "En los Ecos del Puerto, la puntuación y las muletillas delatan la intención antes que las palabras." },
  { id: "tip-night", text: "¿Juegas de noche? Activa el modo lectura nocturna en Ajustes: el Archipiélago baja la luz por ti." },
];
