import type { Alert, Quote, TechnicalIndicators, AlertTriggerEvent } from '../types/models';

/**
 * Alert evaluation engine.
 *
 * This runs client-side for demonstration. In production, this logic
 * should run server-side (Node.js cron worker or Python background job)
 * to ensure alerts fire even when the app is backgrounded.
 */

export function evaluateAlert(
  alert: Alert,
  quote: Quote,
  technicals: TechnicalIndicators | null,
): boolean {
  if (alert.status !== 'active') return false;
  if (alert.cooldownUntil && alert.cooldownUntil > Date.now()) return false;

  const { condition, threshold } = alert;
  const price = quote.price;

  switch (condition) {
    case 'price_above':
      return price > threshold;

    case 'price_below':
      return price < threshold;

    case 'percent_change_up':
      return quote.changePercent >= threshold;

    case 'percent_change_down':
      return quote.changePercent <= -Math.abs(threshold);

    case 'volume_spike':
      return quote.volume >= quote.avgVolume * threshold;

    case 'sma_crossover_above':
      return technicals?.sma20 !== null && technicals?.sma20 !== undefined
        ? price > technicals.sma20
        : false;

    case 'sma_crossover_below':
      return technicals?.sma20 !== null && technicals?.sma20 !== undefined
        ? price < technicals.sma20
        : false;

    case 'rsi_above':
      return technicals?.rsi14 !== null && technicals?.rsi14 !== undefined
        ? technicals.rsi14 > threshold
        : false;

    case 'rsi_below':
      return technicals?.rsi14 !== null && technicals?.rsi14 !== undefined
        ? technicals.rsi14 < threshold
        : false;

    case 'macd_crossover_bullish':
      return (
        technicals?.macdLine !== null &&
        technicals?.macdLine !== undefined &&
        technicals?.macdSignal !== null &&
        technicals?.macdSignal !== undefined &&
        technicals.macdLine > technicals.macdSignal
      );

    case 'macd_crossover_bearish':
      return (
        technicals?.macdLine !== null &&
        technicals?.macdLine !== undefined &&
        technicals?.macdSignal !== null &&
        technicals?.macdSignal !== undefined &&
        technicals.macdLine < technicals.macdSignal
      );

    default:
      return false;
  }
}

export function buildTriggerEvent(
  alert: Alert,
  quote: Quote,
): AlertTriggerEvent {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    alertId: alert.id,
    symbol: alert.symbol,
    condition: alert.condition,
    threshold: alert.threshold,
    triggerPrice: quote.price,
    triggeredAt: Date.now(),
  };
}

/** Returns human-readable trigger summary for notification body. */
export function describeTrigger(alert: Alert, triggerPrice: number): string {
  const price = `$${triggerPrice.toFixed(2)}`;
  switch (alert.condition) {
    case 'price_above': return `${alert.symbol} rose above $${alert.threshold} — now ${price}`;
    case 'price_below': return `${alert.symbol} fell below $${alert.threshold} — now ${price}`;
    case 'percent_change_up': return `${alert.symbol} is up ${alert.threshold}%+ today — ${price}`;
    case 'percent_change_down': return `${alert.symbol} is down ${alert.threshold}%+ today — ${price}`;
    case 'volume_spike': return `${alert.symbol} volume spike detected — ${price}`;
    case 'rsi_above': return `${alert.symbol} RSI above ${alert.threshold} — ${price}`;
    case 'rsi_below': return `${alert.symbol} RSI below ${alert.threshold} — ${price}`;
    case 'sma_crossover_above': return `${alert.symbol} crossed above SMA — ${price}`;
    case 'sma_crossover_below': return `${alert.symbol} crossed below SMA — ${price}`;
    case 'macd_crossover_bullish': return `${alert.symbol} MACD bullish crossover — ${price}`;
    case 'macd_crossover_bearish': return `${alert.symbol} MACD bearish crossover — ${price}`;
    default: return `${alert.symbol} alert triggered — ${price}`;
  }
}
