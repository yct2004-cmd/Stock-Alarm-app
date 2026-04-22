import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useTheme } from '../../hooks/useTheme';
import { typography, spacing, radii } from '../../constants/theme';
import type { OHLCBar, TimeRange } from '../../types/models';

const TIME_RANGES: TimeRange[] = ['1D', '1W', '1M', '3M', '1Y', '5Y'];
const { width: SCREEN_W } = Dimensions.get('window');

interface PriceChartProps {
  bars: OHLCBar[];
  range: TimeRange;
  onRangeChange: (r: TimeRange) => void;
  isLoading?: boolean;
  positive?: boolean;   // overrides color derivation when chart data is loading
  width?: number;
}

function thinLabels(bars: OHLCBar[], range: TimeRange, count = 5): string[] {
  if (bars.length === 0) return [];
  const step = Math.max(1, Math.floor(bars.length / count));
  return bars
    .filter((_, i) => i % step === 0 || i === bars.length - 1)
    .slice(0, count + 1)
    .map(b => {
      const d = new Date(b.timestamp);
      if (range === '1D') {
        const h = d.getHours();
        const m = d.getMinutes().toString().padStart(2, '0');
        return `${h}:${m}`;
      }
      if (range === '1W' || range === '1M') {
        return `${d.getMonth() + 1}/${d.getDate()}`;
      }
      return `${d.getMonth() + 1}/${String(d.getFullYear()).slice(2)}`;
    });
}

function downsample(bars: OHLCBar[], maxPoints: number): OHLCBar[] {
  if (bars.length <= maxPoints) return bars;
  const step = bars.length / maxPoints;
  const result: OHLCBar[] = [];
  for (let i = 0; i < maxPoints; i++) {
    result.push(bars[Math.min(Math.round(i * step), bars.length - 1)]);
  }
  return result;
}

export default function PriceChart({ bars, range, onRangeChange, isLoading = false, positive, width }: PriceChartProps) {
  const { colors, isDark } = useTheme();
  const chartWidth = (width ?? SCREEN_W) - 0;

  const { data, labels, isUp } = useMemo(() => {
    if (bars.length === 0) return { data: [0], labels: [''], isUp: true };
    const sampled = downsample(bars, 80);
    const prices = sampled.map(b => b.close);
    const first = prices[0];
    const last = prices[prices.length - 1];
    return {
      data: prices,
      labels: thinLabels(sampled, range, 4),
      isUp: last >= first,
    };
  }, [bars, range]);

  const lineColor = positive !== undefined
    ? (positive ? colors.chartPositive : colors.chartNegative)
    : (isUp ? colors.chartPositive : colors.chartNegative);

  const fillColor = positive !== undefined
    ? (positive ? '#22C55E' : '#EF4444')
    : (isUp ? '#22C55E' : '#EF4444');

  const chartConfig = {
    backgroundGradientFrom: colors.surface,
    backgroundGradientTo: colors.surface,
    backgroundGradientFromOpacity: 0,
    backgroundGradientToOpacity: 0,
    color: () => lineColor,
    strokeWidth: 2,
    fillShadowGradient: fillColor,
    fillShadowGradientOpacity: 0.12,
    decimalPlaces: 2,
    propsForLabels: {
      fontSize: typography.size.xs,
      fill: colors.chartLabel,
      fontWeight: '400',
    },
    propsForDots: { r: '0' },
    propsForBackgroundLines: {
      stroke: colors.chartGrid,
      strokeWidth: 0.5,
      strokeDasharray: '',
    },
  };

  return (
    <View style={styles.container}>
      {/* Time range tabs */}
      <View style={[styles.tabs, { borderBottomColor: colors.separator }]}>
        {TIME_RANGES.map(r => {
          const active = r === range;
          return (
            <TouchableOpacity
              key={r}
              style={[styles.tab, active && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
              onPress={() => onRangeChange(r)}
            >
              <Text
                style={[
                  styles.tabLabel,
                  { color: active ? colors.primary : colors.textTertiary },
                  active && { fontWeight: typography.weight.semibold },
                ]}
              >
                {r}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Chart */}
      <View style={[styles.chartWrap, { backgroundColor: colors.surface }]}>
        {isLoading ? (
          <View style={[styles.loader, { height: 180 }]}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : (
          <LineChart
            data={{ labels, datasets: [{ data, strokeWidth: 2 }] }}
            width={chartWidth}
            height={180}
            chartConfig={chartConfig}
            bezier
            withShadow
            withInnerLines={false}
            withOuterLines={false}
            withVerticalLines={false}
            withHorizontalLines={false}
            withDots={false}
            withVerticalLabels={false}
            withHorizontalLabels={false}
            style={styles.chart}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing[4],
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing[3],
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabLabel: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
  },
  chartWrap: {
    paddingTop: spacing[2],
  },
  chart: {
    marginLeft: -spacing[4],
  },
  loader: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
