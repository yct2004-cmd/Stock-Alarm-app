import React, { useState, useMemo } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../../hooks/useTheme';
import { useAlertStore } from '../../store/alertStore';
import ScreenHeader from '../../components/common/ScreenHeader';
import Divider from '../../components/common/Divider';
import { typography, spacing, radii } from '../../constants/theme';
import { formatPrice, formatDateTime } from '../../utils/format';
import { ALERT_CONDITION_LABELS } from '../../constants';
import type { AlertTriggerEvent } from '../../types/models';

type Filter = 'all' | string; // 'all' or a specific symbol

export default function AlertHistoryScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const triggerHistory = useAlertStore(s => s.triggerHistory);
  const [filter, setFilter] = useState<Filter>('all');

  // Build sorted list of unique symbols from history
  const symbols = useMemo(() => {
    const s = [...new Set(triggerHistory.map(e => e.symbol))];
    return s.sort();
  }, [triggerHistory]);

  const filtered = useMemo(
    () => filter === 'all' ? triggerHistory : triggerHistory.filter(e => e.symbol === filter),
    [triggerHistory, filter],
  );

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScreenHeader title="Trigger History" showBack />

      {/* Symbol filter chips */}
      {symbols.length > 1 && (
        <View style={[styles.filterBar, { borderBottomColor: colors.border }]}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterContent}
            data={['all', ...symbols]}
            keyExtractor={item => item}
            renderItem={({ item }) => {
              const active = item === filter;
              return (
                <TouchableOpacity
                  style={[
                    styles.chip,
                    { borderColor: active ? colors.primary : colors.border },
                    active && { backgroundColor: colors.primaryLight },
                  ]}
                  onPress={() => setFilter(item as Filter)}
                >
                  <Text style={[styles.chipText, { color: active ? colors.primary : colors.textSecondary }]}>
                    {item === 'all' ? 'All' : item}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      )}

      {filtered.length === 0 ? (
        <EmptyState colors={colors} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
          ItemSeparatorComponent={() => <Divider indent={spacing[4]} />}
          renderItem={({ item }) => <HistoryRow event={item} colors={colors} />}
          ListHeaderComponent={
            <Text style={[styles.countLabel, { color: colors.textTertiary }]}>
              {filtered.length} event{filtered.length !== 1 ? 's' : ''}
            </Text>
          }
        />
      )}
    </View>
  );
}

function HistoryRow({ event, colors }: { event: AlertTriggerEvent; colors: any }) {
  return (
    <View style={[styles.row, { backgroundColor: colors.surface }]}>
      <View style={[styles.dot, { backgroundColor: colors.warning }]} />
      <View style={styles.rowBody}>
        <View style={styles.rowTop}>
          <Text style={[styles.symbol, { color: colors.textPrimary }]}>{event.symbol}</Text>
          <Text style={[styles.price, { color: colors.textPrimary }]}>
            {formatPrice(event.triggerPrice)}
          </Text>
        </View>
        <View style={styles.rowBottom}>
          <Text style={[styles.condition, { color: colors.textSecondary }]}>
            {ALERT_CONDITION_LABELS[event.condition]}
          </Text>
          <Text style={[styles.time, { color: colors.textTertiary }]}>
            {formatDateTime(event.triggeredAt)}
          </Text>
        </View>
      </View>
    </View>
  );
}

function EmptyState({ colors }: { colors: any }) {
  return (
    <View style={styles.empty}>
      <Ionicons name="pulse-outline" size={48} color={colors.textTertiary} />
      <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No triggers yet</Text>
      <Text style={[styles.emptyBody, { color: colors.textSecondary }]}>
        When your alerts fire, the events will appear here.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  filterBar: { borderBottomWidth: StyleSheet.hairlineWidth },
  filterContent: { paddingHorizontal: spacing[4], paddingVertical: spacing[3], gap: spacing[2] },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.full,
    borderWidth: 1,
  },
  chipText: { fontSize: typography.size.sm, fontWeight: typography.weight.medium },
  countLabel: {
    fontSize: typography.size.xs,
    marginHorizontal: spacing[4],
    marginVertical: spacing[3],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 14,
    paddingHorizontal: spacing[4],
    gap: spacing[3],
  },
  dot: { width: 8, height: 8, borderRadius: 4, marginTop: 5 },
  rowBody: { flex: 1 },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  rowBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  symbol: { fontSize: typography.size.sm, fontWeight: typography.weight.bold },
  price: { fontSize: typography.size.sm, fontWeight: typography.weight.bold, fontVariant: ['tabular-nums'] },
  condition: { fontSize: typography.size.xs },
  time: { fontSize: typography.size.xs },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing[3], padding: spacing[8] },
  emptyTitle: { fontSize: typography.size.lg, fontWeight: typography.weight.semibold },
  emptyBody: { fontSize: typography.size.sm, textAlign: 'center', lineHeight: 20 },
});
