import React, { useState } from 'react';
import {
  View, Text, ScrollView, KeyboardAvoidingView, Platform, StyleSheet, Alert,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { useTheme } from '../../hooks/useTheme';
import { mockResetPassword } from '../../services/auth/mockAuthService';
import AppTextInput from '../../components/common/AppTextInput';
import Button from '../../components/common/Button';
import ScreenHeader from '../../components/common/ScreenHeader';
import { typography, spacing, radii } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

const schema = z.object({ email: z.string().email('Enter a valid email') });
type FormData = z.infer<typeof schema>;

export default function ForgotPasswordScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      await mockResetPassword(data.email);
      setSent(true);
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScreenHeader title="Reset Password" showBack />
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + spacing[8] }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {sent ? (
          <View style={styles.successWrap}>
            <View style={[styles.successIcon, { backgroundColor: colors.positiveLight }]}>
              <Ionicons name="checkmark-circle" size={48} color={colors.positive} />
            </View>
            <Text style={[styles.successTitle, { color: colors.textPrimary }]}>
              Check your email
            </Text>
            <Text style={[styles.successDesc, { color: colors.textSecondary }]}>
              If an account exists, we've sent reset instructions to your email.
            </Text>
            <Button
              label="Back to Sign In"
              onPress={() => navigation.goBack()}
              variant="secondary"
              fullWidth
              style={{ marginTop: spacing[6] }}
            />
          </View>
        ) : (
          <>
            <Text style={[styles.desc, { color: colors.textSecondary }]}>
              Enter your email address and we'll send you instructions to reset your password.
            </Text>

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <AppTextInput
                  label="Email"
                  placeholder="you@example.com"
                  keyboardType="email-address"
                  autoComplete="email"
                  leftIcon="mail-outline"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.email?.message}
                />
              )}
            />

            <Button
              label="Send Reset Link"
              onPress={handleSubmit(onSubmit)}
              loading={loading}
              fullWidth
              size="lg"
              style={{ marginTop: spacing[2] }}
            />
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing[5], flexGrow: 1 },
  desc: { fontSize: typography.size.base, lineHeight: 22, marginBottom: spacing[6] },
  successWrap: { alignItems: 'center', paddingTop: spacing[8] },
  successIcon: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center', marginBottom: spacing[5] },
  successTitle: { fontSize: typography.size['2xl'], fontWeight: typography.weight.bold, marginBottom: spacing[3] },
  successDesc: { fontSize: typography.size.base, textAlign: 'center', lineHeight: 22 },
});
