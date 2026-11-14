/**
 * Motor de audio de VERBALIA · v4 (Ola E · 5 · ambiente único de estudio).
 * ---------------------------------------------------------------
 * Todo el sonido del juego son ARCHIVOS de audio reales con licencia
 * libre (CC0), servidos desde public/sfx/ y public/music/.
 * Fuentes, autores y licencias: public/sfx/CREDITS.md. Nada se
 * sintetiza en vivo salvo como respaldo de emergencia.
 *
 * 1) AMBIENTE ÚNICO: una sola capa de ambiente natural calmo (olas
 *    suaves + brisa con algún pájaro lejano), en dos loops largos sin
 *    costura que suenan IGUAL en portada, mapa, regiones y juegos —
 *    sin cambios de ambiente al moverse entre regiones y sin fundidos
 *    cruzados entre escenas: solo el fundido suave de entrada al abrir
 *    la app. Al silenciar (volumen 0), silencio total.
 * 2) SFX: un banco de la misma familia (Kenney + celebraciones),
 *    normalizado por pico. La navegación es UN solo pop de burbuja
 *    (tap/click/back/toggle/navigate comparten archivo); el acierto,
 *    el fallo y el reloj tienen UNA sola variante fija cada uno —
 *    nunca alternan al azar. Las variantes al azar quedan solo en
 *    celebraciones poco frecuentes (logro, subir de nivel).
 * 3) EL GRAN RELOJ EN CONTRATIEMPO: un único «latido lejano» de
 *    archivo (clockSoft: tic real bajado de tono y filtrado). En
 *    reposo es una presencia mínima; en los juegos cronometrados
 *    setTension() lo acelera y le sube un poco el volumen.
 *
 * El AudioContext se desbloquea con el primer gesto del usuario
 * (política de navegadores) y, justo entonces, se calienta el banco:
 * primero los efectos más frecuentes y, cuando el hilo respire, el
 * resto (Ola E · 4). Los primeros golpes entran en una cola de gracia
 * que espera a su archivo (tope 150 ms) para que el sintetizador casi
 * nunca suene. Si un archivo no llega (primera visita sin red,
 * navegador caprichoso), el sintetizador de emergencia toma el turno:
 * el juego nunca se queda mudo. Si el jugador silencia el juego, el
 * contexto se suspende y todo queda en silencio absoluto.
 */

/* ============================== ajustes ============================== */

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let musicBus: GainNode | null = null;
let sfxBus: GainNode | null = null;
let clockBus: GainNode | null = null;
let noiseBus: GainNode | null = null;

let enabled = true;
let sfxVolume = 0.9;

/** Volumen del ambiente por defecto: medio-bajo, se nota sin estorbar
 *  (Ola E · 5). El jugador lo ajusta con el slider «Ambiente». */
export const AMBIENT_VOLUME_DEFAULT = 0.35;

let musicVolume = AMBIENT_VOLUME_DEFAULT;

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
    warmupSfxFiles(); // el banco se calienta ANTES de cualquier sfx probable (Ola E · 4)
    if (currentScene) startAmbient(); // el ambiente arranca al desbloquear
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
  registerVisibilityGuard();
}

/* ================== guarda de visibilidad de la página ==================
 * Cuando la pestaña se oculta o el teléfono se suspende, la música
 * generativa debe callar (y el AudioContext congelarse para no gastar
 * batería). Al volver, la escena se reanuda si sonaba antes. */

let visibilityGuardOn = false;
let pausedByVisibility = false;

export function registerVisibilityGuard(): void {
  if (typeof window === "undefined" || visibilityGuardOn) return;
  visibilityGuardOn = true;

  const pauseAll = () => {
    if (pausedByVisibility) return;
    pausedByVisibility = true;
    // 1) El reloj deja de programar tics (la escena se recuerda).
    if (clockTimer) {
      clearInterval(clockTimer);
      clockTimer = null;
    }
    // 2) El contexto entero se suspende: cero audio y cero batería mientras
    //    la página no está visible (móvil bloqueado, app en segundo plano…).
    if (ctx && ctx.state === "running") void ctx.suspend();
  };

  const resumeAll = () => {
    if (!pausedByVisibility) return;
    pausedByVisibility = false;
    if (!enabled) return; // el jugador silenció el juego mientras no miraba
    if (ctx && ctx.state === "suspended") void ctx.resume();
    // El ambiente que sonaba antes del ocultado vuelve con fundido suave.
    if (currentScene && unlocked) {
      void startAmbient();
      if (clockOn) ensureClockScheduler();
    }
  };

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") pauseAll();
    else resumeAll();
  });
  // iOS y algunos navegadores: al minimizar o navegar fuera de la página.
  window.addEventListener("pagehide", () => pauseAll());
  window.addEventListener("pageshow", () => resumeAll());
  // Congelar la pestaña (procesos en background) también detiene el audio.
  document.addEventListener("freeze" as keyof DocumentEventMap, () => pauseAll());
  document.addEventListener("resume" as keyof DocumentEventMap, () => resumeAll());
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
  // Silencio pedido: el ambiente se detiene del todo (ni voces ni CPU).
  if (musicVolume <= 0) {
    fadeOutAmbient(0.4);
  } else if (currentScene && unlocked) {
    void startAmbient();
  }
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

/* ===================== ambiente único de estudio (Ola E · 5) =====================
 * Una sola capa de ambiente natural calmo —olas suaves + brisa con algún
 * pájaro lejano— en DOS loops largos sin costura (public/music/, CC0,
 * licencias en CREDITS.md). Suenan IGUAL en portada, mapa, regiones y
 * juegos: ni cambios de ambiente al moverse entre regiones ni fundidos
 * cruzados entre escenas. El único fundido es el de entrada, al abrir la
 * app (o al volver del silencio). Al poner el volumen a 0: silencio total
 * y las voces se detienen para no gastar batería.
 * Las dos capas tienen longitudes distintas (124 s y 75,8 s), así que la
 * combinación tarda más de un cuarto de hora en repetirse exacta: el
 * oído nunca encuentra un patrón que memorizar. */

/** Capas del ambiente (nombre base del archivo en /music). */
const AMBIENT_LOOPS = ["estudio-olas", "estudio-brisa"] as const;

let currentScene: string | null = null;
let tension = 0; // 0 reposo · 1 clímax cronometrado

/* ------------------------ carga de música (ogg -> mp3) ------------------------ */

const musicBufferCache = new Map<string, AudioBuffer>();
const musicFailed = new Set<string>();
const musicLoading = new Set<string>();

async function loadMusicLoop(name: string): Promise<AudioBuffer | null> {
  const ac = ensureCtx();
  if (!ac) return null;
  const cached = musicBufferCache.get(name);
  if (cached) return cached;
  if (musicFailed.has(name) || musicLoading.has(name)) return null;
  musicLoading.add(name);
  // .ogg preferido; .mp3 de respaldo para navegadores sin Vorbis (Safari/iOS).
  for (const src of [`/music/${name}.ogg`, `/music/${name}.mp3`]) {
    try {
      const res = await fetch(src);
      if (!res.ok) continue;
      const bytes = await res.arrayBuffer();
      const buf = await ac.decodeAudioData(bytes);
      musicBufferCache.set(name, buf);
      return buf;
    } catch {
      /* probamos el siguiente formato */
    }
  }
  musicFailed.add(name); // hoy no llega: esta capa quedará en silencio
  return null;
}

/* ------------------------ voz de loop con fundidos ------------------------ */

interface LoopVoice {
  src: AudioBufferSourceNode;
  gain: GainNode;
}

let ambientVoices: LoopVoice[] = [];
let ambientSeq = 0; // desecha arranques ya abandonados (silencio pedido)

/** Funde y detiene las voces del ambiente (silencio o estación propia). */
function fadeOutAmbient(seconds = 1.0) {
  const ac = ctx;
  const voices = ambientVoices;
  ambientVoices = [];
  if (!ac) return;
  for (const v of voices) {
    try {
      v.gain.gain.cancelScheduledValues(ac.currentTime);
      v.gain.gain.setTargetAtTime(0.0001, ac.currentTime, seconds / 3);
    } catch {
      /* ya liberada */
    }
    const src = v.src;
    setTimeout(() => {
      try {
        src.stop();
      } catch {
        /* ya parada */
      }
    }, seconds * 1000 + 300);
  }
}

/** Arranca el ambiente con el fundido suave de entrada (si no suena ya).
 *  Es el ÚNICO fundido: ni entre escenas ni entre regiones. */
async function startAmbient() {
  const ac = ensureCtx();
  if (!ac || !enabled || musicVolume <= 0) return;
  if (ambientVoices.length > 0) return; // ya suena: nada que cambiar
  const seq = ++ambientSeq;

  const bufs = await Promise.all(AMBIENT_LOOPS.map((n) => loadMusicLoop(n)));
  // Mientras cargaba: el jugador silenció o pidió su estación. Fuera.
  if (seq !== ambientSeq || !enabled || musicVolume <= 0 || !ctx) return;

  for (const buf of bufs) {
    if (!buf) continue;
    try {
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.loop = true;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.setTargetAtTime(1, ctx.currentTime, 0.8); // entrada suave ~2,4 s
      src.connect(gain).connect(musicBus ?? ctx.destination);
      src.start();
      ambientVoices.push({ src, gain });
    } catch {
      /* navegador caprichoso: esta capa quedará en silencio */
    }
  }
}

/** La API de escenas se conserva para no mover a todos los que llaman:
 *  con el ambiente único el identificador ya no decide nada — el mismo
 *  ambiente suena en cualquier pantalla. */
export function setSceneMusic(_sceneId: string | null) {
  if (!_sceneId || currentScene !== null) {
    currentScene = _sceneId;
    return;
  }
  currentScene = _sceneId;
  if (ctx && unlocked) void startAmbient();
}

/** Silencia el ambiente con fundido (estación propia del jugador o
 *  pantalla de música). No hay música de menú que callar: es la misma
 *  capa en todas partes. */
export function stopSceneMusic() {
  currentScene = null;
  fadeOutAmbient(0.9);
}

/* ============== EL GRAN RELOJ EN CONTRATIEMPO (archivos reales) ==============
 * Un único «latido lejano» de archivo (clockSoft: tic real CC0 bajado 6
 * semitonos y filtrado bajo 600 Hz — presencia de latido, no de reloj).
 * Una sola variante fija: nunca alterna ni al azar ni tic-tac. En reposo
 * es una presencia mínima y más baja que antes; con tensión acelera y
 * sube un poco de volumen hasta el clímax final. Como el ambiente ya
 * viene grabado, el reloj marca su propio pulso constante (2 latidos/s
 * en reposo) en lugar de anclarse al tempo: misma presencia, menos piezas. */

let clockOn = false;
let clockNextTime = 0;
let clockTimer: ReturnType<typeof setInterval> | null = null;

/** Reproduce un archivo corto en un momento exacto y bus concreto. */
function playFileAt(
  base: string,
  when: number,
  opts: { rate?: number; gain?: number; bus?: GainNode | null } = {},
): void {
  const ac = ctx;
  if (!ac) return;
  const buf = sfxBufferCache.get(`${base}.ogg`) ?? sfxBufferCache.get(`${base}.mp3`);
  if (!buf) {
    void loadSfxFile(base);
    return;
  }
  try {
    const node = ac.createBufferSource();
    node.buffer = buf;
    node.playbackRate.value = opts.rate ?? 1;
    const g = ac.createGain();
    g.gain.value = opts.gain ?? 1;
    node.connect(g);
    g.connect(opts.bus ?? sfxBus ?? ac.destination);
    node.start(Math.max(when, ac.currentTime));
  } catch {
    /* ignorar */
  }
}

function scheduleClockAhead() {
  const ac = ctx;
  if (!ac || !enabled) return;
  // Intervalo base 0,5 s (contratiempo tranquilo); la tensión lo aprieta.
  const interval = 0.5 / (1 + tension * 1.4);
  if (clockNextTime < ac.currentTime) clockNextTime = ac.currentTime + 0.05;
  while (clockNextTime < ac.currentTime + 0.6) {
    // Volumen menor que antes: el latido acompaña, no manda.
    const vol = (clockOn ? 0.035 : 0.012) * (0.4 + tension * 1.6);
    const rate = 1 + tension * 0.25; // sube apenas de tono con la tensión
    playFileAt("clockSoft", clockNextTime, { rate, gain: vol, bus: clockBus });
    clockNextTime += interval;
  }
}

function ensureClockScheduler() {
  if (clockTimer || typeof window === "undefined") return;
  clockNextTime = 0;
  clockTimer = setInterval(scheduleClockAhead, 240);
}

/** Enciende la capa del reloj (juegos cronometrados y climas de tensión). */
export function setClockActive(active: boolean) {
  clockOn = active;
  if (active && unlocked) ensureClockScheduler();
}

/** Tensión 0-1: acelera el reloj y lo vuelve protagonista. */
export function setTension(level: number) {
  tension = Math.min(1, Math.max(0, level));
  if (clockBus && ctx) {
    clockBus.gain.setTargetAtTime(0.35 + tension * 0.65, ctx.currentTime, 0.12);
  }
}

/** ¿Hay ambiente sonando? (para el indicador de ajustes) */
export function isMusicPlaying(): boolean {
  return ambientVoices.length > 0;
}

export function getAudioState() {
  return { unlocked, running: !!ctx && ctx.state === "running", scene: currentScene, tension };
}

/* ============================== catálogo SFX ============================== */

/** Variación ligera para no repetir: +-6% de afinación. */
const vary = (f: number) => f * (0.94 + Math.random() * 0.12);

const synthSfx = {
  /* ------- acierto: tres niveles con brillo creciente ------- */
  correct(level = 0) {
    if (!enabled) return;
    haptic(10 + level * 4);
    const base = [659, 880][Math.min(level, 1)];
    tone(vary(base), 0, 0.12, 0.075);
    tone(vary(base * 1.335), 0.08, 0.15, 0.06);
    if (level >= 2) bell(base * 2, 0.12, 0.5, 0.03);
  },
  wrong(soft = false) {
    if (!enabled) return;
    haptic([16, 30, 16]);
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
    hapticFanfare();
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
  /* ------- Hojas, diálogos y Bazar ------- */
  /** Hoja o diálogo que se abre: deslizamiento ascendente suave. */
  open() {
    if (!enabled) return;
    tone(vary(520), 0, 0.07, 0.04, "sine");
    tone(vary(740), 0.05, 0.09, 0.035, "sine");
  },
  /** Hoja o diálogo que se cierra: deslizamiento descendente suave. */
  close() {
    if (!enabled) return;
    tone(vary(740), 0, 0.07, 0.04, "sine");
    tone(vary(520), 0.05, 0.09, 0.035, "sine");
  },
  /** Compra en el Bazar: caja registradora con brillo metálico. */
  buy() {
    if (!enabled) return;
    tone(vary(659), 0, 0.09, 0.06);
    tone(vary(880), 0.07, 0.12, 0.05);
    bell(1319, 0.16, 0.5, 0.035);
  },
  /** Regalo diario reclamado: destello alegre junto a la tinta. */
  gift() {
    if (!enabled) return;
    tone(vary(784), 0, 0.1, 0.055, "sine");
    tone(vary(988), 0.09, 0.12, 0.05, "sine");
    bell(1319, 0.18, 0.7, 0.03);
  },
  /* ------- Salón de Juegos Educativos ------- */
  /** Ficha que resbala (2048, deslizables). */
  slide() {
    if (!enabled) return;
    noiseBurst(0, 0.12, 1400, 0.03, "bandpass", 0.9);
    tone(vary(300), 0.06, 0.05, 0.03, "sine");
  },
  /* ------- Mega-8 · capa sonora ampliada ------- */
  /** Recogida de recompensa: caja fuerte + monedas. */
  claim() {
    if (!enabled) return;
    tone(523, 0, 0.1, 0.06);
    tone(784, 0.08, 0.12, 0.055);
    [988, 1319, 1568].forEach((f, i) => tone(vary(f), 0.16 + i * 0.05, 0.12, 0.04));
    haptic([18, 30, 24]);
  },
  /** Tecla de mecanografía: clac corto y seco. */
  typeKey() {
    if (!enabled) return;
    noiseBurst(0, 0.018, 2600, 0.03, "bandpass", 2.2);
  },
  /** Palabra completa bien tecleada. */
  typeWord() {
    if (!enabled) return;
    tone(vary(740), 0, 0.05, 0.03, "triangle");
  },
  /** Destello mágico (acierto brillante). */
  sparkle() {
    if (!enabled) return;
    tone(vary(1568), 0, 0.07, 0.035);
    tone(vary(2093), 0.05, 0.09, 0.028);
    tone(vary(2637), 0.11, 0.1, 0.02);
  },
  /** Subida de peldaño (nivel de drill, hito). */
  stepUp() {
    if (!enabled) return;
    tone(587, 0, 0.08, 0.05, "triangle");
    tone(880, 0.07, 0.12, 0.045, "triangle");
  },
  /** Sello del cronista (guardar). */
  stamp() {
    if (!enabled) return;
    noiseBurst(0, 0.09, 500, 0.05, "lowpass");
    tone(vary(196), 0.02, 0.06, 0.04, "sine");
  },
};

/* ==================== capa de ARCHIVOS SFX reales ====================
 * La Ola D del sonido: los efectos ya no se sintetizan en vivo; son
 * grabaciones reales servidas desde /sfx/*.ogg con gemelo .mp3 de
 * respaldo (Safari/iOS no leen Vorbis). Fuentes y licencias de cada
 * archivo: public/sfx/CREDITS.md. Cada archivo se descarga, decodifica
 * y queda en memoria; si algo falla (sin red en la primera visita,
 * navegador caprichoso), el sintetizador de emergencia de arriba
 * toma el turno: el juego nunca se queda mudo ni añade retardo. */

type SfxFileSpec = { base: string; rate?: number; gain?: number };

/** Efecto -> variante(s) de archivo. Ola E · 5:
 *  - La navegación es UN solo pop de burbuja (Kenney drop_002): tap,
 *    click, back, toggle, navigate y pop comparten archivo y suena
 *    siempre el mismo.
 *  - El reloj es un único latido (clockSoft); correct y wrong tienen
 *    UNA sola variante fija cada uno — nunca alternan al azar.
 *  - Solo logro y subir de nivel conservan variantes que se alternan
 *    (celebraciones poco frecuentes).
 *  - Todos los archivos vienen normalizados por pico a −2 dBFS; el
 *    gain de aquí es el balance fino del diseñador dentro del banco
 *    (ganancia float de WebAudio, sin recorte). */
const SFX_FILES: Record<string, SfxFileSpec[]> = {
  // Navegación: un único pop de burbuja, siempre el mismo.
  tap: [{ base: "pop" }],
  click: [{ base: "pop" }],
  back: [{ base: "pop" }],
  toggle: [{ base: "pop" }],
  navigate: [{ base: "pop" }],
  pop: [{ base: "pop" }],
  // Acierto, fallo y reloj: una sola variante fija cada uno.
  correct: [{ base: "correct", gain: 1.5 }],
  wrong: [{ base: "wrong", gain: 1.3 }],
  clockTick: [{ base: "clockSoft", gain: 0.9 }],
  tick: [{ base: "clockSoft", gain: 0.9 }],
  tock: [{ base: "clockSoft", gain: 0.9 }],
  // El resto del banco: una variante, balance ajustado al nivel común.
  error: [{ base: "error", gain: 1.1 }],
  whoosh: [{ base: "whoosh", gain: 1.15 }],
  slide: [{ base: "slide" }],
  page: [{ base: "page", gain: 1.1 }],
  flip: [{ base: "flip", gain: 1.15 }],
  deal: [{ base: "deal", gain: 1.05 }],
  place: [{ base: "place", gain: 1.1 }],
  snap: [{ base: "snap", gain: 1.15 }],
  open: [{ base: "open" }],
  close: [{ base: "close" }],
  coin: [{ base: "coin" }],
  coins: [{ base: "coins", gain: 1.15 }],
  tinta: [{ base: "tinta" }],
  buy: [{ base: "buy", gain: 1.4 }],
  unlock: [{ base: "unlock" }],
  gift: [{ base: "gift" }],
  claim: [{ base: "claim", gain: 1.1 }],
  stepUp: [{ base: "stepUp" }],
  sparkle: [{ base: "sparkle" }],
  confetti: [{ base: "confetti" }],
  chime: [{ base: "chime" }],
  sessionEnd: [{ base: "sessionEnd" }],
  go: [{ base: "go", gain: 1.5 }],
  combo: [{ base: "combo" }],
  countdown: [{ base: "countdown", gain: 1.1 }],
  stamp: [{ base: "stamp", gain: 1.15 }],
  buoy: [{ base: "buoy" }],
  typeKey: [{ base: "typeKey", rate: 1.15, gain: 0.7 }],
  typeWord: [{ base: "typeWord", gain: 1.2 }],
  // Victoria y celebraciones poco frecuentes: aquí sí hay variantes.
  sessionWin: [{ base: "sessionWin" }],
  sessionLose: [{ base: "sessionLose" }],
  streak: [{ base: "streak" }],
  levelUp: [{ base: "levelUp" }, { base: "levelUp2" }],
  achievement: [{ base: "achievement" }, { base: "achievement2" }],
};

const sfxBufferCache = new Map<string, AudioBuffer>();
const sfxFileFailed = new Set<string>();
/** Cargas en vuelo por base: dedupe y ancla de la cola de gracia. */
const sfxPending = new Map<string, Promise<boolean>>();

/* ================= Calibración fina tras el primer gesto (Ola E · 4) =================
 * El banco se calienta en cuanto hay gesto, pero fetch + decode es asíncrono:
 * el primer «tap» de ese mismo gesto llegaría ANTES que su archivo y el
 * sintetizador de respaldo sonaría. Mientras se calienta, los primeros
 * efectos entran en una cola de gracia: esperan, con tope de SFX_GRACE_MS,
 * a que su archivo esté; si llega, suena el archivo; si falla en frío o
 * vence el tope, suena el sintetizador como siempre. Pasada la ventana de
 * calentamiento, el comportamiento es exactamente el de antes. */

const SFX_GRACE_MS = 150; // tope de espera de un golpe a su archivo
const SFX_GRACE_WINDOW_MS = 1_500; // ventana tras el primer gesto en la que se espera
let graceWindowEnd = 0;

interface GraceHit {
  name: string;
  base: string;
  rate?: number;
  gain?: number;
  timer: ReturnType<typeof setTimeout> | null;
}
const graceQueue: GraceHit[] = [];

/** Carga un archivo de efecto (dedupe por base). true -> ya está cacheado. */
function loadSfxFile(base: string): Promise<boolean> {
  const key = `${base}.ogg`;
  if (sfxBufferCache.has(key)) return Promise.resolve(true);
  if (sfxFileFailed.has(base)) return Promise.resolve(false);
  const pending = sfxPending.get(base);
  if (pending) return pending;
  const p = (async (): Promise<boolean> => {
    const c = ensureCtx();
    if (!c) return false;
    // .ogg preferido; .mp3 de respaldo (Safari/iOS).
    for (const src of [`/sfx/${base}.ogg`, `/sfx/${base}.mp3`]) {
      try {
        const res = await fetch(src);
        if (!res.ok) continue;
        const bytes = await res.arrayBuffer();
        sfxBufferCache.set(key, await c.decodeAudioData(bytes));
        return true;
      } catch {
        /* probamos el siguiente formato */
      }
    }
    sfxFileFailed.add(base); // este efecto no llega: síntesis permanente para él
    return false;
  })();
  sfxPending.set(base, p);
  void p.then((ok) => {
    sfxPending.delete(base);
    drainGraceQueue(base, ok);
  });
  return p;
}

/** Suena el buffer ya cacheado de una base. false -> no está o falló el nodo. */
function playBuffer(base: string, rate?: number, gain?: number): boolean {
  const c = ensureCtx();
  const buf = c ? sfxBufferCache.get(`${base}.ogg`) : undefined;
  if (!c || !buf) return false;
  try {
    const node = c.createBufferSource();
    node.buffer = buf;
    node.playbackRate.value = rate ?? 1;
    const g = c.createGain();
    g.gain.value = (gain ?? 1) * sfxVolume;
    node.connect(g);
    g.connect(sfxBus ?? c.destination);
    node.start();
    return true;
  } catch {
    return false;
  }
}

/** Respaldo sintético por nombre (solo emergencia: ver CREDITS.md). */
function playSynthFallback(name: string): void {
  const fn = Reflect.get(synthSfx as Record<string, unknown>, name);
  if (typeof fn === "function") (fn as (...args: unknown[]) => void)();
}

/** Toca el archivo del golpe y, si no pudo, el sintetizador. */
function playGraceHit(hit: GraceHit): void {
  if (playBuffer(hit.base, hit.rate, hit.gain)) {
    const hp = HAPTIC_BY_SFX[hit.name];
    if (hp !== undefined) haptic(hp);
  } else {
    playSynthFallback(hit.name);
  }
}

/** Golpe en espera: entra en la cola con su tope de paciencia. */
function enqueueGraceHit(name: string, base: string, rate?: number, gain?: number): void {
  const hit: GraceHit = { name, base, rate, gain, timer: null };
  graceQueue.push(hit);
  hit.timer = setTimeout(() => {
    const i = graceQueue.indexOf(hit);
    if (i === -1) return; // el drenaje ya lo resolvió
    graceQueue.splice(i, 1);
    playGraceHit(hit);
  }, SFX_GRACE_MS + 10);
}

/** El archivo llegó (ok=true) o falló (ok=false): se resuelven sus golpes. */
function drainGraceQueue(base: string, ok: boolean): void {
  if (graceQueue.length === 0) return;
  for (const hit of graceQueue.filter((h) => h.base === base)) {
    const i = graceQueue.indexOf(hit);
    if (i === -1) continue;
    graceQueue.splice(i, 1);
    if (hit.timer) clearTimeout(hit.timer);
    if (ok) playGraceHit(hit);
    else playSynthFallback(hit.name); // falló en frío: respaldo como hoy
  }
}

/** Precarga el banco justo tras el primer gesto, ANTES de cualquier
 *  efecto probable: primera ola con lo más frecuente (el tap de ese
 *  mismo gesto entra en la cola de gracia y espera a su archivo en vez
 *  de dejar sonar el sintetizador) y, cuando el hilo respire, una
 *  segunda ola con el resto del banco (el service worker ya lo
 *  precacheó: solo cuesta decodificar). */
export function warmupSfxFiles(): void {
  graceWindowEnd = Date.now() + SFX_GRACE_WINDOW_MS;
  for (const key of ["tap", "click", "correct", "wrong", "whoosh", "flip", "page", "coin", "clockTick"]) {
    const spec = SFX_FILES[key]?.[0];
    if (spec) void loadSfxFile(spec.base);
  }
  const whenIdle = (cb: () => void): void => {
    if (typeof requestIdleCallback === "function") requestIdleCallback(() => cb(), { timeout: 2_000 });
    else setTimeout(cb, 400);
  };
  whenIdle(() => {
    for (const key of Object.keys(SFX_FILES)) {
      const spec = SFX_FILES[key]?.[0];
      if (spec) void loadSfxFile(spec.base);
    }
  });
}

/** Decide el turno de un efecto: archivo ya sonado («file»), espera en
 *  la cola de gracia («defer») o síntesis de respaldo («synth»). */
function playSfxSmart(name: string): "file" | "defer" | "synth" {
  if (!enabled) return "file"; // silencio pedido: no suena nada (ni archivo ni síntesis)
  const variants = SFX_FILES[name];
  if (!variants || variants.length === 0) return "synth";
  const spec = variants[Math.floor(Math.random() * variants.length)];
  if (playBuffer(spec.base, spec.rate, spec.gain)) return "file";
  if (sfxFileFailed.has(spec.base)) return "synth";
  void loadSfxFile(spec.base); // llegará para la próxima
  // Calibración fina: en la ventana tras el primer gesto, el golpe
  // espera (tope 150 ms) a su archivo antes de resignarse a la síntesis.
  // Si la carga muere al instante (sin AudioContext), el drenaje la
  // resuelve en el mismo microtask: ni retardo ni doble sonido.
  if (Date.now() < graceWindowEnd) {
    enqueueGraceHit(name, spec.base, spec.rate, spec.gain);
    return "defer";
  }
  return "synth";
}

/** Variante simple para «Probar sonidos»: archivo o respaldo, sin gracia. */
function playSfxFile(name: string): boolean {
  return playSfxSmart(name) === "file";
}

/** Lista de efectos con archivo, para «Probar sonidos». */
export function sfxShowcase(): { key: string; label: string }[] {
  return [
    { key: "pop", label: "Pop de burbuja (botones)" },
    { key: "correct", label: "Acierto" },
    { key: "wrong", label: "Fallo" },
    { key: "coin", label: "Moneda de XP" },
    { key: "tinta", label: "Tinta" },
    { key: "levelUp", label: "Subida de nivel" },
    { key: "achievement", label: "Logro" },
    { key: "claim", label: "Reclamar recompensa" },
    { key: "flip", label: "Girar tarjeta" },
    { key: "whoosh", label: "Transición" },
    { key: "chime", label: "Campanita" },
    { key: "sessionWin", label: "¡Victoria!" },
    { key: "sessionLose", label: "Derrota" },
    { key: "clockTick", label: "Reloj (latido lejano)" },
  ];
}

/** Prueba del ambiente desde Ajustes: lo arranca si está parado y lo
 *  detiene si ya suena. Devuelve si quedó sonando. */
export function toggleAmbientPreview(): boolean {
  if (ambientVoices.length > 0) {
    fadeOutAmbient(0.6);
    return false;
  }
  const ac = ensureCtx();
  if (!ac || !enabled || musicVolume <= 0) return false;
  unlocked = true;
  void startAmbient();
  return true;
}

/** Instantánea del banco para pruebas: base(s) de archivo por efecto y
 *  capas del ambiente. No expone nodos de audio. */
export function sfxBankSnapshot(): { sfx: Record<string, string[]>; ambient: string[] } {
  const sfx: Record<string, string[]> = {};
  for (const [key, variants] of Object.entries(SFX_FILES)) {
    sfx[key] = variants.map((v) => v.base);
  }
  return { sfx, ambient: [...AMBIENT_LOOPS] };
}

/** Reproduce un efecto concreto para probarlo desde Ajustes. */
export function playSfxByName(key: string): boolean {
  return playSfxFile(key) || ((): boolean => {
    // respaldo de síntesis puntual para la prueba
    const original = Reflect.get(synthSfx as Record<string, unknown>, key);
    if (typeof original !== "function") return false;
    (original as (...a: unknown[]) => void)();
    return true;
  })();
}

/** Hápticos que vivían dentro de los métodos sintetizados: los
 *  mantenemos aunque suene el archivo (la vibración es parte del golpe). */
const HAPTIC_BY_SFX: Record<string, number | number[]> = {
  correct: 10,
  wrong: [16, 30, 16],
  claim: [18, 30, 24],
  levelUp: [28, 40, 28, 40, 60],
};

export const sfx = new Proxy(synthSfx, {
  get(target, prop, receiver) {
    const original = Reflect.get(target, prop, receiver);
    if (typeof original !== "function") return original;
    return (...args: unknown[]) => {
      const name = String(prop);
      const outcome = playSfxSmart(name);
      if (outcome === "defer") return; // la cola de gracia decidirá (archivo o respaldo)
      if (outcome === "file") {
        const hp = HAPTIC_BY_SFX[name];
        if (hp !== undefined) haptic(hp);
        return;
      }
      return original.apply(target, args);
    };
  },
}) as typeof synthSfx;

/* ============================== voz (TTS) ============================== */

/** ¿Soporta este navegador síntesis de voz en español? */
export function ttsAvailable(): boolean {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return false;
  return true;
}

/** Velocidad global de la voz (configurable en Ajustes · Etapa 4). */
let ttsRateGlobal = 1;

/** Fija la velocidad global del TTS (0.5 - 1.3). */
export function setTtsRate(v: number) {
  ttsRateGlobal = Math.min(1.3, Math.max(0.5, v));
}

/** Háptics: vibración breve si el dispositivo la soporta (Etapa 4). */
let hapticsEnabled = false;

export function setHaptics(value: boolean) {
  hapticsEnabled = value;
}

/** Vibra un patrón corto (aciertos y combos). Silencioso si no hay soporte. */
export function haptic(pattern: number | number[] = 12) {
  if (!hapticsEnabled) return;
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(pattern);
    }
  } catch {
    /* sin soporte: silencio */
  }
}

/** Vibra un patrón largo (subida de nivel). */
export function hapticFanfare() {
  haptic([28, 40, 28, 40, 60]);
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
    utter.rate = rate * ttsRateGlobal;
    window.speechSynthesis.speak(utter);
    return true;
  } catch {
    return false;
  }
}
