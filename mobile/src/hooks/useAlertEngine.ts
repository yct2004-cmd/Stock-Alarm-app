import { useEffect, useRef, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useAlertStore } from '../store/alertStore';
import { useNotificationStore } from '../store/notificationStore';
import { useSettingsStore } from '../store/settingsStore';
import { marketDataService } from '../services/market/MarketDataService';
import { evaluateAlert, buildTriggerEvent, describeTrigger } from '../utils/alertEvaluator';
import {
  scheduleAlertNotification,
  isInQuietHours,
  setBadgeCount,
} from '../services/notifications/NotificationService';
import type { Quote, TechnicalIndicators } from '../types/models';

/** Poll interval while app is in foreground, in milliseconds. */
const POLL_INTERVAL_MS = 30_000;

/**
 * useAlertEngine — runs the alert evaluation loop while the app is foregrounded.
 *
 * Mount once at the top of your app. Automatically pauses when the app
 * backgrounds and resumes when it comes back to the foreground.
 *
 * In production: move this evaluation to a server-side cron job so alerts
 * fire even when the app is closed.
 */
export function useAlertEngine(): void {
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const runningRef = useRef(false); // prevent overlapping evaluations

  const getActiveAlerts = useAlertStore(s => s.getActiveAlerts);
  const recordTrigger = useAlertStore(s => s.recordTrigger);
  const addNotification = useNotificationStore(s => s.addNotification);
  const unreadCount = useNotificationStore(s => s.unreadCount);
  const settings = useSettingsStore(s => s.settings);

  const evaluate = useCallback(async () => {
    if (runningRef.current) return;
    if (isInQuietHours(settings)) return;

    const activeAlerts = getActiveAlerts();
    if (activeAlerts.length === 0) return;

    runningRef.current = true;

    try {
      // Gather unique symbols
      const symbols = [...new Set(activeAlerts.map(a => a.symbol))];

      // Batch-fetch all quotes
      const quotes = await marketDataService.getBatchQuotes(symbols);
      const quoteMap = new Map<string, Quote>(quotes.map(q => [q.symbol, q]));

      // Fetch technicals only for alerts that need them
      const technicalSymbols = [
        ...new Set(
          activeAlerts
            .filter(a =>
              ['sma_crossover_above', 'sma_crossover_below',
               'rsi_above', 'rsi_below',
               'macd_crossover_bullish', 'macd_crossover_bearish'].includes(a.condition),
            )
            .map(a => a.symbol),
        ),
      ];
      const techMap = new Map<string, TechnicalIndicators>();
      await Promise.allSettled(
        technicalSymbols.map(async sym => {
          const t = await marketDataService.getTechnicalIndicators(sym);
          techMap.set(sym, t);
        }),
      );

      // Evaluate each active alert
      for (const alert of activeAlerts) {
        const quote = quoteMap.get(alert.symbol);
        if (!quote) continue;

        const technicals = techMap.get(alert.symbol) ?? null;
        const triggered = evaluateAlert(alert, quote, technicals);

        if (!triggered) continue;

        // Build and record the trigger event
        const event = buildTriggerEvent(alert, quote);
        recordTrigger(event);

        // Add to in-app notification center
        const body = describeTrigger(alert, quote.price);
        addNotification({
          type: 'alert_triggered',
          title: `${alert.symbol} Alert Triggered`,
          body,
          data: { alertId: alert.id, symbol: alert.symbol, price: quote.price },
        });

        // Schedule local push notification
        await scheduleAlertNotification(
          {
            alertId: alert.id,
            symbol: alert.symbol,
            title: `${alert.symbol} Alert`,
            body,
            data: { triggerId: event.id },
          },
          settings,
        );
      }

      // Sync badge with unread count
      await setBadgeCount(unreadCount);
    } catch {
      // Silent failure — evaluation errors should not crash the app
    } finally {
      runningRef.current = false;
    }
  }, [getActiveAlerts, recordTrigger, addNotification, settings, unreadCount]);

  // AppState listener — pause polling when backgrounded
  useEffect(() => {
    const handleAppState = (state: AppStateStatus) => {
      if (state === 'active') {
        startPolling();
      } else {
        stopPolling();
      }
    };

    const sub = AppState.addEventListener('change', handleAppState);
    startPolling(); // start immediately on mount

    return () => {
      sub.remove();
      stopPolling();
    };
  }, [evaluate]);

  function startPolling() {
    stopPolling(); // clear any existing timer first
    evaluate(); // run immediately
    timerRef.current = setInterval(evaluate, POLL_INTERVAL_MS);
  }

  function stopPolling() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }
}
