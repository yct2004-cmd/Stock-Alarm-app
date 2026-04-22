import React from 'react';
import {
  View, ScrollView, KeyboardAvoidingView, Platform, StyleSheet,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { useTheme } from '../../hooks/useTheme';
import { usePortfolioStore } from '../../store/portfolioStore';
import AppTextInput from '../../components/common/AppTextInput';
import Button from '../../components/common/Button';
import ScreenHeader from '../../components/common/ScreenHeader';
import { spacing } from '../../constants/theme';

const schema = z.object({
  symbol: z.string().min(1, 'Ticker required').max(10).toUpperCase(),
  companyName: z.string().min(1, 'Company name required'),
  quantity: z.string().refine(v => !isNaN(Number(v)) && Number(v) > 0, 'Must be > 0'),
  averageCost: z.string().refine(v => !isNaN(Number(v)) && Number(v) > 0, 'Must be > 0'),
  notes: z.string().max(200).optional(),
});
type FormData = z.infer<typeof schema>;

export default function AddHoldingScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const addHolding = usePortfolioStore(s => s.addHolding);

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { symbol: '', companyName: '', quantity: '', averageCost: '', notes: '' },
  });

  const onSubmit = (data: FormData) => {
    addHolding({
      symbol: data.symbol,
      companyName: data.companyName,
      quantity: Number(data.quantity),
      averageCost: Number(data.averageCost),
      notes: data.notes ?? '',
    });
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScreenHeader title="Add Holding" showBack />
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + spacing[8] }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Controller control={control} name="symbol"
          render={({ field: { onChange, onBlur, value } }) => (
            <AppTextInput label="Ticker Symbol" placeholder="e.g. AAPL"
              autoCapitalize="characters" leftIcon="trending-up-outline"
              value={value} onChangeText={v => onChange(v.toUpperCase())} onBlur={onBlur}
              error={errors.symbol?.message} />
          )} />

        <Controller control={control} name="companyName"
          render={({ field: { onChange, onBlur, value } }) => (
            <AppTextInput label="Company Name" placeholder="e.g. Apple Inc."
              leftIcon="business-outline"
              value={value} onChangeText={onChange} onBlur={onBlur}
              error={errors.companyName?.message} />
          )} />

        <Controller control={control} name="quantity"
          render={({ field: { onChange, onBlur, value } }) => (
            <AppTextInput label="Quantity (shares)" placeholder="e.g. 10"
              keyboardType="decimal-pad" leftIcon="layers-outline"
              value={value} onChangeText={onChange} onBlur={onBlur}
              error={errors.quantity?.message} />
          )} />

        <Controller control={control} name="averageCost"
          render={({ field: { onChange, onBlur, value } }) => (
            <AppTextInput label="Average Cost per Share ($)" placeholder="e.g. 150.00"
              keyboardType="decimal-pad" leftIcon="cash-outline"
              value={value} onChangeText={onChange} onBlur={onBlur}
              error={errors.averageCost?.message} />
          )} />

        <Controller control={control} name="notes"
          render={({ field: { onChange, onBlur, value } }) => (
            <AppTextInput label="Notes (optional)" placeholder="Optional note..."
              multiline numberOfLines={3} value={value} onChangeText={onChange} onBlur={onBlur}
              style={{ height: 72, textAlignVertical: 'top' }} />
          )} />

        <Button label="Add to Portfolio" onPress={handleSubmit(onSubmit)} fullWidth size="lg" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing[4], flexGrow: 1 },
});
