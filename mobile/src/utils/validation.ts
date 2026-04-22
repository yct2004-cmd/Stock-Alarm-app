import { z } from 'zod';
import type { AlertCondition } from '../types/models';

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const signUpSchema = z
  .object({
    displayName: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(60, 'Name too long'),
    email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain an uppercase letter')
      .regex(/[0-9]/, 'Must contain a number'),
    confirmPassword: z.string(),
  })
  .refine(d => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain an uppercase letter')
      .regex(/[0-9]/, 'Must contain a number'),
    confirmPassword: z.string(),
  })
  .refine(d => d.newPassword === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

// ─── Alert ────────────────────────────────────────────────────────────────────

/** Conditions that require a numeric threshold entry */
const THRESHOLD_CONDITIONS: AlertCondition[] = [
  'price_above', 'price_below',
  'percent_change_up', 'percent_change_down',
  'volume_spike', 'rsi_above', 'rsi_below',
];

/** Conditions that do NOT need a user-provided threshold */
const NO_THRESHOLD_CONDITIONS: AlertCondition[] = [
  'sma_crossover_above', 'sma_crossover_below',
  'macd_crossover_bullish', 'macd_crossover_bearish',
];

function thresholdRules(condition: AlertCondition, value: number): string | true {
  if (NO_THRESHOLD_CONDITIONS.includes(condition)) return true;
  if (value <= 0) return 'Must be greater than 0';
  if ((condition === 'rsi_above' || condition === 'rsi_below') && value > 100) {
    return 'RSI must be between 0 and 100';
  }
  if ((condition === 'percent_change_up' || condition === 'percent_change_down') && value > 100) {
    return 'Percent change seems unreasonably high';
  }
  if (condition === 'volume_spike' && value < 1) {
    return 'Multiplier must be at least 1';
  }
  return true;
}

export const alertSchema = z
  .object({
    symbol: z
      .string()
      .min(1, 'Ticker symbol is required')
      .max(10, 'Invalid ticker')
      .regex(/^[A-Z.^-]+$/, 'Use uppercase letters only'),
    condition: z.enum([
      'price_above', 'price_below',
      'percent_change_up', 'percent_change_down',
      'volume_spike',
      'sma_crossover_above', 'sma_crossover_below',
      'rsi_above', 'rsi_below',
      'macd_crossover_bullish', 'macd_crossover_bearish',
    ] as const),
    thresholdStr: z.string(),
    frequency: z.enum(['once', 'repeating']),
    monitorPreMarket: z.boolean(),
    monitorRegular: z.boolean(),
    monitorAfterHours: z.boolean(),
    notes: z.string().max(200, 'Notes too long').optional(),
  })
  .superRefine((data, ctx) => {
    if (!NO_THRESHOLD_CONDITIONS.includes(data.condition)) {
      if (!data.thresholdStr || data.thresholdStr.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Threshold is required for this condition',
          path: ['thresholdStr'],
        });
        return;
      }
      const num = Number(data.thresholdStr);
      if (isNaN(num)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Threshold must be a number',
          path: ['thresholdStr'],
        });
        return;
      }
      const result = thresholdRules(data.condition, num);
      if (result !== true) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: result, path: ['thresholdStr'] });
      }
    }
    if (!data.monitorPreMarket && !data.monitorRegular && !data.monitorAfterHours) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Select at least one market session',
        path: ['monitorRegular'],
      });
    }
  });

export type AlertFormData = z.infer<typeof alertSchema>;

// ─── Portfolio / Holdings ─────────────────────────────────────────────────────

export const holdingSchema = z.object({
  symbol: z
    .string()
    .min(1, 'Ticker symbol is required')
    .max(10)
    .regex(/^[A-Z.^-]+$/, 'Use uppercase letters only'),
  companyName: z.string().min(1, 'Company name is required').max(100),
  quantity: z
    .string()
    .min(1, 'Quantity is required')
    .refine(v => !isNaN(Number(v)) && Number(v) > 0, 'Must be a positive number')
    .refine(v => Number(v) <= 1_000_000, 'Quantity seems unreasonably large'),
  averageCost: z
    .string()
    .min(1, 'Average cost is required')
    .refine(v => !isNaN(Number(v)) && Number(v) > 0, 'Must be a positive number')
    .refine(v => Number(v) <= 1_000_000, 'Price seems unreasonably large'),
  notes: z.string().max(200).optional(),
});

export type HoldingFormData = z.infer<typeof holdingSchema>;

// ─── Settings ─────────────────────────────────────────────────────────────────

export const quietHoursSchema = z
  .object({
    start: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
    end: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
  })
  .refine(d => d.start !== d.end, {
    message: 'Start and end times cannot be the same',
    path: ['end'],
  });

export type QuietHoursFormData = z.infer<typeof quietHoursSchema>;
