/**
 * PolygonProvider — real market data via Polygon.io
 *
 * Tier notes:
 *   FREE (Starter):  End-of-day aggregates, reference data, news.
 *                    Quotes are delayed / previous-close only.
 *                    Rate limit: 5 calls/min.
 *
 *   BASIC ($29/mo):  Real-time snapshots, 2-year history, technical indicators.
 *                    Rate limit: unlimited calls.
 *
 * Get an API key at https://polygon.io/dashboard/signup
 * Set EXPO_PUBLIC_POLYGON_API_KEY in your .env file.
 *
 * Note: On the free plan the `getQuote` method returns the previous day's
 * closing price rather than a real-time quote. Upgrade to Basic+ for live data.
 */

import type { IMarketDataProvider } from '../interface';
import type {
  StockSymbol,
  Quote,
  OHLCBar,
  CompanyProfile,
  TechnicalIndicators,
  NewsItem,
  TimeRange,
  MarketSession,
} from '../../../types/models';
import { computeTechnicals } from '../utils/technicals';

const BASE = 'https://api.polygon.io';

// ─── Polygon response shapes ──────────────────────────────────────────────────

interface PolygonSnapshotResult {
  day: { c: number; h: number; l: number; o: number; v: number; vw: number };
  prevDay: { c: number; h: number; l: number; o: number; v: number; vw: number };
  todaysChange: number;
  todaysChangePerc: number;
  updated: number;   // unix ms
  ticker: string;
}

interface PolygonAgg {
  v: number;  // volume
  vw: number; // volume-weighted avg price
  o: number;  // open
  c: number;  // close
  h: number;  // high
  l: number;  // low
  t: number;  // timestamp ms
  n: number;  // number of transactions
}

interface PolygonTickerDetails {
  ticker: string;
  name: string;
  market: string;
  locale: string;
  primary_exchange: string;
  type: string;
  description?: string;
  homepage_url?: string;
  total_employees?: number;
  sic_description?: string;
  market_cap?: number;
  branding?: { logo_url?: string };
}

interface PolygonNewsItem {
  id: string;
  title: string;
  description?: string;
  article_url: string;
  published_utc: string;
  publisher: { name: string; homepage_url?: string };
  tickers: string[];
  amp_url?: string;
  image_url?: string;
  keywords?: string[];
}

// ─── Exchange MIC → readable name ─────────────────────────────────────────────

const MIC_TO_NAME: Record<string, string> = {
  XNAS: 'NASDAQ',
  XNYS: 'NYSE',
  XASE: 'AMEX',
  BATS: 'CBOE BZX',
  XARC: 'NYSE Arca',
};

function exchangeName(mic: string): string {
  return MIC_TO_NAME[mic] ?? mic;
}

// ─── Market session helper ─────────────────────────────────────────────────────

function currentSession(): MarketSession {
  const now = new Date();
  const year = now.getFullYear();
  const marFirst = new Date(Date.UTC(year, 2, 1));
  const dstStart = new Date(Date.UTC(year, 2, 8 + ((7 - marFirst.getUTCDay()) % 7)));
  const novFirst = new Date(Date.UTC(year, 10, 1));
  const dstEnd = new Date(Date.UTC(year, 10, 1 + ((7 - novFirst.getUTCDay()) % 7)));
  const isDST = now.getTime() >= dstStart.getTime() && now.getTime() < dstEnd.getTime();

  const etOffsetMs = (isDST ? -4 : -5) * 3600 * 1000;
  const etDate = new Date(now.getTime() + etOffsetMs);

  const day = etDate.getUTCDay();
  if (day === 0 || day === 6) return 'closed';

  const mins = etDate.getUTCHours() * 60 + etDate.getUTCMinutes();
  if (mins >= 240 && mins < 570) return 'pre';
  if (mins >= 570 && mins < 960) return 'regular';
  if (mins >= 960 && mins < 1200) return 'after';
  return 'closed';
}

// ─── Time-range → Polygon agg params ─────────────────────────────────────────

function isoDate(ts: number): string {
  return new Date(ts).toISOString().slice(0, 10);
}

function rangeToParams(range: TimeRange): {
  multiplier: number;
  timespan: string;
  from: string;
  to: string;
} {
  const now = Date.now();
  const DAY = 86_400_000;
  const today = isoDate(now);
  switch (range) {
    case '1D':  return { multiplier: 5,  timespan: 'minute', from: isoDate(now - DAY),        to: today };
    case '1W':  return { multiplier: 1,  timespan: 'hour',   from: isoDate(now - 7 * DAY),    to: today };
    case '1M':  return { multiplier: 1,  timespan: 'day',    from: isoDate(now - 30 * DAY),   to: today };
    case '3M':  return { multiplier: 1,  timespan: 'day',    from: isoDate(now - 90 * DAY),   to: today };
    case '1Y':  return { multiplier: 1,  timespan: 'day',    from: isoDate(now - 365 * DAY),  to: today };
    case '5Y':  return { multiplier: 1,  timespan: 'week',   from: isoDate(now - 5 * 365 * DAY), to: today };
  }
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export class PolygonProvider implements IMarketDataProvider {
  readonly name = 'polygon';

  private readonly apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async request<T>(path: string, params: Record<string, string | number> = {}): Promise<T> {
    const url = new URL(`${BASE}${path}`);
    url.searchParams.set('apiKey', this.apiKey);
    for (const [k, v] of Object.entries(params)) {
      url.searchParams.set(k, String(v));
    }

    const res = await fetch(url.toString());
    if (res.status === 429) throw new Error('Polygon rate limit exceeded — free tier: 5 req/min');
    if (res.status === 401 || res.status === 403) throw new Error('Invalid Polygon API key');
    if (!res.ok) throw new Error(`Polygon ${path} → HTTP ${res.status}`);

    return res.json() as Promise<T>;
  }

  async searchSymbols(query: string, limit = 15): Promise<StockSymbol[]> {
    const data = await this.request<{
      results: Array<{ ticker: string; name: string; market: string; type: string; primary_exchange: string }>;
    }>('/v3/reference/tickers', { search: query, limit, market: 'stocks', active: 'true' });

    return (data.results ?? []).map(r => ({
      symbol: r.ticker,
      name: r.name,
      exchange: exchangeName(r.primary_exchange ?? ''),
      type: r.type === 'ETF' ? 'etf' : 'stock',
    }));
  }

  async getQuote(symbol: string): Promise<Quote> {
    // Real-time snapshot — requires Basic tier or higher.
    // On the free Starter plan this returns the previous close.
    const data = await this.request<{ results: PolygonSnapshotResult; status: string }>(
      `/v2/snapshot/locale/us/markets/stocks/tickers/${symbol}`,
    );

    const r = data.results;
    const day = r.day ?? {};
    const prev = r.prevDay ?? {};

    // Compute avgVolume from 30-day aggregates
    const { from, to } = rangeToParams('1M');
    const aggData = await this.request<{ results: PolygonAgg[]; status: string }>(
      `/v2/aggs/ticker/${symbol}/range/1/day/${from}/${to}`,
      { adjusted: 'true', sort: 'asc', limit: '50' },
    ).catch(() => ({ results: [] as PolygonAgg[], status: 'ERROR' }));

    const volumes = (aggData.results ?? []).map(a => a.v);
    const avgVolume = volumes.length
      ? Math.round(volumes.reduce((a, b) => a + b, 0) / volumes.length)
      : 0;

    return {
      symbol,
      name: symbol,
      exchange: '',
      price: day.c ?? prev.c ?? 0,
      previousClose: prev.c ?? 0,
      open: day.o ?? prev.o ?? 0,
      dayHigh: day.h ?? prev.h ?? 0,
      dayLow: day.l ?? prev.l ?? 0,
      volume: day.v ?? 0,
      avgVolume,
      marketCap: null,
      change: r.todaysChange ?? 0,
      changePercent: r.todaysChangePerc ?? 0,
      session: currentSession(),
      timestamp: r.updated ?? Date.now(),
    };
  }

  async getHistoricalPrices(symbol: string, range: TimeRange): Promise<OHLCBar[]> {
    const { multiplier, timespan, from, to } = rangeToParams(range);

    const data = await this.request<{ results: PolygonAgg[]; status: string }>(
      `/v2/aggs/ticker/${symbol}/range/${multiplier}/${timespan}/${from}/${to}`,
      { adjusted: 'true', sort: 'asc', limit: '5000' },
    );

    return (data.results ?? []).map(a => ({
      timestamp: a.t,
      open: a.o,
      high: a.h,
      low: a.l,
      close: a.c,
      volume: a.v,
    }));
  }

  async getCompanyProfile(symbol: string): Promise<CompanyProfile> {
    const data = await this.request<{ results: PolygonTickerDetails; status: string }>(
      `/v3/reference/tickers/${symbol}`,
    );
    const d = data.results;
    return {
      symbol,
      name: d.name ?? symbol,
      exchange: exchangeName(d.primary_exchange ?? ''),
      sector: '',
      industry: d.sic_description ?? '',
      description: d.description ?? '',
      employees: d.total_employees ?? null,
      website: d.homepage_url ?? null,
      logoUrl: d.branding?.logo_url ?? null,
      country: d.locale?.toUpperCase() ?? '',
    };
  }

  async getTechnicalIndicators(symbol: string): Promise<TechnicalIndicators> {
    const bars = await this.getHistoricalPrices(symbol, '1Y');

    if (bars.length === 0) {
      return {
        symbol,
        timestamp: Date.now(),
        sma20: null, sma50: null, sma200: null,
        ema12: null, ema26: null, rsi14: null,
        macdLine: null, macdSignal: null, macdHistogram: null,
      };
    }

    return computeTechnicals(symbol, bars);
  }

  async getNews(symbol: string): Promise<NewsItem[]> {
    const data = await this.request<{ results: PolygonNewsItem[]; status: string }>(
      '/v2/reference/news',
      { ticker: symbol, order: 'desc', limit: 10 },
    );

    return (data.results ?? []).map(a => ({
      id: a.id,
      headline: a.title,
      summary: a.description ?? '',
      source: a.publisher?.name ?? '',
      url: a.article_url,
      publishedAt: new Date(a.published_utc).getTime(),
      relatedSymbols: a.tickers ?? [symbol],
      sentiment: null,
    }));
  }

  async getBatchQuotes(symbols: string[]): Promise<Quote[]> {
    // Polygon has a batch snapshot endpoint — fetch all in one request.
    // Requires Basic tier for real-time; free tier returns previous-close data.
    const joined = symbols.join(',');
    const data = await this.request<{ tickers: PolygonSnapshotResult[]; status: string }>(
      `/v2/snapshot/locale/us/markets/stocks/tickers`,
      { tickers: joined },
    ).catch(() => null);

    if (!data?.tickers?.length) {
      // Fallback to individual calls (needed if batch endpoint fails on free tier)
      const results = await Promise.allSettled(symbols.map(s => this.getQuote(s)));
      return results
        .filter((r): r is PromiseFulfilledResult<Quote> => r.status === 'fulfilled')
        .map(r => r.value);
    }

    return data.tickers.map(r => {
      const day = r.day ?? {};
      const prev = r.prevDay ?? {};
      return {
        symbol: r.ticker,
        name: r.ticker,
        exchange: '',
        price: day.c ?? prev.c ?? 0,
        previousClose: prev.c ?? 0,
        open: day.o ?? 0,
        dayHigh: day.h ?? 0,
        dayLow: day.l ?? 0,
        volume: day.v ?? 0,
        avgVolume: 0,
        marketCap: null,
        change: r.todaysChange ?? 0,
        changePercent: r.todaysChangePerc ?? 0,
        session: currentSession(),
        timestamp: r.updated ?? Date.now(),
      } satisfies Quote;
    });
  }
}
