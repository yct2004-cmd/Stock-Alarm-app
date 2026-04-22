from __future__ import annotations

import asyncio
import logging
from datetime import datetime, timezone

from sqlalchemy.exc import SQLAlchemyError

from app.core.config import settings
from app.core.market_session import CLOSED, get_market_session
from app.database import SessionLocal
from app.models import Alert
from app.services.alert_engine import process_alert

logger = logging.getLogger(__name__)


async def run_polling_loop(stop_event: asyncio.Event) -> None:
    """
    Poll enabled alerts every configured interval.
    """
    logger.info("Polling loop started. interval=%ss", settings.poll_interval_seconds)
    while not stop_event.is_set():
        started_at = datetime.now(timezone.utc)
        session = get_market_session(started_at)
        if session == CLOSED:
            logger.info("Market closed. Skip this poll cycle.")
        else:
            db = SessionLocal()
            try:
                alerts = db.query(Alert).filter(Alert.is_enabled.is_(True)).all()
                logger.info("Polling %s enabled alerts in session=%s", len(alerts), session)
                for alert in alerts:
                    process_alert(alert=alert, session=session, now_utc=started_at, db=db)
                db.commit()
            except SQLAlchemyError as exc:
                db.rollback()
                logger.exception("Database error during polling: %s", exc)
            except Exception as exc:  # noqa: BLE001
                db.rollback()
                logger.exception("Unexpected polling error: %s", exc)
            finally:
                db.close()

        try:
            await asyncio.wait_for(stop_event.wait(), timeout=settings.poll_interval_seconds)
        except asyncio.TimeoutError:
            continue

    logger.info("Polling loop stopped.")
