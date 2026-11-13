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
  GameCore,
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
import { EMPTY_PROFILE, migrateProfile, migrateCore } from "@/engine/migrate";
import { applyPurchase, applyEquip, claimDailyGift, MAX_SHIELDS } from "@/engine/shop";
import { dailyMissions, weeklyMissions, metricValue, dateKey, weekKey, daysOfWeek, dailyClaimKey, weeklyClaimKey } from "@/engine/missions";
import { levelFromXp, cumulativeXpForLevel, MAX_LEVEL } from "@/engine/xp";
import { isAdminName, ADMIN_TINTA } from "@/engine/admin";
import { ACHIEVEMENTS_BY_ID } from "@/data/achievements";
import { applyArcadeUnlock, applyArcadeScore, applyTypingTest, type TypingResult } from "@/engine/arcade";
import { storage, CURRENT_SCHEMA_VERSION, enqueueSessionEvent, markSyncDirty, type PersistedState } from "@/services/storage";
import { useMusicStore } from "@/services/music-station";
import { setSoundEnabled, setMusicVolume, setSfxVolume, setTtsRate, setHaptics } from "@/services/audio";

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
  ttsRate: 1,
  haptics: false,
  typingSounds: true,
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
  /** Compra un artículo del Bazar del Copista con tinta. */
  buyShopItem: (itemId: string) => "ok" | "sin-fondos" | "ya-propietario" | "escudo-lleno" | "item-desconocido";
  /** Equipa un marco o título ya comprado. */
  equipShopItem: (itemId: string) => void;
  /** Reclama el regalo diario de tinta del Bazar. */
  claimDailyTinta: () => boolean;
  /** Desbloquea un juego del Salón con tinta. */
  unlockArcade: (gameId: string) => "ok" | "sin-fondos" | "ya-desbloqueado" | "item-desconocido";
  /** Registra la puntuación de una partida del Salón (XP + tinta + récord). */
  recordArcadeScore: (gameId: string, score: number) => { xp: number; tinta: number; isRecord: boolean };
  /** Registra una prueba del Taller de Escritura (mecanografía). */
  recordTypingTest: (result: Omit<TypingResult, "core">) => { xp: number; isRecord: boolean };
  /** Recoge manualmente la recompensa de una misión diaria o semanal. */
  claimMission: (scope: "daily" | "weekly", missionId: string) => { ok: boolean; xp: number; tinta: number; shield: boolean };
  /** Recoge manualmente la recompensa de un logro desbloqueado. */
  claimAchievement: (achievementId: string) => { ok: boolean; xp: number; tinta: number };
  resetAll: () => Promise<void>;
  /** Borra progreso (XP, niveles, logros, misiones, historial) conservando perfil y ajustes. */
  resetProgress: () => Promise<void>;
  /** Borra solo el jardín de tarjetas (SRS). */
  resetSrs: () => Promise<void>;
  /** Adopta el estado canónico del servidor tras un sync (06-sync §3). */
  adoptSyncedState: (payload: PersistedState) => Promise<void>;
  /** Copia local en JSON legible (visible solo sin sesión: Ola 1.2). */
  exportJson: () => string;
  /** Restaura una copia exportada (valida el esqueleto y la versión). */
  importJson: (text: string) => Promise<boolean>;
  clearLastResult: () => void;
}

const EMPTY_PROFILE_STORE: PlayerProfile = EMPTY_PROFILE;

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
  setTtsRate(settings.ttsRate ?? 1);
  setHaptics(Boolean(settings.haptics));
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
    // Todo cambio local marca la cola de sincronización como sucia (06 §2).
    markSyncDirty();
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
        const profile = migrateProfile(saved.profile);
        set({
          hydrated: true,
          hasProfile: profile.onboarded,
          profile,
          settings,
          core: migrateCore(saved.core),
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
      // AdminG: navegante de pruebas con todo el archipiélago abierto.
      if (isAdminName(profile.name)) {
        const core = get().core;
        set({
          profile,
          hasProfile: true,
          core: {
            ...core,
            xp: Math.max(core.xp, cumulativeXpForLevel(MAX_LEVEL)),
            wallet: { ...core.wallet, tinta: Math.max(core.wallet?.tinta ?? 0, ADMIN_TINTA) },
          },
        });
      } else {
        set({ profile, hasProfile: true });
      }
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
      // Capa online: encola progress/events (transcripción + resultado) para
      // la cola offline. Fire-and-forget: el juego nunca espera por la red.
      void enqueueSessionEvent(spec, answers, durationMs, result).catch(() => null);
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
      // Renombrarse a AdminG activa el modo de pruebas al vuelo.
      if (isAdminName(profile.name) && !isAdminName(get().profile.name)) {
        const core = get().core;
        set({
          profile,
          core: {
            ...core,
            xp: Math.max(core.xp, cumulativeXpForLevel(MAX_LEVEL)),
            wallet: { ...core.wallet, tinta: Math.max(core.wallet?.tinta ?? 0, ADMIN_TINTA) },
          },
        });
      } else {
        set({ profile });
      }
      persist(true);
    },

    buyShopItem(itemId) {
      const outcome = applyPurchase(get().core, itemId);
      if (!outcome.ok || !outcome.core) return outcome.reason ?? "item-desconocido";
      set({ core: outcome.core });
      persist(true);
      return "ok";
    },

    equipShopItem(itemId) {
      const core = applyEquip(get().core, itemId);
      set({ core });
      persist(true);
    },

    claimDailyTinta() {
      const outcome = claimDailyGift(get().core);
      if (!outcome.ok) return false;
      set({ core: outcome.core });
      persist(true);
      return true;
    },

    unlockArcade(gameId) {
      const outcome = applyArcadeUnlock(get().core, gameId);
      if (!outcome.ok || !outcome.core) return outcome.reason ?? "item-desconocido";
      set({ core: outcome.core });
      persist(true);
      return "ok";
    },

    recordArcadeScore(gameId, score) {
      const outcome = applyArcadeScore(get().core, gameId, score);
      set({ core: outcome.core });
      persist(true);
      return { xp: outcome.xp, tinta: outcome.tinta, isRecord: outcome.isRecord };
    },

    recordTypingTest(result) {
      const outcome = applyTypingTest(get().core, result);
      set({ core: outcome.core });
      persist(true);
      return { xp: outcome.xp, isRecord: outcome.isRecord };
    },

    claimMission(scope, missionId) {
      const core = get().core;
      const now = new Date();
      const level = levelFromXp(core.xp);
      const list = scope === "daily" ? dailyMissions(dateKey(now), level) : weeklyMissions(weekKey(now), level);
      const def = list.find((m) => m.id === missionId);
      if (!def) return { ok: false, xp: 0, tinta: 0, shield: false };
      const scopeDays = scope === "daily" ? [dateKey(now)] : daysOfWeek(now);
      const reached = metricValue(core, def.metric, { days: scopeDays });
      if (reached < def.target) return { ok: false, xp: 0, tinta: 0, shield: false };
      // Clave con ámbito de periodo: reclamar «d-md-xp» un martes no puede
      // marcar la misión del mismo nombre del jueves (ni impedir cobrarla).
      const claimKey = scope === "daily" ? dailyClaimKey(dateKey(now), missionId) : weeklyClaimKey(weekKey(now), missionId);
      const store = scope === "daily" ? core.missions.daily : core.missions.weekly;
      if (store.claimed.includes(claimKey)) return { ok: false, xp: 0, tinta: 0, shield: false };

      const xp = def.xpReward;
      const tinta = def.tintaReward ?? 0;
      let next = {
        ...core,
        xp: core.xp + xp,
        wallet: { ...core.wallet, tinta: core.wallet.tinta + tinta },
        missions: {
          ...core.missions,
          [scope]: { ...store, claimed: [...store.claimed, claimKey] },
        } as GameCore["missions"],
      };
      if (def.shieldReward) {
        next = { ...next, streak: { ...next.streak, shields: Math.min(MAX_SHIELDS, next.streak.shields + 1) } };
      }
      set({ core: next });
      persist(true);
      return { ok: true, xp, tinta, shield: Boolean(def.shieldReward) };
    },

    claimAchievement(achievementId) {
      const core = get().core;
      if (!core.achievements[achievementId]) return { ok: false, xp: 0, tinta: 0 };
      if (core.achievementsClaimed?.includes(achievementId)) return { ok: false, xp: 0, tinta: 0 };
      const def = ACHIEVEMENTS_BY_ID[achievementId];
      const xp = def?.xpReward ?? 40;
      const tinta = def?.tintaReward ?? 0;
      set({
        core: {
          ...core,
          xp: core.xp + xp,
          wallet: { ...core.wallet, tinta: core.wallet.tinta + tinta },
          achievementsClaimed: [...(core.achievementsClaimed ?? []), achievementId],
        },
      });
      persist(true);
      return { ok: true, xp, tinta };
    },

    async resetAll() {
      await storage.clear();
      set({
        hasProfile: false,
        profile: EMPTY_PROFILE_STORE,
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

    clearLastResult() {
      set({ lastResult: null });
    },

    async adoptSyncedState(payload) {
      // El servidor devolvió el estado canónico unido (PUT/import/409):
      // se adopta tal cual, migrando por si venía de una versión vieja.
      const profile = migrateProfile(payload.profile);
      const settings = { ...DEFAULT_SETTINGS, ...payload.settings };
      const core = migrateCore(payload.core);
      set({
        profile,
        settings,
        core,
        srs: payload.srs ?? {},
        hasProfile: profile.onboarded,
      });
      applySettingsSideEffects(settings);
      persist(true);
    },

    exportJson() {
      const { profile, settings, core, srs } = get();
      return storage.export({
        version: CURRENT_SCHEMA_VERSION,
        profile,
        settings,
        core,
        srs,
        savedAt: Date.now(),
      });
    },

    async importJson(text) {
      const parsed = storage.parseImport(text);
      if (!parsed) return false;
      await get().adoptSyncedState(parsed);
      return true;
    },
  };
});
