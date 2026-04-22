import React from 'react';
import {
  View, Text, ScrollView, FlatList, StyleSheet,
  TouchableOpacity, RefreshControl, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useQueries } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';

import { useTheme } from '../../hooks/useTheme';
import { usePortfolioStore } from '../../store/portfolioStore';
import { marketDataService } from '../../services/market/MarketDataService';
import { QUERY_KEYS, STALE_TIMES } from '../../constants';
import { typography, spacing, radii } from '../../constants/theme';
import { formatPrice, formatPercent, formatChange, formatCompact } from '../../utils/format';
import Divider from '../../components/common/Divider';
import EmptyState from '../../components/common/EmptyState';
import type { HoldingWithMetrics } from '../../types/models';

export default function PortfolioHomeScreen() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { holdings, removeHolding, computeSummary } = usePortfolioStore();

  const symbols = [...new Set(holdings.map(h => h.symbol))];

  const quoteQueries = useQueries({
    queries: symbols.map(s => ({
      queryKey: QUERY_KEYS.quote(s),
      queryFn: () => marketDataService.getQuote(s),
      staleTime: STALE_TIMES.quote,
    })),
  });

  const quotes = quoteQueries.map(q => q.data).filter(Boolean) as any[];
  const summary = computeSummary(quotes);
  const isRefreshing = quoteQueries.some(q => q.isFetching);

  const onRefresh = () => quoteQueries.forEach(q => q.refetch());

  const handleDelete = (id: string, symbol: string) => {
    Alert.alert('Remove Holding', `Remove ${symbol} from your portfolio?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeHolding(id) },
    ]);
  };

  const totalGainPositive = summary.totalUnrealizedGain >= 0;
  const dailyPositive = summary.dailyChange >= 0;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
      >
        {/* Hero summary card */}
        <LinearGradient
          colors={isDark ? ['#1E3A5F', '#0D0D0F'] : ['#EFF6FF', '#DBEAFE']}
          style={[styles.heroCard, { paddingTop: insets.top + spacing[4] }]}
        >
          <Text style={[styles.heroLabel, { color: colors.textSecondary }]}>Total Portfolio Value</Text>
          <Text style={[styles.heroValue, { color: colors.textPrimary }]}>
            {formatPrice(summary.totalValue)}
          </Text>

          <View style={styles.heroRow}>
            <View style={styles.heroStat}>
              <Text style={[styles.heroStatLabel, { color: colors.textSecondary }]}>Today</Text>
              <Text
                style={[styles.heroStatValue, { color: dailyPositive ? colors.positive : colors.negative }]}
              >
                {dailyPositive ? '+' : ''}{formatPrice(summary.dailyChange)}
                {'  '}
                ({formatPercent(summary.dailyChangePercent)})
              </Text>
            </View>
            <View style={[styles.heroDivider, { backgroundColor: colors.border }]} />
            <View style={styles.heroStat}>
              <Text style={[styles.heroStatLabel, { color: colors.textSecondary }]}>Total Gain/Loss</Text>
              <Text
                style={[
                  styles.heroStatValue,
                  { color: totalGainPositive ? colors.positive : colors.negative },
                ]}
              >
                {totalGainPositive ? '+' : ''}{formatPrice(summary.totalUnrealizedGain)}
                {'  '}
                ({formatPercent(summary.totalUnrealizedGainPercent)})
              </Text>
            </View>
          </View>

          {/* Allocation bar */}
          {summary.holdings.length > 0 && (
            <AllocationBar holdings={summary.holdings} totalValue={summary.totalValue} />
          )}
        </LinearGradient>

        {/* Holdings */}
        <View style={[styles.sectionHeader, { backgroundColor: colors.background }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Holdings</Text>
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('AddHolding')}
          >
            <Ionicons name="add" size={16} color="#fff" />
            <Text style={styles.addBtnText}>Add</Text>
          </TouchableOpacity>
        </View>

        {summary.holdings.length === 0 ? (
          <EmptyState
            icon="pie-chart-outline"
            title="No holdings yet"
            description="Add your stock positions to track performance and P&L."
            actionLabel="Add Holding"
            onAction={() => navigation.navigate('AddHolding')}
          />
        ) : (
          <View style={[styles.holdingsList, { backgroundColor: colors.surface }]}>
            {summary.holdings.map((holding, i) => (
              <React.Fragment key={holding.id}>
                {i > 0 && <Divider indent={spacing[4]} />}
                <HoldingRow
                  holding={holding}
                  colors={colors}
                  onPress={() => navigation.navigate('StockDetail', { symbol: holding.symbol, name: holding.companyName })}
                  onDelete={() => handleDelete(holding.id, holding.symbol)}
                />
              </React.Fragment>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function HoldingRow({
  holding, colors, onPress, onDelete,
}: {
  holding: HoldingWithMetrics;
  colors: any;
  onPress: () => void;
  onDelete: () => void;
}) {
  const positive = holding.unrealizedGain >= 0;
  const dailyPos = holding.dailyChange >= 0;

  return (
    <TouchableOpacity style={hrStyles.row} onPress={onPress} activeOpacity={0.7}>
      <View style={[hrStyles.badge, { backgroundColor: colors.primaryLight }]}>
        <Text style={[hrStyles.badgeText, { color: colors.primary }]}>
          {holding.symbol.slice(0, 4)}
        </Text>
      </View>

      <View style={hrStyles.mid}>
        <View style={hrStyles.topLine}>
          <Text style={[hrStyles.symbol, { color: colors.textPrimary }]}>{holding.symbol}</Text>
          <Text style={[hrStyles.qty, { color: colors.textSecondary }]}>
            {holding.quantity} shares @ {formatPrice(holding.averageCost)}
          </Text>
        </View>
        <View style={hrStyles.bottomLine}>
          <Text
            style={[
              hrStyles.gain,
              { color: positive ? colors.positive : colors.negative },
            ]}
          >
            {positive ? '+' : ''}{formatPrice(holding.unrealizedGain)} ({formatPercent(holding.unrealizedGainPercent)})
          </Text>
        </View>
      </View>

      <View style={hrStyles.right}>
        <Text style={[hrStyles.marketValue, { color: colors.textPrimary }]}>
          {formatPrice(holding.marketValue)}
        </Text>
        <Text
          style={[
            hrStyles.daily,
            { color: dailyPos ? colors.positive : colors.negative },
          ]}
        >
          {dailyPos ? '+' : ''}{formatPrice(holding.dailyChange)} today
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function AllocationBar({ holdings, totalValue }: { holdings: HoldingWithMetrics[]; totalValue: number }) {
  const { colors } = useTheme();
  const COLORS = ['#3B82F6', '#8B5CF6', '#22C55E', '#F59E0B', '#EF4444', '#06B6D4', '#EC4899'];

  if (totalValue === 0) return null;

  return (
    <View style={abStyles.wrap}>
      <View style={abStyles.bar}>
        {holdings.map((h, i) => (
          <View
            key={h.id}
            style={[
              abStyles.segment,
              {
                width: `${(h.marketValue / totalValue) * 100}%` as any,
                backgroundColor: COLORS[i % COLORS.length],
              },
            ]}
          />
        ))}
      </View>
      <View style={abStyles.legend}>
        {holdings.slice(0, 5).map((h, i) => (
          <View key={h.id} style={abStyles.legendItem}>
            <View style={[abStyles.dot, { backgroundColor: COLORS[i % COLORS.length] }]} />
            <Text style={[abStyles.legendLabel, { color: colors.textSecondary }]}>
              {h.symbol} {((h.marketValue / totalValue) * 100).toFixed(0)}%
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  heroCard: { paddingHorizontal: spacing[4], paddingBottom: spacing[5] },
  heroLabel: { fontSize: typography.size.sm, marginBottom: spacing[1] },
  heroValue: { fontSize: typography.size['4xl'], fontWeight: typography.weight.bold, letterSpacing: -1, marginBottom: spacing[3], fontVariant: ['tabular-nums'] },
  heroRow: { flexDirection: 'row', gap: spacing[4], marginBottom: spacing[3] },
  heroDivider: { width: StyleSheet.hairlineWidth, height: '100%' },
  heroStat: { flex: 1 },
  heroStatLabel: { fontSize: typography.size.xs, marginBottom: 2 },
  heroStatValue: { fontSize: typography.size.sm, fontWeight: typography.weight.semibold, fontVariant: ['tabular-nums'] },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing[4], paddingVertical: spacing[3] },
  sectionTitle: { fontSize: typography.size.lg, fontWeight: typography.weight.semibold },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: spacing[3], paddingVertical: 7, borderRadius: radii.full },
  addBtnText: { color: '#fff', fontSize: typography.size.sm, fontWeight: typography.weight.semibold },
  holdingsList: { marginHorizontal: spacing[4], borderRadius: radii.lg, overflow: 'hidden' },
});

const hrStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, paddingHorizontal: spacing[4], gap: spacing[3] },
  badge: { width: 42, height: 42, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  badgeText: { fontSize: typography.size.xs, fontWeight: typography.weight.bold },
  mid: { flex: 1, overflow: 'hidden' },
  topLine: { flexDirection: 'row', alignItems: 'center', gap: spacing[2], marginBottom: 3 },
  bottomLine: {},
  symbol: { fontSize: typography.size.base, fontWeight: typography.weight.bold },
  qty: { fontSize: typography.size.xs },
  gain: { fontSize: typography.size.sm, fontWeight: typography.weight.medium, fontVariant: ['tabular-nums'] },
  right: { alignItems: 'flex-end', flexShrink: 0 },
  marketValue: { fontSize: typography.size.base, fontWeight: typography.weight.semibold, fontVariant: ['tabular-nums'] },
  daily: { fontSize: typography.size.xs, marginTop: 2, fontVariant: ['tabular-nums'] },
});

const abStyles = StyleSheet.create({
  wrap: { marginTop: spacing[1] },
  bar: { flexDirection: 'row', height: 6, borderRadius: 3, overflow: 'hidden' },
  segment: { height: '100%' },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[3], marginTop: spacing[2] },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: { fontSize: typography.size.xs },
});
