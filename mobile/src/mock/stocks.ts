import type { StockSymbol, Quote, CompanyProfile, OHLCBar, NewsItem, TechnicalIndicators } from '../types/models';

// ─── Symbol universe ──────────────────────────────────────────────────────────

export const MOCK_SYMBOLS: StockSymbol[] = [
  { symbol: 'AAPL',  name: 'Apple Inc.',                    exchange: 'NASDAQ', type: 'stock' },
  { symbol: 'MSFT',  name: 'Microsoft Corporation',         exchange: 'NASDAQ', type: 'stock' },
  { symbol: 'NVDA',  name: 'NVIDIA Corporation',            exchange: 'NASDAQ', type: 'stock' },
  { symbol: 'AMZN',  name: 'Amazon.com Inc.',               exchange: 'NASDAQ', type: 'stock' },
  { symbol: 'GOOGL', name: 'Alphabet Inc. Class A',         exchange: 'NASDAQ', type: 'stock' },
  { symbol: 'META',  name: 'Meta Platforms Inc.',           exchange: 'NASDAQ', type: 'stock' },
  { symbol: 'TSLA',  name: 'Tesla Inc.',                    exchange: 'NASDAQ', type: 'stock' },
  { symbol: 'NFLX',  name: 'Netflix Inc.',                  exchange: 'NASDAQ', type: 'stock' },
  { symbol: 'AMD',   name: 'Advanced Micro Devices Inc.',   exchange: 'NASDAQ', type: 'stock' },
  { symbol: 'INTC',  name: 'Intel Corporation',             exchange: 'NASDAQ', type: 'stock' },
  { symbol: 'JPM',   name: 'JPMorgan Chase & Co.',          exchange: 'NYSE',   type: 'stock' },
  { symbol: 'BAC',   name: 'Bank of America Corp.',         exchange: 'NYSE',   type: 'stock' },
  { symbol: 'GS',    name: 'Goldman Sachs Group Inc.',      exchange: 'NYSE',   type: 'stock' },
  { symbol: 'V',     name: 'Visa Inc.',                     exchange: 'NYSE',   type: 'stock' },
  { symbol: 'MA',    name: 'Mastercard Inc.',               exchange: 'NYSE',   type: 'stock' },
  { symbol: 'JNJ',   name: 'Johnson & Johnson',             exchange: 'NYSE',   type: 'stock' },
  { symbol: 'UNH',   name: 'UnitedHealth Group Inc.',       exchange: 'NYSE',   type: 'stock' },
  { symbol: 'PFE',   name: 'Pfizer Inc.',                   exchange: 'NYSE',   type: 'stock' },
  { symbol: 'XOM',   name: 'Exxon Mobil Corporation',       exchange: 'NYSE',   type: 'stock' },
  { symbol: 'CVX',   name: 'Chevron Corporation',           exchange: 'NYSE',   type: 'stock' },
  { symbol: 'SPY',   name: 'SPDR S&P 500 ETF Trust',        exchange: 'NYSE',   type: 'etf'   },
  { symbol: 'QQQ',   name: 'Invesco QQQ Trust',             exchange: 'NASDAQ', type: 'etf'   },
  { symbol: 'ARKK',  name: 'ARK Innovation ETF',            exchange: 'NYSE',   type: 'etf'   },
  { symbol: 'PLTR',  name: 'Palantir Technologies Inc.',    exchange: 'NYSE',   type: 'stock' },
  { symbol: 'CRM',   name: 'Salesforce Inc.',               exchange: 'NYSE',   type: 'stock' },
];

// ─── Seed price data ──────────────────────────────────────────────────────────

interface SeedData {
  price: number;
  prevClose: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  avgVolume: number;
  marketCap: number | null;
  sector: string;
  industry: string;
  employees: number | null;
  description: string;
  country: string;
}

export const MOCK_SEED: Record<string, SeedData> = {
  AAPL:  { price: 189.30, prevClose: 187.15, open: 187.90, high: 190.25, low: 186.80, volume: 58_200_000, avgVolume: 62_000_000, marketCap: 2_950_000_000_000, sector: 'Technology', industry: 'Consumer Electronics', employees: 164_000, description: 'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide.', country: 'US' },
  MSFT:  { price: 415.80, prevClose: 410.50, open: 411.00, high: 418.90, low: 409.20, volume: 21_400_000, avgVolume: 23_500_000, marketCap: 3_090_000_000_000, sector: 'Technology', industry: 'Software—Infrastructure', employees: 221_000, description: 'Microsoft Corporation develops and supports software, services, devices, and solutions worldwide.', country: 'US' },
  NVDA:  { price: 875.40, prevClose: 860.20, open: 862.00, high: 882.00, low: 857.10, volume: 42_100_000, avgVolume: 45_000_000, marketCap: 2_160_000_000_000, sector: 'Technology', industry: 'Semiconductors', employees: 29_600, description: 'NVIDIA Corporation provides graphics, computing, and networking solutions worldwide.', country: 'US' },
  AMZN:  { price: 185.50, prevClose: 183.20, open: 183.90, high: 187.10, low: 182.60, volume: 35_600_000, avgVolume: 38_000_000, marketCap: 1_930_000_000_000, sector: 'Consumer Cyclical', industry: 'Internet Retail', employees: 1_540_000, description: 'Amazon.com Inc. engages in the retail sale of consumer products and subscriptions through online and physical stores.', country: 'US' },
  GOOGL: { price: 172.80, prevClose: 170.40, open: 170.90, high: 174.20, low: 169.80, volume: 24_300_000, avgVolume: 26_500_000, marketCap: 2_140_000_000_000, sector: 'Technology', industry: 'Internet Content & Information', employees: 182_000, description: 'Alphabet Inc. provides various products and platforms in the United States, Europe, the Middle East, Africa, the Asia-Pacific, Canada, and Latin America.', country: 'US' },
  META:  { price: 512.40, prevClose: 505.90, open: 507.00, high: 515.80, low: 504.30, volume: 16_800_000, avgVolume: 18_200_000, marketCap: 1_310_000_000_000, sector: 'Technology', industry: 'Internet Content & Information', employees: 86_500, description: 'Meta Platforms Inc. develops products that enable people to connect and share through mobile devices, personal computers, and other surfaces worldwide.', country: 'US' },
  TSLA:  { price: 248.60, prevClose: 241.30, open: 243.00, high: 251.80, low: 240.50, volume: 95_300_000, avgVolume: 102_000_000, marketCap: 790_000_000_000, sector: 'Consumer Cyclical', industry: 'Auto Manufacturers', employees: 127_000, description: 'Tesla Inc. designs, develops, manufactures, leases, and sells electric vehicles, energy generation and storage systems worldwide.', country: 'US' },
  NFLX:  { price: 628.90, prevClose: 622.40, open: 623.50, high: 632.10, low: 620.80, volume: 7_200_000, avgVolume: 7_800_000, marketCap: 273_000_000_000, sector: 'Communication Services', industry: 'Entertainment', employees: 13_000, description: 'Netflix Inc. provides entertainment services. It offers TV series, documentaries, feature films, and mobile games across various genres and languages.', country: 'US' },
  AMD:   { price: 162.40, prevClose: 159.80, open: 160.20, high: 164.70, low: 158.90, volume: 48_700_000, avgVolume: 52_000_000, marketCap: 263_000_000_000, sector: 'Technology', industry: 'Semiconductors', employees: 26_000, description: 'Advanced Micro Devices Inc. operates as a semiconductor company worldwide.', country: 'US' },
  INTC:  { price: 28.60,  prevClose: 29.10,  open: 28.90,  high: 29.20,  low: 28.10,  volume: 52_400_000, avgVolume: 55_000_000, marketCap: 120_000_000_000, sector: 'Technology', industry: 'Semiconductors', employees: 124_800, description: 'Intel Corporation designs, manufactures, and sells computing and related products and services worldwide.', country: 'US' },
  JPM:   { price: 198.50, prevClose: 196.80, open: 197.20, high: 199.90, low: 196.10, volume: 12_100_000, avgVolume: 13_400_000, marketCap: 568_000_000_000, sector: 'Financial Services', industry: 'Banks—Diversified', employees: 308_669, description: 'JPMorgan Chase & Co. operates as a financial services company worldwide.', country: 'US' },
  BAC:   { price: 37.80,  prevClose: 37.20,  open: 37.30,  high: 38.10,  low: 37.00,  volume: 45_600_000, avgVolume: 48_000_000, marketCap: 296_000_000_000, sector: 'Financial Services', industry: 'Banks—Diversified', employees: 213_000, description: 'Bank of America Corp. provides banking and financial products and services for individual consumers, small- and middle-market businesses, institutional investors, and corporations.', country: 'US' },
  GS:    { price: 442.30, prevClose: 438.70, open: 439.50, high: 444.80, low: 437.20, volume: 3_200_000,  avgVolume: 3_500_000,  marketCap: 144_000_000_000, sector: 'Financial Services', industry: 'Capital Markets', employees: 44_500, description: 'The Goldman Sachs Group Inc. operates as a global investment banking and financial services company.', country: 'US' },
  V:     { price: 276.40, prevClose: 274.10, open: 274.50, high: 277.90, low: 273.20, volume: 8_900_000,  avgVolume: 9_800_000,  marketCap: 569_000_000_000, sector: 'Financial Services', industry: 'Credit Services', employees: 29_000, description: 'Visa Inc. operates as a payments technology company worldwide.', country: 'US' },
  MA:    { price: 462.80, prevClose: 459.40, open: 460.00, high: 465.20, low: 458.30, volume: 4_400_000,  avgVolume: 4_800_000,  marketCap: 429_000_000_000, sector: 'Financial Services', industry: 'Credit Services', employees: 31_600, description: 'Mastercard Inc., a technology company, provides transaction processing and other payment-related products and services.', country: 'US' },
  JNJ:   { price: 155.30, prevClose: 154.20, open: 154.40, high: 156.10, low: 153.80, volume: 10_200_000, avgVolume: 11_500_000, marketCap: 372_000_000_000, sector: 'Healthcare', industry: 'Drug Manufacturers—General', employees: 152_700, description: 'Johnson & Johnson researches, develops, manufactures, and sells various products in the healthcare field worldwide.', country: 'US' },
  UNH:   { price: 518.90, prevClose: 515.20, open: 516.00, high: 521.40, low: 514.10, volume: 3_800_000,  avgVolume: 4_200_000,  marketCap: 481_000_000_000, sector: 'Healthcare', industry: 'Healthcare Plans', employees: 400_000, description: 'UnitedHealth Group Incorporated operates as a diversified healthcare company.', country: 'US' },
  PFE:   { price: 27.40,  prevClose: 27.80,  open: 27.70,  high: 27.90,  low: 27.10,  volume: 38_700_000, avgVolume: 41_000_000, marketCap: 155_000_000_000, sector: 'Healthcare', industry: 'Drug Manufacturers—General', employees: 88_000, description: 'Pfizer Inc. discovers, develops, manufactures, markets, distributes, and sells biopharmaceutical products worldwide.', country: 'US' },
  XOM:   { price: 112.60, prevClose: 111.40, open: 111.70, high: 113.40, low: 110.90, volume: 22_400_000, avgVolume: 24_000_000, marketCap: 454_000_000_000, sector: 'Energy', industry: 'Oil & Gas Integrated', employees: 62_000, description: 'Exxon Mobil Corporation explores for and produces crude oil and natural gas.', country: 'US' },
  CVX:   { price: 156.80, prevClose: 155.30, open: 155.60, high: 157.90, low: 154.80, volume: 11_600_000, avgVolume: 12_500_000, marketCap: 293_000_000_000, sector: 'Energy', industry: 'Oil & Gas Integrated', employees: 43_846, description: 'Chevron Corporation engages in integrated energy and chemicals operations worldwide.', country: 'US' },
  SPY:   { price: 524.80, prevClose: 521.30, open: 522.00, high: 526.40, low: 520.70, volume: 78_200_000, avgVolume: 82_000_000, marketCap: null, sector: 'ETF', industry: 'Index Fund', employees: null, description: 'The SPDR S&P 500 ETF Trust seeks to provide investment results that, before expenses, correspond generally to the price and yield performance of the S&P 500 Index.', country: 'US' },
  QQQ:   { price: 448.60, prevClose: 444.90, open: 445.80, high: 450.20, low: 444.10, volume: 45_100_000, avgVolume: 48_000_000, marketCap: null, sector: 'ETF', industry: 'Index Fund', employees: null, description: 'The Invesco QQQ Trust tracks the Nasdaq-100 Index, which includes 100 of the largest domestic and international nonfinancial companies listed on the Nasdaq Stock Market.', country: 'US' },
  ARKK:  { price: 48.20,  prevClose: 47.10,  open: 47.40,  high: 48.90,  low: 46.80,  volume: 12_400_000, avgVolume: 14_000_000, marketCap: null, sector: 'ETF', industry: 'Thematic', employees: null, description: 'The ARK Innovation ETF is an actively managed ETF that seeks long-term growth of capital through companies involved in disruptive innovation.', country: 'US' },
  PLTR:  { price: 23.80,  prevClose: 22.90,  open: 23.10,  high: 24.20,  low: 22.70,  volume: 68_400_000, avgVolume: 72_000_000, marketCap: 50_000_000_000,  sector: 'Technology', industry: 'Software—Infrastructure', employees: 3_838,  description: 'Palantir Technologies Inc. builds and deploys software platforms for the intelligence community in the US to assist in counterterrorism investigations and operations.', country: 'US' },
  CRM:   { price: 298.70, prevClose: 295.40, open: 296.00, high: 300.80, low: 294.20, volume: 5_900_000,  avgVolume: 6_400_000,  marketCap: 289_000_000_000, sector: 'Technology', industry: 'Software—Application', employees: 73_541, description: 'Salesforce Inc. provides Customer Relationship Management technology that brings companies and customers together worldwide.', country: 'US' },
};

// ─── Quote builder ────────────────────────────────────────────────────────────

function buildQuote(symbol: StockSymbol): Quote {
  const seed = MOCK_SEED[symbol.symbol];
  if (!seed) throw new Error(`No seed for ${symbol.symbol}`);
  const change = seed.price - seed.prevClose;
  const changePercent = (change / seed.prevClose) * 100;
  return {
    symbol: symbol.symbol,
    name: symbol.name,
    exchange: symbol.exchange,
    price: seed.price,
    previousClose: seed.prevClose,
    open: seed.open,
    dayHigh: seed.high,
    dayLow: seed.low,
    volume: seed.volume,
    avgVolume: seed.avgVolume,
    marketCap: seed.marketCap,
    change: parseFloat(change.toFixed(2)),
    changePercent: parseFloat(changePercent.toFixed(4)),
    session: 'regular',
    timestamp: Date.now(),
  };
}

export function getMockQuote(symbol: string): Quote {
  const sym = MOCK_SYMBOLS.find(s => s.symbol === symbol);
  if (!sym) throw new Error(`Symbol ${symbol} not found`);
  return buildQuote(sym);
}

export function getMockQuotes(symbols: string[]): Quote[] {
  return symbols.map(getMockQuote);
}

// ─── Historical price generator ───────────────────────────────────────────────

/** Deterministic seeded pseudo-random using LCG. */
function lcg(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function charCodeSum(str: string): number {
  return str.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
}

export function generateMockHistory(symbol: string, range: import('../types/models').TimeRange): OHLCBar[] {
  const seed = charCodeSum(symbol) + ['1D','1W','1M','3M','1Y','5Y'].indexOf(range);
  const rng = lcg(seed);

  const barCounts: Record<import('../types/models').TimeRange, number> = {
    '1D': 78,    // 5-min bars
    '1W': 5 * 78,
    '1M': 22 * 78,
    '3M': 66 * 78,
    '1Y': 252,
    '5Y': 1260,
  };
  const n = barCounts[range];

  const seedData = MOCK_SEED[symbol];
  const basePrice = seedData?.price ?? 100;
  const volatility = (seedData?.price ?? 100) > 200 ? 0.008 : 0.012;

  const now = Date.now();
  const intervalMs: Record<import('../types/models').TimeRange, number> = {
    '1D': 5 * 60_000,
    '1W': 5 * 60_000,
    '1M': 5 * 60_000,
    '3M': 5 * 60_000,
    '1Y': 24 * 60 * 60_000,
    '5Y': 24 * 60 * 60_000,
  };
  const interval = intervalMs[range];

  const bars: OHLCBar[] = [];
  let price = basePrice * (0.8 + rng() * 0.4);

  for (let i = n; i >= 0; i--) {
    const open = price;
    const change1 = (rng() - 0.5) * 2 * volatility;
    const change2 = (rng() - 0.5) * 2 * volatility;
    const high = open * (1 + Math.abs(change1) + rng() * 0.003);
    const low = open * (1 - Math.abs(change2) - rng() * 0.003);
    const close = low + rng() * (high - low);
    const volume = Math.floor((seedData?.avgVolume ?? 1_000_000) / (range === '1D' ? n : 1) * (0.5 + rng()));

    bars.push({
      timestamp: now - i * interval,
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume,
    });
    price = close;
  }

  return bars;
}

// ─── Company profiles ─────────────────────────────────────────────────────────

export function getMockProfile(symbol: string): CompanyProfile {
  const sym = MOCK_SYMBOLS.find(s => s.symbol === symbol);
  const seed = MOCK_SEED[symbol];
  if (!sym || !seed) throw new Error(`No profile for ${symbol}`);
  return {
    symbol,
    name: sym.name,
    exchange: sym.exchange,
    sector: seed.sector,
    industry: seed.industry,
    description: seed.description,
    employees: seed.employees,
    website: `https://www.${symbol.toLowerCase()}.com`,
    logoUrl: null,
    country: seed.country,
  };
}

// ─── Technical indicators ─────────────────────────────────────────────────────

export function getMockTechnicals(symbol: string): TechnicalIndicators {
  const rng = lcg(charCodeSum(symbol));
  const seed = MOCK_SEED[symbol];
  const price = seed?.price ?? 100;
  return {
    symbol,
    timestamp: Date.now(),
    sma20: parseFloat((price * (0.97 + rng() * 0.06)).toFixed(2)),
    sma50: parseFloat((price * (0.94 + rng() * 0.06)).toFixed(2)),
    sma200: parseFloat((price * (0.88 + rng() * 0.12)).toFixed(2)),
    ema12: parseFloat((price * (0.98 + rng() * 0.04)).toFixed(2)),
    ema26: parseFloat((price * (0.96 + rng() * 0.06)).toFixed(2)),
    rsi14: parseFloat((35 + rng() * 40).toFixed(1)),
    macdLine: parseFloat(((rng() - 0.5) * 8).toFixed(4)),
    macdSignal: parseFloat(((rng() - 0.5) * 6).toFixed(4)),
    macdHistogram: parseFloat(((rng() - 0.5) * 3).toFixed(4)),
  };
}

// ─── News ─────────────────────────────────────────────────────────────────────

const NEWS_TEMPLATES = [
  { headline: '{name} Reports Strong Quarterly Earnings, Beats Analyst Estimates', sentiment: 'positive' as const },
  { headline: '{name} Announces Strategic Partnership to Expand Market Reach', sentiment: 'positive' as const },
  { headline: '{symbol} Stock Rises on Positive Outlook from Major Wall Street Banks', sentiment: 'positive' as const },
  { headline: '{name} Faces Regulatory Scrutiny in Key Markets', sentiment: 'negative' as const },
  { headline: 'Analysts Downgrade {symbol} Amid Sector Headwinds', sentiment: 'negative' as const },
  { headline: '{name} CEO Outlines Vision for AI-Driven Growth Strategy', sentiment: 'positive' as const },
  { headline: '{symbol} Shares Volatile as Macro Concerns Persist', sentiment: 'neutral' as const },
  { headline: '{name} Expands into Emerging Markets with New Product Launch', sentiment: 'positive' as const },
  { headline: 'Institutional Investors Increase Stake in {symbol}', sentiment: 'positive' as const },
  { headline: '{name} Supply Chain Disruptions Impact Near-Term Guidance', sentiment: 'negative' as const },
];

const SOURCES = ['Reuters', 'Bloomberg', 'CNBC', 'Wall Street Journal', 'Financial Times', 'MarketWatch', 'Seeking Alpha', 'The Motley Fool'];

export function getMockNews(symbol: string): NewsItem[] {
  const rng = lcg(charCodeSum(symbol) + 7);
  const sym = MOCK_SYMBOLS.find(s => s.symbol === symbol);
  const name = sym?.name.replace(' Inc.', '').replace(' Corporation', '').replace(' Corp.', '') ?? symbol;

  return NEWS_TEMPLATES.slice(0, 6).map((tpl, i) => ({
    id: `${symbol}-news-${i}`,
    headline: tpl.headline.replace('{name}', name).replace('{symbol}', symbol),
    summary: `${name} continues to make headlines as market participants closely monitor developments in the sector.`,
    source: SOURCES[Math.floor(rng() * SOURCES.length)],
    url: '#',
    publishedAt: Date.now() - i * 3_600_000 * (1 + Math.floor(rng() * 6)),
    relatedSymbols: [symbol],
    sentiment: tpl.sentiment,
  }));
}

// ─── Search ───────────────────────────────────────────────────────────────────

export function searchMockSymbols(query: string): StockSymbol[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return MOCK_SYMBOLS.filter(
    s =>
      s.symbol.toLowerCase().includes(q) ||
      s.name.toLowerCase().includes(q),
  ).slice(0, 15);
}
