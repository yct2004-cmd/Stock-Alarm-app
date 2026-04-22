import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AppNotification } from '../types/models';
import { ASYNC_STORAGE_KEYS } from '../constants';
import { MOCK_NOTIFICATIONS } from '../mock/notifications';

function uuid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
  isHydrated: boolean;

  hydrate: () => Promise<void>;
  persist: () => Promise<void>;

  addNotification: (n: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
}

function countUnread(notifications: AppNotification[]): number {
  return notifications.filter(n => !n.read).length;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isHydrated: false,

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(ASYNC_STORAGE_KEYS.NOTIFICATIONS);
      const notifications: AppNotification[] = raw ? JSON.parse(raw) : MOCK_NOTIFICATIONS;
      set({ notifications, unreadCount: countUnread(notifications), isHydrated: true });
    } catch {
      set({ notifications: MOCK_NOTIFICATIONS, unreadCount: countUnread(MOCK_NOTIFICATIONS), isHydrated: true });
    }
  },

  persist: async () => {
    await AsyncStorage.setItem(
      ASYNC_STORAGE_KEYS.NOTIFICATIONS,
      JSON.stringify(get().notifications),
    );
  },

  addNotification: (n) => {
    const notification: AppNotification = { ...n, id: uuid(), read: false, createdAt: Date.now() };
    set(s => ({
      notifications: [notification, ...s.notifications],
      unreadCount: s.unreadCount + 1,
    }));
    get().persist();
  },

  markRead: (id) => {
    set(s => {
      const notifications = s.notifications.map(n =>
        n.id === id ? { ...n, read: true } : n,
      );
      return { notifications, unreadCount: countUnread(notifications) };
    });
    get().persist();
  },

  markAllRead: () => {
    set(s => ({
      notifications: s.notifications.map(n => ({ ...n, read: true })),
      unreadCount: 0,
    }));
    get().persist();
  },

  deleteNotification: (id) => {
    set(s => {
      const notifications = s.notifications.filter(n => n.id !== id);
      return { notifications, unreadCount: countUnread(notifications) };
    });
    get().persist();
  },

  clearAll: () => {
    set({ notifications: [], unreadCount: 0 });
    get().persist();
  },
}));
