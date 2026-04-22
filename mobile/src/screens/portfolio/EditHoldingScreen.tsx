import React from 'react';
import {
  View, Text, ScrollView, KeyboardAvoidingView, Platform, Alert, StyleSheet,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';

import { useTheme } from '../../hooks/useTheme';
import { usePortfolioStore } from '../../store/portfolioStore';
import AppTextInput from '../../components/common/AppTextInput';
import Button from '../../components/common/Button';
import ScreenHeader from '../../components/common/ScreenHeader';
import { spacing } from '../../constants/theme';

const schema = z.object({
  companyName: z.string().min(1, 'Company name required'),
  quantity: z.string().refine(v => !isNaN(Number(v)) && Number(v) > 0, 'Must be > 0'),
  averageCost: z.string().refine(v => !isNaN(Number(v)) && Number(v) > 0, 'Must be > 0'),
  notes: z.string().max(200).optional(),
});
type FormData = z.infer<typeof schema>;

export default function EditHoldingScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { holdingId } = route.params as { holdingId: string };

  const holdings = usePortfolioStore(s => s.holdings);
  const updateHolding = usePortfolioStore(s => s.updateHolding);
  const removeHolding = usePortfolioStore(s => s.removeHolding);

  const existing = holdings.find(h => h.id === holdingId);

  if (!existing) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ScreenHeader title="Edit Holding" showBack />
        <Text style={{ color: colors.textSecondary }}>Holding not found.</Text>
      </View>
    );
  }

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      companyName: existing.companyName,
      quantity: String(existing.quantity),
      averageCost: String(existing.averageCost),
      notes: existing.notes ?? '',
    },
  });

  const onSubmit = (data: FormData) => {
    updateHolding(holdingId, {
      companyName: data.companyName,
      quantity: Number(data.quantity),
      averageCost: Number(data.averageCost),
      notes: data.notes ?? '',
    });
    navigation.goBack();
  };

  const confirmDelete = () => {
    Alert.alert('Remove Holding', `Remove ${existing.symbol} from your portfolio?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          removeHolding(holdingId);
          navigation.goBack();
        },
      },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScreenHeader
        title={`Edit ${existing.symbol}`}
        showBack
        rightAction={{ icon: 'trash-outline', onPress: confirmDelete, color: colors.negative }}
      />
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + spacing[8] }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Symbol read-only */}
        <AppTextInput
          label="Ticker Symbol"
          value={existing.symbol}
          editable={false}
          leftIcon="trending-up-outline"
          containerStyle={{ opacity: 0.6 }}
        />

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

        <Button label="Save Changes" onPress={handleSubmit(onSubmit)} fullWidth size="lg" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: spacing[4], flexGrow: 1 },
});
