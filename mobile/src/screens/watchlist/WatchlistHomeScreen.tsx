import React, { useCallback, useRef } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  RefreshControl, Alert, SectionList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useQueries } from '@tanstack/react-query';

import { useTheme } from '../../hooks/useTheme';
import { useWatchlistStore } from '../../store/watchlistStore';
import { marketDataService } from '../../services/market/MarketDataService';
import { QUERY_KEYS, STALE_TIMES, APP_NAME } from '../../constants';
import { typography, spacing, radii } from '../../constants/theme';
import StockRow from '../../components/stocks/StockRow';
import { SkeletonStockRow } from '../../components/common/Skeleton';
import Divider from '../../components/common/Divider';
import EmptyState from '../../components/common/EmptyState';
import type { WatchlistNavigationProp } from '../../types/navigation';

export default function WatchlistHomeScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<WatchlistNavigationProp>();

  const { watchlists, activeWatchlistId, setActiveWatchlist, removeSymbol } = useWatchlistStore();
  const activeWatchlist = watchlists.find(w => w.id === activeWatchlistId) ?? watchlists[0];
  const symbols = activeWatchlist?.items.map(i => i.symbol) ?? [];

  // Batch-fetch all quotes in parallel
  const quoteQueries = useQueries({
    queries: symbols.map(symbol => ({
      queryKey: QUERY_KEYS.quote(symbol),
      queryFn: () => marketDataService.getQuote(symbol),
      staleTime: STALE_TIMES.quote,
    })),
  });

  const isLoading = quoteQueries.some(q => q.isLoading);
  const isRefreshing = quoteQueries.some(q => q.isFetching);

  const onRefresh = useCallback(() => {
    quoteQueries.forEach(q => q.refetch());
  }, [quoteQueries]);

  const handleStockPress = (symbol: string, name: string) => {
    navigation.navigate('StockDetail', { symbol, name });
  };

  const handleRemove = (symbol: string) => {
    if (!activeWatchlist) return;
    Alert.alert('Remove from Watchlist', `Remove ${symbol} from ${activeWatchlist.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => removeSymbol(activeWatchlist.id, symbol),
      },
    ]);
  };

  // Derived stats for header summary
  const quotes = quoteQueries.map(q => q.data).filter(Boolean);
  const gainers = quotes.filter(q => q!.changePercent > 0).length;
  const losers = quotes.filter(q => q!.changePercent < 0).length;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          { backgroundColor: colors.surface, borderBottomColor: colors.border, paddingTop: insets.top + 8 },
        ]}
      >
        <View style={styles.headerTop}>
          <View style={styles.brandRow}>
            <View style={[styles.logoMini, { backgroundColor: colors.primary }]}>
              <Ionicons name="pulse" size={14} color="#fff" />
            </View>
            <Text style={[styles.brandText, { color: colors.textPrimary }]}>{APP_NAME}</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={() => navigation.navigate('SearchTab' as any)}
              style={styles.iconBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="search-outline" size={22} color={colors.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate('ManageWatchlists')}
              style={styles.iconBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="list-outline" size={22} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Market summary pills */}
        {quotes.length > 0 && (
          <View style={styles.summaryRow}>
            <View style={[styles.pill, { backgroundColor: colors.positiveLight }]}>
              <Ionicons name="trending-up" size={12} color={colors.positive} />
              <Text style={[styles.pillText, { color: colors.positive }]}>{gainers} up</Text>
            </View>
            <View style={[styles.pill, { backgroundColor: colors.negativeLight }]}>
              <Ionicons name="trending-down" size={12} color={colors.negative} />
              <Text style={[styles.pillText, { color: colors.negative }]}>{losers} down</Text>
            </View>
            <View style={[styles.pill, { backgroundColor: colors.separator }]}>
              <Text style={[styles.pillText, { color: colors.textSecondary }]}>
                {quotes.length - gainers - losers} flat
              </Text>
            </View>
          </View>
        )}

        {/* Watchlist tabs */}
        {watchlists.length > 1 && (
          <FlatList
            data={watchlists}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={w => w.id}
            style={styles.tabList}
            contentContainerStyle={{ paddingHorizontal: spacing[4] }}
            renderItem={({ item: wl }) => {
              const active = wl.id === activeWatchlistId;
              return (
                <TouchableOpacity
                  style={[
                    styles.wlTab,
                    active && { backgroundColor: colors.primary },
                    !active && { backgroundColor: colors.surfacePress },
                  ]}
                  onPress={() => setActiveWatchlist(wl.id)}
                >
                  <Text
                    style={[
                      styles.wlTabText,
                      { color: active ? '#fff' : colors.textSecondary },
                    ]}
                  >
                    {wl.name}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        )}
      </View>

      {/* Stock list */}
      {isLoading ? (
        <View style={styles.skeletons}>
          {[...Array(6)].map((_, i) => (
            <React.Fragment key={i}>
              <SkeletonStockRow />
              <Divider indent={72} />
            </React.Fragment>
          ))}
        </View>
      ) : symbols.length === 0 ? (
        <EmptyState
          icon="star-outline"
          title="Your watchlist is empty"
          description="Search for stocks and add them to track prices and alerts."
          actionLabel="Search Stocks"
          onAction={() => navigation.navigate('SearchTab' as any)}
        />
      ) : (
        <FlatList
          data={symbols}
          keyExtractor={s => s}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
          ItemSeparatorComponent={() => <Divider indent={72} />}
          renderItem={({ item: symbol, index }) => {
            const query = quoteQueries[index];
            if (!query?.data) return null;
            return (
              <StockRow
                quote={query.data}
                onPress={() => handleStockPress(query.data!.symbol, query.data!.name)}
              />
            );
          }}
          contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
        />
      )}

      {/* FAB — add stock */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary, bottom: insets.bottom + 20 }]}
        onPress={() => navigation.navigate('SearchTab' as any)}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingBottom: spacing[3],
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[2],
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoMini: { width: 26, height: 26, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  brandText: { fontSize: typography.size.lg, fontWeight: typography.weight.bold, letterSpacing: -0.3 },
  headerActions: { flexDirection: 'row', gap: spacing[3] },
  iconBtn: { padding: 4 },
  summaryRow: { flexDirection: 'row', gap: spacing[2], paddingHorizontal: spacing[4], marginBottom: spacing[2] },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: radii.full },
  pillText: { fontSize: typography.size.xs, fontWeight: typography.weight.medium },
  tabList: { marginBottom: 4 },
  wlTab: { paddingHorizontal: spacing[3], paddingVertical: 6, borderRadius: radii.full, marginRight: spacing[2] },
  wlTabText: { fontSize: typography.size.sm, fontWeight: typography.weight.medium },
  skeletons: {},
  fab: {
    position: 'absolute',
    right: spacing[5],
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
});
