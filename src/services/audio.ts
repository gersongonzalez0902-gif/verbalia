/**
 * Servicio de sonido · Sintetizado con WebAudio (sin ficheros, sin descargas).
 * El AudioContext se crea con el primer gesto del usuario (política de
 * navegadores) y se respeta el ajuste de sonido de VerbalIA.
 */

let ctx: AudioContext | null = null;
let enabled = true;

export function setSoundEnabled(value: boolean) {
  enabled = value;
}

function ensureCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!ctx) {
      const AudioCtor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtor) return null;
      ctx = new AudioCtor();
    }
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(freq: number, start: number, duration: number, volume = 0.09, type: OscillatorType = "sine") {
  const ac = ensureCtx();
  if (!ac) return;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  const t = ac.currentTime + start;
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(volume, t + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  osc.connect(gain).connect(ac.destination);
  osc.start(t);
  osc.stop(t + duration + 0.05);
}

export const sfx = {
  correct() {
    if (!enabled) return;
    tone(659, 0, 0.12);
    tone(880, 0.09, 0.16);
  },
  wrong() {
    if (!enabled) return;
    tone(196, 0, 0.22, 0.07, "triangle");
  },
  click() {
    if (!enabled) return;
    tone(440, 0, 0.05, 0.04, "square");
  },
  levelUp() {
    if (!enabled) return;
    [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.09, 0.22));
  },
  achievement() {
    if (!enabled) return;
    tone(880, 0, 0.15);
    tone(1319, 0.12, 0.25);
  },
  combo(level: number) {
    if (!enabled) return;
    tone(500 + Math.min(level, 8) * 60, 0, 0.08, 0.05);
  },
};

/* ============ Voz: síntesis disponible en el navegador ============ */

/** ¿Soporta este navegador síntesis de voz en español? */
export function ttsAvailable(): boolean {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return false;
  return true;
}

/**
 * Lee un texto en voz alta (es-ES) si el navegador lo permite.
 * Devuelve false si no está disponible: la UI debe ofrecer siempre
 * la alternativa visual.
 */
export function speak(text: string): boolean {
  if (!ttsAvailable()) return false;
  try {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "es-ES";
    utter.rate = 0.95;
    window.speechSynthesis.speak(utter);
    return true;
  } catch {
    return false;
  }
}
