import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import type { Alert, AppSettings } from '../../types/models';

// ─── Handler — runs while app is foregrounded ────────────────────────────────

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// ─── Permission + token registration ─────────────────────────────────────────

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function registerPushToken(): Promise<string | null> {
  const granted = await requestNotificationPermissions();
  if (!granted) return null;

  try {
    const projectId = (Constants.expoConfig?.extra as any)?.eas?.projectId
      ?? Constants.easConfig?.projectId;

    const token = projectId
      ? await Notifications.getExpoPushTokenAsync({ projectId })
      : await Notifications.getExpoPushTokenAsync();

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('alerts', {
        name: 'Price Alerts',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 200, 100, 200],
        lightColor: '#3B82F6',
        sound: 'default',
      });
      await Notifications.setNotificationChannelAsync('market', {
        name: 'Market Updates',
        importance: Notifications.AndroidImportance.DEFAULT,
        sound: null,
      });
    }

    return token.data;
  } catch {
    return null;
  }
}

// ─── Quiet hours check ────────────────────────────────────────────────────────

export function isInQuietHours(settings: AppSettings): boolean {
  if (!settings.quietHoursEnabled) return false;

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const [startH, startM] = settings.quietHoursStart.split(':').map(Number);
  const [endH, endM] = settings.quietHoursEnd.split(':').map(Number);
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  // Handle overnight window (e.g., 22:00 – 07:00)
  if (startMinutes > endMinutes) {
    return currentMinutes >= startMinutes || currentMinutes < endMinutes;
  }
  return currentMinutes >= startMinutes && currentMinutes < endMinutes;
}

// ─── Schedule local notification ─────────────────────────────────────────────

export interface AlertNotificationPayload {
  alertId: string;
  symbol: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

export async function scheduleAlertNotification(
  payload: AlertNotificationPayload,
  settings: AppSettings,
): Promise<string | null> {
  if (!settings.notificationsEnabled) return null;
  if (isInQuietHours(settings)) return null;

  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: payload.title,
        body: payload.body,
        data: { alertId: payload.alertId, symbol: payload.symbol, ...payload.data },
        sound: 'default',
        badge: 1,
      },
      trigger: null, // Fire immediately
    });
    return id;
  } catch {
    return null;
  }
}

export async function scheduleMarketOpenNotification(): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Market Open',
      body: 'US equity markets are now open for trading.',
      data: { type: 'market_open' },
      sound: null,
    },
    trigger: null,
  });
}

export async function scheduleMarketCloseNotification(): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Market Close',
      body: 'US equity markets have closed for the day.',
      data: { type: 'market_close' },
      sound: null,
    },
    trigger: null,
  });
}

// ─── Badge management ─────────────────────────────────────────────────────────

export async function setBadgeCount(count: number): Promise<void> {
  await Notifications.setBadgeCountAsync(count);
}

export async function clearBadge(): Promise<void> {
  await Notifications.setBadgeCountAsync(0);
}

// ─── Notification response listener ──────────────────────────────────────────

export function addNotificationResponseListener(
  handler: (response: Notifications.NotificationResponse) => void,
): Notifications.EventSubscription {
  return Notifications.addNotificationResponseReceivedListener(handler);
}

export function addNotificationReceivedListener(
  handler: (notification: Notifications.Notification) => void,
): Notifications.EventSubscription {
  return Notifications.addNotificationReceivedListener(handler);
}
