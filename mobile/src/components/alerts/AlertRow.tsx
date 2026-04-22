import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { typography, spacing, radii } from '../../constants/theme';
import type { Alert } from '../../types/models';
import { ALERT_CONDITION_LABELS } from '../../constants';
import { formatPrice, formatRelativeTime } from '../../utils/format';

interface AlertRowProps {
  alert: Alert;
  onPress?: () => void;
  onToggle?: (active: boolean) => void;
  onDelete?: () => void;
}

const STATUS_COLORS: Record<Alert['status'], string> = {
  active: '#22C55E',
  inactive: '#9CA3AF',
  triggered: '#F59E0B',
};

export default function AlertRow({ alert, onPress, onToggle, onDelete }: AlertRowProps) {
  const { colors } = useTheme();
  const isActive = alert.status === 'active';

  return (
    <TouchableOpacity
      style={[styles.row, { backgroundColor: colors.surface }]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      {/* Status dot */}
      <View
        style={[styles.dot, { backgroundColor: STATUS_COLORS[alert.status] }]}
      />

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.topLine}>
          <Text style={[styles.symbol, { color: colors.textPrimary }]}>
            {alert.symbol}
          </Text>
          <Text style={[styles.condition, { color: colors.textSecondary }]}>
            {ALERT_CONDITION_LABELS[alert.condition]}
          </Text>
        </View>

        <View style={styles.midLine}>
          <Text style={[styles.threshold, { color: colors.textPrimary }]}>
            {formatThreshold(alert)}
          </Text>
          {alert.notes ? (
            <Text style={[styles.notes, { color: colors.textTertiary }]} numberOfLines={1}>
              · {alert.notes}
            </Text>
          ) : null}
        </View>

        {alert.lastTriggeredAt && (
          <Text style={[styles.triggered, { color: colors.warning }]}>
            Triggered {formatRelativeTime(alert.lastTriggeredAt)}
            {alert.lastTriggeredPrice
              ? ` at ${formatPrice(alert.lastTriggeredPrice)}`
              : ''}
          </Text>
        )}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <Switch
          value={isActive}
          onValueChange={onToggle}
          trackColor={{ false: colors.border, true: colors.primaryLight }}
          thumbColor={isActive ? colors.primary : colors.textTertiary}
          style={styles.toggle}
        />
        {onDelete && (
          <TouchableOpacity
            onPress={onDelete}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.deleteBtn}
          >
            <Ionicons name="trash-outline" size={16} color={colors.textTertiary} />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

function formatThreshold(alert: Alert): string {
  const { condition, threshold } = alert;
  if (condition === 'percent_change_up' || condition === 'percent_change_down') {
    return `${threshold}%`;
  }
  if (condition === 'volume_spike') {
    return `${threshold}× avg vol`;
  }
  if (condition === 'rsi_above' || condition === 'rsi_below') {
    return `RSI ${threshold}`;
  }
  if (condition === 'macd_crossover_bullish' || condition === 'macd_crossover_bearish') {
    return 'MACD cross';
  }
  return formatPrice(threshold);
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: spacing[4],
    gap: spacing[3],
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    flexShrink: 0,
    alignSelf: 'flex-start',
    marginTop: 5,
  },
  content: {
    flex: 1,
    overflow: 'hidden',
  },
  topLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: 3,
  },
  symbol: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
  },
  condition: {
    fontSize: typography.size.sm,
  },
  midLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  threshold: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    fontVariant: ['tabular-nums'],
  },
  notes: {
    fontSize: typography.size.sm,
    flex: 1,
  },
  triggered: {
    fontSize: typography.size.xs,
    marginTop: 3,
  },
  actions: {
    alignItems: 'flex-end',
    gap: spacing[2],
  },
  toggle: {
    transform: [{ scaleX: 0.85 }, { scaleY: 0.85 }],
  },
  deleteBtn: {
    padding: 2,
  },
});
