import React, { useState } from 'react';
import {
  View, Text, ScrollView, Switch, TouchableOpacity, StyleSheet, Platform, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useTheme } from '../../hooks/useTheme';
import { useSettingsStore } from '../../store/settingsStore';
import { useNotificationStore } from '../../store/notificationStore';
import ScreenHeader from '../../components/common/ScreenHeader';
import Divider from '../../components/common/Divider';
import { typography, spacing, radii } from '../../constants/theme';
import { quietHoursSchema, type QuietHoursFormData } from '../../utils/validation';
import AppTextInput from '../../components/common/AppTextInput';
import Button from '../../components/common/Button';

export default function NotificationSettingsScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const settings = useSettingsStore(s => s.settings);
  const updateSettings = useSettingsStore(s => s.updateSettings);
  const notificationCount = useNotificationStore(s => s.notifications.length);
  const clearAll = useNotificationStore(s => s.clearAll);
  const markAllRead = useNotificationStore(s => s.markAllRead);

  const [editingQuietHours, setEditingQuietHours] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<QuietHoursFormData>({
    resolver: zodResolver(quietHoursSchema),
    defaultValues: {
      start: settings.quietHoursStart,
      end: settings.quietHoursEnd,
    },
  });

  const saveQuietHours = (data: QuietHoursFormData) => {
    updateSettings({ quietHoursStart: data.start, quietHoursEnd: data.end });
    setEditingQuietHours(false);
  };

  const handleClearHistory = () => {
    Alert.alert('Clear Notification History', 'Remove all notifications from the in-app center?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear All', style: 'destructive', onPress: clearAll },
    ]);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScreenHeader title="Notifications" showBack />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      >
        {/* Push notifications */}
        <SectionTitle label="PUSH NOTIFICATIONS" colors={colors} />
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <SettingsRow
            label="Enable Notifications"
            sub="Receive push alerts when conditions are met"
            colors={colors}
            right={
              <Switch
                value={settings.notificationsEnabled}
                onValueChange={v => updateSettings({ notificationsEnabled: v })}
                trackColor={{ false: colors.border, true: colors.primaryLight }}
                thumbColor={settings.notificationsEnabled ? colors.primary : colors.textTertiary}
              />
            }
          />
          <Divider indent={spacing[4]} />
          <SettingsRow
            label="Market Open Alert"
            sub="Notify when regular trading hours begin"
            colors={colors}
            disabled={!settings.notificationsEnabled}
            right={
              <Switch
                value={settings.marketOpenAlert}
                onValueChange={v => updateSettings({ marketOpenAlert: v })}
                disabled={!settings.notificationsEnabled}
                trackColor={{ false: colors.border, true: colors.primaryLight }}
                thumbColor={settings.marketOpenAlert ? colors.primary : colors.textTertiary}
              />
            }
          />
          <Divider indent={spacing[4]} />
          <SettingsRow
            label="Market Close Alert"
            sub="Notify when regular trading hours end"
            colors={colors}
            disabled={!settings.notificationsEnabled}
            right={
              <Switch
                value={settings.marketCloseAlert}
                onValueChange={v => updateSettings({ marketCloseAlert: v })}
                disabled={!settings.notificationsEnabled}
                trackColor={{ false: colors.border, true: colors.primaryLight }}
                thumbColor={settings.marketCloseAlert ? colors.primary : colors.textTertiary}
              />
            }
          />
        </View>

        {/* Quiet hours */}
        <SectionTitle label="QUIET HOURS" colors={colors} />
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <SettingsRow
            label="Quiet Hours"
            sub="Silence alerts during set hours"
            colors={colors}
            right={
              <Switch
                value={settings.quietHoursEnabled}
                onValueChange={v => updateSettings({ quietHoursEnabled: v })}
                trackColor={{ false: colors.border, true: colors.primaryLight }}
                thumbColor={settings.quietHoursEnabled ? colors.primary : colors.textTertiary}
              />
            }
          />

          {settings.quietHoursEnabled && (
            <>
              <Divider indent={spacing[4]} />
              {editingQuietHours ? (
                <View style={styles.quietEdit}>
                  <Text style={[styles.quietEditHint, { color: colors.textTertiary }]}>
                    Enter times in 24-hour format (HH:MM)
                  </Text>
                  <Controller control={control} name="start"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <AppTextInput
                        label="Start time"
                        placeholder="e.g. 22:00"
                        keyboardType="numbers-and-punctuation"
                        leftIcon="moon-outline"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        error={errors.start?.message}
                        containerStyle={{ marginBottom: spacing[2] }}
                      />
                    )}
                  />
                  <Controller control={control} name="end"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <AppTextInput
                        label="End time"
                        placeholder="e.g. 07:00"
                        keyboardType="numbers-and-punctuation"
                        leftIcon="sunny-outline"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        error={errors.end?.message}
                        containerStyle={{ marginBottom: spacing[3] }}
                      />
                    )}
                  />
                  <View style={styles.quietBtns}>
                    <Button
                      label="Cancel"
                      variant="outline"
                      size="sm"
                      onPress={() => setEditingQuietHours(false)}
                      style={{ flex: 1 }}
                    />
                    <Button
                      label="Save"
                      size="sm"
                      onPress={handleSubmit(saveQuietHours)}
                      style={{ flex: 1 }}
                    />
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.quietPreview}
                  onPress={() => setEditingQuietHours(true)}
                >
                  <View style={styles.quietTimes}>
                    <TimeChip icon="moon-outline" label={settings.quietHoursStart} colors={colors} />
                    <Ionicons name="arrow-forward" size={14} color={colors.textTertiary} />
                    <TimeChip icon="sunny-outline" label={settings.quietHoursEnd} colors={colors} />
                  </View>
                  <Ionicons name="create-outline" size={18} color={colors.primary} />
                </TouchableOpacity>
              )}
            </>
          )}
        </View>

        {/* Notification history */}
        <SectionTitle label="NOTIFICATION HISTORY" colors={colors} />
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <SettingsRow
            label="Mark All as Read"
            sub={`${notificationCount} notification${notificationCount !== 1 ? 's' : ''} in center`}
            colors={colors}
            right={
              <TouchableOpacity onPress={markAllRead}>
                <Text style={[styles.actionText, { color: colors.primary }]}>Mark Read</Text>
              </TouchableOpacity>
            }
          />
          <Divider indent={spacing[4]} />
          <TouchableOpacity style={styles.destructiveRow} onPress={handleClearHistory}>
            <Ionicons name="trash-outline" size={18} color={colors.negative} />
            <Text style={[styles.destructiveText, { color: colors.negative }]}>
              Clear Notification History
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionTitle({ label, colors }: { label: string; colors: any }) {
  return (
    <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>{label}</Text>
  );
}

function SettingsRow({
  label, sub, colors, right, disabled = false,
}: { label: string; sub: string; colors: any; right: React.ReactNode; disabled?: boolean }) {
  return (
    <View style={[styles.settingsRow, disabled && { opacity: 0.5 }]}>
      <View style={styles.rowText}>
        <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>{label}</Text>
        <Text style={[styles.rowSub, { color: colors.textSecondary }]}>{sub}</Text>
      </View>
      {right}
    </View>
  );
}

function TimeChip({ icon, label, colors }: { icon: any; label: string; colors: any }) {
  return (
    <View style={[styles.timeChip, { backgroundColor: colors.surfacePress }]}>
      <Ionicons name={icon} size={13} color={colors.textSecondary} />
      <Text style={[styles.timeChipText, { color: colors.textPrimary }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  sectionTitle: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginHorizontal: spacing[4],
    marginTop: spacing[5],
    marginBottom: spacing[2],
  },
  card: { marginHorizontal: spacing[4], borderRadius: radii.lg, overflow: 'hidden' },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: spacing[4],
    gap: spacing[3],
  },
  rowText: { flex: 1 },
  rowLabel: { fontSize: typography.size.sm, fontWeight: typography.weight.medium },
  rowSub: { fontSize: typography.size.xs, marginTop: 2 },
  quietEdit: { padding: spacing[4] },
  quietEditHint: { fontSize: typography.size.xs, marginBottom: spacing[3] },
  quietBtns: { flexDirection: 'row', gap: spacing[3] },
  quietPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: spacing[4],
  },
  quietTimes: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  timeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.md,
  },
  timeChipText: { fontSize: typography.size.sm, fontWeight: typography.weight.semibold, fontVariant: ['tabular-nums'] },
  destructiveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingVertical: 14,
    paddingHorizontal: spacing[4],
  },
  destructiveText: { fontSize: typography.size.sm, fontWeight: typography.weight.medium },
  actionText: { fontSize: typography.size.sm, fontWeight: typography.weight.medium },
});
