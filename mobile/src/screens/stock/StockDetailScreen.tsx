import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';

import { useTheme } from '../../hooks/useTheme';
import { useWatchlistStore } from '../../store/watchlistStore';
import { marketDataService } from '../../services/market/MarketDataService';
import { QUERY_KEYS, STALE_TIMES } from '../../constants';
import { typography, spacing, radii } from '../../constants/theme';
import {
  formatPrice, formatPercent, formatChange,
  formatCompact, formatVolume, formatRelativeTime,
} from '../../utils/format';
import PriceChart from '../../components/charts/PriceChart';
import ChangeChip from '../../components/common/ChangeChip';
import Divider from '../../components/common/Divider';
import type { TimeRange } from '../../types/models';
import type { StockDetailScreenProps } from '../../types/navigation';

export default function StockDetailScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<StockDetailScreenProps['route']>();
  const { symbol, name } = route.params;

  const [range, setRange] = useState<TimeRange>('1D');

  const { watchlists, activeWatchlistId, addSymbol, removeSymbol, isSymbolInAnyWatchlist } =
    useWatchlistStore();
  const inWatchlist = isSymbolInAnyWatchlist(symbol);

  const toggleWatchlist = () => {
    if (!activeWatchlistId) return;
    if (inWatchlist) {
      removeSymbol(activeWatchlistId, symbol);
    } else {
      addSymbol(activeWatchlistId, symbol);
    }
  };

  const { data: quote, isLoading: quoteLoading } = useQuery({
    queryKey: QUERY_KEYS.quote(symbol),
    queryFn: () => marketDataService.getQuote(symbol),
    staleTime: STALE_TIMES.quote,
    refetchInterval: 15_000,
  });

  const { data: bars, isFetching: chartFetching } = useQuery({
    queryKey: QUERY_KEYS.history(symbol, range),
    queryFn: () => marketDataService.getHistoricalPrices(symbol, range),
    staleTime: STALE_TIMES.history,
  });

  const { data: profile } = useQuery({
    queryKey: QUERY_KEYS.profile(symbol),
    queryFn: () => marketDataService.getCompanyProfile(symbol),
    staleTime: STALE_TIMES.profile,
  });

  const { data: technicals } = useQuery({
    queryKey: QUERY_KEYS.technicals(symbol),
    queryFn: () => marketDataService.getTechnicalIndicators(symbol),
    staleTime: STALE_TIMES.technicals,
  });

  const { data: news } = useQuery({
    queryKey: QUERY_KEYS.news(symbol),
    queryFn: () => marketDataService.getNews(symbol),
    staleTime: STALE_TIMES.news,
  });

  const isPositive = (quote?.changePercent ?? 0) >= 0;

  const navigateToCreateAlert = () => {
    (navigation as any).navigate('AlertsTab', {
      screen: 'CreateAlert',
      params: { symbol, name },
    });
  };

  if (quoteLoading) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <ActivityIndicator color={colors.primary} size="large" style={{ flex: 1 }} />
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Fixed nav bar */}
      <View
        style={[
          styles.navbar,
          { backgroundColor: colors.surface, borderBottomColor: colors.border, paddingTop: insets.top + 4 },
        ]}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.navBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <View style={styles.navCenter}>
          <Text style={[styles.navSymbol, { color: colors.textPrimary }]}>{symbol}</Text>
          <Text style={[styles.navExchange, { color: colors.textSecondary }]}>
            {quote?.exchange ?? ''}
          </Text>
        </View>
        <View style={styles.navRight}>
          <TouchableOpacity onPress={toggleWatchlist} style={styles.navBtn}>
            <Ionicons
              name={inWatchlist ? 'star' : 'star-outline'}
              size={22}
              color={inWatchlist ? colors.warning : colors.textSecondary}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={navigateToCreateAlert} style={styles.navBtn}>
            <Ionicons name="notifications-outline" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      >
        {/* Price hero */}
        <View style={[styles.priceHero, { backgroundColor: colors.surface }]}>
          <Text style={[styles.companyName, { color: colors.textSecondary }]} numberOfLines={1}>
            {quote?.name ?? name}
          </Text>
          <View style={styles.priceRow}>
            <Text style={[styles.price, { color: colors.textPrimary }]}>
              {formatPrice(quote?.price ?? 0)}
            </Text>
          </View>
          <View style={styles.changeRow}>
            <Text
              style={[
                styles.changeAbs,
                { color: isPositive ? colors.positive : colors.negative },
              ]}
            >
              {formatChange(quote?.change ?? 0)}
            </Text>
            <ChangeChip
              value={quote?.changePercent ?? 0}
              showIcon
              style={{ marginLeft: spacing[2] }}
            />
            <Text style={[styles.session, { color: colors.textTertiary }]}>
              {' '}· {quote?.session ?? 'regular'}
            </Text>
          </View>
        </View>

        {/* Chart */}
        <View style={[styles.chartCard, { backgroundColor: colors.surface }]}>
          <PriceChart
            bars={bars ?? []}
            range={range}
            onRangeChange={setRange}
            isLoading={chartFetching}
            positive={isPositive}
          />
        </View>

        {/* Key stats */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Key Statistics</Text>
          <View style={styles.statsGrid}>
            <StatCell label="Open" value={formatPrice(quote?.open ?? 0)} colors={colors} />
            <StatCell label="Prev Close" value={formatPrice(quote?.previousClose ?? 0)} colors={colors} />
            <StatCell label="Day High" value={formatPrice(quote?.dayHigh ?? 0)} colors={colors} positive />
            <StatCell label="Day Low" value={formatPrice(quote?.dayLow ?? 0)} colors={colors} negative />
            <StatCell label="Volume" value={formatVolume(quote?.volume ?? 0)} colors={colors} />
            <StatCell label="Avg Vol" value={formatVolume(quote?.avgVolume ?? 0)} colors={colors} />
            <StatCell label="Market Cap" value={formatCompact(quote?.marketCap ?? 0)} colors={colors} />
            <StatCell label="Exchange" value={quote?.exchange ?? '—'} colors={colors} />
          </View>
        </View>

        {/* Technicals */}
        {technicals && (
          <View style={[styles.section, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Technical Indicators
            </Text>
            <View style={styles.statsGrid}>
              {technicals.sma20 !== null && (
                <StatCell
                  label="SMA 20"
                  value={formatPrice(technicals.sma20!)}
                  colors={colors}
                  accentColor={
                    quote && technicals.sma20
                      ? quote.price > technicals.sma20
                        ? colors.positive
                        : colors.negative
                      : undefined
                  }
                />
              )}
              {technicals.sma50 !== null && (
                <StatCell label="SMA 50" value={formatPrice(technicals.sma50!)} colors={colors} />
              )}
              {technicals.sma200 !== null && (
                <StatCell label="SMA 200" value={formatPrice(technicals.sma200!)} colors={colors} />
              )}
              {technicals.rsi14 !== null && (
                <StatCell
                  label="RSI (14)"
                  value={technicals.rsi14!.toFixed(1)}
                  colors={colors}
                  accentColor={
                    technicals.rsi14! > 70
                      ? colors.negative
                      : technicals.rsi14! < 30
                      ? colors.positive
                      : undefined
                  }
                />
              )}
              {technicals.macdLine !== null && (
                <StatCell
                  label="MACD"
                  value={technicals.macdLine!.toFixed(4)}
                  colors={colors}
                  accentColor={
                    technicals.macdLine! > (technicals.macdSignal ?? 0)
                      ? colors.positive
                      : colors.negative
                  }
                />
              )}
              {technicals.macdSignal !== null && (
                <StatCell label="Signal" value={technicals.macdSignal!.toFixed(4)} colors={colors} />
              )}
            </View>
            {technicals.rsi14 !== null && (
              <RsiBar value={technicals.rsi14!} colors={colors} />
            )}
          </View>
        )}

        {/* Company profile */}
        {profile && (
          <View style={[styles.section, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>About</Text>
            <View style={styles.profileMeta}>
              <MetaChip label={profile.sector} colors={colors} />
              <MetaChip label={profile.industry} colors={colors} />
              {profile.country && <MetaChip label={profile.country} colors={colors} />}
            </View>
            <Text style={[styles.description, { color: colors.textSecondary }]}>
              {profile.description}
            </Text>
            {profile.employees && (
              <Text style={[styles.employees, { color: colors.textTertiary }]}>
                {formatCompact(profile.employees)} employees
              </Text>
            )}
          </View>
        )}

        {/* News */}
        {news && news.length > 0 && (
          <View style={[styles.section, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>News</Text>
            {news.map((item, i) => (
              <React.Fragment key={item.id}>
                {i > 0 && <Divider />}
                <TouchableOpacity style={styles.newsItem} activeOpacity={0.7}>
                  <View style={styles.newsHeader}>
                    <Text style={[styles.newsSource, { color: colors.textTertiary }]}>
                      {item.source}
                    </Text>
                    <Text style={[styles.newsTime, { color: colors.textTertiary }]}>
                      {formatRelativeTime(item.publishedAt)}
                    </Text>
                  </View>
                  <Text style={[styles.newsHeadline, { color: colors.textPrimary }]}>
                    {item.headline}
                  </Text>
                  {item.sentiment && (
                    <View
                      style={[
                        styles.sentimentBadge,
                        {
                          backgroundColor:
                            item.sentiment === 'positive'
                              ? colors.positiveLight
                              : item.sentiment === 'negative'
                              ? colors.negativeLight
                              : colors.surfacePress,
                        },
                      ]}
                    >
                      <Text
                        style={{
                          fontSize: 10,
                          fontWeight: typography.weight.semibold,
                          color:
                            item.sentiment === 'positive'
                              ? colors.positive
                              : item.sentiment === 'negative'
                              ? colors.negative
                              : colors.textSecondary,
                        }}
                      >
                        {item.sentiment.toUpperCase()}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </React.Fragment>
            ))}
          </View>
        )}

        {/* Alert CTA */}
        <View style={{ paddingHorizontal: spacing[4], marginTop: spacing[3] }}>
          <TouchableOpacity
            style={[styles.alertCta, { backgroundColor: colors.primary }]}
            onPress={navigateToCreateAlert}
            activeOpacity={0.85}
          >
            <Ionicons name="notifications" size={18} color="#fff" />
            <Text style={styles.alertCtaText}>Create Alert for {symbol}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCell({
  label, value, colors, positive, negative, accentColor,
}: {
  label: string;
  value: string;
  colors: any;
  positive?: boolean;
  negative?: boolean;
  accentColor?: string;
}) {
  const textColor = accentColor
    ?? (positive ? colors.positive : negative ? colors.negative : colors.textPrimary);
  return (
    <View style={statStyles.cell}>
      <Text style={[statStyles.label, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[statStyles.value, { color: textColor }]}>{value}</Text>
    </View>
  );
}

function RsiBar({ value, colors }: { value: number; colors: any }) {
  const pct = Math.min(Math.max(value, 0), 100);
  const fillColor = value > 70 ? colors.negative : value < 30 ? colors.positive : colors.primary;
  return (
    <View style={rsiStyles.wrap}>
      <View style={[rsiStyles.track, { backgroundColor: colors.border }]}>
        <View style={[rsiStyles.fill, { width: `${pct}%` as any, backgroundColor: fillColor }]} />
        {/* Overbought / oversold lines */}
        <View style={[rsiStyles.line, { left: '70%' as any, backgroundColor: colors.negative }]} />
        <View style={[rsiStyles.line, { left: '30%' as any, backgroundColor: colors.positive }]} />
      </View>
      <View style={rsiStyles.labels}>
        <Text style={[rsiStyles.label, { color: colors.positive }]}>30</Text>
        <Text style={[rsiStyles.label, { color: colors.textTertiary }]}>RSI</Text>
        <Text style={[rsiStyles.label, { color: colors.negative }]}>70</Text>
      </View>
    </View>
  );
}

function MetaChip({ label, colors }: { label: string; colors: any }) {
  return (
    <View style={[mcStyles.chip, { backgroundColor: colors.primaryLight }]}>
      <Text style={[mcStyles.text, { color: colors.primary }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  loading: { flex: 1, paddingHorizontal: spacing[4] },
  backBtn: { paddingVertical: spacing[4] },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: spacing[3],
    paddingHorizontal: spacing[2],
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  navBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  navCenter: { flex: 1, alignItems: 'center' },
  navSymbol: { fontSize: typography.size.md, fontWeight: typography.weight.bold },
  navExchange: { fontSize: typography.size.xs, marginTop: 1 },
  navRight: { flexDirection: 'row' },
  priceHero: {
    padding: spacing[4],
    paddingTop: spacing[5],
    marginBottom: 1,
  },
  companyName: { fontSize: typography.size.sm, marginBottom: 4 },
  priceRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 6 },
  price: {
    fontSize: typography.size['4xl'],
    fontWeight: typography.weight.bold,
    letterSpacing: -1,
    fontVariant: ['tabular-nums'],
  },
  changeRow: { flexDirection: 'row', alignItems: 'center' },
  changeAbs: { fontSize: typography.size.base, fontWeight: typography.weight.semibold, fontVariant: ['tabular-nums'] },
  session: { fontSize: typography.size.xs, textTransform: 'capitalize' },
  chartCard: { marginBottom: 1 },
  section: {
    padding: spacing[4],
    marginBottom: 1,
  },
  sectionTitle: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold,
    marginBottom: spacing[3],
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  profileMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: spacing[3] },
  description: { fontSize: typography.size.sm, lineHeight: 20, marginBottom: spacing[2] },
  employees: { fontSize: typography.size.xs },
  newsItem: { paddingVertical: spacing[3] },
  newsHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  newsSource: { fontSize: typography.size.xs, fontWeight: typography.weight.medium },
  newsTime: { fontSize: typography.size.xs },
  newsHeadline: { fontSize: typography.size.sm, fontWeight: typography.weight.medium, lineHeight: 20 },
  sentimentBadge: { alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 2, borderRadius: radii.xs, marginTop: 6 },
  alertCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    paddingVertical: 14,
    borderRadius: radii.lg,
  },
  alertCtaText: { color: '#fff', fontSize: typography.size.base, fontWeight: typography.weight.semibold },
});

const statStyles = StyleSheet.create({
  cell: { width: '50%', paddingVertical: 8, paddingRight: spacing[4] },
  label: { fontSize: typography.size.xs, marginBottom: 2 },
  value: { fontSize: typography.size.sm, fontWeight: typography.weight.semibold, fontVariant: ['tabular-nums'] },
});

const rsiStyles = StyleSheet.create({
  wrap: { marginTop: spacing[3] },
  track: { height: 6, borderRadius: 3, overflow: 'hidden', position: 'relative' },
  fill: { height: '100%', borderRadius: 3 },
  line: { position: 'absolute', top: 0, width: 1.5, height: '100%' },
  labels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  label: { fontSize: 10 },
});

const mcStyles = StyleSheet.create({
  chip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radii.full },
  text: { fontSize: typography.size.xs, fontWeight: typography.weight.medium },
});
