import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { radii } from '../../constants/theme';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export default function Skeleton({ width = '100%', height = 16, borderRadius = radii.sm, style }: SkeletonProps) {
  const { colors } = useTheme();
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 800, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [anim]);

  const opacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] });

  return (
    <Animated.View
      style={[
        { width: width as any, height, borderRadius, backgroundColor: colors.skeletonBase, opacity },
        style,
      ]}
    />
  );
}

export function SkeletonRow({ lines = 2 }: { lines?: number }) {
  return (
    <View style={{ gap: 8 }}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} height={14} width={i === 0 ? '70%' : '45%'} />
      ))}
    </View>
  );
}

export function SkeletonStockRow() {
  return (
    <View style={skStyles.row}>
      <View style={skStyles.left}>
        <Skeleton width={36} height={36} borderRadius={radii.md} />
      </View>
      <View style={skStyles.mid}>
        <Skeleton height={14} width={48} style={{ marginBottom: 6 }} />
        <Skeleton height={11} width={120} />
      </View>
      <View style={skStyles.right}>
        <Skeleton height={14} width={60} style={{ marginBottom: 6 }} />
        <Skeleton height={11} width={50} />
      </View>
    </View>
  );
}

const skStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16, gap: 12 },
  left: {},
  mid: { flex: 1 },
  right: { alignItems: 'flex-end' },
});
