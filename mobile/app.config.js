/**
 * app.config.js — Expo dynamic configuration
 *
 * Reads environment variables at build/start time so they flow into
 * Constants.expoConfig.extra as well as process.env.EXPO_PUBLIC_*.
 *
 * This file replaces the static app.json (which is kept as a fallback
 * reference).  Run `npx expo start` and Expo will prefer this file.
 *
 * Usage:
 *   1. Copy mobile/.env.example → mobile/.env
 *   2. Fill in your API keys
 *   3. Run `npx expo start` — changes take effect on next Metro restart
 */

/** @type {import('@expo/config').ExpoConfig} */
module.exports = {
  name: 'Stock Alarm MVP',
  slug: 'stock-alarm-mvp',
  version: '1.0.0',
  orientation: 'portrait',
  userInterfaceStyle: 'light',
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
  },
  android: {},
  plugins: ['expo-notifications'],
  extra: {
    // Backend API URL — override via EXPO_PUBLIC_API_BASE_URL in .env
    apiBaseUrl:
      process.env.EXPO_PUBLIC_API_BASE_URL ??
      'https://thirty-donkeys-report.loca.lt/api/v1',

    // Which market data provider is active (for debugging / display)
    marketProvider: process.env.EXPO_PUBLIC_POLYGON_API_KEY
      ? 'polygon'
      : process.env.EXPO_PUBLIC_FINNHUB_API_KEY
      ? 'finnhub'
      : 'mock',
  },
};
