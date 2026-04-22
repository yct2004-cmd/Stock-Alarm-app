export const APP_NAME = 'PulseMarkets';
export const APP_VERSION = '1.0.0';

// Market hours (Eastern Time)
export const MARKET_OPEN_ET = '09:30';
export const MARKET_CLOSE_ET = '16:00';
export const PRE_MARKET_OPEN_ET = '04:00';
export const AFTER_HOURS_CLOSE_ET = '20:00';

// Alert conditions human-readable labels
export const ALERT_CONDITION_LABELS: Record<import('../types/models').AlertCondition, string> = {
  price_above: 'Price Above',
  price_below: 'Price Below',
  percent_change_up: '% Change Up',
  percent_change_down: '% Change Down',
  volume_spike: 'Volume Spike',
  sma_crossover_above: 'Price Crosses Above SMA',
  sma_crossover_below: 'Price Crosses Below SMA',
  rsi_above: 'RSI Above',
  rsi_below: 'RSI Below',
  macd_crossover_bullish: 'MACD Bullish Cross',
  macd_crossover_bearish: 'MACD Bearish Cross',
};

export const ALERT_CONDITION_DESCRIPTIONS: Record<import('../types/models').AlertCondition, string> = {
  price_above: 'Triggers when the stock price rises above your target.',
  price_below: 'Triggers when the stock price falls below your target.',
  percent_change_up: 'Triggers when price increases by the specified percentage.',
  percent_change_down: 'Triggers when price decreases by the specified percentage.',
  volume_spike: 'Triggers when volume exceeds your multiplier threshold.',
  sma_crossover_above: 'Triggers when price crosses above the simple moving average.',
  sma_crossover_below: 'Triggers when price crosses below the simple moving average.',
  rsi_above: 'Triggers when RSI(14) exceeds the threshold (overbought signal).',
  rsi_below: 'Triggers when RSI(14) falls below the threshold (oversold signal).',
  macd_crossover_bullish: 'Triggers when MACD line crosses above the signal line.',
  macd_crossover_bearish: 'Triggers when MACD line crosses below the signal line.',
};

export const TIME_RANGE_LABELS: Record<import('../types/models').TimeRange, string> = {
  '1D': '1 Day',
  '1W': '1 Week',
  '1M': '1 Month',
  '3M': '3 Months',
  '1Y': '1 Year',
  '5Y': '5 Years',
};

export const DEFAULT_APP_SETTINGS: import('../types/models').AppSettings = {
  theme: 'system',
  currency: 'USD',
  quietHoursEnabled: false,
  quietHoursStart: '22:00',
  quietHoursEnd: '07:00',
  notificationsEnabled: true,
  pushNotificationsEnabled: true,
  marketOpenAlert: false,
  marketCloseAlert: false,
};

export const ASYNC_STORAGE_KEYS = {
  AUTH_SESSION: '@pulse/auth_session',
  WATCHLISTS: '@pulse/watchlists',
  HOLDINGS: '@pulse/holdings',
  ALERTS: '@pulse/alerts',
  NOTIFICATIONS: '@pulse/notifications',
  SETTINGS: '@pulse/settings',
  RECENT_SEARCHES: '@pulse/recent_searches',
} as const;

export const QUERY_KEYS = {
  quote: (symbol: string) => ['quote', symbol] as const,
  history: (symbol: string, range: string) => ['history', symbol, range] as const,
  profile: (symbol: string) => ['profile', symbol] as const,
  technicals: (symbol: string) => ['technicals', symbol] as const,
  news: (symbol: string) => ['news', symbol] as const,
  search: (query: string) => ['search', query] as const,
} as const;

// Stale times in milliseconds
export const STALE_TIMES = {
  quote: 15_000,       // 15s — prices refresh fast
  history: 60_000,     // 1min
  profile: 60 * 60_000, // 1 hour
  technicals: 60_000,
  news: 5 * 60_000,    // 5 min
  search: 30_000,
} as const;
