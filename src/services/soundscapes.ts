"use client";

/**
 * Paisajes sonoros del Archipiélago · VERBALIA (Etapa 4).
 * ---------------------------------------------------------------
 * Cuatro ambientes sintetizados con WebAudio a partir de ruido
 * filtrado: no descargan nada, no guardan nada y suenan junto al
 * juego cuando el navegante lo pide. Un único paisaje a la vez.
 *
 * - lluvia: ruido blanco agudo y constante con vaivén de intensidad.
 * - olas: ruido grave con una marea lenta de 12 segundos.
 * - chimenea: rumor grave + chispazos aleatorios (crepitar).
 * - noche: rumor muy tenue con grillos que cantan a intervalos.
 */

export type SoundscapeId = "lluvia" | "olas" | "chimenea" | "noche";

export const SOUNDSCAPES: { id: SoundscapeId; name: string; emoji: string; description: string }[] = [
  { id: "lluvia", name: "Lluvia en la biblioteca", emoji: "🌧️", description: "Chaparrón manso sobre el tejado de cristal." },
  { id: "olas", name: "Marea del puerto", emoji: "🌊", description: "Olas lentas contra el malecón del faro." },
  { id: "chimenea", name: "Chimenea de la Forja", emoji: "🔥", description: "Brasa y crepitar del fuego del yunque." },
  { id: "noche", name: "Noche del Observatorio", emoji: "🌙", description: "Rumor tenue y grillos tras la cúpula." },
];

interface ScapesRuntime {
  ctx: AudioContext | null;
  master: GainNode | null;
  nodes: AudioNode[];
  timers: ReturnType<typeof setTimeout>[];
  id: SoundscapeId | null;
}

const rt: ScapesRuntime = { ctx: null, master: null, nodes: [], timers: [], id: null };

function ensureCtx(): AudioContext | null {
  try {
    if (typeof window === "undefined") return null;
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    if (!rt.ctx) rt.ctx = new Ctor();
    if (rt.ctx.state === "suspended") void rt.ctx.resume();
    return rt.ctx;
  } catch {
    return null;
  }
}

/** Buffer de ruido blanco de 2 s (se reproduce en bucle). */
let noiseBuffer: AudioBuffer | null = null;
function getNoise(ctx: AudioContext): AudioBuffer {
  if (noiseBuffer && noiseBuffer.sampleRate === ctx.sampleRate) return noiseBuffer;
  const len = ctx.sampleRate * 2;
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  noiseBuffer = buf;
  return buf;
}

/** Cadena de un bucle de ruido con filtro. */
function noiseLoop(ctx: AudioContext, dest: AudioNode, filter: BiquadFilterNode, gain: number): GainNode {
  const src = ctx.createBufferSource();
  src.buffer = getNoise(ctx);
  src.loop = true;
  const g = ctx.createGain();
  g.gain.value = gain;
  src.connect(filter).connect(g).connect(dest);
  src.start();
  rt.nodes.push(src, filter, g);
  return g;
}

function stopAll() {
  for (const t of rt.timers) clearTimeout(t);
  rt.timers = [];
  for (const n of rt.nodes) {
    try {
      (n as AudioScheduledSourceNode).stop?.();
    } catch {
      /* ya parado */
    }
    try {
      n.disconnect();
    } catch {
      /* ya desconectado */
    }
  }
  rt.nodes = [];
  if (rt.master) {
    try {
      rt.master.gain.setTargetAtTime(0, rt.ctx?.currentTime ?? 0, 0.15);
    } catch {
      /* noop */
    }
    const m = rt.master;
    setTimeout(() => {
      try {
        m.disconnect();
      } catch {
        /* noop */
      }
    }, 400);
    rt.master = null;
  }
  rt.id = null;
}

/** Reproduce un paisaje sonoro (detiene el anterior). */
export function playSoundscape(id: SoundscapeId, volume = 0.6): void {
  stopAll();
  const ctx = ensureCtx();
  if (!ctx) return;
  rt.id = id;

  const master = ctx.createGain();
  master.gain.value = 0;
  master.gain.setTargetAtTime(Math.min(1, volume), ctx.currentTime, 0.4);
  rt.master = master;

  if (id === "lluvia") {
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 900;
    const bp = ctx.createBiquadFilter();
    bp.type = "peaking";
    bp.frequency.value = 2400;
    bp.gain.value = 6;
    const g = noiseLoop(ctx, master, hp, 0.22);
    g.connect(bp);
    // Vaivén de intensidad: la lluvia respira.
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 0.07;
    lfoGain.gain.value = 0.05;
    lfo.connect(lfoGain).connect(g.gain);
    lfo.start();
    rt.nodes.push(lfo, lfoGain);
  } else if (id === "olas") {
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 420;
    const g = noiseLoop(ctx, master, lp, 0.4);
    // Marea lenta: 12 s de subida y bajada.
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 1 / 12;
    lfoGain.gain.value = 0.3;
    lfo.connect(lfoGain).connect(g.gain);
    lfo.start();
    rt.nodes.push(lfo, lfoGain);
  } else if (id === "chimenea") {
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 300;
    noiseLoop(ctx, master, lp, 0.5);
    // Crepitar: chispazos aleatorios agudos.
    const crackle = () => {
      if (rt.id !== "chimenea") return;
      const src = ctx.createBufferSource();
      src.buffer = getNoise(ctx);
      const bp = ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.value = 1800 + Math.random() * 2600;
      bp.Q.value = 7;
      const g = ctx.createGain();
      const t = ctx.currentTime;
      const peak = 0.05 + Math.random() * 0.09;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(peak, t + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0005, t + 0.09 + Math.random() * 0.08);
      src.connect(bp).connect(g).connect(master);
      src.start(t);
      src.stop(t + 0.3);
      rt.timers.push(setTimeout(crackle, 90 + Math.random() * 420));
    };
    crackle();
  } else if (id === "noche") {
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 200;
    noiseLoop(ctx, master, lp, 0.22); // rumor tenue
    // Grillos: ráfagas de chirridos a intervalos irregulares.
    const cricket = () => {
      if (rt.id !== "noche") return;
      const osc = ctx.createOscillator();
      osc.type = "triangle";
      osc.frequency.value = 4300 + Math.random() * 500;
      const g = ctx.createGain();
      const t = ctx.currentTime;
      g.gain.setValueAtTime(0, t);
      for (let i = 0; i < 5; i++) {
        g.gain.setValueAtTime(0.016, t + i * 0.09);
        g.gain.setValueAtTime(0.0, t + i * 0.09 + 0.05);
      }
      osc.connect(g).connect(master);
      osc.start(t);
      osc.stop(t + 0.5);
      rt.timers.push(setTimeout(cricket, 700 + Math.random() * 2400));
    };
    cricket();
  }
}

/** Detiene el paisaje sonoro actual. */
export function stopSoundscape(): void {
  stopAll();
}

export function soundscapePlaying(): SoundscapeId | null {
  return rt.id;
}

/** Ajusta el volumen del paisaje en vivo. */
export function setSoundscapeVolume(volume: number): void {
  if (!rt.master || !rt.ctx) return;
  try {
    rt.master.gain.setTargetAtTime(Math.min(1, Math.max(0, volume)), rt.ctx.currentTime, 0.1);
  } catch {
    /* noop */
  }
}
