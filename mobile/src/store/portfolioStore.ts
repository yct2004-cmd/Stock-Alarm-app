import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Holding, HoldingWithMetrics, PortfolioSummary, Quote } from '../types/models';
import { ASYNC_STORAGE_KEYS } from '../constants';
import { MOCK_HOLDINGS } from '../mock/portfolio';

function uuid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

interface PortfolioState {
  holdings: Holding[];
  isHydrated: boolean;

  hydrate: () => Promise<void>;
  persist: () => Promise<void>;

  addHolding: (h: Omit<Holding, 'id' | 'addedAt'>) => Holding;
  updateHolding: (id: string, patch: Partial<Omit<Holding, 'id'>>) => void;
  removeHolding: (id: string) => void;

  computeWithMetrics: (quotes: Quote[]) => HoldingWithMetrics[];
  computeSummary: (quotes: Quote[]) => PortfolioSummary;
}

function enrich(holding: Holding, quote: Quote | undefined): HoldingWithMetrics {
  const currentPrice = quote?.price ?? holding.averageCost;
  const marketValue = currentPrice * holding.quantity;
  const costBasis = holding.averageCost * holding.quantity;
  const unrealizedGain = marketValue - costBasis;
  const unrealizedGainPercent = costBasis > 0 ? (unrealizedGain / costBasis) * 100 : 0;
  const dailyChange = quote ? (quote.change * holding.quantity) : 0;
  const dailyChangePercent = quote?.changePercent ?? 0;
  return {
    ...holding,
    currentPrice,
    marketValue,
    costBasis,
    unrealizedGain,
    unrealizedGainPercent,
    dailyChange,
    dailyChangePercent,
  };
}

export const usePortfolioStore = create<PortfolioState>((set, get) => ({
  holdings: [],
  isHydrated: false,

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(ASYNC_STORAGE_KEYS.HOLDINGS);
      const holdings: Holding[] = raw ? JSON.parse(raw) : MOCK_HOLDINGS;
      set({ holdings, isHydrated: true });
    } catch {
      set({ holdings: MOCK_HOLDINGS, isHydrated: true });
    }
  },

  persist: async () => {
    await AsyncStorage.setItem(
      ASYNC_STORAGE_KEYS.HOLDINGS,
      JSON.stringify(get().holdings),
    );
  },

  addHolding: (h) => {
    const holding: Holding = { ...h, id: uuid(), addedAt: Date.now() };
    set(s => ({ holdings: [holding, ...s.holdings] }));
    get().persist();
    return holding;
  },

  updateHolding: (id, patch) => {
    set(s => ({
      holdings: s.holdings.map(h => h.id === id ? { ...h, ...patch } : h),
    }));
    get().persist();
  },

  removeHolding: (id) => {
    set(s => ({ holdings: s.holdings.filter(h => h.id !== id) }));
    get().persist();
  },

  computeWithMetrics: (quotes) => {
    const { holdings } = get();
    const quoteMap = new Map(quotes.map(q => [q.symbol, q]));
    return holdings.map(h => enrich(h, quoteMap.get(h.symbol)));
  },

  computeSummary: (quotes) => {
    const enriched = get().computeWithMetrics(quotes);
    const totalValue = enriched.reduce((s, h) => s + h.marketValue, 0);
    const totalCostBasis = enriched.reduce((s, h) => s + h.costBasis, 0);
    const totalUnrealizedGain = totalValue - totalCostBasis;
    const totalUnrealizedGainPercent = totalCostBasis > 0
      ? (totalUnrealizedGain / totalCostBasis) * 100
      : 0;
    const dailyChange = enriched.reduce((s, h) => s + h.dailyChange, 0);
    const dailyChangePercent = totalValue > 0
      ? (dailyChange / (totalValue - dailyChange)) * 100
      : 0;
    return {
      totalValue,
      totalCostBasis,
      totalUnrealizedGain,
      totalUnrealizedGainPercent,
      dailyChange,
      dailyChangePercent,
      holdings: enriched,
    };
  },
}));
