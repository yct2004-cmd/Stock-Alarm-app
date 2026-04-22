import React, { useState, useCallback } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useTheme } from '../../hooks/useTheme';
import { useDebounce } from '../../hooks/useDebounce';
import { useRecentSearches } from '../../hooks/useRecentSearches';
import { useWatchlistStore } from '../../store/watchlistStore';
import { marketDataService } from '../../services/market/MarketDataService';
import { QUERY_KEYS, STALE_TIMES } from '../../constants';
import { typography, spacing, radii } from '../../constants/theme';
import Divider from '../../components/common/Divider';
import type { SearchStackParamList } from '../../types/navigation';
import type { StockSymbol } from '../../types/models';

type Nav = NativeStackNavigationProp<SearchStackParamList>;

const TYPE_COLORS: Record<StockSymbol['type'], string> = {
  stock: '#3B82F6',
  etf: '#8B5CF6',
  crypto: '#F59E0B',
  forex: '#10B981',
};

export default function SearchHomeScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const { recent, add: addRecent, remove: removeRecent, clear } = useRecentSearches();
  const { watchlists, activeWatchlistId, addSymbol, isSymbolInAnyWatchlist } = useWatchlistStore();

  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 350);
  const trimmed = debouncedQuery.trim();

  const { data: results, isFetching } = useQuery({
    queryKey: QUERY_KEYS.search(trimmed),
    queryFn: () => marketDataService.searchSymbols(trimmed),
    enabled: trimmed.length >= 1,
    staleTime: STALE_TIMES.search,
  });

  const handleSelect = useCallback(
    (symbol: StockSymbol) => {
      addRecent(symbol.symbol);
      navigation.navigate('StockDetail', { symbol: symbol.symbol, name: symbol.name });
    },
    [addRecent, navigation],
  );

  const handleAddToWatchlist = useCallback(
    (symbolStr: string) => {
      if (!activeWatchlistId) return;
      addSymbol(activeWatchlistId, symbolStr);
    },
    [activeWatchlistId, addSymbol],
  );

  const renderResult = ({ item }: { item: StockSymbol }) => {
    const inWatchlist = isSymbolInAnyWatchlist(item.symbol);
    return (
      <TouchableOpacity
        style={[styles.resultRow, { backgroundColor: colors.surface }]}
        onPress={() => handleSelect(item)}
        activeOpacity={0.7}
      >
        <View style={[styles.typeBadge, { backgroundColor: TYPE_COLORS[item.type] + '20' }]}>
          <Text style={[styles.typeBadgeText, { color: TYPE_COLORS[item.type] }]}>
            {item.type.toUpperCase()}
          </Text>
        </View>
        <View style={styles.resultContent}>
          <Text style={[styles.resultSymbol, { color: colors.textPrimary }]}>{item.symbol}</Text>
          <Text style={[styles.resultName, { color: colors.textSecondary }]} numberOfLines={1}>
            {item.name}
          </Text>
        </View>
        <Text style={[styles.exchange, { color: colors.textTertiary }]}>{item.exchange}</Text>
        <TouchableOpacity
          onPress={() => handleAddToWatchlist(item.symbol)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.addBtn}
        >
          <Ionicons
            name={inWatchlist ? 'star' : 'star-outline'}
            size={20}
            color={inWatchlist ? colors.warning : colors.textTertiary}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const showRecent = trimmed.length === 0;
  const showResults = trimmed.length > 0;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Search bar */}
      <View
        style={[
          styles.searchHeader,
          { backgroundColor: colors.surface, borderBottomColor: colors.border, paddingTop: insets.top + 8 },
        ]}
      >
        <View style={[styles.searchBar, { backgroundColor: colors.surfacePress, borderColor: colors.border }]}>
          <Ionicons name="search" size={18} color={colors.textTertiary} />
          <TextInput
            style={[styles.searchInput, { color: colors.textPrimary }]}
            placeholder="Search ticker or company..."
            placeholderTextColor={colors.textTertiary}
            value={query}
            onChangeText={setQuery}
            autoCapitalize="characters"
            autoCorrect={false}
            returnKeyType="search"
            autoFocus
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close-circle" size={18} color={colors.textTertiary} />
            </TouchableOpacity>
          )}
          {isFetching && <ActivityIndicator size="small" color={colors.primary} style={{ marginLeft: 6 }} />}
        </View>
      </View>

      {/* Recent searches */}
      {showRecent && (
        <View style={styles.recentSection}>
          {recent.length > 0 && (
            <>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Recent</Text>
                <TouchableOpacity onPress={clear}>
                  <Text style={[styles.clearBtn, { color: colors.primary }]}>Clear</Text>
                </TouchableOpacity>
              </View>
              {recent.map(sym => (
                <TouchableOpacity
                  key={sym}
                  style={[styles.recentRow, { backgroundColor: colors.surface }]}
                  onPress={() => {
                    setQuery(sym);
                  }}
                >
                  <Ionicons name="time-outline" size={16} color={colors.textTertiary} style={{ marginRight: spacing[3] }} />
                  <Text style={[styles.recentSymbol, { color: colors.textPrimary }]}>{sym}</Text>
                  <TouchableOpacity
                    onPress={() => removeRecent(sym)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="close" size={16} color={colors.textTertiary} />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </>
          )}

          {/* Popular picks */}
          <View style={[styles.sectionHeader, { marginTop: spacing[5] }]}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Popular</Text>
          </View>
          <View style={styles.popularGrid}>
            {['AAPL', 'MSFT', 'NVDA', 'AMZN', 'TSLA', 'SPY', 'QQQ', 'META'].map(sym => (
              <TouchableOpacity
                key={sym}
                style={[styles.popularChip, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => setQuery(sym)}
              >
                <Text style={[styles.popularChipText, { color: colors.textPrimary }]}>{sym}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Results */}
      {showResults && (
        <FlatList
          data={results ?? []}
          keyExtractor={item => item.symbol}
          renderItem={renderResult}
          ItemSeparatorComponent={() => <Divider indent={spacing[4]} />}
          ListEmptyComponent={
            !isFetching ? (
              <View style={styles.noResults}>
                <Text style={[styles.noResultsText, { color: colors.textSecondary }]}>
                  No results for "{trimmed}"
                </Text>
              </View>
            ) : null
          }
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  searchHeader: {
    padding: spacing[4],
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radii.full,
    borderWidth: 1,
    paddingHorizontal: spacing[3],
    paddingVertical: 10,
    gap: spacing[2],
  },
  searchInput: {
    flex: 1,
    fontSize: typography.size.base,
    padding: 0,
  },
  recentSection: { padding: spacing[4] },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  sectionTitle: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  clearBtn: { fontSize: typography.size.sm, fontWeight: typography.weight.medium },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: spacing[3],
    borderRadius: radii.md,
    marginBottom: 4,
  },
  recentSymbol: { flex: 1, fontSize: typography.size.base, fontWeight: typography.weight.medium },
  popularGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
  popularChip: {
    paddingHorizontal: spacing[3],
    paddingVertical: 8,
    borderRadius: radii.full,
    borderWidth: 1,
  },
  popularChipText: { fontSize: typography.size.sm, fontWeight: typography.weight.medium },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: spacing[4],
    gap: spacing[3],
  },
  typeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radii.xs,
  },
  typeBadgeText: { fontSize: 10, fontWeight: typography.weight.bold },
  resultContent: { flex: 1 },
  resultSymbol: { fontSize: typography.size.base, fontWeight: typography.weight.semibold },
  resultName: { fontSize: typography.size.sm, marginTop: 2 },
  exchange: { fontSize: typography.size.xs },
  addBtn: { padding: 4 },
  noResults: { padding: spacing[8], alignItems: 'center' },
  noResultsText: { fontSize: typography.size.base },
});
