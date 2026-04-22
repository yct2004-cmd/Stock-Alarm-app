import React, { useState } from 'react';
import {
  View, Text, ScrollView, KeyboardAvoidingView, Platform,
  TouchableOpacity, StyleSheet, Switch,
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
import type { CreateAlertScreenProps } from '../../types/navigation';

const CONDITIONS = Object.keys(ALERT_CONDITION_LABELS) as AlertCondition[];
const NO_THRESHOLD: AlertCondition[] = [
  'sma_crossover_above', 'sma_crossover_below',
  'macd_crossover_bullish', 'macd_crossover_bearish',
];

export default function CreateAlertScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<CreateAlertScreenProps['route']>();
  const createAlert = useAlertStore(s => s.createAlert);

  const prefillSymbol = route.params?.symbol ?? '';
  const prefillName = route.params?.name ?? '';

  const [showConditionPicker, setShowConditionPicker] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AlertFormData>({
    resolver: zodResolver(alertSchema),
    defaultValues: {
      symbol: prefillSymbol,
      condition: 'price_above',
      thresholdStr: '',
      frequency: 'once',
      monitorPreMarket: false,
      monitorRegular: true,
      monitorAfterHours: false,
      notes: '',
    },
  });

  const condition = watch('condition');
  const needsThreshold = !NO_THRESHOLD.includes(condition);

  const onSubmit = (data: AlertFormData) => {
    createAlert({
      symbol: data.symbol,
      companyName: prefillName || data.symbol,
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

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScreenHeader title="Create Alert" showBack />

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + spacing[8] }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Stock */}
        <GroupLabel label="STOCK" colors={colors} />
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Controller
            control={control}
            name="symbol"
            render={({ field: { onChange, onBlur, value } }) => (
              <AppTextInput
                label="Ticker Symbol"
                placeholder="e.g. AAPL"
                autoCapitalize="characters"
                leftIcon="trending-up-outline"
                value={value}
                onChangeText={v => onChange(v.toUpperCase())}
                onBlur={onBlur}
                error={errors.symbol?.message}
                containerStyle={{ marginBottom: 0 }}
              />
            )}
          />
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
            <ConditionList
              current={condition}
              onSelect={c => { setValue('condition', c); setShowConditionPicker(false); }}
              colors={colors}
            />
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
          {errors.monitorRegular && (
            <Text style={[styles.sessionError, { color: colors.negative }]}>
              {errors.monitorRegular.message}
            </Text>
          )}
          <View style={[styles.sep, { backgroundColor: colors.separator }]} />
          <Controller control={control} name="monitorAfterHours"
            render={({ field: { value, onChange } }) => (
              <SessionRow label="After Hours" sub="4:00–8:00 PM ET" value={value} onChange={onChange} colors={colors} />
            )}
          />
        </View>

        {/* Notes */}
        <GroupLabel label="NOTES (OPTIONAL)" colors={colors} />
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Controller
            control={control}
            name="notes"
            render={({ field: { onChange, onBlur, value } }) => (
              <AppTextInput
                placeholder="Why are you creating this alert?"
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
          label="Create Alert"
          onPress={handleSubmit(onSubmit)}
          fullWidth
          size="lg"
          style={{ marginTop: spacing[4] }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function GroupLabel({ label, colors }: { label: string; colors: any }) {
  return (
    <Text style={[styles.groupLabel, { color: colors.textSecondary }]}>{label}</Text>
  );
}

function ConditionList({
  current, onSelect, colors,
}: { current: AlertCondition; onSelect: (c: AlertCondition) => void; colors: any }) {
  return (
    <View style={[styles.conditionList, { borderTopColor: colors.border }]}>
      {CONDITIONS.map(c => (
        <TouchableOpacity
          key={c}
          style={[
            styles.conditionOption,
            c === current && { backgroundColor: colors.primaryLight },
          ]}
          onPress={() => onSelect(c)}
        >
          <Text
            style={[
              styles.conditionOptionLabel,
              { color: c === current ? colors.primary : colors.textPrimary },
            ]}
          >
            {ALERT_CONDITION_LABELS[c]}
          </Text>
          {c === current && <Ionicons name="checkmark" size={16} color={colors.primary} />}
        </TouchableOpacity>
      ))}
    </View>
  );
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
  if (condition === 'volume_spike') return 'e.g. 2  (2× average)';
  if (condition === 'rsi_above' || condition === 'rsi_below') return 'e.g. 70';
  return 'e.g. 150.00';
}

const styles = StyleSheet.create({
  scroll: { padding: spacing[4] },
  groupLabel: {
    fontSize: typography.size.xs, fontWeight: typography.weight.semibold,
    letterSpacing: 0.6, textTransform: 'uppercase',
    marginBottom: spacing[2], marginTop: spacing[4], marginLeft: 4,
  },
  card: { borderRadius: radii.lg, overflow: 'hidden', padding: spacing[3] },
  flex1: { flex: 1 },
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
  sessionError: { fontSize: typography.size.xs, paddingHorizontal: spacing[3], paddingBottom: 8 },
});
