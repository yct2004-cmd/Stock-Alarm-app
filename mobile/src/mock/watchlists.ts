import type { Watchlist } from '../types/models';

export const MOCK_WATCHLISTS: Watchlist[] = [
  {
    id: 'wl-default',
    name: 'My Watchlist',
    isDefault: true,
    createdAt: Date.now() - 30 * 24 * 60 * 60_000,
    updatedAt: Date.now() - 1 * 24 * 60 * 60_000,
    items: [
      { id: 'wi-1', symbol: 'AAPL',  addedAt: Date.now() - 20 * 24 * 60 * 60_000, order: 0, notes: '' },
      { id: 'wi-2', symbol: 'NVDA',  addedAt: Date.now() - 18 * 24 * 60 * 60_000, order: 1, notes: '' },
      { id: 'wi-3', symbol: 'MSFT',  addedAt: Date.now() - 15 * 24 * 60 * 60_000, order: 2, notes: '' },
      { id: 'wi-4', symbol: 'TSLA',  addedAt: Date.now() - 10 * 24 * 60 * 60_000, order: 3, notes: '' },
      { id: 'wi-5', symbol: 'SPY',   addedAt: Date.now() - 8 * 24 * 60 * 60_000,  order: 4, notes: '' },
      { id: 'wi-6', symbol: 'QQQ',   addedAt: Date.now() - 5 * 24 * 60 * 60_000,  order: 5, notes: '' },
    ],
  },
  {
    id: 'wl-tech',
    name: 'Tech Plays',
    isDefault: false,
    createdAt: Date.now() - 10 * 24 * 60 * 60_000,
    updatedAt: Date.now() - 1 * 24 * 60 * 60_000,
    items: [
      { id: 'wi-7',  symbol: 'GOOGL', addedAt: Date.now() - 9 * 24 * 60 * 60_000, order: 0, notes: '' },
      { id: 'wi-8',  symbol: 'META',  addedAt: Date.now() - 8 * 24 * 60 * 60_000, order: 1, notes: '' },
      { id: 'wi-9',  symbol: 'AMD',   addedAt: Date.now() - 7 * 24 * 60 * 60_000, order: 2, notes: '' },
      { id: 'wi-10', symbol: 'PLTR',  addedAt: Date.now() - 5 * 24 * 60 * 60_000, order: 3, notes: '' },
    ],
  },
  {
    id: 'wl-value',
    name: 'Value & Dividends',
    isDefault: false,
    createdAt: Date.now() - 5 * 24 * 60 * 60_000,
    updatedAt: Date.now() - 1 * 24 * 60 * 60_000,
    items: [
      { id: 'wi-11', symbol: 'JPM', addedAt: Date.now() - 4 * 24 * 60 * 60_000, order: 0, notes: '' },
      { id: 'wi-12', symbol: 'JNJ', addedAt: Date.now() - 3 * 24 * 60 * 60_000, order: 1, notes: '' },
      { id: 'wi-13', symbol: 'XOM', addedAt: Date.now() - 2 * 24 * 60 * 60_000, order: 2, notes: '' },
    ],
  },
];
