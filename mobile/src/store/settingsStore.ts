import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AppSettings } from '../types/models';
import { ASYNC_STORAGE_KEYS, DEFAULT_APP_SETTINGS } from '../constants';
import { useColorScheme } from 'react-native';

interface SettingsState {
  settings: AppSettings;
  isHydrated: boolean;

  hydrate: () => Promise<void>;
  updateSettings: (patch: Partial<AppSettings>) => Promise<void>;
  resetSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: DEFAULT_APP_SETTINGS,
  isHydrated: false,

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(ASYNC_STORAGE_KEYS.SETTINGS);
      const settings: AppSettings = raw
        ? { ...DEFAULT_APP_SETTINGS, ...JSON.parse(raw) }
        : DEFAULT_APP_SETTINGS;
      set({ settings, isHydrated: true });
    } catch {
      set({ settings: DEFAULT_APP_SETTINGS, isHydrated: true });
    }
  },

  updateSettings: async (patch) => {
    const next = { ...get().settings, ...patch };
    set({ settings: next });
    await AsyncStorage.setItem(ASYNC_STORAGE_KEYS.SETTINGS, JSON.stringify(next));
  },

  resetSettings: async () => {
    set({ settings: DEFAULT_APP_SETTINGS });
    await AsyncStorage.removeItem(ASYNC_STORAGE_KEYS.SETTINGS);
  },
}));

/**
 * Resolves the effective color scheme from settings + system.
 * Use this in the theme context, not directly in components.
 */
export function resolveColorScheme(
  setting: AppSettings['theme'],
  system: 'light' | 'dark' | null | undefined,
): 'light' | 'dark' {
  if (setting === 'system') return system === 'dark' ? 'dark' : 'light';
  return setting;
}
