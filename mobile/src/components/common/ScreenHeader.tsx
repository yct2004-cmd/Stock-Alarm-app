import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../hooks/useTheme';
import { typography, spacing } from '../../constants/theme';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: {
    icon?: React.ComponentProps<typeof Ionicons>['name'];
    label?: string;
    onPress: () => void;
    color?: string;
  };
  rightAction2?: {
    icon: React.ComponentProps<typeof Ionicons>['name'];
    onPress: () => void;
    color?: string;
  };
  style?: ViewStyle;
  transparent?: boolean;
  largeTitle?: boolean;
}

export default function ScreenHeader({
  title,
  subtitle,
  showBack = false,
  onBack,
  rightAction,
  rightAction2,
  style,
  transparent = false,
  largeTitle = false,
}: ScreenHeaderProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const handleBack = onBack ?? (() => navigation.goBack());

  const paddingTop = Platform.OS === 'ios' ? insets.top + 4 : insets.top + 8;

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop,
          backgroundColor: transparent ? 'transparent' : colors.surface,
          borderBottomColor: transparent ? 'transparent' : colors.border,
          borderBottomWidth: transparent ? 0 : StyleSheet.hairlineWidth,
        },
        style,
      ]}
    >
      <View style={styles.row}>
        {/* Left — back button */}
        <View style={styles.side}>
          {showBack && (
            <TouchableOpacity
              onPress={handleBack}
              style={styles.backBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="chevron-back" size={24} color={colors.primary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Center — title */}
        <View style={styles.center}>
          {!largeTitle && (
            <Text
              style={[styles.title, { color: colors.textPrimary }]}
              numberOfLines={1}
            >
              {title}
            </Text>
          )}
          {subtitle && (
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {subtitle}
            </Text>
          )}
        </View>

        {/* Right — actions */}
        <View style={[styles.side, styles.rightSide]}>
          {rightAction2 && (
            <TouchableOpacity
              onPress={rightAction2.onPress}
              style={styles.actionBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name={rightAction2.icon}
                size={22}
                color={rightAction2.color ?? colors.primary}
              />
            </TouchableOpacity>
          )}
          {rightAction && (
            <TouchableOpacity
              onPress={rightAction.onPress}
              style={styles.actionBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              {rightAction.icon ? (
                <Ionicons
                  name={rightAction.icon}
                  size={22}
                  color={rightAction.color ?? colors.primary}
                />
              ) : (
                <Text style={[styles.actionLabel, { color: rightAction.color ?? colors.primary }]}>
                  {rightAction.label}
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>

      {largeTitle && (
        <Text style={[styles.largeTitle, { color: colors.textPrimary }]}>{title}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: spacing[3],
    paddingHorizontal: spacing[4],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
  },
  side: {
    width: 80,
  },
  rightSide: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  center: {
    flex: 1,
    alignItems: 'center',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionBtn: {
    marginLeft: spacing[3],
    padding: 2,
  },
  title: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
  },
  subtitle: {
    fontSize: typography.size.xs,
    marginTop: 1,
  },
  largeTitle: {
    fontSize: typography.size['3xl'],
    fontWeight: typography.weight.bold,
    marginTop: spacing[1],
  },
  actionLabel: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.medium,
  },
});
