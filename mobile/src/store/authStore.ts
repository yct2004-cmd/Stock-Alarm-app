import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AuthSession, User } from '../types/models';
import { ASYNC_STORAGE_KEYS } from '../constants';

interface AuthState {
  session: AuthSession | null;
  isLoading: boolean;
  isHydrated: boolean;

  // Actions
  setSession: (session: AuthSession | null) => Promise<void>;
  hydrate: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  isLoading: false,
  isHydrated: false,

  setSession: async (session) => {
    if (session) {
      await AsyncStorage.setItem(ASYNC_STORAGE_KEYS.AUTH_SESSION, JSON.stringify(session));
    } else {
      await AsyncStorage.removeItem(ASYNC_STORAGE_KEYS.AUTH_SESSION);
    }
    set({ session });
  },

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(ASYNC_STORAGE_KEYS.AUTH_SESSION);
      const session: AuthSession | null = raw ? JSON.parse(raw) : null;
      // Treat expired sessions as logged-out
      const valid = session && session.expiresAt > Date.now();
      set({ session: valid ? session : null, isHydrated: true });
    } catch {
      set({ session: null, isHydrated: true });
    }
  },

  logout: async () => {
    await AsyncStorage.removeItem(ASYNC_STORAGE_KEYS.AUTH_SESSION);
    set({ session: null });
  },
}));

// Convenience selectors
export const selectUser = (s: AuthState): User | null => s.session?.user ?? null;
export const selectIsAuthenticated = (s: AuthState): boolean => s.session !== null;
export const selectAccessToken = (s: AuthState): string | null => s.session?.accessToken ?? null;
