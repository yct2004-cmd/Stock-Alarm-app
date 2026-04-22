import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Watchlist, WatchlistItem } from '../types/models';
import { ASYNC_STORAGE_KEYS } from '../constants';
import { MOCK_WATCHLISTS } from '../mock/watchlists';

function uuid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

interface WatchlistState {
  watchlists: Watchlist[];
  activeWatchlistId: string | null;
  isHydrated: boolean;

  // Hydration
  hydrate: () => Promise<void>;
  persist: () => Promise<void>;

  // Watchlist CRUD
  createWatchlist: (name: string) => string;
  renameWatchlist: (id: string, name: string) => void;
  deleteWatchlist: (id: string) => void;
  setActiveWatchlist: (id: string) => void;

  // Item management
  addSymbol: (watchlistId: string, symbol: string) => void;
  removeSymbol: (watchlistId: string, symbol: string) => void;
  reorderItems: (watchlistId: string, items: WatchlistItem[]) => void;
  isSymbolInWatchlist: (watchlistId: string, symbol: string) => boolean;
  isSymbolInAnyWatchlist: (symbol: string) => boolean;
}

export const useWatchlistStore = create<WatchlistState>((set, get) => ({
  watchlists: [],
  activeWatchlistId: null,
  isHydrated: false,

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(ASYNC_STORAGE_KEYS.WATCHLISTS);
      const watchlists: Watchlist[] = raw ? JSON.parse(raw) : MOCK_WATCHLISTS;
      const defaultId = watchlists.find(w => w.isDefault)?.id ?? watchlists[0]?.id ?? null;
      set({ watchlists, activeWatchlistId: defaultId, isHydrated: true });
    } catch {
      set({ watchlists: MOCK_WATCHLISTS, activeWatchlistId: MOCK_WATCHLISTS[0].id, isHydrated: true });
    }
  },

  persist: async () => {
    await AsyncStorage.setItem(
      ASYNC_STORAGE_KEYS.WATCHLISTS,
      JSON.stringify(get().watchlists),
    );
  },

  createWatchlist: (name) => {
    const id = uuid();
    const now = Date.now();
    const wl: Watchlist = { id, name, items: [], isDefault: false, createdAt: now, updatedAt: now };
    set(s => ({ watchlists: [...s.watchlists, wl] }));
    get().persist();
    return id;
  },

  renameWatchlist: (id, name) => {
    set(s => ({
      watchlists: s.watchlists.map(w =>
        w.id === id ? { ...w, name, updatedAt: Date.now() } : w,
      ),
    }));
    get().persist();
  },

  deleteWatchlist: (id) => {
    const { watchlists, activeWatchlistId } = get();
    const remaining = watchlists.filter(w => w.id !== id);
    const newActive = activeWatchlistId === id ? (remaining[0]?.id ?? null) : activeWatchlistId;
    set({ watchlists: remaining, activeWatchlistId: newActive });
    get().persist();
  },

  setActiveWatchlist: (id) => set({ activeWatchlistId: id }),

  addSymbol: (watchlistId, symbol) => {
    set(s => ({
      watchlists: s.watchlists.map(w => {
        if (w.id !== watchlistId) return w;
        if (w.items.some(i => i.symbol === symbol)) return w;
        const item: WatchlistItem = {
          id: uuid(),
          symbol,
          addedAt: Date.now(),
          order: w.items.length,
          notes: '',
        };
        return { ...w, items: [...w.items, item], updatedAt: Date.now() };
      }),
    }));
    get().persist();
  },

  removeSymbol: (watchlistId, symbol) => {
    set(s => ({
      watchlists: s.watchlists.map(w => {
        if (w.id !== watchlistId) return w;
        return {
          ...w,
          items: w.items.filter(i => i.symbol !== symbol).map((item, idx) => ({ ...item, order: idx })),
          updatedAt: Date.now(),
        };
      }),
    }));
    get().persist();
  },

  reorderItems: (watchlistId, items) => {
    set(s => ({
      watchlists: s.watchlists.map(w =>
        w.id === watchlistId ? { ...w, items, updatedAt: Date.now() } : w,
      ),
    }));
    get().persist();
  },

  isSymbolInWatchlist: (watchlistId, symbol) => {
    const wl = get().watchlists.find(w => w.id === watchlistId);
    return wl?.items.some(i => i.symbol === symbol) ?? false;
  },

  isSymbolInAnyWatchlist: (symbol) => {
    return get().watchlists.some(w => w.items.some(i => i.symbol === symbol));
  },
}));
