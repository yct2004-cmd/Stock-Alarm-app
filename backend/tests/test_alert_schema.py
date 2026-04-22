import pytest
from pydantic import ValidationError

from app.schemas import AlertCreate


def test_alert_create_ma_success():
    payload = AlertCreate(
        ticker="nvda",
        condition_type="ma",
        ma_window=20,
        monitor_premarket=False,
        monitor_regular=True,
        monitor_afterhours=False,
        is_enabled=True,
    )
    assert payload.ticker == "NVDA"
    assert payload.ma_window == 20


def test_alert_create_price_success():
    payload = AlertCreate(
        ticker="QQQ",
        condition_type="price",
        target_price=432.0,
        monitor_premarket=True,
        monitor_regular=True,
        monitor_afterhours=True,
        is_enabled=True,
    )
    assert payload.target_price == 432.0


def test_alert_create_invalid_condition_combination():
    with pytest.raises(ValidationError):
        AlertCreate(
            ticker="AAPL",
            condition_type="ma",
            target_price=100.0,
            monitor_premarket=False,
            monitor_regular=True,
            monitor_afterhours=False,
            is_enabled=True,
        )


def test_alert_create_requires_at_least_one_session():
    with pytest.raises(ValidationError):
        AlertCreate(
            ticker="AAPL",
            condition_type="price",
            target_price=100.0,
            monitor_premarket=False,
            monitor_regular=False,
            monitor_afterhours=False,
            is_enabled=True,
        )
