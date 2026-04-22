from __future__ import annotations

from datetime import datetime, time
from zoneinfo import ZoneInfo

from app.core.config import settings

PREMARKET = "premarket"
REGULAR = "regular"
AFTERHOURS = "afterhours"
CLOSED = "closed"


def get_market_session(now_utc: datetime | None = None) -> str:
    """
    Simplified US market session detection for MVP:
    - Weekdays only
    - premarket: 04:00-09:30 ET
    - regular: 09:30-16:00 ET
    - afterhours: 16:00-20:00 ET
    - otherwise: closed
    """
    if now_utc is None:
        now_utc = datetime.now(tz=ZoneInfo("UTC"))
    if now_utc.tzinfo is None:
        now_utc = now_utc.replace(tzinfo=ZoneInfo("UTC"))

    eastern_now = now_utc.astimezone(ZoneInfo(settings.timezone_market))
    if eastern_now.weekday() >= 5:  # 5=Saturday, 6=Sunday
        return CLOSED

    current_time = eastern_now.time()
    if time(4, 0) <= current_time < time(9, 30):
        return PREMARKET
    if time(9, 30) <= current_time < time(16, 0):
        return REGULAR
    if time(16, 0) <= current_time < time(20, 0):
        return AFTERHOURS
    return CLOSED
