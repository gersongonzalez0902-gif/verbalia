/**
 * Motor de audio de VERBALIA · v2
 * ---------------------------------------------------------------
 * Todo el sonido del juego se sintetiza aquí con WebAudio:
 * sin ficheros, sin descargas, sin red.
 *
 * 1) SFX: ~30 efectos de interacción (acierto, fallo, niveles,
 *    monedas de XP, naipes, etc.) con variantes para que nunca
 *    suenen igual dos veces seguidas.
 * 2) MÚSICA AMBIENTE GENERATIVA: cada escena/ región tiene su
 *    propia paleta musical (escala, tempo, timbres, textura de
 *    ruido) compuesta en tiempo real con un secuenciador por
 *    adelantado (lookahead). Al cambiar de región la música
 *    hace fundido cruzado.
 * 3) EL GRAN RELOJ EN CONTRATIEMPO: una capa de tic-tac que
 *    suena DESFASADA respecto al pulso musical (en los
 *    contratiempos, como pidió el jugador). En reposo es una
 *    presencia mínima y sugerente; en los juegos cronometrados
 *    `setTension()` la enciende, la acelera y le sube el tono
 *    hasta el clímax de los últimos segundos.
 *
 * El AudioContext se desbloquea con el primer gesto del usuario
 * (política de navegadores). Si el jugador silencia el juego,
 * el contexto se suspende y todo queda en silencio absoluto.
 */

/* ============================== ajustes ============================== */

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let musicBus: GainNode | null = null;
let sfxBus: GainNode | null = null;
let clockBus: GainNode | null = null;
let noiseBus: GainNode | null = null;

let enabled = true;
let musicVolume = 0.55;
let sfxVolume = 0.9;

let unlocked = false;
let unlockListeners: (() => void) | null = null;

/* Ruido compartido (buffer de 2 s reutilizado por todas las texturas) */
let noiseBuffer: AudioBuffer | null = null;

function ensureCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!ctx) {
      const AudioCtor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtor) return null;
      ctx = new AudioCtor();
      master = ctx.createGain();
      master.gain.value = enabled ? 0.9 : 0;
      master.connect(ctx.destination);

      musicBus = ctx.createGain();
      musicBus.gain.value = musicVolume;
      musicBus.connect(master);

      sfxBus = ctx.createGain();
      sfxBus.gain.value = sfxVolume;
      sfxBus.connect(master);

      clockBus = ctx.createGain();
      clockBus.gain.value = 0.5;
      clockBus.connect(master);

      noiseBus = ctx.createGain();
      noiseBus.gain.value = 1;
      noiseBus.connect(musicBus);

      const len = ctx.sampleRate * 2;
      noiseBuffer = ctx.createBuffer(1, len, ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    }
    if (ctx.state === "suspended" && enabled) void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

/** Desbloquea el audio en el primer gesto (tap, teclado, scroll táctil). */
export function initAudioUnlock(): void {
  if (typeof window === "undefined" || unlockListeners) return;
  const unlock = () => {
    ensureCtx();
    unlocked = true;
    if (currentScene) startScene(currentScene); // la música arranca al desbloquear
    detach();
  };
  const detach = () => {
    window.removeEventListener("pointerdown", unlock);
    window.removeEventListener("keydown", unlock);
    window.removeEventListener("touchstart", unlock);
    unlockListeners = null;
  };
  window.addEventListener("pointerdown", unlock, { once: false, passive: true });
  window.addEventListener("keydown", unlock, { once: false });
  window.addEventListener("touchstart", unlock, { once: false, passive: true });
  unlockListeners = detach;
}

export function setSoundEnabled(value: boolean) {
  enabled = value;
  const ac = ctx ?? null;
  if (ac && master) master.gain.setTargetAtTime(value ? 0.9 : 0, ac.currentTime, 0.05);
  if (!value && ac && ac.state === "running") void ac.suspend();
  if (value && ac && ac.state === "suspended") {
    void ac.resume();
    unlocked = true;
  }
}

export function setMusicVolume(v: number) {
  musicVolume = Math.min(1, Math.max(0, v));
  if (ctx && musicBus) musicBus.gain.setTargetAtTime(musicVolume, ctx.currentTime, 0.08);
}

export function setSfxVolume(v: number) {
  sfxVolume = Math.min(1, Math.max(0, v));
  if (ctx && sfxBus) sfxBus.gain.setTargetAtTime(sfxVolume, ctx.currentTime, 0.05);
}

export function isAudioUnlocked(): boolean {
  return unlocked && !!ctx && ctx.state === "running";
}

/* ============================== voces base ============================== */

function tone(
  freq: number,
  start: number,
  duration: number,
  volume = 0.09,
  type: OscillatorType = "sine",
  bus: GainNode | null = null,
  glideTo?: number,
) {
  const ac = ensureCtx();
  if (!ac || !enabled) return;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  const t = ac.currentTime + start;
  osc.frequency.setValueAtTime(freq, t);
  if (glideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(20, glideTo), t + duration);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(Math.max(volume, 0.0002), t + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  osc.connect(gain).connect(bus ?? sfxBus ?? ac.destination);
  osc.start(t);
  osc.stop(t + duration + 0.06);
}

/** Campanada tipo campana con parciales inarmónicos (para bells y éxito). */
function bell(freq: number, start: number, duration = 0.9, volume = 0.08) {
  const ac = ensureCtx();
  if (!ac || !enabled) return;
  const partials = [1, 2.76, 5.4];
  partials.forEach((p, i) => {
    tone(freq * p, start, duration / (1 + i * 0.4), volume / (i + 1.5), "sine");
  });
}

/** Ráfaga de ruido filtrada (clics, olas, viento, aplausos). */
function noiseBurst(
  start: number,
  duration: number,
  filterFreq: number,
  volume = 0.06,
  type: BiquadFilterType = "bandpass",
  q = 1,
  bus: GainNode | null = null,
) {
  const ac = ensureCtx();
  if (!ac || !enabled || !noiseBuffer) return;
  const src = ac.createBufferSource();
  src.buffer = noiseBuffer;
  src.loop = true;
  const filter = ac.createBiquadFilter();
  filter.type = type;
  filter.frequency.value = filterFreq;
  filter.Q.value = q;
  const gain = ac.createGain();
  const t = ac.currentTime + start;
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(volume, t + Math.min(0.05, duration / 3));
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  src.connect(filter).connect(gain).connect(bus ?? sfxBus ?? ac.destination);
  src.start(t, Math.random() * 1.5);
  src.stop(t + duration + 0.08);
}

/* ============================== escenas musicales ============================== */

interface SceneMusic {
  /** Nota raíz en Hz. */
  root: number;
  /** Escala en semitonos (siempre consonante). */
  scale: number[];
  /** Pulsos por minuto del pulso ambiental. */
  bpm: number;
  /** Progresión de acordes (índices sobre la escala, 3 notas cada uno). */
  chords: number[][];
  /** Probabilidad de nota de arpegio por contratiempo. */
  pluck: number;
  /** Textura de ruido de fondo. */
  texture: "wind" | "waves" | "hum" | "paper" | "crackle" | "air";
  /** Volumen de la textura (0-1). */
  textureLevel: number;
  /** Timbre del arpegio. */
  pluckType: OscillatorType;
  /** Nota más grave de apoyo cada compás. */
  bass: boolean;
}

const A = 55;
const SCENES: Record<string, SceneMusic> = {
  /* Puerto de salida: calidez pentatónica en Do, viento suave */
  home: {
    root: 261.63,
    scale: [0, 2, 4, 7, 9, 12, 14, 16],
    bpm: 52,
    chords: [
      [0, 2, 4],
      [1, 3, 5],
      [0, 2, 4],
      [2, 4, 6],
    ],
    pluck: 0.5,
    texture: "wind",
    textureLevel: 0.05,
    pluckType: "sine",
    bass: true,
  },
  /* Bosque: pentatónica menor de La, gotas de agua y hojas */
  bosque: {
    root: A * 4,
    scale: [0, 3, 5, 7, 10, 12, 15],
    bpm: 48,
    chords: [
      [0, 2, 4],
      [0, 2, 3],
      [1, 3, 5],
      [0, 2, 4],
    ],
    pluck: 0.65,
    texture: "wind",
    textureLevel: 0.07,
    pluckType: "triangle",
    bass: true,
  },
  /* Ciudad: lidio brillante de Fa, murmullo urbano */
  ciudad: {
    root: 349.23,
    scale: [0, 2, 4, 6, 7, 9, 11, 12],
    bpm: 58,
    chords: [
      [0, 2, 4],
      [3, 5, 7],
      [1, 3, 5],
      [0, 2, 4],
    ],
    pluck: 0.55,
    texture: "hum",
    textureLevel: 0.04,
    pluckType: "square",
    bass: true,
  },
  /* Fortaleza: dórico de Re, yunque apagado y brasas */
  fortaleza: {
    root: 146.83,
    scale: [0, 2, 3, 5, 7, 9, 10, 12],
    bpm: 60,
    chords: [
      [0, 2, 4],
      [3, 5, 7],
      [1, 3, 5],
      [0, 2, 4],
    ],
    pluck: 0.4,
    texture: "crackle",
    textureLevel: 0.05,
    pluckType: "triangle",
    bass: true,
  },
  /* Biblioteca: pentatónica de Mi bemol, páginas y arpas */
  biblioteca: {
    root: 311.13,
    scale: [0, 2, 4, 7, 9, 12, 14],
    bpm: 44,
    chords: [
      [0, 2, 4],
      [1, 3, 5],
      [0, 2, 4],
      [2, 4, 6],
    ],
    pluck: 0.6,
    texture: "paper",
    textureLevel: 0.03,
    pluckType: "sine",
    bass: false,
  },
  /* Puerto: pentatónica mayor de Sol, olas y campana de boya */
  puerto: {
    root: 392.0,
    scale: [0, 2, 4, 7, 9, 12],
    bpm: 50,
    chords: [
      [0, 2, 4],
      [2, 4, 5],
      [1, 3, 5],
      [0, 2, 4],
    ],
    pluck: 0.5,
    texture: "waves",
    textureLevel: 0.08,
    pluckType: "sine",
    bass: true,
  },
  /* Torre: pentatónica menor de Si, reloj protagonista */
  torre: {
    root: 246.94,
    scale: [0, 3, 5, 7, 10, 12, 14],
    bpm: 54,
    chords: [
      [0, 2, 4],
      [0, 2, 3],
      [2, 4, 6],
      [0, 2, 4],
    ],
    pluck: 0.45,
    texture: "air",
    textureLevel: 0.045,
    pluckType: "triangle",
    bass: true,
  },
  /* Resultados: fanfarria cálida, mayor y luminosa */
  results: {
    root: 293.66,
    scale: [0, 2, 4, 5, 7, 9, 11, 12, 14, 16],
    bpm: 62,
    chords: [
      [0, 2, 4],
      [4, 6, 8],
      [3, 5, 7],
      [0, 2, 4],
    ],
    pluck: 0.7,
    texture: "air",
    textureLevel: 0.03,
    pluckType: "sine",
    bass: true,
  },
  /* Mapa: pentatónica aventurera de Sol, papel de pergamino */
  map: {
    root: 196,
    scale: [0, 2, 4, 7, 9, 12, 14, 16],
    bpm: 58,
    chords: [
      [0, 2, 4],
      [2, 4, 6],
      [1, 3, 5],
      [0, 2, 4],
    ],
    pluck: 0.55,
    texture: "paper",
    textureLevel: 0.035,
    pluckType: "triangle",
    bass: true,
  },
  /* Misiones: fanfarria dorada en La, chispa de confeti */
  missions: {
    root: 220,
    scale: [0, 2, 4, 7, 9, 11, 12, 14, 16],
    bpm: 66,
    chords: [
      [0, 2, 4],
      [4, 6, 8],
      [5, 7, 9],
      [0, 2, 4],
    ],
    pluck: 0.62,
    texture: "crackle",
    textureLevel: 0.03,
    pluckType: "sine",
    bass: true,
  },
  /* Colección: jardín pentatónico en Mi, brisa entre flores */
  collection: {
    root: 164.81,
    scale: [0, 2, 4, 7, 9, 12, 14],
    bpm: 56,
    chords: [
      [0, 2, 4],
      [1, 3, 5],
      [2, 4, 6],
      [0, 2, 4],
    ],
    pluck: 0.5,
    texture: "waves",
    textureLevel: 0.04,
    pluckType: "sine",
    bass: true,
  },
  /* Cuaderno de errores: introspección en Re menor, zumbido de estudio */
  errors: {
    root: 146.83,
    scale: [0, 2, 3, 5, 7, 8, 10, 12, 14, 15],
    bpm: 50,
    chords: [
      [0, 2, 4],
      [5, 7, 9],
      [3, 5, 7],
      [0, 2, 4],
    ],
    pluck: 0.4,
    texture: "hum",
    textureLevel: 0.05,
    pluckType: "triangle",
    bass: true,
  },
  /* Estadísticas: dorian analítico en Si, aire limpio */
  stats: {
    root: 123.47,
    scale: [0, 2, 3, 5, 7, 9, 10, 12],
    bpm: 54,
    chords: [
      [0, 2, 4],
      [3, 5, 7],
      [0, 2, 4],
      [2, 4, 6],
    ],
    pluck: 0.45,
    texture: "air",
    textureLevel: 0.03,
    pluckType: "sine",
    bass: true,
  },
  /* Perfil: mixolidio brillante en Do#, viento cálido */
  profile: {
    root: 138.59,
    scale: [0, 2, 4, 5, 7, 9, 10, 12, 14, 16],
    bpm: 62,
    chords: [
      [0, 2, 4],
      [4, 6, 8],
      [0, 2, 4],
      [2, 4, 6],
    ],
    pluck: 0.5,
    texture: "wind",
    textureLevel: 0.04,
    pluckType: "sine",
    bass: true,
  },
  /* Biblioteca: eólico de páginas en La, susurro de papel */
  library: {
    root: 110,
    scale: [0, 2, 3, 5, 7, 8, 10, 12],
    bpm: 52,
    chords: [
      [0, 2, 4],
      [2, 4, 6],
      [1, 3, 5],
      [0, 2, 4],
    ],
    pluck: 0.42,
    texture: "paper",
    textureLevel: 0.05,
    pluckType: "triangle",
    bass: false,
  },
  /* Ajustes: calma diatónica en Re, marea lejana */
  settings: {
    root: 293.66,
    scale: [0, 2, 4, 7, 9, 12, 14],
    bpm: 54,
    chords: [
      [0, 2, 4],
      [1, 3, 5],
      [0, 2, 4],
      [2, 4, 6],
    ],
    pluck: 0.4,
    texture: "waves",
    textureLevel: 0.045,
    pluckType: "sine",
    bass: true,
  },
  /* Bienvenida: amanecer pentatónico en Mi, marea suave */
  welcome: {
    root: 164.81,
    scale: [0, 2, 4, 7, 9, 12, 16],
    bpm: 52,
    chords: [
      [0, 2, 4],
      [0, 2, 4],
      [1, 3, 5],
      [0, 2, 4],
    ],
    pluck: 0.5,
    texture: "waves",
    textureLevel: 0.05,
    pluckType: "sine",
    bass: true,
  },
  /* Evaluación: concentración en Sol lidio, aire de faro */
  placement: {
    root: 196,
    scale: [0, 2, 4, 6, 7, 9, 11, 12],
    bpm: 56,
    chords: [
      [0, 2, 4],
      [1, 3, 5],
      [2, 4, 6],
      [0, 2, 4],
    ],
    pluck: 0.45,
    texture: "air",
    textureLevel: 0.035,
    pluckType: "triangle",
    bass: true,
  },
  /* Estación del jugador: lo-fi cálido de Rece (la radio de la isla) */
  station: {
    root: 174.61,
    scale: [0, 3, 5, 7, 10, 12, 14, 17],
    bpm: 66,
    chords: [
      [0, 2, 4],
      [3, 4, 6],
      [1, 3, 5],
      [0, 2, 4],
    ],
    pluck: 0.7,
    texture: "crackle",
    textureLevel: 0.02,
    pluckType: "sine",
    bass: true,
  },
  /* Observatorio: lidio celeste de Mi, noche estrellada y silencio de cúpula */
  observatorio: {
    root: 329.63,
    scale: [0, 2, 4, 6, 7, 9, 11, 12, 16],
    bpm: 40,
    chords: [
      [0, 2, 4],
      [2, 4, 6],
      [1, 3, 5],
      [0, 3, 5],
    ],
    pluck: 0.55,
    texture: "air",
    textureLevel: 0.04,
    pluckType: "sine",
    bass: true,
  },
};

/* ======================= secuenciador generativo ======================= */

let currentScene: string | null = null;
let schedulerId: ReturnType<typeof setInterval> | null = null;
let nextBeatTime = 0;
let beatIndex = 0;
let barIndex = 0;
let tension = 0; // 0 reposo · 1 clímax cronometrado
let clockOn = false;
let clockTickToggle = 0;
let textureNodes: { src: AudioBufferSourceNode; gain: GainNode } | null = null;

const semitone = (root: number, s: number) => root * Math.pow(2, s / 12);

/** Funda de entrada a la escena: acorde inicial y textura. */
function startScene(sceneId: string) {
  const ac = ensureCtx();
  if (!ac || !enabled) return;
  const scene = SCENES[sceneId] ?? SCENES.home;
  currentScene = sceneId;
  // Si la escena anterior se silenció (stopSceneMusic), recupera el volumen.
  if (musicBus) musicBus.gain.setTargetAtTime(musicVolume, ac.currentTime, 0.5);
  stopTexture();
  startTexture(scene);
  // Acorde de bienvenida
  scene.chords[0].forEach((d) => padNote(semitone(scene.root, scene.scale[d]), 0.02, 6, 0.05));
  if (!schedulerId) {
    nextBeatTime = ac.currentTime + 0.1;
    beatIndex = 0;
    barIndex = 0;
    schedulerId = setInterval(scheduleAhead, 240);
  }
}

/** Cambia la música de escena con fundido. La escena ya activa no se re-inicia. */
export function setSceneMusic(sceneId: string | null) {
  if (!sceneId || sceneId === currentScene) return;
  if (!ctx || !unlocked) {
    currentScene = sceneId; // se aplicará al desbloquear
    return;
  }
  startScene(sceneId);
}

/** Silencia la escena actual con fundido (partidas sin música de menú). */
export function stopSceneMusic() {
  currentScene = null;
  stopTexture();
  if (schedulerId) {
    clearInterval(schedulerId);
    schedulerId = null;
  }
  if (!ctx) return;
  musicBus?.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.35);
}

function stopTexture() {
  if (textureNodes && ctx) {
    try {
      textureNodes.gain.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.4);
      const src = textureNodes.src;
      setTimeout(() => {
        try {
          src.stop();
        } catch {
          /* ya parado */
        }
      }, 1500);
    } catch {
      /* ignorar */
    }
    textureNodes = null;
  }
}

function startTexture(scene: SceneMusic) {
  const ac = ctx;
  if (!ac || !noiseBuffer) return;
  const src = ac.createBufferSource();
  src.buffer = noiseBuffer;
  src.loop = true;
  const filter = ac.createBiquadFilter();
  const gain = ac.createGain();
  gain.gain.value = 0.0001;
  const t = ac.currentTime;
  let lfo: OscillatorNode | null = null;
  let lfoGain: GainNode | null = null;

  switch (scene.texture) {
    case "wind":
      filter.type = "lowpass";
      filter.frequency.value = 420;
      // ráfagas lentas
      lfo = ac.createOscillator();
      lfo.frequency.value = 0.09;
      lfoGain = ac.createGain();
      lfoGain.gain.value = scene.textureLevel * 0.7;
      lfo.connect(lfoGain).connect(gain.gain);
      gain.gain.value = scene.textureLevel;
      break;
    case "waves":
      filter.type = "lowpass";
      filter.frequency.value = 300;
      lfo = ac.createOscillator();
      lfo.frequency.value = 0.07; // marea muy lenta
      lfoGain = ac.createGain();
      lfoGain.gain.value = scene.textureLevel * 0.8;
      lfo.connect(lfoGain).connect(gain.gain);
      gain.gain.value = scene.textureLevel;
      break;
    case "hum":
      filter.type = "lowpass";
      filter.frequency.value = 180;
      gain.gain.setTargetAtTime(scene.textureLevel, t, 1.2);
      break;
    case "paper":
      filter.type = "bandpass";
      filter.frequency.value = 4200;
      filter.Q.value = 0.4;
      gain.gain.setTargetAtTime(scene.textureLevel * 0.5, t, 1.5);
      break;
    case "crackle":
      filter.type = "bandpass";
      filter.frequency.value = 2600;
      filter.Q.value = 2.5;
      lfo = ac.createOscillator();
      lfo.frequency.value = 1.7;
      lfoGain = ac.createGain();
      lfoGain.gain.value = scene.textureLevel;
      lfo.connect(lfoGain).connect(gain.gain);
      gain.gain.value = scene.textureLevel * 0.3;
      break;
    case "air":
    default:
      filter.type = "lowpass";
      filter.frequency.value = 900;
      gain.gain.setTargetAtTime(scene.textureLevel, t, 1.5);
      break;
  }
  src.connect(filter).connect(gain).connect(noiseBus ?? master ?? ac.destination);
  if (lfo && lfoGain) lfo.start();
  src.start();
  textureNodes = { src, gain };
}

/** Colchón armónico suave (pad) con ataque largo y filtro móvil. */
function padNote(freq: number, start: number, duration: number, volume: number) {
  const ac = ctx;
  if (!ac || !enabled) return;
  const t = ac.currentTime + start;
  const gain = ac.createGain();
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.linearRampToValueAtTime(volume, t + duration * 0.35);
  gain.gain.setTargetAtTime(0.0001, t + duration * 0.6, 1.2);
  const filter = ac.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(freq * 1.4, t);
  filter.frequency.linearRampToValueAtTime(freq * 0.9, t + duration);
  [0, 4, -5].forEach((detune) => {
    const osc = ac.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.value = freq;
    osc.detune.value = detune * 3;
    osc.connect(filter);
    osc.start(t);
    osc.stop(t + duration + 1.8);
  });
  filter.connect(gain).connect(musicBus ?? ac.destination);
}

/** Nota melódica breve (arpegio/pltuck) con carácter de la escena. */
function pluck(freq: number, start: number, volume: number, type: OscillatorType) {
  const ac = ctx;
  if (!ac || !enabled) return;
  const t = ac.currentTime + start;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(volume, t + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);
  osc.connect(gain).connect(musicBus ?? ac.destination);
  osc.start(t);
  osc.stop(t + 0.65);
}

/** El tic del Gran Reloj: madera seca y corta. */
function clockTick(high: boolean, start: number, volume: number) {
  const ac = ctx;
  if (!ac || !enabled) return;
  const t = ac.currentTime + start;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = "square";
  osc.frequency.setValueAtTime(high ? 1980 : 1560, t);
  osc.frequency.exponentialRampToValueAtTime(high ? 1500 : 1180, t + 0.03);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(volume, t + 0.004);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
  const filter = ac.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 1900;
  filter.Q.value = 4;
  osc.connect(filter).connect(gain).connect(clockBus ?? ac.destination);
  osc.start(t);
  osc.stop(t + 0.07);
  // chasquido de mecánica
  noiseBurst(start, 0.018, 3400, volume * 0.4, "bandpass", 5, clockBus);
}

function scheduleAhead() {
  const ac = ctx;
  const scene = SCENES[currentScene ?? "home"] ?? SCENES.home;
  if (!ac || !enabled) return;
  const beatDur = 60 / scene.bpm;
  while (nextBeatTime < ac.currentTime + 0.6) {
    const start = Math.max(0, nextBeatTime - ac.currentTime);
    const beatInBar = beatIndex % 4;

    /* -- pulso: colchón en cada compás, bajo en el 1 -- */
    if (beatInBar === 0) {
      const chord = scene.chords[barIndex % scene.chords.length];
      chord.forEach((d) =>
        padNote(semitone(scene.root * 2, scene.scale[d % scene.scale.length]), start, beatDur * 4.2, 0.035),
      );
      if (scene.bass) padNote(scene.root / 2, start, beatDur * 4, 0.05);
    }

    /* -- arpegios en los contratiempos (nunca en el pulso fuerte) -- */
    const offbeat = start + beatDur * 0.5;
    if (Math.random() < scene.pluck) {
      const deg = scene.scale[Math.floor(Math.random() * scene.scale.length)];
      const octave = Math.random() < 0.3 ? 24 : 12;
      pluck(semitone(scene.root, deg + octave), offbeat, 0.055, scene.pluckType);
    }
    if (beatInBar === 2 && Math.random() < scene.pluck * 0.7) {
      const deg = scene.scale[Math.floor(Math.random() * scene.scale.length)];
      pluck(semitone(scene.root, deg + 12), start + beatDur * 0.25, 0.04, "sine");
    }

    /* -- EL GRAN RELOJ EN CONTRATIEMPO --
       tic-tac entre pulsos: en reposo muy sutil; con tensión se
       vuelve insistente (cada contratiempo) y sube de tono. */
    const clockBase = clockOn ? 0.055 : 0.018;
    const clockVol = clockBase * (0.35 + tension * 1.65) * (beatInBar % 2 === 0 ? 1 : 0.8);
    clockTick(clockTickToggle % 2 === 0, offbeat, clockVol);
    clockTickToggle++;
    if (tension > 0.55) {
      // doble tic nervioso en el segundo contratiempo del pulso
      clockTick(clockTickToggle % 2 === 0, offbeat + beatDur * 0.25, clockVol * 0.6);
    }

    beatIndex++;
    if (beatInBar === 3) barIndex++;
    nextBeatTime += beatDur;
  }
}

/** Enciende la capa del reloj (juegos cronometrados y climas de tensión). */
export function setClockActive(active: boolean) {
  clockOn = active;
}

/** Tensión 0-1: acelera el reloj y lo vuelve protagonista. */
export function setTension(level: number) {
  tension = Math.min(1, Math.max(0, level));
  if (clockBus && ctx) {
    clockBus.gain.setTargetAtTime(0.35 + tension * 0.65, ctx.currentTime, 0.12);
  }
}

/** ¿Hay música sonando? (para el indicador de ajustes) */
export function isMusicPlaying(): boolean {
  return !!schedulerId && !!currentScene;
}

export function getAudioState() {
  return { unlocked, running: !!ctx && ctx.state === "running", scene: currentScene, tension };
}

/* ============================== catálogo SFX ============================== */

/** Variación ligera para no repetir: +-6% de afinación. */
const vary = (f: number) => f * (0.94 + Math.random() * 0.12);

export const sfx = {
  /* ------- acierto: tres niveles con brillo creciente ------- */
  correct(level = 0) {
    if (!enabled) return;
    const base = [659, 880][Math.min(level, 1)];
    tone(vary(base), 0, 0.12, 0.075);
    tone(vary(base * 1.335), 0.08, 0.15, 0.06);
    if (level >= 2) bell(base * 2, 0.12, 0.5, 0.03);
  },
  wrong(soft = false) {
    if (!enabled) return;
    if (soft) {
      tone(vary(240), 0, 0.14, 0.05, "triangle");
      tone(vary(180), 0.08, 0.18, 0.04, "triangle");
    } else {
      tone(196, 0, 0.2, 0.07, "sawtooth");
      tone(147, 0.07, 0.26, 0.06, "sawtooth");
      noiseBurst(0, 0.08, 500, 0.02, "lowpass");
    }
  },
  click() {
    if (!enabled) return;
    tone(vary(440), 0, 0.045, 0.04, "square");
  },
  tap() {
    if (!enabled) return;
    tone(vary(620), 0, 0.03, 0.03, "sine");
  },
  toggle() {
    if (!enabled) return;
    tone(520, 0, 0.04, 0.035, "square");
    tone(760, 0.045, 0.05, 0.035, "square");
  },
  levelUp() {
    if (!enabled) return;
    [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.09, 0.22, 0.07));
    bell(1047, 0.36, 1.1, 0.045);
  },
  achievement() {
    if (!enabled) return;
    tone(880, 0, 0.15, 0.07);
    tone(1319, 0.12, 0.25, 0.06);
    bell(1760, 0.26, 0.8, 0.03);
  },
  combo(level: number) {
    if (!enabled) return;
    const f = 500 + Math.min(level, 10) * 62;
    tone(vary(f), 0, 0.07, 0.05, "triangle");
    tone(vary(f * 1.5), 0.05, 0.06, 0.035, "triangle");
  },
  /** Navegación: ráfaga suave hacia arriba. */
  navigate() {
    if (!enabled) return;
    tone(392, 0, 0.07, 0.035);
    tone(523, 0.05, 0.09, 0.03);
  },
  back() {
    if (!enabled) return;
    tone(523, 0, 0.07, 0.035);
    tone(392, 0.05, 0.09, 0.03);
  },
  unlock() {
    if (!enabled) return;
    [440, 554, 659, 880].forEach((f, i) => tone(f, i * 0.08, 0.24, 0.075));
    bell(1109, 0.34, 0.34, 0.05);
  },
  sessionEnd() {
    if (!enabled) return;
    [523, 659, 784].forEach((f, i) => tone(f, i * 0.02, 0.3, 0.06, "triangle"));
    [659, 831, 988].forEach((f, i) => tone(f, 0.24 + i * 0.02, 0.32, 0.05, "triangle"));
  },
  sessionWin() {
    if (!enabled) return;
    [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, i * 0.1, 0.3, 0.06));
    bell(1568, 0.5, 1.2, 0.04);
    noiseBurst(0.5, 0.5, 3000, 0.02, "highpass");
  },
  sessionLose() {
    if (!enabled) return;
    [392, 330, 262].forEach((f, i) => tone(f, i * 0.12, 0.3, 0.05, "triangle"));
    tone(196, 0.36, 0.4, 0.04, "sine");
  },
  /** Últimos segundos de un ítem cronometrado: tic alerta. */
  tick(urgent = false) {
    if (!enabled) return;
    tone(urgent ? 1400 : 1200, 0, 0.045, urgent ? 0.07 : 0.05, "square");
  },
  tock() {
    if (!enabled) return;
    tone(900, 0, 0.04, 0.04, "square");
  },
  /** Cuenta atrás 3·2·1: do-re-mi ascendente y ¡ya! */
  countdown(step: number) {
    if (!enabled) return;
    tone(vary([523, 587, 659][Math.max(0, Math.min(2, step))]), 0, 0.09, 0.06, "sine");
  },
  go() {
    if (!enabled) return;
    tone(880, 0, 0.12, 0.08);
    tone(1175, 0.08, 0.2, 0.06);
  },
  flip() {
    if (!enabled) return;
    tone(330, 0, 0.06, 0.04, "triangle");
    tone(494, 0.06, 0.1, 0.04, "triangle");
  },
  deal() {
    if (!enabled) return;
    noiseBurst(0, 0.12, 2200, 0.03, "bandpass", 1.5);
    tone(vary(740), 0.02, 0.05, 0.025, "triangle");
  },
  place() {
    if (!enabled) return;
    tone(vary(196), 0, 0.07, 0.06, "sine");
    noiseBurst(0, 0.05, 800, 0.02, "lowpass");
  },
  snap() {
    if (!enabled) return;
    tone(vary(330), 0, 0.04, 0.05, "square");
    tone(vary(660), 0.035, 0.05, 0.04, "square");
  },
  /** Moneda de XP: brillo metálico. */
  coin(big = false) {
    if (!enabled) return;
    tone(vary(big ? 1319 : 988), 0, 0.08, 0.05);
    tone(vary(big ? 1760 : 1319), 0.05, 0.12, 0.04);
  },
  /** Cascada de monedas al reclamar misión. */
  coins() {
    if (!enabled) return;
    [988, 1175, 1319, 1568, 1976].forEach((f, i) => tone(vary(f), i * 0.06, 0.14, 0.05));
  },
  streak() {
    if (!enabled) return;
    tone(784, 0, 0.14, 0.06);
    tone(1175, 0.11, 0.2, 0.05);
  },
  chime() {
    if (!enabled) return;
    bell(880, 0, 1.2, 0.06);
    bell(1320, 0.15, 1, 0.04);
  },
  /** Campana de boya al entrar en el puerto / región. */
  buoy() {
    if (!enabled) return;
    bell(392, 0, 1.6, 0.06);
    bell(587, 0.3, 1.2, 0.03);
  },
  splash() {
    if (!enabled) return;
    noiseBurst(0, 0.3, 900, 0.06, "lowpass");
    noiseBurst(0.05, 0.25, 2400, 0.02, "bandpass");
  },
  page() {
    if (!enabled) return;
    noiseBurst(0, 0.16, 3800, 0.035, "bandpass", 0.8);
  },
  /** Léxico habla: blip suave y curioso. */
  tinta() {
    if (!enabled) return;
    tone(vary(620), 0, 0.05, 0.04, "sine");
    tone(vary(830), 0.06, 0.06, 0.035, "sine");
  },
  pop() {
    if (!enabled) return;
    tone(vary(520), 0, 0.05, 0.05, "sine", null, 240);
  },
  confetti() {
    if (!enabled) return;
    noiseBurst(0, 0.2, 3200, 0.04, "highpass");
    tone(vary(1200), 0.02, 0.08, 0.03);
    tone(vary(1600), 0.1, 0.08, 0.03);
  },
  whoosh() {
    if (!enabled) return;
    noiseBurst(0, 0.22, 700, 0.035, "bandpass", 0.6);
  },
  error() {
    if (!enabled) return;
    tone(220, 0, 0.16, 0.05, "square");
    tone(207, 0.14, 0.2, 0.04, "square");
  },
};

/* ============================== voz (TTS) ============================== */

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
export function speak(text: string, rate = 0.95): boolean {
  if (!ttsAvailable()) return false;
  try {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "es-ES";
    utter.rate = rate;
    window.speechSynthesis.speak(utter);
    return true;
  } catch {
    return false;
  }
}
