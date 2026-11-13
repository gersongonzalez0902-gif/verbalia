"use client";

/**
 * Store de la capa online · sesión del usuario y estado de sincronización.
 *
 * Ola 1.1: la unión bitácora↔barco es AUTOMÁTICA y silenciosa (syncOnLogin
 * en services/sync.ts); ya no hay aviso post-login ni flujo manual de
 * migración. Sin sesión y sin red ⇒ todo queda en idle y el juego es
 * 100 % local.
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

  refreshUser: () => Promise<void>;
  setUser: (user: PublicUser | null) => void;
  setSyncing: (syncing: boolean) => void;
  setAuthError: (message: string | null) => void;
  logoutLocal: () => Promise<void>;
}

export const useOnlineStore = create<OnlineStore>((set) => ({
  user: null,
  authChecked: false,
  syncing: false,
  lastAuthError: null,

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

  async logoutLocal() {
    await api.auth.logout();
    set({ user: null, lastAuthError: null });
  },
}));
