from fastapi import APIRouter, HTTPException

from app.core.market_session import CLOSED, get_market_session
from app.schemas import MAValues, MarketTickerResponse
from app.services.ma_calculator import calculate_standard_ma
from app.services.market_data import (
    MarketDataError,
    get_daily_closes,
    get_latest_price_by_session,
    normalize_ticker,
    validate_ticker,
)

router = APIRouter(prefix="/market", tags=["market"])


@router.get("/ticker/{ticker}", response_model=MarketTickerResponse)
def get_ticker_market_data(ticker: str):
    try:
        normalized = normalize_ticker(ticker)
        validate_ticker(normalized)
        closes = get_daily_closes(normalized, days=120)
    except MarketDataError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    market_session = get_market_session()
    current_price = None
    if market_session != CLOSED:
        try:
            current_price = get_latest_price_by_session(normalized, market_session)
        except MarketDataError as exc:
            raise HTTPException(status_code=502, detail=str(exc)) from exc

    ma = calculate_standard_ma(closes)
    return MarketTickerResponse(
        ticker=normalized,
        market_session=market_session,
        current_price=current_price,
        ma=MAValues(**ma),
        data_source="yfinance",
    )
