import React, { useState } from 'react';
import {
  View, Text, ScrollView, KeyboardAvoidingView, TouchableOpacity,
  Platform, StyleSheet, Alert,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useTheme } from '../../hooks/useTheme';
import { useAuthStore } from '../../store/authStore';
import { mockSignUp } from '../../services/auth/mockAuthService';
import AppTextInput from '../../components/common/AppTextInput';
import Button from '../../components/common/Button';
import { typography, spacing, radii } from '../../constants/theme';
import type { AuthStackParamList } from '../../types/navigation';
import { APP_NAME } from '../../constants';

const schema = z.object({
  displayName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirm: z.string(),
}).refine(d => d.password === d.confirm, {
  message: "Passwords don't match",
  path: ['confirm'],
});
type FormData = z.infer<typeof schema>;

export default function SignUpScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const setSession = useAuthStore(s => s.setSession);
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { displayName: '', email: '', password: '', confirm: '' },
  });

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      const session = await mockSignUp(data.email, data.password, data.displayName);
      await setSession(session);
    } catch (e) {
      Alert.alert('Sign Up Failed', e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + spacing[6], paddingBottom: insets.bottom + spacing[8] },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Ionicons name="chevron-back" size={22} color={colors.primary} />
        </TouchableOpacity>

        <View style={styles.brandRow}>
          <View style={[styles.logoWrap, { backgroundColor: colors.primary }]}>
            <Ionicons name="pulse" size={26} color="#fff" />
          </View>
          <Text style={[styles.brandName, { color: colors.textPrimary }]}>{APP_NAME}</Text>
        </View>

        <Text style={[styles.heading, { color: colors.textPrimary }]}>Create account</Text>
        <Text style={[styles.sub, { color: colors.textSecondary }]}>
          Start tracking stocks and setting alerts
        </Text>

        <Controller
          control={control}
          name="displayName"
          render={({ field: { onChange, onBlur, value } }) => (
            <AppTextInput
              label="Full name"
              placeholder="Jane Smith"
              autoComplete="name"
              leftIcon="person-outline"
              autoCapitalize="words"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.displayName?.message}
            />
          )}
        />

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

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <AppTextInput
              label="Password"
              placeholder="At least 8 characters"
              isPassword
              autoComplete="new-password"
              leftIcon="lock-closed-outline"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.password?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="confirm"
          render={({ field: { onChange, onBlur, value } }) => (
            <AppTextInput
              label="Confirm password"
              placeholder="Re-enter password"
              isPassword
              autoComplete="new-password"
              leftIcon="lock-closed-outline"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.confirm?.message}
            />
          )}
        />

        <Button
          label="Create Account"
          onPress={handleSubmit(onSubmit)}
          loading={loading}
          fullWidth
          size="lg"
          style={{ marginTop: spacing[2], marginBottom: spacing[6] }}
        />

        <View style={styles.loginRow}>
          <Text style={[{ color: colors.textSecondary, fontSize: typography.size.base }]}>
            Already have an account?{' '}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={{ color: colors.primary, fontSize: typography.size.base, fontWeight: typography.weight.semibold }}>
              Sign in
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: spacing[5], flexGrow: 1 },
  back: { marginBottom: spacing[4] },
  brandRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing[6], gap: spacing[3] },
  logoWrap: { width: 48, height: 48, borderRadius: radii.lg, alignItems: 'center', justifyContent: 'center' },
  brandName: { fontSize: typography.size['2xl'], fontWeight: typography.weight.bold, letterSpacing: -0.5 },
  heading: { fontSize: typography.size['3xl'], fontWeight: typography.weight.bold, letterSpacing: -0.5, marginBottom: spacing[2] },
  sub: { fontSize: typography.size.base, marginBottom: spacing[6], lineHeight: 22 },
  loginRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
});
