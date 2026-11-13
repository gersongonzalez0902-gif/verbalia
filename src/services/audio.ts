/**
 * Motor de audio de VERBALIA · v3 (Ola D · archivos reales).
 * ---------------------------------------------------------------
 * Todo el sonido del juego son ARCHIVOS de audio reales con licencia
 * libre (CC0 / CC-BY), servidos desde public/sfx/ y public/music/.
 * Fuentes, autores y licencias: public/sfx/CREDITS.md. Nada se
 * sintetiza en vivo salvo como respaldo de emergencia.
 *
 * 1) SFX: ~45 efectos con 2-3 variantes por efecto que se alternan
 *    al azar (nunca suena igual dos veces seguidas). Cada efecto
 *    vive en .ogg (preferido) + .mp3 de respaldo (Safari/iOS).
 * 2) MÚSICA AMBIENTE: un loop real por escena/región con fundido
 *    cruzado al cambiar de región (el mismo fundido de siempre).
 * 3) EL GRAN RELOJ EN CONTRATIEMPO: capa de tic-tac con archivos
 *    reales (tic-tac CC0). En reposo es una presencia mínima; en
 *    los juegos cronometrados `setTension()` la acelera, le sube
 *    el tono y el volumen hasta el clímax de los últimos segundos.
 *
 * El AudioContext se desbloquea con el primer gesto del usuario
 * (política de navegadores) y, justo entonces, se precargan en
 * segundo plano los efectos más frecuentes. Si un archivo no
 * llega (primera visita sin red, navegador caprichoso), el
 * sintetizador de emergencia toma el turno: el juego nunca se
 * queda mudo. Si el jugador silencia el juego, el contexto se
 * suspende y todo queda en silencio absoluto.
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
    warmupSfxFiles(); // los archivos reales llegan con el primer gesto
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
    // La escena que sonaba antes del ocultado vuelve con fundido.
    if (currentScene && unlocked) {
      void startScene(currentScene);
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

/* ===================== escenas musicales (loops reales) =====================
 * Cada escena tiene su loop de archivo real (public/music/, licencias en
 * public/sfx/CREDITS.md). Al cambiar de región el loop anterior se funde
 * hacia el silencio mientras el nuevo entra: el mismo fundido cruzado de
 * siempre, ahora con música grabada. */

/** Escena -> loop (nombre base del archivo en /music). Las pantallas
 *  sin loop propio heredan el de una escena cercana. */
const SCENE_LOOPS: Record<string, string> = {
  // Regiones del Archipiélago: un loop propio cada una.
  bosque: "bosque",
  ciudad: "ciudad",
  fortaleza: "fortaleza",
  biblioteca: "biblioteca",
  puerto: "puerto",
  torre: "torre",
  observatorio: "observatorio",
  forja: "forja",
  // Escenas globales.
  welcome: "welcome",
  map: "map",
  missions: "missions",
  results: "results",
  arcade: "arcade",
  errors: "errors",
  stats: "stats",
  // Escenas que heredan: sin archivo extra (mismo espíritu, menos peso).
  home: "welcome",
  placement: "welcome",
  collection: "biblioteca",
  library: "biblioteca",
  profile: "map",
  settings: "puerto",
  station: "welcome",
};

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
  musicFailed.add(name); // hoy no llega: esta escena quedará en silencio
  return null;
}

/* ------------------------ voz de loop con fundidos ------------------------ */

interface LoopVoice {
  scene: string;
  src: AudioBufferSourceNode;
  gain: GainNode;
  stopAt: number;
}

let currentLoop: LoopVoice | null = null;
let loopSeq = 0; // desecha arranques de escenas ya abandonadas

/** Funde y detiene una voz de loop (cambio de escena o silencio). */
function fadeOutLoop(voice: LoopVoice, seconds = 1.2) {
  const ac = ctx;
  if (!ac) return;
  try {
    voice.gain.gain.cancelScheduledValues(ac.currentTime);
    voice.gain.gain.setTargetAtTime(0.0001, ac.currentTime, seconds / 3);
  } catch {
    /* ya liberada */
  }
  const src = voice.src;
  setTimeout(() => {
    try {
      src.stop();
    } catch {
      /* ya parada */
    }
  }, seconds * 1000 + 300);
}

/** Arranca el loop de una escena con fundido de entrada (si no suena ya). */
async function startScene(sceneId: string) {
  const ac = ensureCtx();
  if (!ac || !enabled) return;
  const name = SCENE_LOOPS[sceneId] ?? SCENE_LOOPS.home;
  currentScene = sceneId;
  const seq = ++loopSeq;

  // Si la escena anterior se silenció (stopSceneMusic), recupera el volumen.
  if (musicBus) musicBus.gain.setTargetAtTime(musicVolume, ac.currentTime, 0.5);

  // ¿Ya suena este mismo loop? Nada que hacer (ni cortar ni reiniciar).
  if (currentLoop && SCENE_LOOPS[currentLoop.scene] === name) return;

  // Funde el loop anterior mientras carga el nuevo (crossfade real).
  if (currentLoop) {
    fadeOutLoop(currentLoop, 1.2);
    currentLoop = null;
  }

  const buf = await loadMusicLoop(name);
  // Mientras cargaba: otra escena mandó, o el jugador silenció. Fuera.
  if (!buf || seq !== loopSeq || !enabled || !ctx) return;

  try {
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.setTargetAtTime(1, ctx.currentTime, 0.5); // entrada suave ~1,5 s
    src.connect(gain).connect(musicBus ?? ctx.destination);
    src.start();
    currentLoop = { scene: sceneId, src, gain, stopAt: 0 };
  } catch {
    /* navegador caprichoso: esta escena quedará en silencio */
  }
}

/** Cambia la música de escena con fundido. La escena ya activa no se re-inicia. */
export function setSceneMusic(sceneId: string | null) {
  if (!sceneId || sceneId === currentScene) return;
  if (!ctx || !unlocked) {
    currentScene = sceneId; // se aplicará al desbloquear
    return;
  }
  void startScene(sceneId);
}

/** Silencia la escena actual con fundido (partidas sin música de menú). */
export function stopSceneMusic() {
  currentScene = null;
  if (currentLoop) {
    fadeOutLoop(currentLoop, 0.9);
    currentLoop = null;
  }
}

/* ============== EL GRAN RELOJ EN CONTRATIEMPO (archivos reales) ==============
 * Tic-tac de archivo (public/sfx/clockTick*.ogg, CC0) que vive en los
 * contratiempos: en reposo muy sutil; con tensión se vuelve insistente,
 * acelera y sube de tono (playbackRate) hasta el clímax final. Como los
 * loops de música ya vienen grabados, el reloj marca su propio pulso
 * constante (2 tics/s en reposo) en lugar de anclarse al tempo de la
 * escena: misma presencia, menos piezas. */

let clockOn = false;
let clockNextTime = 0;
let clockHigh = false;
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
    const vol = (clockOn ? 0.05 : 0.016) * (0.4 + tension * 1.6);
    const rate = 1 + tension * 0.35; // sube de tono con la tensión
    const variant = clockHigh ? "clockTick" : "tock";
    playFileAt(variant, clockNextTime, { rate, gain: vol, bus: clockBus });
    clockHigh = !clockHigh; // tic ... tac ...
    if (tension > 0.55) {
      // doble tic nervioso entre contratiempos
      playFileAt("clockTick2", clockNextTime + interval * 0.3, {
        rate: rate * 1.06,
        gain: vol * 0.5,
        bus: clockBus,
      });
    }
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

/** ¿Hay música sonando? (para el indicador de ajustes) */
export function isMusicPlaying(): boolean {
  return !!currentLoop && !!currentScene;
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

/** Efecto -> variantes de archivo (se alternan al azar). Los métodos
 *  sin grabación propia reutilizan un archivo cercano con
 *  velocidad/volumen ajustados, como haría un diseñador sonoro. */
const SFX_FILES: Record<string, SfxFileSpec[]> = {
  tap: [{ base: "tap", gain: 1 }, { base: "tap2", gain: 1 }, { base: "tap3", gain: 1 }],
  click: [{ base: "click" }, { base: "click2" }, { base: "click3" }],
  toggle: [{ base: "toggle" }, { base: "toggle2" }, { base: "toggle3" }],
  pop: [{ base: "pop" }, { base: "pop2" }, { base: "pop3" }],
  correct: [{ base: "correct", gain: 1 }, { base: "correct2", gain: 1 }, { base: "correct3", gain: 1 }],
  wrong: [{ base: "wrong" }, { base: "wrong2" }, { base: "wrong3" }],
  error: [{ base: "error" }, { base: "error2" }],
  whoosh: [{ base: "whoosh" }, { base: "whoosh2" }, { base: "whoosh3" }],
  slide: [{ base: "slide" }, { base: "slide2" }],
  page: [{ base: "page" }, { base: "page2" }],
  flip: [{ base: "flip" }, { base: "flip2" }],
  deal: [{ base: "deal" }, { base: "deal2" }],
  place: [{ base: "place" }, { base: "place2" }],
  snap: [{ base: "snap" }, { base: "snap2" }],
  open: [{ base: "open" }, { base: "open2" }],
  close: [{ base: "close" }, { base: "close2" }],
  back: [{ base: "back" }, { base: "back2" }],
  navigate: [{ base: "navigate" }, { base: "navigate2" }],
  coin: [{ base: "coin", gain: 1 }, { base: "coin2", gain: 1 }],
  coins: [{ base: "coins" }, { base: "coins2" }, { base: "coins3" }],
  tinta: [{ base: "tinta" }, { base: "tinta2" }],
  buy: [{ base: "buy" }, { base: "buy2" }],
  unlock: [{ base: "unlock" }],
  levelUp: [{ base: "levelUp" }, { base: "levelUp2" }],
  achievement: [{ base: "achievement" }, { base: "achievement2" }],
  gift: [{ base: "gift" }],
  claim: [{ base: "claim" }, { base: "claim2" }],
  streak: [{ base: "streak" }],
  stepUp: [{ base: "stepUp" }],
  sparkle: [{ base: "sparkle" }, { base: "sparkle2" }],
  confetti: [{ base: "confetti" }, { base: "confetti2" }],
  chime: [{ base: "chime" }, { base: "chime2" }],
  sessionWin: [{ base: "sessionWin" }],
  sessionEnd: [{ base: "sessionEnd" }, { base: "sessionEnd2" }],
  sessionLose: [{ base: "sessionLose" }],
  go: [{ base: "go" }, { base: "go2" }],
  combo: [{ base: "combo" }, { base: "combo2" }],
  countdown: [{ base: "countdown" }, { base: "countdown2" }],
  tick: [{ base: "tick", gain: 0.9 }, { base: "tick2", gain: 0.9 }],
  tock: [{ base: "tock", gain: 0.9 }, { base: "tock2", gain: 0.9 }],
  stamp: [{ base: "stamp" }],
  buoy: [{ base: "buoy" }],
  typeKey: [{ base: "typeKey", rate: 1.15, gain: 0.5 }],
  typeWord: [{ base: "typeWord", gain: 0.9 }],
};

const sfxBufferCache = new Map<string, AudioBuffer>();
const sfxFileFailed = new Set<string>();
const sfxFileLoading = new Set<string>();

async function loadSfxFile(base: string): Promise<void> {
  const c = ensureCtx();
  const key = `${base}.ogg`;
  if (!c || sfxBufferCache.has(key) || sfxFileFailed.has(base) || sfxFileLoading.has(base)) return;
  sfxFileLoading.add(base);
  // .ogg preferido; .mp3 de respaldo (Safari/iOS).
  for (const src of [`/sfx/${base}.ogg`, `/sfx/${base}.mp3`]) {
    try {
      const res = await fetch(src);
      if (!res.ok) continue;
      const bytes = await res.arrayBuffer();
      sfxBufferCache.set(key, await c.decodeAudioData(bytes));
      return;
    } catch {
      /* probamos el siguiente formato */
    }
  }
  sfxFileFailed.add(base); // este efecto no llega: síntesis permanente para él
  sfxFileLoading.delete(base);
}

/** Precarga los sonidos más frecuentes justo tras el primer gesto. */
export function warmupSfxFiles(): void {
  for (const key of ["tap", "click", "correct", "wrong", "whoosh", "flip", "page", "coin", "clockTick", "tock"]) {
    const spec = SFX_FILES[key]?.[0] ?? (key === "clockTick" ? { base: "clockTick" } : key === "tock" ? { base: "tock" } : undefined);
    if (spec) void loadSfxFile(spec.base);
  }
}

/** Intenta sonar con archivo. false -> el sintetizador toma el turno. */
function playSfxFile(name: string): boolean {
  if (!enabled) return true; // silencio pedido: no suena nada (ni archivo ni síntesis)
  const variants = SFX_FILES[name];
  if (!variants || variants.length === 0) return false;
  const spec = variants[Math.floor(Math.random() * variants.length)];
  const c = ensureCtx();
  if (!c) return false;
  const key = `${spec.base}.ogg`;
  const buf = sfxBufferCache.get(key);
  if (!buf) {
    if (!sfxFileFailed.has(spec.base)) void loadSfxFile(spec.base); // llegará para la próxima
    return false;
  }
  try {
    const node = c.createBufferSource();
    node.buffer = buf;
    node.playbackRate.value = spec.rate ?? 1;
    const g = c.createGain();
    g.gain.value = (spec.gain ?? 1) * sfxVolume;
    node.connect(g);
    g.connect(sfxBus ?? c.destination);
    node.start();
  } catch {
    return false;
  }
  return true;
}

/** Lista de efectos con archivo, con sus variantes, para «Probar sonidos». */
export function sfxShowcase(): { key: string; label: string }[] {
  return [
    { key: "tap", label: "Toque (botones)" },
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
    { key: "clockTick", label: "Reloj (tic-tac)" },
  ];
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
      if (playSfxFile(name)) {
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
