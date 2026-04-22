import type { OHLCBar, TechnicalIndicators } from '../../../types/models';

// ─── Core helpers ─────────────────────────────────────────────────────────────

/**
 * Build a full EMA series from an array of closes.
 * Returns an array of length (closes.length - period + 1); index 0 is the EMA
 * seeded by the first `period` bars, index 1 is bar `period`, etc.
 */
function buildEMASeries(closes: number[], period: number): number[] {
  if (closes.length < period) return [];
  const k = 2 / (period + 1);
  // Seed with SMA of the first `period` bars
  let value = closes.slice(0, period).reduce((a, b) => a + b, 0) / period;
  const series: number[] = [value];
  for (let i = period; i < closes.length; i++) {
    value = closes[i] * k + value * (1 - k);
    series.push(value);
  }
  return series;
}

/** Simple Moving Average over the last `period` closes. Returns null if not enough data. */
function sma(closes: number[], period: number): number | null {
  if (closes.length < period) return null;
  const slice = closes.slice(-period);
  return slice.reduce((a, b) => a + b, 0) / period;
}

/** EMA of the last value in `closes` using a running series. */
function ema(closes: number[], period: number): number | null {
  const series = buildEMASeries(closes, period);
  return series.length > 0 ? series[series.length - 1] : null;
}

/**
 * RSI-14 using Wilder's smoothing method.
 * Requires at least 15 closes to produce a value.
 */
function rsi14(closes: number[]): number | null {
  const period = 14;
  if (closes.length < period + 1) return null;

  // Bootstrap with simple average of the first `period` changes
  let avgGain = 0;
  let avgLoss = 0;
  for (let i = 1; i <= period; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff > 0) avgGain += diff;
    else avgLoss += Math.abs(diff);
  }
  avgGain /= period;
  avgLoss /= period;

  // Wilder's smoothing for remaining bars
  for (let i = period + 1; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    avgGain = (avgGain * (period - 1) + (diff > 0 ? diff : 0)) / period;
    avgLoss = (avgLoss * (period - 1) + (diff < 0 ? Math.abs(diff) : 0)) / period;
  }

  if (avgLoss === 0) return 100;
  return 100 - 100 / (1 + avgGain / avgLoss);
}

/**
 * MACD line, signal, and histogram.
 *
 * Uses full EMA series (O(n)) rather than recomputing from scratch per bar.
 * Requires 26+ bars for the line, 35+ for a reliable signal line.
 */
function computeMACD(closes: number[]): {
  line: number | null;
  signal: number | null;
  histogram: number | null;
} {
  const ema12Series = buildEMASeries(closes, 12);
  const ema26Series = buildEMASeries(closes, 26);

  if (ema12Series.length === 0 || ema26Series.length === 0) {
    return { line: null, signal: null, histogram: null };
  }

  // ema12Series[0] corresponds to closes[11]; ema26Series[0] → closes[25].
  // Align by slicing ema12Series by (26-12)=14 so both start at closes[25].
  const offset = 26 - 12; // 14
  const alignedEma12 = ema12Series.slice(offset);
  const macdSeries = alignedEma12.map((e12, i) => e12 - ema26Series[i]);

  const line = macdSeries[macdSeries.length - 1] ?? null;
  if (line === null) return { line: null, signal: null, histogram: null };

  const signalSeries = buildEMASeries(macdSeries, 9);
  const signal = signalSeries.length > 0 ? signalSeries[signalSeries.length - 1] : null;
  const histogram = signal !== null ? line - signal : null;

  return { line, signal, histogram };
}

// ─── Public export ────────────────────────────────────────────────────────────

/**
 * Derive a full TechnicalIndicators snapshot from a sorted array of OHLC bars.
 *
 * Needs at least 200 bars for SMA-200; fewer bars degrade gracefully (null fields).
 * Typically called with 1Y of daily bars (~252 bars).
 */
export function computeTechnicals(symbol: string, bars: OHLCBar[]): TechnicalIndicators {
  const closes = bars.map(b => b.close);
  const { line, signal, histogram } = computeMACD(closes);

  return {
    symbol,
    timestamp: Date.now(),
    sma20: sma(closes, 20),
    sma50: sma(closes, 50),
    sma200: sma(closes, 200),
    ema12: ema(closes, 12),
    ema26: ema(closes, 26),
    rsi14: rsi14(closes),
    macdLine: line,
    macdSignal: signal,
    macdHistogram: histogram,
  };
}
