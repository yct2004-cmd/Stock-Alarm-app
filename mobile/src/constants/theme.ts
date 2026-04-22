import { Platform } from 'react-native';

// ─── Color palette ────────────────────────────────────────────────────────────

const palette = {
  // Brand
  blue50: '#EFF6FF',
  blue100: '#DBEAFE',
  blue400: '#60A5FA',
  blue500: '#3B82F6',
  blue600: '#2563EB',
  blue700: '#1D4ED8',

  // Greens
  green50: '#F0FDF4',
  green400: '#4ADE80',
  green500: '#22C55E',
  green600: '#16A34A',

  // Reds
  red50: '#FFF1F2',
  red400: '#F87171',
  red500: '#EF4444',
  red600: '#DC2626',

  // Yellows / Amber
  amber400: '#FBBF24',
  amber500: '#F59E0B',

  // Neutrals
  white: '#FFFFFF',
  black: '#000000',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',
  gray950: '#030712',

  // Dark surface
  dark100: '#1A1A2E',
  dark200: '#16213E',
  dark300: '#0F3460',
} as const;

// ─── Light theme ──────────────────────────────────────────────────────────────

export const lightColors = {
  // Surfaces
  background: palette.gray50,
  surface: palette.white,
  surfaceElevated: palette.white,
  surfacePress: palette.gray100,
  border: palette.gray200,
  borderStrong: palette.gray300,
  separator: palette.gray100,

  // Text
  textPrimary: palette.gray900,
  textSecondary: palette.gray500,
  textTertiary: palette.gray400,
  textInverse: palette.white,
  textLink: palette.blue600,

  // Brand
  primary: palette.blue500,
  primaryLight: palette.blue50,
  primaryDark: palette.blue700,

  // Semantic
  positive: palette.green500,
  positiveLight: palette.green50,
  negative: palette.red500,
  negativeLight: palette.red50,
  warning: palette.amber500,

  // Tab bar
  tabBar: palette.white,
  tabBarBorder: palette.gray200,
  tabBarActive: palette.blue500,
  tabBarInactive: palette.gray400,

  // Charts
  chartLine: palette.blue500,
  chartFill: palette.blue100,
  chartGrid: palette.gray200,
  chartLabel: palette.gray500,
  chartPositive: palette.green500,
  chartNegative: palette.red500,
  chartCandleUp: palette.green500,
  chartCandleDown: palette.red500,

  // Skeletons
  skeletonBase: palette.gray200,
  skeletonHighlight: palette.gray100,

  // Status bar
  statusBar: 'dark-content' as const,
} as const;

// ─── Dark theme ───────────────────────────────────────────────────────────────

export const darkColors = {
  background: '#0D0D0F',
  surface: '#18181B',
  surfaceElevated: '#27272A',
  surfacePress: '#3F3F46',
  border: '#3F3F46',
  borderStrong: '#52525B',
  separator: '#27272A',

  textPrimary: '#FAFAFA',
  textSecondary: '#A1A1AA',
  textTertiary: '#71717A',
  textInverse: '#18181B',
  textLink: palette.blue400,

  primary: palette.blue500,
  primaryLight: '#1E3A5F',
  primaryDark: palette.blue400,

  positive: palette.green400,
  positiveLight: '#14532D',
  negative: palette.red400,
  negativeLight: '#450A0A',
  warning: palette.amber400,

  tabBar: '#18181B',
  tabBarBorder: '#3F3F46',
  tabBarActive: palette.blue400,
  tabBarInactive: '#71717A',

  chartLine: palette.blue400,
  chartFill: '#1E3A5F',
  chartGrid: '#3F3F46',
  chartLabel: '#71717A',
  chartPositive: palette.green400,
  chartNegative: palette.red400,
  chartCandleUp: palette.green400,
  chartCandleDown: palette.red400,

  skeletonBase: '#27272A',
  skeletonHighlight: '#3F3F46',

  statusBar: 'light-content' as const,
} as const;

// Use a structural type instead of `typeof lightColors` so both themes satisfy it
export type ColorScheme = {
  background: string;
  surface: string;
  surfaceElevated: string;
  surfacePress: string;
  border: string;
  borderStrong: string;
  separator: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;
  textLink: string;
  primary: string;
  primaryLight: string;
  primaryDark: string;
  positive: string;
  positiveLight: string;
  negative: string;
  negativeLight: string;
  warning: string;
  tabBar: string;
  tabBarBorder: string;
  tabBarActive: string;
  tabBarInactive: string;
  chartLine: string;
  chartFill: string;
  chartGrid: string;
  chartLabel: string;
  chartPositive: string;
  chartNegative: string;
  chartCandleUp: string;
  chartCandleDown: string;
  skeletonBase: string;
  skeletonHighlight: string;
  statusBar: 'dark-content' | 'light-content';
};

// ─── Typography ───────────────────────────────────────────────────────────────

const fontFamily = Platform.select({
  ios: {
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
    mono: 'Courier New',
  },
  android: {
    regular: 'sans-serif',
    medium: 'sans-serif-medium',
    semibold: 'sans-serif-medium',
    bold: 'sans-serif-bold',
    mono: 'monospace',
  },
  default: {
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
    mono: 'monospace',
  },
})!;

export const typography = {
  fontFamily,
  size: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 34,
    '5xl': 40,
  },
  weight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  lineHeight: {
    tight: 1.2,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
  },
} as const;

// ─── Spacing ──────────────────────────────────────────────────────────────────

export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
} as const;

// ─── Radii ────────────────────────────────────────────────────────────────────

export const radii = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
} as const;

// ─── Shadows ──────────────────────────────────────────────────────────────────

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;

// ─── Animation durations ──────────────────────────────────────────────────────

export const durations = {
  fast: 150,
  normal: 250,
  slow: 400,
} as const;
