"use client";

/**
 * Store de la capa online · sesión del usuario y estado de sincronización.
 *
 * Ola 1: usuario actual, indicador de sincronización y el aviso post-login
 * "Tu bitácora ya existe: ¿subimos tu progreso al barco?" (02 §7).
 * Sin sesión y sin red ⇒ todo queda en idle y el juego es 100 % local.
 */

import { create } from "zustand";
import { api, type PublicUser } from "@/lib/api-client";

export interface OnlineStore {
  user: PublicUser | null;
  /** Primera consulta de /auth/me completada (con o sin sesión). */
  authChecked: boolean;
  /** Un drain/push está en curso (indicador "Sincronizando…"). */
  syncing: boolean;
  /** Error humano del último intento de login/registro (para el formulario). */
  lastAuthError: string | null;
  /** Flujo post-primer-login: ¿preguntamos por subir la bitácora local? */
  importPrompt: "idle" | "ask";

  refreshUser: () => Promise<void>;
  setUser: (user: PublicUser | null) => void;
  setSyncing: (syncing: boolean) => void;
  setAuthError: (message: string | null) => void;
  askImport: () => void;
  dismissImport: () => void;
  logoutLocal: () => Promise<void>;
}

export const useOnlineStore = create<OnlineStore>((set) => ({
  user: null,
  authChecked: false,
  syncing: false,
  lastAuthError: null,
  importPrompt: "idle",

  async refreshUser() {
    try {
      const { user } = await api.auth.me();
      set({ user, authChecked: true, lastAuthError: null });
    } catch {
      // Sin red o servidor caído: modo local de siempre (nunca error en cara).
      set({ user: null, authChecked: true });
    }
  },

  setUser(user) {
    set({ user, lastAuthError: null });
  },

  setSyncing(syncing) {
    set({ syncing });
  },

  setAuthError(message) {
    set({ lastAuthError: message });
  },

  askImport() {
    set({ importPrompt: "ask" });
  },

  dismissImport() {
    set({ importPrompt: "idle" });
  },

  async logoutLocal() {
    await api.auth.logout();
    set({ user: null, importPrompt: "idle", lastAuthError: null });
  },
}));
