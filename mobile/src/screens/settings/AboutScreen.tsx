import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../../hooks/useTheme';
import ScreenHeader from '../../components/common/ScreenHeader';
import { typography, spacing, radii } from '../../constants/theme';
import { APP_NAME, APP_VERSION } from '../../constants';

export default function AboutScreen() {
  const { colors } = useTheme();

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScreenHeader title="About" showBack />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.logoRow}>
          <View style={[styles.logo, { backgroundColor: colors.primary }]}>
            <Ionicons name="pulse" size={36} color="#fff" />
          </View>
          <Text style={[styles.appName, { color: colors.textPrimary }]}>{APP_NAME}</Text>
          <Text style={[styles.version, { color: colors.textSecondary }]}>Version {APP_VERSION}</Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Market Data Disclaimer</Text>
          <Text style={[styles.cardBody, { color: colors.textSecondary }]}>
            {APP_NAME} is for informational and educational purposes only. All market data,
            prices, and information provided is believed to be accurate but is not guaranteed.
            This app does not provide investment advice. Past performance is not indicative of
            future results. Consult a licensed financial professional before making investment
            decisions. Market data may be delayed.
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Built With</Text>
          {[
            'React Native + Expo',
            'TypeScript',
            'React Navigation 7',
            'Zustand',
            'TanStack Query v5',
            'react-native-chart-kit',
          ].map(item => (
            <View key={item} style={styles.builtItem}>
              <Ionicons name="checkmark-circle" size={16} color={colors.positive} />
              <Text style={[styles.builtText, { color: colors.textSecondary }]}>{item}</Text>
            </View>
          ))}
        </View>

        <Text style={[styles.footer, { color: colors.textTertiary }]}>
          © 2025 {APP_NAME}. All rights reserved.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { padding: spacing[4] },
  logoRow: { alignItems: 'center', paddingVertical: spacing[6] },
  logo: { width: 80, height: 80, borderRadius: radii.xl, alignItems: 'center', justifyContent: 'center', marginBottom: spacing[3] },
  appName: { fontSize: typography.size['2xl'], fontWeight: typography.weight.bold, letterSpacing: -0.5 },
  version: { fontSize: typography.size.sm, marginTop: 4 },
  card: { borderRadius: radii.lg, padding: spacing[4], marginBottom: spacing[3] },
  cardTitle: { fontSize: typography.size.base, fontWeight: typography.weight.semibold, marginBottom: spacing[3] },
  cardBody: { fontSize: typography.size.sm, lineHeight: 22 },
  builtItem: { flexDirection: 'row', alignItems: 'center', gap: spacing[2], marginBottom: spacing[2] },
  builtText: { fontSize: typography.size.sm },
  footer: { textAlign: 'center', fontSize: typography.size.xs, marginTop: spacing[4] },
});
