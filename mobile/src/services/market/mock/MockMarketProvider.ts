import type { IMarketDataProvider } from '../interface';
import type {
  StockSymbol,
  Quote,
  OHLCBar,
  CompanyProfile,
  TechnicalIndicators,
  NewsItem,
  TimeRange,
} from '../../../types/models';
import {
  getMockQuote,
  getMockProfile,
  getMockTechnicals,
  getMockNews,
  generateMockHistory,
  searchMockSymbols,
} from '../../../mock/stocks';

/** Simulates realistic network latency in development. */
function fakeDelay(ms = 300): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * MockMarketProvider — fully functional offline market data provider.
 *
 * Uses deterministic seeded data so charts, indicators, and prices are
 * consistent across app restarts. No network calls required.
 *
 * TODO: Replace with a real provider (Polygon.io, Alpaca, Yahoo Finance, etc.)
 *       by implementing IMarketDataProvider and swapping it in MarketDataService.
 */
export class MockMarketProvider implements IMarketDataProvider {
  readonly name = 'mock';

  async searchSymbols(query: string, _limit = 15): Promise<StockSymbol[]> {
    await fakeDelay(120);
    return searchMockSymbols(query);
  }

  async getQuote(symbol: string): Promise<Quote> {
    await fakeDelay(200);
    return getMockQuote(symbol);
  }

  async getHistoricalPrices(symbol: string, range: TimeRange): Promise<OHLCBar[]> {
    await fakeDelay(350);
    return generateMockHistory(symbol, range);
  }

  async getCompanyProfile(symbol: string): Promise<CompanyProfile> {
    await fakeDelay(150);
    return getMockProfile(symbol);
  }

  async getTechnicalIndicators(symbol: string): Promise<TechnicalIndicators> {
    await fakeDelay(200);
    return getMockTechnicals(symbol);
  }

  async getNews(symbol: string): Promise<NewsItem[]> {
    await fakeDelay(250);
    return getMockNews(symbol);
  }

  async getBatchQuotes(symbols: string[]): Promise<Quote[]> {
    await fakeDelay(300);
    return symbols.map(s => {
      try {
        return getMockQuote(s);
      } catch {
        return null;
      }
    }).filter(Boolean) as Quote[];
  }
}
