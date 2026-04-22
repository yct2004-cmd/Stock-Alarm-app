import 'react-native-gesture-handler'; // Must be the very first import
import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import RootNavigator from './src/navigation/RootNavigator';
import { ThemeContext, useThemeContextValue } from './src/hooks/useTheme';
import { useAppHydration } from './src/hooks/useAppHydration';
import { useAlertEngine } from './src/hooks/useAlertEngine';
import {
  registerPushToken,
  addNotificationResponseListener,
  addNotificationReceivedListener,
} from './src/services/notifications/NotificationService';
import { lightColors, darkColors } from './src/constants/theme';

// ─── TanStack Query client ────────────────────────────────────────────────────

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 15_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

// ─── Inner app — needs store access for theme ─────────────────────────────────

function AppInner() {
  const themeValue = useThemeContextValue();
  const isReady = useAppHydration();

  // Start alert evaluation loop (pauses when app is backgrounded)
  useAlertEngine();

  // Initialize push notification infrastructure once hydration is complete
  useEffect(() => {
    if (!isReady) return;
    registerPushToken().catch(() => {/* silent — permissions may not be granted */});
    const responseSub = addNotificationResponseListener((_response) => {
      // Deep-link handling: navigate to relevant alert detail when user taps a notification
      // Deferred until a real navigation ref is wired in
    });
    const receivedSub = addNotificationReceivedListener((_notification) => {
      // Foreground notification received — already added to in-app center by useAlertEngine
    });
    return () => {
      responseSub.remove();
      receivedSub.remove();
    };
  }, [isReady]);

  const navTheme = themeValue.isDark
    ? {
        ...DarkTheme,
        colors: {
          ...DarkTheme.colors,
          background: darkColors.background,
          card: darkColors.surface,
          border: darkColors.border,
          text: darkColors.textPrimary,
          primary: darkColors.primary,
          notification: '#EF4444',
        },
      }
    : {
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          background: lightColors.background,
          card: lightColors.surface,
          border: lightColors.border,
          text: lightColors.textPrimary,
          primary: lightColors.primary,
          notification: '#EF4444',
        },
      };

  if (!isReady) {
    return (
      <View style={[styles.splash, { backgroundColor: themeValue.colors.background }]}>
        <ActivityIndicator color={themeValue.colors.primary} size="large" />
      </View>
    );
  }

  return (
    <ThemeContext.Provider value={themeValue}>
      <NavigationContainer theme={navTheme}>
        <StatusBar style={themeValue.isDark ? 'light' : 'dark'} />
        <RootNavigator />
      </NavigationContainer>
    </ThemeContext.Provider>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AppInner />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
