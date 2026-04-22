/**
 * FinnhubProvider — real market data via Finnhub.io
 *
 * Free tier covers:
 *   • Real-time US stock quotes  (60 calls/min)
 *   • Company profiles & search
 *   • Historical OHLCV candles (intraday + daily + weekly)
 *   • Company news (last 7 days)
 *   • No real-time WebSocket on free plan — polling only
 *
 * Get a free API key at https://finnhub.io/register
 * Set EXPO_PUBLIC_FINNHUB_API_KEY in your .env file.
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

const BASE = 'https://finnhub.io/api/v1';

// ─── Finnhub response shapes ──────────────────────────────────────────────────

interface FinnhubQuote {
  c: number;   // current price
  d: number;   // change
  dp: number;  // percent change
  h: number;   // high of day
  l: number;   // low of day
  o: number;   // open
  pc: number;  // previous close
  t: number;   // unix timestamp (seconds)
}

interface FinnhubCandles {
  c: number[];  // closes
  h: number[];  // highs
  l: number[];  // lows
  o: number[];  // opens
  s: string;    // "ok" | "no_data"
  t: number[];  // unix timestamps (seconds)
  v: number[];  // volumes
}

interface FinnhubProfile {
  country: string;
  currency: string;
  exchange: string;
  finnhubIndustry: string;
  logo: string;
  marketCapitalization: number; // in millions USD
  name: string;
  ticker: string;
  weburl: string;
  gsector: string;
  gsubindustry: string;
  description?: string;
  employeeTotal?: number;
}

interface FinnhubSearchResult {
  description: string;
  displaySymbol: string;
  symbol: string;
  type: string; // "Common Stock" | "ETP" | ...
}

interface FinnhubNewsItem {
  id: number;
  headline: string;
  summary: string;
  source: string;
  url: string;
  datetime: number;  // unix seconds
  related: string;   // comma-separated tickers
  image?: string;
}

// ─── Market session helper ─────────────────────────────────────────────────────

function currentSession(): MarketSession {
  const now = new Date();

  // Approximate US DST: second Sun in March → first Sun in November
  const year = now.getFullYear();
  const marFirst = new Date(Date.UTC(year, 2, 1));
  const dstStart = new Date(Date.UTC(year, 2, 8 + ((7 - marFirst.getUTCDay()) % 7)));
  const novFirst = new Date(Date.UTC(year, 10, 1));
  const dstEnd = new Date(Date.UTC(year, 10, 1 + ((7 - novFirst.getUTCDay()) % 7)));
  const isDST = now.getTime() >= dstStart.getTime() && now.getTime() < dstEnd.getTime();

  const etOffsetMs = (isDST ? -4 : -5) * 3600 * 1000;
  const etDate = new Date(now.getTime() + etOffsetMs);

  const day = etDate.getUTCDay(); // 0=Sun, 6=Sat
  if (day === 0 || day === 6) return 'closed';

  const mins = etDate.getUTCHours() * 60 + etDate.getUTCMinutes();
  if (mins >= 240 && mins < 570) return 'pre';       // 04:00–09:30
  if (mins >= 570 && mins < 960) return 'regular';   // 09:30–16:00
  if (mins >= 960 && mins < 1200) return 'after';    // 16:00–20:00
  return 'closed';
}

// ─── Time-range → Finnhub candle params ──────────────────────────────────────

function rangeToParams(range: TimeRange): { resolution: string; fromTs: number } {
  const now = Math.floor(Date.now() / 1000);
  const DAY = 86_400;
  switch (range) {
    case '1D':  return { resolution: '5',  fromTs: now - DAY };           // 5-min bars
    case '1W':  return { resolution: '60', fromTs: now - 7 * DAY };       // hourly bars
    case '1M':  return { resolution: 'D',  fromTs: now - 30 * DAY };      // daily bars
    case '3M':  return { resolution: 'D',  fromTs: now - 90 * DAY };
    case '1Y':  return { resolution: 'D',  fromTs: now - 365 * DAY };
    case '5Y':  return { resolution: 'W',  fromTs: now - 5 * 365 * DAY }; // weekly bars
  }
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export class FinnhubProvider implements IMarketDataProvider {
  readonly name = 'finnhub';

  private readonly apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  // ── Low-level HTTP wrapper ─────────────────────────────────────────────────

  private async request<T>(
    path: string,
    params: Record<string, string | number> = {},
  ): Promise<T> {
    const url = new URL(`${BASE}${path}`);
    url.searchParams.set('token', this.apiKey);
    for (const [k, v] of Object.entries(params)) {
      url.searchParams.set(k, String(v));
    }

    const res = await fetch(url.toString());
    if (res.status === 429) throw new Error('Finnhub rate limit exceeded — slow down polling');
    if (res.status === 401 || res.status === 403) throw new Error('Invalid Finnhub API key');
    if (!res.ok) throw new Error(`Finnhub ${path} → HTTP ${res.status}`);

    return res.json() as Promise<T>;
  }

  // ── IMarketDataProvider ────────────────────────────────────────────────────

  async searchSymbols(query: string, limit = 15): Promise<StockSymbol[]> {
    const data = await this.request<{ count: number; result: FinnhubSearchResult[] }>(
      '/search',
      { q: query },
    );
    return data.result.slice(0, limit).map(r => ({
      symbol: r.displaySymbol,
      name: r.description,
      exchange: '',
      type: r.type === 'ETP' ? 'etf' : 'stock',
    }));
  }

  async getQuote(symbol: string): Promise<Quote> {
    const nowTs = Math.floor(Date.now() / 1000);
    const fromTs = nowTs - 31 * 86_400; // 31 days for avgVolume calculation

    // Parallel: real-time price + 30-day daily candles (for volume)
    const [q, candles] = await Promise.all([
      this.request<FinnhubQuote>('/quote', { symbol }),
      this.request<FinnhubCandles>('/stock/candle', {
        symbol,
        resolution: 'D',
        from: fromTs,
        to: nowTs,
      }).catch((): null => null),
    ]);

    const volumes = candles?.s === 'ok' ? (candles.v ?? []) : [];
    const volume = volumes.length ? volumes[volumes.length - 1] : 0;
    const avgVolume = volumes.length
      ? Math.round(volumes.reduce((a, b) => a + b, 0) / volumes.length)
      : 0;

    return {
      symbol,
      name: symbol, // Use getCompanyProfile() for the full name when needed
      exchange: '',
      price: q.c,
      previousClose: q.pc,
      open: q.o,
      dayHigh: q.h,
      dayLow: q.l,
      volume,
      avgVolume,
      marketCap: null, // Use getCompanyProfile() for marketCap
      change: q.d,
      changePercent: q.dp,
      session: currentSession(),
      timestamp: q.t * 1000,
    };
  }

  async getHistoricalPrices(symbol: string, range: TimeRange): Promise<OHLCBar[]> {
    const { resolution, fromTs } = rangeToParams(range);
    const toTs = Math.floor(Date.now() / 1000);

    const data = await this.request<FinnhubCandles>('/stock/candle', {
      symbol,
      resolution,
      from: fromTs,
      to: toTs,
    });

    if (data.s !== 'ok' || !data.c?.length) return [];

    return data.t.map((ts, i) => ({
      timestamp: ts * 1000,
      open: data.o[i],
      high: data.h[i],
      low: data.l[i],
      close: data.c[i],
      volume: data.v[i],
    }));
  }

  async getCompanyProfile(symbol: string): Promise<CompanyProfile> {
    const p = await this.request<FinnhubProfile>('/stock/profile2', { symbol });
    return {
      symbol,
      name: p.name ?? symbol,
      exchange: p.exchange ?? '',
      sector: p.gsector ?? p.finnhubIndustry ?? '',
      industry: p.finnhubIndustry ?? '',
      description: p.description ?? '',
      employees: p.employeeTotal ?? null,
      website: p.weburl ?? null,
      logoUrl: p.logo ?? null,
      country: p.country ?? '',
    };
  }

  async getTechnicalIndicators(symbol: string): Promise<TechnicalIndicators> {
    // Fetch 1Y of daily bars and compute indicators locally.
    // 252 trading days gives reliable SMA-200, RSI-14, and MACD signal line.
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
    const today = new Date();
    const to = today.toISOString().slice(0, 10);
    const from = new Date(today.getTime() - 7 * 86_400_000).toISOString().slice(0, 10);

    const articles = await this.request<FinnhubNewsItem[]>('/company-news', {
      symbol,
      from,
      to,
    });

    return articles.slice(0, 10).map(a => ({
      id: String(a.id),
      headline: a.headline,
      summary: a.summary ?? '',
      source: a.source,
      url: a.url,
      publishedAt: a.datetime * 1000,
      relatedSymbols: a.related
        ? a.related.split(',').map(s => s.trim()).filter(Boolean)
        : [symbol],
      sentiment: null,
    }));
  }

  async getBatchQuotes(symbols: string[]): Promise<Quote[]> {
    // Finnhub has no batch quote endpoint — run concurrent individual calls.
    // Free tier: 60 calls/min. Each getQuote uses 2 calls → max ~30 symbols/min
    // before hitting limits. For larger batches, add rate-limiting middleware.
    const results = await Promise.allSettled(symbols.map(s => this.getQuote(s)));
    return results
      .filter((r): r is PromiseFulfilledResult<Quote> => r.status === 'fulfilled')
      .map(r => r.value);
  }
}
