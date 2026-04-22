import type { AppNotification } from '../types/models';

export const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    type: 'alert_triggered',
    title: 'TSLA Alert Triggered',
    body: 'Tesla fell below $240.00 — current price $239.40',
    data: { symbol: 'TSLA', alertId: 'alert-3', price: 239.40 },
    read: false,
    createdAt: Date.now() - 2 * 60 * 60_000,
  },
  {
    id: 'notif-2',
    type: 'price_milestone',
    title: 'NVDA hits all-time high',
    body: 'NVIDIA touched a new 52-week high of $882.00',
    data: { symbol: 'NVDA', price: 882.00 },
    read: false,
    createdAt: Date.now() - 4 * 60 * 60_000,
  },
  {
    id: 'notif-3',
    type: 'market_open',
    title: 'Market Open',
    body: 'US equity markets are now open for trading.',
    data: {},
    read: true,
    createdAt: Date.now() - 8 * 60 * 60_000,
  },
  {
    id: 'notif-4',
    type: 'alert_triggered',
    title: 'SPY Alert — Market Down 1.2%',
    body: 'S&P 500 ETF dropped more than 1% today.',
    data: { symbol: 'SPY', alertId: 'alert-4', price: 518.20 },
    read: true,
    createdAt: Date.now() - 2 * 24 * 60 * 60_000,
  },
];
