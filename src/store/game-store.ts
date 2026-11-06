"use client";

/**
 * Store central del juego · Zustand.
 * Mantiene perfil, ajustes, núcleo de progreso y tarjetas SRS en memoria
 * y los persiste en IndexedDB (con guardado diferido y volcado inmediato
 * en los momentos críticos).
 */

import { create } from "zustand";
import type {
  AnswerRecord,
  GameSettings,
  PlayerProfile,
  SrsCard,
  SrsGrade,
  SessionSpec,
  SessionResult,
  SkillId,
} from "@/types";
import { createCore, reduceSessionComplete, computePlacement } from "@/engine/core";
import { reviewCard, newCard, isLearned, isMastered } from "@/engine/srs";
import { storage, CURRENT_SCHEMA_VERSION, type PersistedState } from "@/services/storage";
import { useMusicStore } from "@/services/music-station";
import { setSoundEnabled, setMusicVolume, setSfxVolume } from "@/services/audio";

const SAVE_DEBOUNCE_MS = 700;

export const DEFAULT_SETTINGS: GameSettings = {
  reduceMotion: false,
  textSize: "md",
  sound: true,
  musicVolume: 0.55,
  sfxVolume: 0.9,
  dailyGoalXp: 120,
  newCardsPerDay: 8,
  offlineMode: true,
  nightMode: false,
  themeColor: "aurora",
  musicInGames: false,
  stationVolume: 0.75,
  stationInGames: false,
};

export interface GameStore {
  hydrated: boolean;
  hasProfile: boolean;
  profile: PlayerProfile;
  settings: GameSettings;
  core: ReturnType<typeof createCore>;
  srs: Record<string, SrsCard>;
  lastResult: SessionResult | null;

  hydrate: () => Promise<void>;
  finishOnboarding: (profile: Omit<PlayerProfile, "createdAt" | "onboarded" | "placementDone">) => void;
  finishPlacement: (answers: { skill: SkillId; difficulty: number; correct: boolean }[]) => void;
  skipPlacement: () => void;
  completeSession: (spec: SessionSpec, answers: AnswerRecord[], durationMs: number) => SessionResult;
  rateCard: (wordId: string, grade: SrsGrade) => void;
  updateSettings: (partial: Partial<GameSettings>) => void;
  updateProfile: (partial: Partial<PlayerProfile>) => void;
  resetAll: () => Promise<void>;
  /** Borra progreso (XP, niveles, logros, misiones, historial) conservando perfil y ajustes. */
  resetProgress: () => Promise<void>;
  /** Borra solo el jardín de tarjetas (SRS). */
  resetSrs: () => Promise<void>;
  exportJson: () => string | null;
  importJson: (text: string) => Promise<boolean>;
  clearLastResult: () => void;
}

const EMPTY_PROFILE: PlayerProfile = {
  name: "",
  avatar: "owl",
  goal: "leer",
  experience: "principiante",
  gender: "x",
  bio: "",
  banner: "preset:aurora",
  photo: "",
  createdAt: 0,
  onboarded: false,
  placementDone: false,
};

let saveTimer: ReturnType<typeof setTimeout> | null = null;
let pendingSave = false;

function applySettingsSideEffects(settings: GameSettings) {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.textSize = settings.textSize;
  document.documentElement.dataset.theme = settings.themeColor ?? "aurora";
  document.documentElement.classList.toggle("reduce-motion", settings.reduceMotion);
  document.documentElement.classList.toggle("night", settings.nightMode);
  setSoundEnabled(settings.sound);
  setMusicVolume(settings.musicVolume);
  setSfxVolume(settings.sfxVolume);
  useMusicStore.getState().setVolume(settings.stationVolume ?? 0.75);
}

export const useGameStore = create<GameStore>((set, get) => {
  const persist = (immediate = false) => {
    const { profile, settings, core, srs } = get();
    const state: PersistedState = {
      version: CURRENT_SCHEMA_VERSION,
      profile,
      settings,
      core,
      srs,
      savedAt: Date.now(),
    };
    pendingSave = true;
    const doSave = () => {
      pendingSave = false;
      void storage.save(state);
    };
    if (immediate) {
      if (saveTimer) clearTimeout(saveTimer);
      doSave();
      return;
    }
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(doSave, SAVE_DEBOUNCE_MS);
  };

  // Volcado al cerrar/ocultar la pestaña: nunca se pierde progreso.
  if (typeof window !== "undefined") {
    const flush = () => {
      if (!pendingSave) return;
      if (saveTimer) clearTimeout(saveTimer);
      const { profile, settings, core, srs } = get();
      void storage.save({ version: CURRENT_SCHEMA_VERSION, profile, settings, core, srs, savedAt: Date.now() });
      pendingSave = false;
    };
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") flush();
    });
  }

  return {
    hydrated: false,
    hasProfile: false,
    profile: EMPTY_PROFILE,
    settings: DEFAULT_SETTINGS,
    core: createCore(),
    srs: {},
    lastResult: null,

    async hydrate() {
      const saved = await storage.load();
      if (saved && saved.profile) {
        const settings = { ...DEFAULT_SETTINGS, ...saved.settings };
        set({
          hydrated: true,
          hasProfile: saved.profile.onboarded,
          profile: saved.profile,
          settings,
          core: saved.core ?? createCore(),
          srs: saved.srs ?? {},
        });
        applySettingsSideEffects(settings);
      } else {
        set({ hydrated: true, hasProfile: false });
        applySettingsSideEffects(DEFAULT_SETTINGS);
      }
    },

    finishOnboarding(profileData) {
      const profile: PlayerProfile = {
        ...profileData,
        createdAt: Date.now(),
        onboarded: true,
        placementDone: false,
      };
      set({ profile, hasProfile: true });
      persist(true);
    },

    finishPlacement(answers) {
      const { profile, core } = get();
      const skills = computePlacement(profile.experience, answers);
      set({
        profile: { ...profile, placementDone: true },
        core: { ...core, skills },
      });
      persist(true);
    },

    skipPlacement() {
      const { profile } = get();
      set({ profile: { ...profile, placementDone: true } });
      persist(true);
    },

    completeSession(spec, answers, durationMs) {
      const { core, srs } = get();
      const cards = Object.values(srs);
      const learned = cards.filter(isLearned).length;
      const mastered = cards.filter(isMastered).length;
      const { core: nextCore, result } = reduceSessionComplete(core, {
        spec,
        answers,
        durationMs,
        now: new Date(),
        masteredWords: mastered,
        learnedWords: learned,
      });
      set({ core: nextCore, lastResult: result });
      persist(true); // Fin de sesión: guardado inmediato.
      return result;
    },

    rateCard(wordId, grade) {
      const { srs } = get();
      const card = srs[wordId] ?? newCard(wordId, Date.now());
      const updated = reviewCard(card, grade, Date.now());
      set({ srs: { ...srs, [wordId]: updated } });
      persist(); // diferido: las ráfagas de tarjetas no bloquean la UI
    },

    updateSettings(partial) {
      const settings = { ...get().settings, ...partial };
      set({ settings });
      applySettingsSideEffects(settings);
      persist(true);
    },

    updateProfile(partial) {
      const profile = { ...get().profile, ...partial };
      set({ profile });
      persist(true);
    },

    async resetAll() {
      await storage.clear();
      set({
        hasProfile: false,
        profile: EMPTY_PROFILE,
        settings: DEFAULT_SETTINGS,
        core: createCore(),
        srs: {},
        lastResult: null,
      });
      applySettingsSideEffects(DEFAULT_SETTINGS);
    },

    async resetProgress() {
      const core = createCore();
      set({ core, lastResult: null });
      persist(true);
    },

    async resetSrs() {
      set({ srs: {} });
      persist(true);
    },

    exportJson() {
      const { profile, settings, core, srs } = get();
      return storage.export({ version: CURRENT_SCHEMA_VERSION, profile, settings, core, srs, savedAt: Date.now() });
    },

    async importJson(text) {
      const parsed = storage.parseImport(text);
      if (!parsed) return false;
      set({
        profile: parsed.profile,
        settings: { ...DEFAULT_SETTINGS, ...parsed.settings },
        core: parsed.core,
        srs: parsed.srs ?? {},
        hasProfile: parsed.profile.onboarded,
      });
      applySettingsSideEffects({ ...DEFAULT_SETTINGS, ...parsed.settings });
      await storage.save(parsed);
      return true;
    },

    clearLastResult() {
      set({ lastResult: null });
    },
  };
});
