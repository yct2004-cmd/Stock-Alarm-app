// ─── Core domain models ──────────────────────────────────────────────────────

export type AlertCondition =
  | 'price_above'
  | 'price_below'
  | 'percent_change_up'
  | 'percent_change_down'
  | 'volume_spike'
  | 'sma_crossover_above'
  | 'sma_crossover_below'
  | 'rsi_above'
  | 'rsi_below'
  | 'macd_crossover_bullish'
  | 'macd_crossover_bearish';

export type AlertFrequency = 'once' | 'repeating';

export type AlertStatus = 'active' | 'inactive' | 'triggered';

export type TimeRange = '1D' | '1W' | '1M' | '3M' | '1Y' | '5Y';

export type MarketSession = 'pre' | 'regular' | 'after' | 'closed';

export type Exchange = 'NASDAQ' | 'NYSE' | 'AMEX' | 'OTC' | string;

// ─── Stock / Quote ────────────────────────────────────────────────────────────

export interface StockSymbol {
  symbol: string;
  name: string;
  exchange: Exchange;
  type: 'stock' | 'etf' | 'crypto' | 'forex';
}

export interface Quote {
  symbol: string;
  name: string;
  exchange: Exchange;
  price: number;
  previousClose: number;
  open: number;
  dayHigh: number;
  dayLow: number;
  volume: number;
  avgVolume: number;
  marketCap: number | null;
  change: number;
  changePercent: number;
  session: MarketSession;
  timestamp: number; // unix ms
}

export interface OHLCBar {
  timestamp: number; // unix ms
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface CompanyProfile {
  symbol: string;
  name: string;
  exchange: Exchange;
  sector: string;
  industry: string;
  description: string;
  employees: number | null;
  website: string | null;
  logoUrl: string | null;
  country: string;
}

export interface TechnicalIndicators {
  symbol: string;
  timestamp: number;
  sma20: number | null;
  sma50: number | null;
  sma200: number | null;
  ema12: number | null;
  ema26: number | null;
  rsi14: number | null;
  macdLine: number | null;
  macdSignal: number | null;
  macdHistogram: number | null;
}

export interface NewsItem {
  id: string;
  headline: string;
  summary: string;
  source: string;
  url: string;
  publishedAt: number; // unix ms
  relatedSymbols: string[];
  sentiment: 'positive' | 'neutral' | 'negative' | null;
}

// ─── Alert ────────────────────────────────────────────────────────────────────

export interface Alert {
  id: string;
  userId: string;
  symbol: string;
  companyName: string;
  condition: AlertCondition;
  threshold: number;
  frequency: AlertFrequency;
  status: AlertStatus;
  notes: string;
  // Session windows
  monitorPreMarket: boolean;
  monitorRegular: boolean;
  monitorAfterHours: boolean;
  // Timestamps
  createdAt: number;
  updatedAt: number;
  lastTriggeredAt: number | null;
  lastTriggeredPrice: number | null;
  cooldownUntil: number | null;
}

export type CreateAlertInput = Omit<
  Alert,
  'id' | 'userId' | 'status' | 'createdAt' | 'updatedAt' | 'lastTriggeredAt' | 'lastTriggeredPrice' | 'cooldownUntil'
>;

export type UpdateAlertInput = Partial<CreateAlertInput> & { id: string };

export interface AlertTriggerEvent {
  id: string;
  alertId: string;
  symbol: string;
  condition: AlertCondition;
  threshold: number;
  triggerPrice: number;
  triggeredAt: number;
}

// ─── Watchlist ────────────────────────────────────────────────────────────────

export interface WatchlistItem {
  id: string;
  symbol: string;
  addedAt: number;
  order: number;
  notes: string;
}

export interface Watchlist {
  id: string;
  name: string;
  items: WatchlistItem[];
  createdAt: number;
  updatedAt: number;
  isDefault: boolean;
}

// ─── Portfolio ────────────────────────────────────────────────────────────────

export interface Holding {
  id: string;
  symbol: string;
  companyName: string;
  quantity: number;
  averageCost: number;
  addedAt: number;
  notes: string;
}

export interface HoldingWithMetrics extends Holding {
  currentPrice: number;
  marketValue: number;
  costBasis: number;
  unrealizedGain: number;
  unrealizedGainPercent: number;
  dailyChange: number;
  dailyChangePercent: number;
}

export interface PortfolioSummary {
  totalValue: number;
  totalCostBasis: number;
  totalUnrealizedGain: number;
  totalUnrealizedGainPercent: number;
  dailyChange: number;
  dailyChangePercent: number;
  holdings: HoldingWithMetrics[];
}

// ─── Notifications ────────────────────────────────────────────────────────────

export type NotificationType =
  | 'alert_triggered'
  | 'price_milestone'
  | 'market_open'
  | 'market_close'
  | 'system';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  data: Record<string, unknown>;
  read: boolean;
  createdAt: number;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  displayName: string;
  createdAt: number;
  avatarUrl: string | null;
}

export interface AuthSession {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

// ─── Settings ─────────────────────────────────────────────────────────────────

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  currency: string;
  quietHoursEnabled: boolean;
  quietHoursStart: string; // "HH:MM" 24h
  quietHoursEnd: string;
  notificationsEnabled: boolean;
  pushNotificationsEnabled: boolean;
  marketOpenAlert: boolean;
  marketCloseAlert: boolean;
}
