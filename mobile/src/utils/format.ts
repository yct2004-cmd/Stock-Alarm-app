/**
 * Formatting utilities for prices, percentages, large numbers, and dates.
 * All functions are pure and have no side effects.
 */

/** Format a dollar price with dynamic decimal places. */
export function formatPrice(price: number, currency = 'USD'): string {
  if (price === 0) return '$0.00';
  const decimals = price < 1 ? 4 : price < 10 ? 3 : 2;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(price);
}

/** Format a percentage, always including sign. */
export function formatPercent(pct: number, decimals = 2): string {
  const sign = pct >= 0 ? '+' : '';
  return `${sign}${pct.toFixed(decimals)}%`;
}

/** Format a dollar change with sign. */
export function formatChange(change: number, currency = 'USD'): string {
  const abs = formatPrice(Math.abs(change), currency);
  return change >= 0 ? `+${abs}` : `-${abs.replace('$', '$')}`;
}

/** Compact number format: 1.2B, 345.6M, 12.3K */
export function formatCompact(n: number): string {
  if (n === null || n === undefined) return '—';
  if (n >= 1e12) return `${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9)  return `${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6)  return `${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3)  return `${(n / 1e3).toFixed(1)}K`;
  return n.toFixed(0);
}

/** Format volume with compact suffix. */
export function formatVolume(v: number): string {
  return formatCompact(v);
}

/** Format market cap. */
export function formatMarketCap(mc: number | null): string {
  if (mc === null) return '—';
  return formatCompact(mc);
}

/** Format unix ms timestamp as "Apr 22, 2025" */
export function formatDate(ts: number): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(ts));
}

/** Format unix ms as time "9:32 AM" */
export function formatTime(ts: number): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(ts));
}

/** Format unix ms as "Apr 22, 9:32 AM" */
export function formatDateTime(ts: number): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(ts));
}

/** Relative time: "2 minutes ago", "3 days ago" */
export function formatRelativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(ts);
}

/** Clamp a number between min and max. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
