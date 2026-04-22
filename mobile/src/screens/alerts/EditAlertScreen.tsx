import React, { useState } from 'react';
import {
  View, Text, ScrollView, KeyboardAvoidingView, Platform,
  TouchableOpacity, StyleSheet, Switch, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../../hooks/useTheme';
import { useAlertStore } from '../../store/alertStore';
import AppTextInput from '../../components/common/AppTextInput';
import Button from '../../components/common/Button';
import ScreenHeader from '../../components/common/ScreenHeader';
import { typography, spacing, radii } from '../../constants/theme';
import { ALERT_CONDITION_LABELS, ALERT_CONDITION_DESCRIPTIONS } from '../../constants';
import { alertSchema, type AlertFormData } from '../../utils/validation';
import type { AlertCondition } from '../../types/models';
import type { EditAlertScreenProps } from '../../types/navigation';

const CONDITIONS = Object.keys(ALERT_CONDITION_LABELS) as AlertCondition[];
const NO_THRESHOLD: AlertCondition[] = [
  'sma_crossover_above', 'sma_crossover_below',
  'macd_crossover_bullish', 'macd_crossover_bearish',
];

export default function EditAlertScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<EditAlertScreenProps['route']>();
  const { alertId } = route.params;

  const getAlertById = useAlertStore(s => s.getAlertById);
  const updateAlert = useAlertStore(s => s.updateAlert);
  const deleteAlert = useAlertStore(s => s.deleteAlert);

  const existing = getAlertById(alertId);
  const [showConditionPicker, setShowConditionPicker] = useState(false);

  if (!existing) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.textSecondary }}>Alert not found.</Text>
      </View>
    );
  }

  const {
    control, handleSubmit, watch, setValue, formState: { errors },
  } = useForm<AlertFormData>({
    resolver: zodResolver(alertSchema),
    defaultValues: {
      symbol: existing.symbol,
      condition: existing.condition,
      thresholdStr: NO_THRESHOLD.includes(existing.condition)
        ? ''
        : String(existing.threshold),
      frequency: existing.frequency,
      monitorPreMarket: existing.monitorPreMarket,
      monitorRegular: existing.monitorRegular,
      monitorAfterHours: existing.monitorAfterHours,
      notes: existing.notes,
    },
  });

  const condition = watch('condition');
  const needsThreshold = !NO_THRESHOLD.includes(condition);

  const onSubmit = (data: AlertFormData) => {
    updateAlert({
      id: alertId,
      symbol: data.symbol,
      condition: data.condition,
      threshold: needsThreshold ? Number(data.thresholdStr) : 0,
      frequency: data.frequency,
      notes: data.notes ?? '',
      monitorPreMarket: data.monitorPreMarket,
      monitorRegular: data.monitorRegular,
      monitorAfterHours: data.monitorAfterHours,
    });
    navigation.goBack();
  };

  const confirmDelete = () => {
    Alert.alert('Delete Alert', `Delete alert for ${existing.symbol}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteAlert(alertId);
          navigation.goBack();
        },
      },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScreenHeader
        title="Edit Alert"
        showBack
        rightAction={{ icon: 'trash-outline', onPress: confirmDelete, color: colors.negative }}
      />

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + spacing[8] }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Symbol (read-only in edit mode) */}
        <GroupLabel label="STOCK" colors={colors} />
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={styles.symbolReadOnly}>
            <View style={[styles.symbolBadge, { backgroundColor: colors.primaryLight }]}>
              <Ionicons name="trending-up-outline" size={16} color={colors.primary} />
            </View>
            <View>
              <Text style={[styles.symbolText, { color: colors.textPrimary }]}>{existing.symbol}</Text>
              <Text style={[styles.symbolSub, { color: colors.textTertiary }]}>
                Editing — symbol cannot be changed
              </Text>
            </View>
          </View>
        </View>

        {/* Condition */}
        <GroupLabel label="CONDITION" colors={colors} />
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <TouchableOpacity
            style={styles.conditionBtn}
            onPress={() => setShowConditionPicker(p => !p)}
          >
            <View style={styles.flex1}>
              <Text style={[styles.conditionLabel, { color: colors.textPrimary }]}>
                {ALERT_CONDITION_LABELS[condition]}
              </Text>
              <Text style={[styles.conditionDesc, { color: colors.textSecondary }]} numberOfLines={2}>
                {ALERT_CONDITION_DESCRIPTIONS[condition]}
              </Text>
            </View>
            <Ionicons
              name={showConditionPicker ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={colors.textTertiary}
            />
          </TouchableOpacity>

          {showConditionPicker && (
            <View style={[styles.conditionList, { borderTopColor: colors.border }]}>
              {CONDITIONS.map(c => (
                <TouchableOpacity
                  key={c}
                  style={[
                    styles.conditionOption,
                    c === condition && { backgroundColor: colors.primaryLight },
                  ]}
                  onPress={() => { setValue('condition', c); setShowConditionPicker(false); }}
                >
                  <Text style={[styles.conditionOptionLabel, { color: c === condition ? colors.primary : colors.textPrimary }]}>
                    {ALERT_CONDITION_LABELS[c]}
                  </Text>
                  {c === condition && <Ionicons name="checkmark" size={16} color={colors.primary} />}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Threshold */}
        {needsThreshold && (
          <>
            <GroupLabel label="THRESHOLD" colors={colors} />
            <View style={[styles.card, { backgroundColor: colors.surface }]}>
              <Controller
                control={control}
                name="thresholdStr"
                render={({ field: { onChange, onBlur, value } }) => (
                  <AppTextInput
                    label={getThresholdLabel(condition)}
                    placeholder={getThresholdPlaceholder(condition)}
                    keyboardType="decimal-pad"
                    leftIcon="calculator-outline"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.thresholdStr?.message}
                    containerStyle={{ marginBottom: 0 }}
                  />
                )}
              />
            </View>
          </>
        )}

        {/* Frequency */}
        <GroupLabel label="FREQUENCY" colors={colors} />
        <Controller
          control={control}
          name="frequency"
          render={({ field: { value, onChange } }) => (
            <View style={[styles.card, { backgroundColor: colors.surface, padding: spacing[4] }]}>
              <View style={styles.frequencyRow}>
                {(['once', 'repeating'] as const).map(f => {
                  const active = f === value;
                  return (
                    <TouchableOpacity
                      key={f}
                      style={[
                        styles.frequencyBtn,
                        { borderColor: active ? colors.primary : colors.border },
                        active && { backgroundColor: colors.primaryLight },
                      ]}
                      onPress={() => onChange(f)}
                    >
                      <Ionicons
                        name={f === 'once' ? 'flag-outline' : 'repeat-outline'}
                        size={18}
                        color={active ? colors.primary : colors.textSecondary}
                      />
                      <View>
                        <Text style={[styles.freqLabel, { color: active ? colors.primary : colors.textPrimary }]}>
                          {f === 'once' ? 'Once' : 'Repeating'}
                        </Text>
                        <Text style={[styles.freqSub, { color: colors.textTertiary }]}>
                          {f === 'once' ? 'Fires once then pauses' : '5-min cooldown'}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}
        />

        {/* Sessions */}
        <GroupLabel label="MARKET SESSIONS" colors={colors} />
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Controller control={control} name="monitorPreMarket"
            render={({ field: { value, onChange } }) => (
              <SessionRow label="Pre-Market" sub="4:00–9:30 AM ET" value={value} onChange={onChange} colors={colors} />
            )}
          />
          <View style={[styles.sep, { backgroundColor: colors.separator }]} />
          <Controller control={control} name="monitorRegular"
            render={({ field: { value, onChange } }) => (
              <SessionRow label="Regular Hours" sub="9:30 AM–4:00 PM ET" value={value} onChange={onChange} colors={colors} />
            )}
          />
          <View style={[styles.sep, { backgroundColor: colors.separator }]} />
          <Controller control={control} name="monitorAfterHours"
            render={({ field: { value, onChange } }) => (
              <SessionRow label="After Hours" sub="4:00–8:00 PM ET" value={value} onChange={onChange} colors={colors} />
            )}
          />
        </View>

        {/* Notes */}
        <GroupLabel label="NOTES" colors={colors} />
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Controller
            control={control}
            name="notes"
            render={({ field: { onChange, onBlur, value } }) => (
              <AppTextInput
                placeholder="Add a note..."
                multiline
                numberOfLines={3}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                containerStyle={{ marginBottom: 0 }}
                style={{ height: 80, textAlignVertical: 'top' }}
              />
            )}
          />
        </View>

        <Button
          label="Save Changes"
          onPress={handleSubmit(onSubmit)}
          fullWidth
          size="lg"
          style={{ marginTop: spacing[4] }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function GroupLabel({ label, colors }: { label: string; colors: any }) {
  return <Text style={[styles.groupLabel, { color: colors.textSecondary }]}>{label}</Text>;
}

function SessionRow({
  label, sub, value, onChange, colors,
}: { label: string; sub: string; value: boolean; onChange: (v: boolean) => void; colors: any }) {
  return (
    <View style={styles.sessionRow}>
      <View style={styles.flex1}>
        <Text style={[styles.sessionLabel, { color: colors.textPrimary }]}>{label}</Text>
        <Text style={[styles.sessionSub, { color: colors.textTertiary }]}>{sub}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: colors.border, true: colors.primaryLight }}
        thumbColor={value ? colors.primary : colors.textTertiary}
      />
    </View>
  );
}

function getThresholdLabel(condition: AlertCondition): string {
  if (condition === 'percent_change_up' || condition === 'percent_change_down') return 'Change threshold (%)';
  if (condition === 'volume_spike') return 'Volume multiplier (× average)';
  if (condition === 'rsi_above' || condition === 'rsi_below') return 'RSI value (0–100)';
  return 'Price ($)';
}

function getThresholdPlaceholder(condition: AlertCondition): string {
  if (condition === 'percent_change_up' || condition === 'percent_change_down') return 'e.g. 5';
  if (condition === 'volume_spike') return 'e.g. 2';
  if (condition === 'rsi_above' || condition === 'rsi_below') return 'e.g. 70';
  return 'e.g. 150.00';
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: spacing[4] },
  groupLabel: {
    fontSize: typography.size.xs, fontWeight: typography.weight.semibold,
    letterSpacing: 0.6, textTransform: 'uppercase',
    marginBottom: spacing[2], marginTop: spacing[4], marginLeft: 4,
  },
  card: { borderRadius: radii.lg, overflow: 'hidden', padding: spacing[3] },
  flex1: { flex: 1 },
  symbolReadOnly: { flexDirection: 'row', alignItems: 'center', gap: spacing[3], padding: spacing[1] },
  symbolBadge: { width: 36, height: 36, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center' },
  symbolText: { fontSize: typography.size.base, fontWeight: typography.weight.bold },
  symbolSub: { fontSize: typography.size.xs, marginTop: 2 },
  conditionBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  conditionLabel: { fontSize: typography.size.base, fontWeight: typography.weight.semibold },
  conditionDesc: { fontSize: typography.size.sm, marginTop: 2, lineHeight: 18 },
  conditionList: { borderTopWidth: StyleSheet.hairlineWidth, marginTop: spacing[3] },
  conditionOption: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 10, paddingHorizontal: spacing[3], borderRadius: radii.sm, marginTop: 2,
  },
  conditionOptionLabel: { fontSize: typography.size.sm, flex: 1 },
  frequencyRow: { flexDirection: 'row', gap: spacing[3] },
  frequencyBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing[2],
    padding: spacing[3], borderRadius: radii.md, borderWidth: 1.5,
  },
  freqLabel: { fontSize: typography.size.sm, fontWeight: typography.weight.medium },
  freqSub: { fontSize: 11, marginTop: 1 },
  sep: { height: StyleSheet.hairlineWidth },
  sessionRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, paddingHorizontal: spacing[3], gap: spacing[3],
  },
  sessionLabel: { fontSize: typography.size.sm, fontWeight: typography.weight.medium },
  sessionSub: { fontSize: typography.size.xs, marginTop: 1 },
});
