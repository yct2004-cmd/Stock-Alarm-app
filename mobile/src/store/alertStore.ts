import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Alert, AlertTriggerEvent, CreateAlertInput, UpdateAlertInput } from '../types/models';
import { ASYNC_STORAGE_KEYS } from '../constants';
import { MOCK_ALERTS, MOCK_TRIGGER_HISTORY } from '../mock/alerts';

function uuid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// How long a once-trigger waits before being eligible again (30 min)
const ONCE_COOLDOWN_MS = 30 * 60_000;
// How long a repeating alert cools down between fires (5 min)
const REPEAT_COOLDOWN_MS = 5 * 60_000;

interface AlertState {
  alerts: Alert[];
  triggerHistory: AlertTriggerEvent[];
  isHydrated: boolean;

  hydrate: () => Promise<void>;
  persistAlerts: () => Promise<void>;
  persistHistory: () => Promise<void>;

  createAlert: (input: CreateAlertInput) => Alert;
  updateAlert: (input: UpdateAlertInput) => void;
  deleteAlert: (id: string) => void;
  toggleAlert: (id: string, active: boolean) => void;

  /** Called by the evaluation engine when a condition fires. */
  recordTrigger: (event: AlertTriggerEvent) => void;

  getAlertById: (id: string) => Alert | undefined;
  getAlertsForSymbol: (symbol: string) => Alert[];
  getActiveAlerts: () => Alert[];
  getHistoryForAlert: (alertId: string) => AlertTriggerEvent[];
}

const HISTORY_KEY = '@pulse/trigger_history';

export const useAlertStore = create<AlertState>((set, get) => ({
  alerts: [],
  triggerHistory: [],
  isHydrated: false,

  hydrate: async () => {
    try {
      const [alertsRaw, historyRaw] = await Promise.all([
        AsyncStorage.getItem(ASYNC_STORAGE_KEYS.ALERTS),
        AsyncStorage.getItem(HISTORY_KEY),
      ]);
      const alerts: Alert[] = alertsRaw ? JSON.parse(alertsRaw) : MOCK_ALERTS;
      const triggerHistory: AlertTriggerEvent[] = historyRaw
        ? JSON.parse(historyRaw)
        : MOCK_TRIGGER_HISTORY;
      set({ alerts, triggerHistory, isHydrated: true });
    } catch {
      set({ alerts: MOCK_ALERTS, triggerHistory: MOCK_TRIGGER_HISTORY, isHydrated: true });
    }
  },

  persistAlerts: async () => {
    await AsyncStorage.setItem(ASYNC_STORAGE_KEYS.ALERTS, JSON.stringify(get().alerts));
  },

  persistHistory: async () => {
    // Cap history at 500 entries to bound storage growth
    const trimmed = get().triggerHistory.slice(0, 500);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
  },

  createAlert: (input) => {
    const now = Date.now();
    const alert: Alert = {
      ...input,
      id: uuid(),
      userId: 'user-1',
      status: 'active',
      createdAt: now,
      updatedAt: now,
      lastTriggeredAt: null,
      lastTriggeredPrice: null,
      cooldownUntil: null,
    };
    set(s => ({ alerts: [alert, ...s.alerts] }));
    get().persistAlerts();
    return alert;
  },

  updateAlert: (input) => {
    set(s => ({
      alerts: s.alerts.map(a =>
        a.id === input.id ? { ...a, ...input, updatedAt: Date.now() } : a,
      ),
    }));
    get().persistAlerts();
  },

  deleteAlert: (id) => {
    set(s => ({ alerts: s.alerts.filter(a => a.id !== id) }));
    get().persistAlerts();
  },

  toggleAlert: (id, active) => {
    set(s => ({
      alerts: s.alerts.map(a =>
        a.id === id
          ? { ...a, status: active ? 'active' : 'inactive', updatedAt: Date.now() }
          : a,
      ),
    }));
    get().persistAlerts();
  },

  recordTrigger: (event) => {
    const now = Date.now();
    set(s => {
      const alerts = s.alerts.map(a => {
        if (a.id !== event.alertId) return a;
        const isOnce = a.frequency === 'once';
        return {
          ...a,
          status: isOnce ? ('triggered' as const) : a.status,
          lastTriggeredAt: now,
          lastTriggeredPrice: event.triggerPrice,
          cooldownUntil: now + (isOnce ? ONCE_COOLDOWN_MS : REPEAT_COOLDOWN_MS),
          updatedAt: now,
        };
      });
      return {
        alerts,
        triggerHistory: [event, ...s.triggerHistory],
      };
    });
    // Persist both synchronously after state update
    get().persistAlerts();
    get().persistHistory();
  },

  getAlertById: (id) => get().alerts.find(a => a.id === id),

  getAlertsForSymbol: (symbol) => get().alerts.filter(a => a.symbol === symbol),

  getActiveAlerts: () => get().alerts.filter(a => a.status === 'active'),

  getHistoryForAlert: (alertId) =>
    get().triggerHistory.filter(e => e.alertId === alertId),
}));
