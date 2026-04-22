import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  TouchableOpacity,
  Platform,
  StyleSheet,
  Alert,
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
import { mockLogin } from '../../services/auth/mockAuthService';
import AppTextInput from '../../components/common/AppTextInput';
import Button from '../../components/common/Button';
import { typography, spacing, radii } from '../../constants/theme';
import type { AuthStackParamList } from '../../types/navigation';
import { APP_NAME } from '../../constants';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});
type FormData = z.infer<typeof schema>;

export default function LoginScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const setSession = useAuthStore(s => s.setSession);
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      const session = await mockLogin(data.email, data.password);
      await setSession(session);
    } catch (e) {
      Alert.alert('Sign In Failed', e instanceof Error ? e.message : 'Please try again.');
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
          { paddingTop: insets.top + spacing[8], paddingBottom: insets.bottom + spacing[8] },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.brandRow}>
          <View style={[styles.logoWrap, { backgroundColor: colors.primary }]}>
            <Ionicons name="pulse" size={26} color="#fff" />
          </View>
          <Text style={[styles.brandName, { color: colors.textPrimary }]}>{APP_NAME}</Text>
        </View>

        <Text style={[styles.heading, { color: colors.textPrimary }]}>Welcome back</Text>
        <Text style={[styles.sub, { color: colors.textSecondary }]}>
          Sign in to your account to continue
        </Text>

        <View style={styles.form}>
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
                placeholder="••••••••"
                isPassword
                autoComplete="password"
                leftIcon="lock-closed-outline"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.password?.message}
              />
            )}
          />

          <TouchableOpacity
            onPress={() => navigation.navigate('ForgotPassword')}
            style={styles.forgotBtn}
          >
            <Text style={[styles.forgotLabel, { color: colors.primary }]}>
              Forgot password?
            </Text>
          </TouchableOpacity>

          <Button
            label="Sign In"
            onPress={handleSubmit(onSubmit)}
            loading={loading}
            fullWidth
            size="lg"
            style={{ marginTop: spacing[2] }}
          />
        </View>

        <View style={[styles.demoHint, { backgroundColor: colors.primaryLight, borderColor: colors.border }]}>
          <Ionicons name="information-circle-outline" size={16} color={colors.primary} style={{ marginRight: 6 }} />
          <Text style={[styles.demoText, { color: colors.primary }]}>
            Demo — enter any valid email and any password
          </Text>
        </View>

        <View style={styles.signupRow}>
          <Text style={[styles.signupPre, { color: colors.textSecondary }]}>
            Don't have an account?{' '}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
            <Text style={[styles.signupLink, { color: colors.primary }]}>Sign up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: spacing[5], flexGrow: 1 },
  brandRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing[8], gap: spacing[3] },
  logoWrap: { width: 48, height: 48, borderRadius: radii.lg, alignItems: 'center', justifyContent: 'center' },
  brandName: { fontSize: typography.size['2xl'], fontWeight: typography.weight.bold, letterSpacing: -0.5 },
  heading: { fontSize: typography.size['3xl'], fontWeight: typography.weight.bold, letterSpacing: -0.5, marginBottom: spacing[2] },
  sub: { fontSize: typography.size.base, marginBottom: spacing[8], lineHeight: 22 },
  form: { marginBottom: spacing[5] },
  forgotBtn: { alignSelf: 'flex-end', marginBottom: spacing[4], marginTop: -spacing[2] },
  forgotLabel: { fontSize: typography.size.sm, fontWeight: typography.weight.medium },
  demoHint: { flexDirection: 'row', alignItems: 'center', padding: spacing[3], borderRadius: radii.md, borderWidth: 1, marginBottom: spacing[6] },
  demoText: { fontSize: typography.size.sm, flex: 1 },
  signupRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  signupPre: { fontSize: typography.size.base },
  signupLink: { fontSize: typography.size.base, fontWeight: typography.weight.semibold },
});
