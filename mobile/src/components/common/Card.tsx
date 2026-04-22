import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { radii, shadows, spacing } from '../../constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: keyof typeof spacing | number;
  elevated?: boolean;
  noPadding?: boolean;
}

export default function Card({ children, style, padding = 4, elevated = false, noPadding = false }: CardProps) {
  const { colors, isDark } = useTheme();
  const pad = noPadding ? 0 : typeof padding === 'number' ? spacing[padding as keyof typeof spacing] ?? padding : padding;

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.surface, padding: pad },
        !isDark && elevated && shadows.md,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.lg,
    overflow: 'hidden',
  },
});
