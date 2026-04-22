import React from 'react';
import { Text, View, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { typography, radii, spacing } from '../../constants/theme';

interface ChangeChipProps {
  value: number;      // percent change
  showIcon?: boolean;
  compact?: boolean;
  style?: ViewStyle;
}

export default function ChangeChip({ value, showIcon = true, compact = false, style }: ChangeChipProps) {
  const { colors } = useTheme();
  const positive = value >= 0;
  const bg = positive ? colors.positiveLight : colors.negativeLight;
  const textColor = positive ? colors.positive : colors.negative;
  const icon: React.ComponentProps<typeof Ionicons>['name'] = positive ? 'caret-up' : 'caret-down';
  const label = `${positive ? '+' : ''}${value.toFixed(2)}%`;

  return (
    <View style={[styles.chip, { backgroundColor: bg }, compact && styles.compact, style]}>
      {showIcon && <Ionicons name={icon} size={10} color={textColor} style={{ marginRight: 2 }} />}
      <Text style={[styles.text, { color: textColor }, compact && styles.compactText]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[2],
    paddingVertical: 3,
    borderRadius: radii.xs,
  },
  compact: {
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  text: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
  },
  compactText: {
    fontSize: typography.size.xs,
  },
});
