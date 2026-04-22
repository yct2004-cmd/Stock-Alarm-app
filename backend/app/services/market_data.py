from __future__ import annotations

import logging

import pandas as pd
import yfinance as yf

logger = logging.getLogger(__name__)


class MarketDataError(Exception):
    pass


def normalize_ticker(raw_ticker: str) -> str:
    ticker = raw_ticker.strip().upper()
    if not ticker:
        raise MarketDataError("Ticker is required.")
    return ticker


def _build_ticker(ticker: str) -> yf.Ticker:
    return yf.Ticker(ticker)


def validate_ticker(ticker: str) -> None:
    """
    Lightweight validity check by reading recent 1d history.
    If history is empty, treat ticker as invalid for this MVP.
    """
    tk = _build_ticker(ticker)
    try:
        history = tk.history(period="5d", interval="1d", auto_adjust=False)
    except Exception as exc:  # noqa: BLE001
        raise MarketDataError(f"Failed to validate ticker {ticker}: {exc}") from exc

    if history is None or history.empty:
        raise MarketDataError(f"Invalid ticker or no market data available: {ticker}")


def get_daily_closes(ticker: str, days: int = 90) -> pd.Series:
    tk = _build_ticker(ticker)
    try:
        # Daily close used for MA in all sessions (per requirement).
        history = tk.history(period=f"{days}d", interval="1d", auto_adjust=False)
    except Exception as exc:  # noqa: BLE001
        raise MarketDataError(f"Failed to fetch historical data for {ticker}: {exc}") from exc

    if history is None or history.empty or "Close" not in history.columns:
        raise MarketDataError(f"No daily close data found for {ticker}")

    closes = history["Close"].dropna()
    if closes.empty:
        raise MarketDataError(f"Daily close data is empty for {ticker}")
    return closes


def get_latest_price_by_session(ticker: str, session: str) -> float | None:
    """
    Session-aware latest price fetch with safe fallback.
    If session-specific value is missing, returns None and caller should skip trigger.
    """
    tk = _build_ticker(ticker)
    try:
        info = tk.info or {}
        fast_info = getattr(tk, "fast_info", None) or {}
    except Exception as exc:  # noqa: BLE001
        raise MarketDataError(f"Failed to fetch latest data for {ticker}: {exc}") from exc

    regular = info.get("regularMarketPrice") or fast_info.get("lastPrice")
    premarket = info.get("preMarketPrice")
    afterhours = info.get("postMarketPrice")

    if session == "regular":
        price = regular
    elif session == "premarket":
        price = premarket
    elif session == "afterhours":
        price = afterhours
    else:
        price = None

    if price is None:
        logger.warning(
            "Missing session price for ticker=%s session=%s; skip this run.",
            ticker,
            session,
        )
        return None

    try:
        return float(price)
    except (TypeError, ValueError):
        logger.warning(
            "Invalid session price for ticker=%s session=%s value=%s; skip this run.",
            ticker,
            session,
            price,
        )
        return None
