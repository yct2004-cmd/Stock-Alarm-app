import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { typography, radii, spacing } from '../../constants/theme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'positive';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  leftIcon?: React.ReactNode;
}

export default function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
  textStyle,
  leftIcon,
}: ButtonProps) {
  const { colors } = useTheme();
  const isDisabled = disabled || loading;

  const containerStyle = [
    styles.base,
    styles[size],
    fullWidth && styles.fullWidth,
    {
      backgroundColor: getBg(variant, colors),
      borderColor: getBorder(variant, colors),
      borderWidth: variant === 'secondary' || variant === 'ghost' ? 1.5 : 0,
      opacity: isDisabled ? 0.5 : 1,
    },
    style,
  ];

  const labelStyle: TextStyle = {
    ...styles.label,
    ...sizes[size].label,
    color: getTextColor(variant, colors),
  };

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.75}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor(variant, colors)} size="small" />
      ) : (
        <View style={styles.inner}>
          {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
          <Text style={[labelStyle, textStyle]}>{label}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

function getBg(v: Variant, c: ReturnType<typeof useTheme>['colors']): string {
  switch (v) {
    case 'primary':   return c.primary;
    case 'danger':    return c.negative;
    case 'positive':  return c.positive;
    case 'secondary':
    case 'ghost':     return 'transparent';
  }
}

function getBorder(v: Variant, c: ReturnType<typeof useTheme>['colors']): string {
  switch (v) {
    case 'secondary': return c.border;
    case 'ghost':     return 'transparent';
    default:          return 'transparent';
  }
}

function getTextColor(v: Variant, c: ReturnType<typeof useTheme>['colors']): string {
  switch (v) {
    case 'primary':
    case 'danger':
    case 'positive': return '#FFFFFF';
    case 'secondary': return c.textPrimary;
    case 'ghost':     return c.primary;
  }
}

const sizes = {
  sm: { label: { fontSize: typography.size.sm, fontWeight: typography.weight.semibold } },
  md: { label: { fontSize: typography.size.base, fontWeight: typography.weight.semibold } },
  lg: { label: { fontSize: typography.size.md, fontWeight: typography.weight.bold } },
};

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sm:  { paddingHorizontal: spacing[3], paddingVertical: 8, borderRadius: radii.sm },
  md:  { paddingHorizontal: spacing[4], paddingVertical: 13 },
  lg:  { paddingHorizontal: spacing[5], paddingVertical: 16, borderRadius: radii.lg },
  fullWidth: { width: '100%' },
  inner: { flexDirection: 'row', alignItems: 'center' },
  iconLeft: { marginRight: spacing[2] },
  label: {},
});
