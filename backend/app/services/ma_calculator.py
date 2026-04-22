from __future__ import annotations

import pandas as pd


def calculate_sma(closes: pd.Series, window: int) -> float | None:
    if closes is None or closes.empty or len(closes) < window:
        return None
    value = closes.tail(window).mean()
    return float(round(value, 4))


def calculate_standard_ma(closes: pd.Series) -> dict[str, float | None]:
    return {
        "ma5": calculate_sma(closes, 5),
        "ma10": calculate_sma(closes, 10),
        "ma20": calculate_sma(closes, 20),
        "ma30": calculate_sma(closes, 30),
        "ma60": calculate_sma(closes, 60),
    }
