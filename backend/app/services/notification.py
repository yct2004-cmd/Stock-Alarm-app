from __future__ import annotations

import json
import logging
from urllib import error, request

from app.core.config import settings

logger = logging.getLogger(__name__)


def _post_json(url: str, payload: dict, timeout_seconds: int) -> tuple[int, str]:
    req = request.Request(
        url=url,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
        method="POST",
    )
    with request.urlopen(req, timeout=timeout_seconds) as response:  # noqa: S310
        status = response.getcode()
        body = response.read().decode("utf-8")
    return status, body


def build_alert_message(
    ticker: str,
    current_price: float,
    threshold: float,
    condition_type: str,
    session: str,
    ma_window: int | None = None,
) -> tuple[str, str]:
    session_label = {
        "premarket": "盘前",
        "regular": "盘中",
        "afterhours": "盘后",
    }.get(session, session)

    if condition_type == "ma" and ma_window:
        title = f"🚨 提醒：{ticker} 已触发 MA{ma_window}"
        body = (
            f"{ticker} 当前{session_label}价格 ${current_price:.2f} <= MA{ma_window} "
            f"${threshold:.2f}"
        )
    else:
        title = f"🚨 提醒：{ticker} 已触发价格线"
        body = (
            f"{ticker} 当前{session_label}价格 ${current_price:.2f} <= "
            f"目标价 ${threshold:.2f}"
        )
    return title, body


def send_expo_push(token: str, title: str, body: str, data: dict | None = None) -> bool:
    payload = {
        "to": token,
        "sound": "default",
        "title": title,
        "body": body,
        "data": data or {},
    }
    try:
        status, response_body = _post_json(
            settings.expo_push_url,
            payload,
            timeout_seconds=settings.expo_push_timeout_seconds,
        )
    except error.URLError as exc:
        logger.error("Expo push request failed: %s", exc)
        return False
    except Exception as exc:  # noqa: BLE001
        logger.exception("Unexpected Expo push error: %s", exc)
        return False

    if status < 200 or status >= 300:
        logger.error("Expo push failed with HTTP %s: %s", status, response_body)
        return False

    logger.info("Expo push sent: %s", response_body)
    return True


def send_telegram_message(*_args, **_kwargs) -> bool:
    """
    Placeholder for future Telegram Bot integration.
    """
    logger.info("Telegram integration not enabled in MVP.")
    return False
