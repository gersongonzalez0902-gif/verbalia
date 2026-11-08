"use client";

/**
 * Estación de música del jugador · VERBALIA (Etapa 3).
 * ---------------------------------------------------------------
 * El jugador carga sus propias canciones (archivos locales) y la
 * estación las guarda en IndexedDB — nunca salen del dispositivo —
 * para reproducirlas en aleatorio, pasarlas, repetirlas, etc.
 * El <audio> vive en un singleton: la música sigue sonando mientras
 * se navega por el Archipiélago.
 */

import { create } from "zustand";
import { useUiStore } from "@/store/ui-store";

export interface StationTrack {
  id: string;
  name: string;
  type: string;
  size: number;
  addedAt: number;
}

const DB_NAME = "verbalia-music";
const DB_VERSION = 1;
const STORE = "tracks";

/* ------------------------------ IndexedDB ------------------------------ */

let dbPromise: Promise<IDBDatabase | null> | null = null;

function openDb(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === "undefined") return Promise.resolve(null);
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve) => {
    try {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        if (!req.result.objectStoreNames.contains(STORE)) {
          req.result.createObjectStore(STORE, { keyPath: "id" });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
  return dbPromise;
}

async function dbPut(rec: StationTrack & { blob: Blob }): Promise<boolean> {
  const db = await openDb();
  if (!db) return false;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put(rec);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
      tx.onabort = () => resolve(false);
    } catch {
      resolve(false);
    }
  });
}

async function dbDelete(id: string): Promise<void> {
  const db = await openDb();
  if (!db) return;
  await new Promise<void>((resolve) => {
    try {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

async function dbList(): Promise<(StationTrack & { blob: Blob })[]> {
  const db = await openDb();
  if (!db) return [];
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).getAll();
      req.onsuccess = () => resolve((req.result as (StationTrack & { blob: Blob })[]) ?? []);
      req.onerror = () => resolve([]);
    } catch {
      resolve([]);
    }
  });
}

/* ------------------------------ Reproductor ------------------------------ */

let audio: HTMLAudioElement | null = null;
let currentUrl: string | null = null;
let eventsAttached = false;
const blobCache = new Map<string, Blob>();

function getAudio(): HTMLAudioElement | null {
  if (typeof Audio === "undefined" || typeof window === "undefined") return null;
  if (!audio) {
    audio = new Audio();
    audio.preload = "metadata";
  }
  return audio;
}

export type RepeatMode = "off" | "all" | "one";

export interface MusicStore {
  loaded: boolean;
  tracks: StationTrack[];
  currentId: string | null;
  playing: boolean;
  shuffle: boolean;
  repeatMode: RepeatMode;
  volume: number;
  currentTime: number;
  duration: number;
  error: string | null;

  load: () => Promise<void>;
  addFiles: (files: FileList | File[]) => Promise<number>;
  removeTrack: (id: string) => Promise<void>;
  playTrack: (id: string) => Promise<void>;
  toggle: () => void;
  next: (auto?: boolean) => void;
  prev: () => void;
  setShuffle: (v: boolean) => void;
  cycleRepeat: () => void;
  setVolume: (v: number) => void;
  seek: (t: number) => void;
}

/** Utilidades internas (fuera del store para no serializarlas). */
function stopAudio() {
  const a = getAudio();
  a?.pause();
  if (currentUrl) {
    URL.revokeObjectURL(currentUrl);
    currentUrl = null;
  }
}

/* ---- Guardián de visibilidad: la estación calla al ocultar la página ----
 * (pestaña en segundo plano, teléfono bloqueado o app suspendida) y
 * retoma la canción justo donde iba al volver. */
let stationGuardOn = false;
let stationPausedByVisibility = false;

function registerStationVisibilityGuard() {
  if (typeof window === "undefined" || stationGuardOn) return;
  stationGuardOn = true;
  document.addEventListener("visibilitychange", () => {
    const a = getAudio();
    if (!a) return;
    if (document.visibilityState === "hidden") {
      if (useMusicStore.getState().playing && !a.paused) {
        stationPausedByVisibility = true;
        a.pause(); // el estado «playing» del store se conserva: es un pausa técnica
      }
    } else if (stationPausedByVisibility) {
      stationPausedByVisibility = false;
      void a.play().catch(() => {
        /* si el navegador lo impide, el jugador pulsa play */
      });
    }
  });
  window.addEventListener("pagehide", () => {
    const a = getAudio();
    if (a && !a.paused && useMusicStore.getState().playing) {
      stationPausedByVisibility = true;
      a.pause();
    }
  });
  window.addEventListener("pageshow", () => {
    const a = getAudio();
    if (a && stationPausedByVisibility) {
      stationPausedByVisibility = false;
      void a.play().catch(() => {});
    }
  });
}

/** Metadatos para el sistema (MediaSession): título en la pantalla de bloqueo. */
function syncMediaSession() {
  if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;
  const { currentId, tracks } = useMusicStore.getState();
    const track = tracks.find((t) => t.id === currentId);
  try {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: track?.name ?? "Estación de VerbalIA",
      artist: "VerbalIA · Estación del navegante",
      album: "El Archipiélago de las Palabras",
    });
    navigator.mediaSession.playbackState = useMusicStore.getState().playing ? "playing" : "paused";
    navigator.mediaSession.setActionHandler("play", () => useMusicStore.getState().toggle());
    navigator.mediaSession.setActionHandler("pause", () => useMusicStore.getState().toggle());
    navigator.mediaSession.setActionHandler("nexttrack", () => useMusicStore.getState().next());
    navigator.mediaSession.setActionHandler("previoustrack", () => useMusicStore.getState().prev());
  } catch {
    /* sin MediaSession en este navegador */
  }
}

export const useMusicStore = create<MusicStore>((set, get) => {
  const syncPlaying = (playing: boolean) => {
    set({ playing });
    useUiStore.getState().setStationPlaying(playing);
  };

  const attachTrack = (track: StationTrack) => {
    stopAudio();
    const blob = blobCache.get(track.id);
    if (!blob) return;
    const a = getAudio();
    if (!a) return;
    ensureEvents(a);
    currentUrl = URL.createObjectURL(blob);
    a.src = currentUrl;
    a.volume = get().volume;
    a.loop = get().repeatMode === "one";
  };

  /** Suscripción única a los eventos del elemento de audio (perezosa, solo cliente). */
  const ensureEvents = (a: HTMLAudioElement) => {
    if (eventsAttached) return;
    eventsAttached = true;
    a.addEventListener("ended", () => {
      if (get().repeatMode === "one") {
        void a.play().catch(() => {}); // autoplay bloqueado: se ignora en silencio
        return;
      }
      get().next(true);
    });
    a.addEventListener("timeupdate", () => {
      set({ currentTime: a.currentTime, duration: Number.isFinite(a.duration) ? a.duration : 0 });
    });
    a.addEventListener("loadedmetadata", () => {
      set({ duration: Number.isFinite(a.duration) ? a.duration : 0 });
    });
  };

  /** Índice siguiente según modo aleatorio. */
  const pickNext = (dir: 1 | -1, auto: boolean): StationTrack | null => {
    const { tracks, shuffle, currentId } = get();
    if (tracks.length === 0) return null;
    if (tracks.length === 1) return auto ? null : tracks[0];
    if (shuffle) {
      let i = Math.floor(Math.random() * tracks.length);
      if (tracks[i].id === currentId) i = (i + dir + tracks.length) % tracks.length;
      return tracks[i];
    }
    const idx = tracks.findIndex((t) => t.id === currentId);
    const nextIdx = (idx + dir + tracks.length) % tracks.length;
    return tracks[nextIdx];
  };

  return {
    loaded: false,
    tracks: [],
    currentId: null,
    playing: false,
    shuffle: true,
    repeatMode: "all",
    volume: 0.75,
    currentTime: 0,
    duration: 0,
    error: null,

    async load() {
      registerStationVisibilityGuard();
      const rows = await dbList();
      const tracks = rows
        .map(({ blob, ...meta }) => {
          blobCache.set(meta.id, blob);
          return meta;
        })
        .sort((x, y) => x.addedAt - y.addedAt);
      set({ tracks, loaded: true });
    },

    async addFiles(files) {
      const audioLike = [...files].filter((f) => f.type.startsWith("audio/") || /\.(mp3|ogg|wav|m4a|flac|opus|webm)$/i.test(f.name));
      let added = 0;
      for (const f of audioLike) {
        const id = `trk-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
        const rec: StationTrack & { blob: Blob } = {
          id,
          name: f.name.replace(/\.[^.]+$/, "").slice(0, 80),
          type: f.type || "audio",
          size: f.size,
          addedAt: Date.now(),
          blob: f,
        };
        const ok = await dbPut(rec);
        if (ok) {
          blobCache.set(id, f);
          set((s) => ({ tracks: [...s.tracks, { id, name: rec.name, type: rec.type, size: rec.size, addedAt: rec.addedAt }] }));
          added += 1;
        }
      }
      if (audioLike.length > added) {
        set({ error: "No se pudieron guardar todas las canciones (¿espacio del navegador?)." });
      }
      return added;
    },

    async removeTrack(id) {
      await dbDelete(id);
      blobCache.delete(id);
      const { currentId } = get();
      if (currentId === id) {
        stopAudio();
        syncPlaying(false);
        set({ currentId: null, currentTime: 0, duration: 0 });
      }
      set((s) => ({ tracks: s.tracks.filter((t) => t.id !== id) }));
    },

    async playTrack(id) {
      const track = get().tracks.find((t) => t.id === id);
      if (!track) return;
      attachTrack(track);
      if (!getAudio()) {
        set({ error: "Reproducción no disponible en este entorno." });
        return;
      }
      set({ currentId: id, currentTime: 0 });
      try {
        await getAudio()!.play();
        syncPlaying(true);
        syncMediaSession();
      } catch {
        syncPlaying(false);
        set({ error: "El navegador bloqueó la reproducción: pulsa play de nuevo." });
      }
    },

    toggle() {
      const a = getAudio();
      const { playing, currentId, tracks } = get();
      if (!a) return;
      if (playing) {
        a.pause();
        syncPlaying(false);
        return;
      }
      if (!currentId && tracks.length > 0) {
        void get().playTrack(tracks[0].id);
        return;
      }
      if (currentId) {
        ensureEvents(a);
        void a
          .play()
          .then(() => syncPlaying(true))
          .catch(() => set({ error: "No se pudo reproducir. Vuelve a pulsar." }));
      }
    },

    next(auto = false) {
      const nextTrack = pickNext(1, auto);
      if (!nextTrack) {
        // Fin de la cola con repetición apagada.
        stopAudio();
        syncPlaying(false);
        set({ currentTime: 0 });
        return;
      }
      void get().playTrack(nextTrack.id);
    },

    prev() {
      const a = getAudio();
      if (!a) return;
      // Si lleva más de 4 s sonando, reinicia la canción (como toda radio que se precie).
      if (a.currentTime > 4 && get().currentId) {
        a.currentTime = 0;
        return;
      }
      const prevTrack = pickNext(-1, false);
      if (prevTrack) void get().playTrack(prevTrack.id);
    },

    setShuffle(v) {
      set({ shuffle: v });
    },

    cycleRepeat() {
      const order: RepeatMode[] = ["off", "all", "one"];
      const nextMode = order[(order.indexOf(get().repeatMode) + 1) % order.length];
      set({ repeatMode: nextMode });
      const a = getAudio();
      if (a) a.loop = nextMode === "one";
    },

    setVolume(v) {
      const vol = Math.min(1, Math.max(0, v));
      set({ volume: vol });
      const a = getAudio();
      if (a) a.volume = vol;
    },

    seek(t) {
      const a = getAudio();
      if (a && Number.isFinite(a.duration)) {
        a.currentTime = Math.min(Math.max(0, t), a.duration);
        set({ currentTime: a.currentTime });
      }
    },
  };
});

/* ------------------------------ Metadatos ------------------------------ */

/** Título legible para el MediaSession del sistema (si existe). */
export function currentTrackTitle(): string | null {
  const { currentId, tracks } = useMusicStore.getState();
  if (!currentId) return null;
  return tracks.find((t) => t.id === currentId)?.name ?? null;
}

export function stationTrackCount(): number {
  return useMusicStore.getState().tracks.length;
}
