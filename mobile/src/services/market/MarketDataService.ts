import type { IMarketDataProvider } from './interface';
import { MockMarketProvider } from './mock/MockMarketProvider';
import type {
  StockSymbol,
  Quote,
  OHLCBar,
  CompanyProfile,
  TechnicalIndicators,
  NewsItem,
  TimeRange,
} from '../../types/models';

/**
 * MarketDataService — singleton facade over the active data provider.
 *
 * ## Switching to a real provider
 * 1. Create a new class implementing `IMarketDataProvider`
 * 2. Set it via `MarketDataService.setProvider(new RealProvider())`
 *    (e.g., in app bootstrap, reading from env vars)
 *
 * The rest of the app (hooks, stores, screens) never imports provider classes
 * directly — they only import from this file.
 */
class MarketDataService {
  private provider: IMarketDataProvider;

  constructor() {
    // TODO: Replace MockMarketProvider with a real provider when credentials are available.
    //   Example:
    //   const apiKey = process.env.EXPO_PUBLIC_POLYGON_API_KEY;
    //   this.provider = apiKey ? new PolygonProvider(apiKey) : new MockMarketProvider();
    this.provider = new MockMarketProvider();
  }

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
