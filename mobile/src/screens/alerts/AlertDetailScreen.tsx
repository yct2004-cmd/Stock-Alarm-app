import React from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Switch, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';

import { useTheme } from '../../hooks/useTheme';
import { useAlertStore } from '../../store/alertStore';
import { marketDataService } from '../../services/market/MarketDataService';
import { QUERY_KEYS, STALE_TIMES, ALERT_CONDITION_LABELS, ALERT_CONDITION_DESCRIPTIONS } from '../../constants';
import { typography, spacing, radii } from '../../constants/theme';
import { formatPrice, formatDate, formatDateTime, formatRelativeTime } from '../../utils/format';
import ScreenHeader from '../../components/common/ScreenHeader';
import Divider from '../../components/common/Divider';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AlertsStackParamList } from '../../types/navigation';
import type { AlertTriggerEvent } from '../../types/models';

type Nav = NativeStackNavigationProp<AlertsStackParamList>;

export default function AlertDetailScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const route = useRoute<any>();
  const { alertId } = route.params as { alertId: string };

  const getAlertById = useAlertStore(s => s.getAlertById);
  const getHistoryForAlert = useAlertStore(s => s.getHistoryForAlert);
  const toggleAlert = useAlertStore(s => s.toggleAlert);
  const deleteAlert = useAlertStore(s => s.deleteAlert);

  const alert = getAlertById(alertId);
  const history = getHistoryForAlert(alertId);

  const { data: quote } = useQuery({
    queryKey: QUERY_KEYS.quote(alert?.symbol ?? ''),
    queryFn: () => marketDataService.getQuote(alert!.symbol),
    enabled: !!alert,
    staleTime: STALE_TIMES.quote,
    refetchInterval: 15_000,
  });

  if (!alert) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ScreenHeader title="Alert" showBack />
        <Text style={{ color: colors.textSecondary }}>Alert not found.</Text>
      </View>
    );
  }

  const isActive = alert.status === 'active';
  const currentPrice = quote?.price;
  const isTriggeredNow = currentPrice !== undefined && isConditionMet(alert, quote!);

  const handleDelete = () => {
    Alert.alert('Delete Alert', `Delete this alert for ${alert.symbol}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => { deleteAlert(alertId); navigation.goBack(); },
      },
    ]);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScreenHeader
        title={`${alert.symbol} Alert`}
        showBack
        rightAction={{ icon: 'create-outline', onPress: () => navigation.navigate('EditAlert', { alertId }), color: colors.primary }}
        rightAction2={{ icon: 'trash-outline', onPress: handleDelete, color: colors.negative }}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      >
        {/* Status card */}
        <View style={[styles.statusCard, { backgroundColor: colors.surface }]}>
          <View style={styles.statusTop}>
            <View style={styles.statusLeft}>
              <Text style={[styles.symbol, { color: colors.textPrimary }]}>{alert.symbol}</Text>
              <Text style={[styles.conditionName, { color: colors.textSecondary }]}>
                {ALERT_CONDITION_LABELS[alert.condition]}
              </Text>
            </View>
            <View style={styles.statusRight}>
              <StatusPill status={alert.status} colors={colors} />
              <Switch
                value={isActive}
                onValueChange={active => toggleAlert(alertId, active)}
                trackColor={{ false: colors.border, true: colors.primaryLight }}
                thumbColor={isActive ? colors.primary : colors.textTertiary}
                style={{ marginTop: 8 }}
              />
            </View>
          </View>

          {/* Live price vs threshold */}
          {currentPrice !== undefined && (
            <View style={[styles.priceCompare, { backgroundColor: colors.surfacePress, borderRadius: radii.md }]}>
              <View style={styles.priceItem}>
                <Text style={[styles.priceLabel, { color: colors.textTertiary }]}>Threshold</Text>
                <Text style={[styles.priceValue, { color: colors.textPrimary }]}>
                  {formatThresholdValue(alert.condition, alert.threshold)}
                </Text>
              </View>
              <Ionicons
                name={isTriggeredNow ? 'checkmark-circle' : 'arrow-forward'}
                size={22}
                color={isTriggeredNow ? colors.positive : colors.textTertiary}
              />
              <View style={styles.priceItem}>
                <Text style={[styles.priceLabel, { color: colors.textTertiary }]}>Current Price</Text>
                <Text
                  style={[
                    styles.priceValue,
                    { color: isTriggeredNow ? colors.positive : colors.textPrimary },
                  ]}
                >
                  {formatPrice(currentPrice)}
                </Text>
              </View>
            </View>
          )}

          {isTriggeredNow && (
            <View style={[styles.triggerBanner, { backgroundColor: colors.positiveLight }]}>
              <Ionicons name="flash" size={14} color={colors.positive} />
              <Text style={[styles.triggerBannerText, { color: colors.positive }]}>
                Condition is currently met
              </Text>
            </View>
          )}
        </View>

        {/* Config details */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Configuration</Text>
          <DetailRow label="Condition" value={ALERT_CONDITION_LABELS[alert.condition]} colors={colors} />
          <Divider indent={spacing[4]} />
          <DetailRow
            label="Description"
            value={ALERT_CONDITION_DESCRIPTIONS[alert.condition]}
            colors={colors}
            multiLine
          />
          <Divider indent={spacing[4]} />
          <DetailRow label="Frequency" value={alert.frequency === 'once' ? 'Trigger once' : 'Repeating (5-min cooldown)'} colors={colors} />
          <Divider indent={spacing[4]} />
          <DetailRow
            label="Sessions"
            value={[
              alert.monitorPreMarket && 'Pre-market',
              alert.monitorRegular && 'Regular',
              alert.monitorAfterHours && 'After-hours',
            ].filter(Boolean).join(', ') || 'None'}
            colors={colors}
          />
          {alert.notes ? (
            <>
              <Divider indent={spacing[4]} />
              <DetailRow label="Notes" value={alert.notes} colors={colors} multiLine />
            </>
          ) : null}
        </View>

        {/* Timestamps */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Activity</Text>
          <DetailRow label="Created" value={formatDateTime(alert.createdAt)} colors={colors} />
          <Divider indent={spacing[4]} />
          <DetailRow label="Last updated" value={formatDateTime(alert.updatedAt)} colors={colors} />
          {alert.lastTriggeredAt && (
            <>
              <Divider indent={spacing[4]} />
              <DetailRow
                label="Last triggered"
                value={`${formatDateTime(alert.lastTriggeredAt)}${alert.lastTriggeredPrice ? ` at ${formatPrice(alert.lastTriggeredPrice)}` : ''}`}
                colors={colors}
              />
            </>
          )}
          {alert.cooldownUntil && alert.cooldownUntil > Date.now() && (
            <>
              <Divider indent={spacing[4]} />
              <DetailRow
                label="Cooldown ends"
                value={formatRelativeTime(alert.cooldownUntil)}
                colors={colors}
                accent={colors.warning}
              />
            </>
          )}
        </View>

        {/* Trigger history */}
        {history.length > 0 && (
          <View style={[styles.section, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Trigger History ({history.length})
            </Text>
            {history.slice(0, 10).map((event, i) => (
              <React.Fragment key={event.id}>
                {i > 0 && <Divider indent={spacing[4]} />}
                <TriggerEventRow event={event} colors={colors} />
              </React.Fragment>
            ))}
            {history.length > 10 && (
              <TouchableOpacity
                style={styles.viewMore}
                onPress={() => navigation.navigate('AlertHistory')}
              >
                <Text style={[styles.viewMoreText, { color: colors.primary }]}>
                  View all {history.length} events →
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Actions */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => navigation.navigate('EditAlert', { alertId })}
          >
            <Ionicons name="create-outline" size={18} color={colors.primary} />
            <Text style={[styles.actionBtnText, { color: colors.primary }]}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.actionBtn,
              { backgroundColor: isActive ? colors.negativeLight : colors.positiveLight,
                borderColor: isActive ? colors.negative : colors.positive },
            ]}
            onPress={() => toggleAlert(alertId, !isActive)}
          >
            <Ionicons
              name={isActive ? 'pause-outline' : 'play-outline'}
              size={18}
              color={isActive ? colors.negative : colors.positive}
            />
            <Text style={[styles.actionBtnText, { color: isActive ? colors.negative : colors.positive }]}>
              {isActive ? 'Pause' : 'Resume'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: colors.negativeLight, borderColor: colors.negative }]}
            onPress={handleDelete}
          >
            <Ionicons name="trash-outline" size={18} color={colors.negative} />
            <Text style={[styles.actionBtnText, { color: colors.negative }]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusPill({ status, colors }: { status: string; colors: any }) {
  const cfg: Record<string, { label: string; bg: string; text: string }> = {
    active:    { label: 'Active',    bg: colors.positiveLight, text: colors.positive },
    inactive:  { label: 'Paused',   bg: colors.surfacePress,  text: colors.textSecondary },
    triggered: { label: 'Triggered', bg: '#FEF3C7',           text: colors.warning },
  };
  const c = cfg[status] ?? cfg.inactive;
  return (
    <View style={[styles.pill, { backgroundColor: c.bg }]}>
      <Text style={[styles.pillText, { color: c.text }]}>{c.label}</Text>
    </View>
  );
}

function DetailRow({
  label, value, colors, multiLine = false, accent,
}: { label: string; value: string; colors: any; multiLine?: boolean; accent?: string }) {
  return (
    <View style={[styles.detailRow, multiLine && styles.detailRowWrap]}>
      <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text
        style={[
          styles.detailValue,
          { color: accent ?? colors.textPrimary },
          multiLine && styles.detailValueWrap,
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

function TriggerEventRow({ event, colors }: { event: AlertTriggerEvent; colors: any }) {
  return (
    <View style={styles.triggerRow}>
      <View style={[styles.triggerDot, { backgroundColor: colors.warning }]} />
      <View style={styles.flex1}>
        <Text style={[styles.triggerPrice, { color: colors.textPrimary }]}>
          Triggered at {formatPrice(event.triggerPrice)}
        </Text>
        <Text style={[styles.triggerTime, { color: colors.textTertiary }]}>
          {formatDateTime(event.triggeredAt)}
        </Text>
      </View>
    </View>
  );
}

function isConditionMet(alert: any, quote: any): boolean {
  const { condition, threshold } = alert;
  switch (condition) {
    case 'price_above': return quote.price > threshold;
    case 'price_below': return quote.price < threshold;
    case 'percent_change_up': return quote.changePercent >= threshold;
    case 'percent_change_down': return quote.changePercent <= -threshold;
    default: return false;
  }
}

function formatThresholdValue(condition: string, threshold: number): string {
  if (condition === 'percent_change_up' || condition === 'percent_change_down') return `${threshold}%`;
  if (condition === 'volume_spike') return `${threshold}×`;
  if (condition === 'rsi_above' || condition === 'rsi_below') return `RSI ${threshold}`;
  if (condition === 'macd_crossover_bullish' || condition === 'macd_crossover_bearish') return 'MACD cross';
  if (condition === 'sma_crossover_above' || condition === 'sma_crossover_below') return 'SMA cross';
  return formatPrice(threshold);
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1 },
  statusCard: { margin: spacing[4], borderRadius: radii.lg, padding: spacing[4] },
  statusTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing[3] },
  statusLeft: { flex: 1 },
  statusRight: { alignItems: 'flex-end' },
  symbol: { fontSize: typography.size['2xl'], fontWeight: typography.weight.bold, letterSpacing: -0.5 },
  conditionName: { fontSize: typography.size.sm, marginTop: 2 },
  pill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radii.full },
  pillText: { fontSize: typography.size.xs, fontWeight: typography.weight.semibold },
  priceCompare: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', padding: spacing[3], marginBottom: spacing[3] },
  priceItem: { alignItems: 'center' },
  priceLabel: { fontSize: typography.size.xs, marginBottom: 2 },
  priceValue: { fontSize: typography.size.base, fontWeight: typography.weight.bold, fontVariant: ['tabular-nums'] },
  triggerBanner: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: spacing[3], borderRadius: radii.sm },
  triggerBannerText: { fontSize: typography.size.sm, fontWeight: typography.weight.medium },
  section: { marginHorizontal: spacing[4], marginBottom: spacing[3], borderRadius: radii.lg, padding: spacing[4] },
  sectionTitle: { fontSize: typography.size.base, fontWeight: typography.weight.semibold, marginBottom: spacing[3] },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
  detailRowWrap: { flexDirection: 'column', alignItems: 'flex-start', gap: 4 },
  detailLabel: { fontSize: typography.size.sm, flexShrink: 0 },
  detailValue: { fontSize: typography.size.sm, fontWeight: typography.weight.medium, textAlign: 'right', flex: 1, paddingLeft: spacing[3] },
  detailValueWrap: { textAlign: 'left', paddingLeft: 0, flex: undefined },
  viewMore: { paddingVertical: spacing[3], alignItems: 'center' },
  viewMoreText: { fontSize: typography.size.sm, fontWeight: typography.weight.medium },
  actionsRow: { flexDirection: 'row', gap: spacing[3], paddingHorizontal: spacing[4], marginTop: spacing[2] },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing[2], paddingVertical: 12, borderRadius: radii.md, borderWidth: 1.5 },
  actionBtnText: { fontSize: typography.size.sm, fontWeight: typography.weight.semibold },
  triggerRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing[3], paddingVertical: 10 },
  triggerDot: { width: 8, height: 8, borderRadius: 4, marginTop: 4 },
  flex1: { flex: 1 },
  triggerPrice: { fontSize: typography.size.sm, fontWeight: typography.weight.medium },
  triggerTime: { fontSize: typography.size.xs, marginTop: 2 },
});
