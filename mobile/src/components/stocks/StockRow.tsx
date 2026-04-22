import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { typography, spacing, radii } from '../../constants/theme';
import ChangeChip from '../common/ChangeChip';
import type { Quote } from '../../types/models';
import { formatPrice, formatChange } from '../../utils/format';

interface StockRowProps {
  quote: Quote;
  onPress?: () => void;
  rightSwipeContent?: React.ReactNode;
  showExchange?: boolean;
}

export default function StockRow({ quote, onPress, showExchange = false }: StockRowProps) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.row, { backgroundColor: colors.surface }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Symbol badge */}
      <View style={[styles.badge, { backgroundColor: colors.primaryLight }]}>
        <Text style={[styles.badgeText, { color: colors.primary }]} numberOfLines={1}>
          {quote.symbol.length > 4 ? quote.symbol.slice(0, 4) : quote.symbol}
        </Text>
      </View>

      {/* Name + exchange */}
      <View style={styles.nameCol}>
        <Text style={[styles.symbol, { color: colors.textPrimary }]} numberOfLines={1}>
          {quote.symbol}
        </Text>
        <Text style={[styles.name, { color: colors.textSecondary }]} numberOfLines={1}>
          {showExchange ? `${quote.exchange} · ` : ''}{quote.name}
        </Text>
      </View>

      {/* Price + change */}
      <View style={styles.priceCol}>
        <Text style={[styles.price, { color: colors.textPrimary }]}>
          {formatPrice(quote.price)}
        </Text>
        <View style={styles.changeRow}>
          <Text
            style={[
              styles.changeAbs,
              { color: quote.change >= 0 ? colors.positive : colors.negative },
            ]}
          >
            {formatChange(quote.change)}
          </Text>
          <ChangeChip value={quote.changePercent} showIcon={false} compact style={{ marginLeft: 4 }} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: spacing[4],
    gap: spacing[3],
  },
  badge: {
    width: 42,
    height: 42,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  badgeText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
    letterSpacing: -0.3,
  },
  nameCol: {
    flex: 1,
    overflow: 'hidden',
  },
  symbol: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold,
  },
  name: {
    fontSize: typography.size.sm,
    marginTop: 2,
  },
  priceCol: {
    alignItems: 'flex-end',
    flexShrink: 0,
  },
  price: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold,
    fontVariant: ['tabular-nums'],
  },
  changeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  changeAbs: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.medium,
    fontVariant: ['tabular-nums'],
  },
});
