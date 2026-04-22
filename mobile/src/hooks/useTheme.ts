import React, { createContext, useContext } from 'react';
import { useColorScheme } from 'react-native';
import { lightColors, darkColors, type ColorScheme } from '../constants/theme';
import { useSettingsStore, resolveColorScheme } from '../store/settingsStore';

interface ThemeContextValue {
  colors: ColorScheme;
  isDark: boolean;
  scheme: 'light' | 'dark';
}

export const ThemeContext = createContext<ThemeContextValue>({
  colors: lightColors,
  isDark: false,
  scheme: 'light',
});

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}

/** Call once at the app root to derive the context value. */
export function useThemeContextValue(): ThemeContextValue {
  const systemScheme = useColorScheme();
  const themeSetting = useSettingsStore(s => s.settings.theme);
  const scheme = resolveColorScheme(themeSetting, systemScheme);
  const isDark = scheme === 'dark';
  const colors = isDark ? darkColors : lightColors;
  return { colors, isDark, scheme };
}
