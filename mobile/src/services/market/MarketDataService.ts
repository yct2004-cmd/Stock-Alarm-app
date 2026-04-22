/**
 * MarketDataService — singleton facade over the active market data provider.
 *
 * ## Provider selection (checked in order)
 *   1. EXPO_PUBLIC_POLYGON_API_KEY   → PolygonProvider  (real-time on Basic+; EOD on free)
 *   2. EXPO_PUBLIC_FINNHUB_API_KEY   → FinnhubProvider  (real-time on free tier)
 *   3. (neither set)                 → MockMarketProvider (offline, deterministic data)
 *
 * ## Switching providers at runtime
 *   marketDataService.setProvider(new FinnhubProvider(key));
 *
 * ## Adding a new provider
 *   1. Implement `IMarketDataProvider` (src/services/market/interface.ts)
 *   2. Call `marketDataService.setProvider(new YourProvider())` in App.tsx
 *      (or add another env-var branch in the constructor below)
 *
 * Screens, hooks, and stores NEVER import provider classes directly.
 * They only import from this file.
 */

import type { IMarketDataProvider } from './interface';
import { MockMarketProvider } from './mock/MockMarketProvider';
import { FinnhubProvider } from './providers/FinnhubProvider';
import { PolygonProvider } from './providers/PolygonProvider';
import type {
  StockSymbol,
  Quote,
  OHLCBar,
  CompanyProfile,
  TechnicalIndicators,
  NewsItem,
  TimeRange,
} from '../../types/models';

function createProvider(): IMarketDataProvider {
  const polygonKey = process.env.EXPO_PUBLIC_POLYGON_API_KEY;
  const finnhubKey = process.env.EXPO_PUBLIC_FINNHUB_API_KEY;

  if (polygonKey) {
    console.log('[MarketDataService] Using PolygonProvider');
    return new PolygonProvider(polygonKey);
  }

  if (finnhubKey) {
    console.log('[MarketDataService] Using FinnhubProvider');
    return new FinnhubProvider(finnhubKey);
  }

  console.log('[MarketDataService] No API key found — using MockMarketProvider');
  return new MockMarketProvider();
}

class MarketDataService {
  private provider: IMarketDataProvider;

  constructor() {
    this.provider = createProvider();
  }

  /** Replace the active provider at runtime (e.g., after login, user selects a data tier). */
  setProvider(p: IMarketDataProvider): void {
    this.provider = p;
  }

  getProviderName(): string {
    return this.provider.name;
  }

  searchSymbols(query: string, limit?: number): Promise<StockSymbol[]> {
    return this.provider.searchSymbols(query, limit);
  }

  getQuote(symbol: string): Promise<Quote> {
    return this.provider.getQuote(symbol);
  }

  getHistoricalPrices(symbol: string, range: TimeRange): Promise<OHLCBar[]> {
    return this.provider.getHistoricalPrices(symbol, range);
  }

  getCompanyProfile(symbol: string): Promise<CompanyProfile> {
    return this.provider.getCompanyProfile(symbol);
  }

  getTechnicalIndicators(symbol: string): Promise<TechnicalIndicators> {
    return this.provider.getTechnicalIndicators(symbol);
  }

  getNews(symbol: string): Promise<NewsItem[]> {
    return this.provider.getNews(symbol);
  }

  getBatchQuotes(symbols: string[]): Promise<Quote[]> {
    return this.provider.getBatchQuotes(symbols);
  }
}

export const marketDataService = new MarketDataService();
