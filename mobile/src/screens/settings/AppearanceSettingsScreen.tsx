import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../../hooks/useTheme';
import { useSettingsStore } from '../../store/settingsStore';
import ScreenHeader from '../../components/common/ScreenHeader';
import { typography, spacing, radii } from '../../constants/theme';
import type { AppSettings } from '../../types/models';

const THEMES: { key: AppSettings['theme']; label: string; icon: React.ComponentProps<typeof Ionicons>['name'] }[] = [
  { key: 'light', label: 'Light', icon: 'sunny-outline' },
  { key: 'dark',  label: 'Dark',  icon: 'moon-outline' },
  { key: 'system', label: 'System Default', icon: 'phone-portrait-outline' },
];

export default function AppearanceSettingsScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { settings, updateSettings } = useSettingsStore();

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScreenHeader title="Appearance" showBack />
      <View style={{ padding: spacing[4] }}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>THEME</Text>
        <View style={[styles.group, { backgroundColor: colors.surface }]}>
          {THEMES.map((t, i) => (
            <React.Fragment key={t.key}>
              {i > 0 && <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: colors.separator, marginLeft: 52 }} />}
              <TouchableOpacity
                style={styles.row}
                onPress={() => updateSettings({ theme: t.key })}
              >
                <View style={[styles.iconWrap, { backgroundColor: colors.primaryLight }]}>
                  <Ionicons name={t.icon} size={16} color={colors.primary} />
                </View>
                <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>{t.label}</Text>
                {settings.theme === t.key && (
                  <Ionicons name="checkmark" size={20} color={colors.primary} />
                )}
              </TouchableOpacity>
            </React.Fragment>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  label: { fontSize: typography.size.xs, fontWeight: typography.weight.semibold, letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: spacing[2], marginLeft: 4 },
  group: { borderRadius: radii.lg, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, paddingHorizontal: spacing[4], gap: spacing[3] },
  iconWrap: { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  rowLabel: { flex: 1, fontSize: typography.size.base },
});
