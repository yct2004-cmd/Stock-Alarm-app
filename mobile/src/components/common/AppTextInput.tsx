import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextInputProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { typography, spacing, radii } from '../../constants/theme';

interface AppTextInputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ComponentProps<typeof Ionicons>['name'];
  rightIcon?: React.ComponentProps<typeof Ionicons>['name'];
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  isPassword?: boolean;
}

export default function AppTextInput({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  isPassword = false,
  style,
  ...rest
}: AppTextInputProps) {
  const { colors } = useTheme();
  const [secure, setSecure] = useState(isPassword);
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? colors.negative
    : focused
    ? colors.primary
    : colors.border;

  const iconColor = focused ? colors.primary : colors.textTertiary;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
      )}

      <View
        style={[
          styles.inputWrap,
          {
            borderColor,
            backgroundColor: colors.surface,
          },
        ]}
      >
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={18}
            color={iconColor}
            style={styles.leftIcon}
          />
        )}

        <TextInput
          style={[
            styles.input,
            {
              color: colors.textPrimary,
              paddingLeft: leftIcon ? 0 : spacing[3],
            },
            style,
          ]}
          placeholderTextColor={colors.textTertiary}
          secureTextEntry={secure}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoCapitalize="none"
          autoCorrect={false}
          {...rest}
        />

        {(isPassword || rightIcon) && (
          <TouchableOpacity
            style={styles.rightIcon}
            onPress={isPassword ? () => setSecure(p => !p) : onRightIconPress}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={
                isPassword
                  ? secure
                    ? 'eye-outline'
                    : 'eye-off-outline'
                  : rightIcon!
              }
              size={18}
              color={iconColor}
            />
          </TouchableOpacity>
        )}
      </View>

      {error ? (
        <Text style={[styles.error, { color: colors.negative }]}>{error}</Text>
      ) : hint ? (
        <Text style={[styles.hint, { color: colors.textTertiary }]}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing[4],
  },
  label: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    marginBottom: 6,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: radii.md,
    minHeight: 48,
  },
  leftIcon: {
    marginLeft: spacing[3],
    marginRight: spacing[2],
  },
  rightIcon: {
    padding: spacing[3],
  },
  input: {
    flex: 1,
    fontSize: typography.size.base,
    paddingVertical: 12,
    paddingRight: spacing[3],
  },
  error: {
    fontSize: typography.size.xs,
    marginTop: 4,
    fontWeight: typography.weight.medium,
  },
  hint: {
    fontSize: typography.size.xs,
    marginTop: 4,
  },
});
