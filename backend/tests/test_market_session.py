from datetime import datetime, timezone

from app.core.market_session import get_market_session


def test_weekday_regular_session():
    # Monday 14:00 ET (18:00 UTC) should be regular session.
    now_utc = datetime(2026, 4, 20, 18, 0, tzinfo=timezone.utc)
    assert get_market_session(now_utc) == "regular"


def test_weekday_premarket_session():
    # Monday 06:00 ET (10:00 UTC) should be premarket session.
    now_utc = datetime(2026, 4, 20, 10, 0, tzinfo=timezone.utc)
    assert get_market_session(now_utc) == "premarket"


def test_weekend_closed_session():
    # Saturday should always be closed in MVP rules.
    now_utc = datetime(2026, 4, 18, 15, 0, tzinfo=timezone.utc)
    assert get_market_session(now_utc) == "closed"
