from __future__ import annotations

import logging
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.core.config import settings
from app.models import Alert, Device
from app.services.ma_calculator import calculate_sma
from app.services.market_data import (
    MarketDataError,
    get_daily_closes,
    get_latest_price_by_session,
)
from app.services.notification import build_alert_message, send_expo_push

logger = logging.getLogger(__name__)


def is_alert_session_enabled(alert: Alert, session: str) -> bool:
    if session == "premarket":
        return alert.monitor_premarket
    if session == "regular":
        return alert.monitor_regular
    if session == "afterhours":
        return alert.monitor_afterhours
    return False


def is_in_cooldown(alert: Alert, now_utc: datetime) -> bool:
    return bool(alert.cooldown_until and now_utc < alert.cooldown_until.replace(tzinfo=timezone.utc))


def resolve_threshold(alert: Alert) -> float | None:
    if alert.condition_type == "price":
        return float(alert.target_price) if alert.target_price is not None else None

    if alert.condition_type == "ma":
        if not alert.ma_window:
            return None
        closes = get_daily_closes(alert.ticker, days=120)
        return calculate_sma(closes, alert.ma_window)

    return None


def process_alert(alert: Alert, session: str, now_utc: datetime, db: Session) -> None:
    if not alert.is_enabled:
        return
    if not is_alert_session_enabled(alert, session):
        return
    if is_in_cooldown(alert, now_utc):
        return

    try:
        current_price = get_latest_price_by_session(alert.ticker, session)
        if current_price is None:
            return
        threshold = resolve_threshold(alert)
    except MarketDataError as exc:
        logger.warning("Skip alert id=%s ticker=%s due to market error: %s", alert.id, alert.ticker, exc)
        return
    except Exception as exc:  # noqa: BLE001
        logger.exception("Unexpected alert processing error id=%s: %s", alert.id, exc)
        return

    if threshold is None:
        logger.warning("Skip alert id=%s: threshold unavailable", alert.id)
        return

    if current_price > threshold:
        return

    devices = db.query(Device).filter(Device.is_active.is_(True)).all()
    if not devices:
        logger.info("Alert triggered but no active devices. alert_id=%s", alert.id)
        return

    title, body = build_alert_message(
        ticker=alert.ticker,
        current_price=current_price,
        threshold=threshold,
        condition_type=alert.condition_type,
        session=session,
        ma_window=alert.ma_window,
    )

    sent_count = 0
    for device in devices:
        sent = send_expo_push(
            token=device.expo_push_token,
            title=title,
            body=body,
            data={
                "alert_id": alert.id,
                "ticker": alert.ticker,
                "session": session,
                "current_price": current_price,
                "threshold": threshold,
            },
        )
        if sent:
            sent_count += 1

    if sent_count == 0:
        logger.warning("Alert condition met but push failed for all devices. alert_id=%s", alert.id)
        return

    alert.last_triggered_at = now_utc.replace(tzinfo=None)
    alert.last_triggered_price = current_price
    alert.cooldown_until = (now_utc + timedelta(hours=settings.alert_cooldown_hours)).replace(
        tzinfo=None
    )
    logger.info(
        "Alert triggered id=%s ticker=%s session=%s price=%.4f threshold=%.4f devices=%s",
        alert.id,
        alert.ticker,
        session,
        current_price,
        threshold,
        sent_count,
    )
