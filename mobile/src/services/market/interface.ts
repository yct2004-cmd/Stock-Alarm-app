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
 * IMarketDataProvider — clean abstraction layer for all market data.
 *
 * Swap the implementation (mock → real API) without touching any screen,
 * hook, or store. Register providers in MarketDataService.
 */
export interface IMarketDataProvider {
  readonly name: string;

  /**
   * Search for symbols by ticker or company name.
   * @param query - User search string
   * @param limit - Max results to return (default 15)
   */
  searchSymbols(query: string, limit?: number): Promise<StockSymbol[]>;

  /**
   * Fetch a real-time (or most-recent) quote for a symbol.
   */
  getQuote(symbol: string): Promise<Quote>;

  /**
   * Fetch OHLC bars for the given time range.
   * Callers should interpret bar timestamps as the bar's close time.
   */
  getHistoricalPrices(symbol: string, range: TimeRange): Promise<OHLCBar[]>;

  /**
   * Fetch company metadata (sector, description, employees, etc.)
   */
  getCompanyProfile(symbol: string): Promise<CompanyProfile>;

  /**
   * Fetch latest technical indicator snapshot.
   */
  getTechnicalIndicators(symbol: string): Promise<TechnicalIndicators>;

  /**
   * Fetch recent news headlines for a symbol.
   * Returns at most 10 items sorted newest first.
   */
  getNews(symbol: string): Promise<NewsItem[]>;

  /**
   * Batch-fetch quotes. Implementations may parallelize or use a bulk endpoint.
   * Default implementation calls getQuote() for each symbol.
   */
  getBatchQuotes(symbols: string[]): Promise<Quote[]>;
}
