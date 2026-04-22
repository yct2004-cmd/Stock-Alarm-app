from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field, field_validator, model_validator


class MAValues(BaseModel):
    ma5: float | None = Field(default=None)
    ma10: float | None = Field(default=None)
    ma20: float | None = Field(default=None)
    ma30: float | None = Field(default=None)
    ma60: float | None = Field(default=None)


class MarketTickerResponse(BaseModel):
    ticker: str
    market_session: str
    current_price: float | None
    ma: MAValues
    data_source: str = "yfinance"


AllowedMAWindow = Literal[5, 10, 20, 30, 60]
ConditionTypeLiteral = Literal["ma", "price"]


class AlertCreate(BaseModel):
    ticker: str = Field(min_length=1, max_length=32)
    condition_type: ConditionTypeLiteral
    ma_window: AllowedMAWindow | None = None
    target_price: float | None = Field(default=None, gt=0)
    monitor_premarket: bool = False
    monitor_regular: bool = True
    monitor_afterhours: bool = False
    is_enabled: bool = True

    @field_validator("ticker")
    @classmethod
    def normalize_ticker(cls, value: str) -> str:
        return value.strip().upper()

    @model_validator(mode="after")
    def validate_condition_fields(self):
        if self.condition_type == "ma":
            if self.ma_window is None:
                raise ValueError("ma_window is required when condition_type is 'ma'.")
            if self.target_price is not None:
                raise ValueError("target_price must be empty when condition_type is 'ma'.")
        if self.condition_type == "price":
            if self.target_price is None:
                raise ValueError(
                    "target_price is required when condition_type is 'price'."
                )
            if self.ma_window is not None:
                raise ValueError("ma_window must be empty when condition_type is 'price'.")

        if not (self.monitor_premarket or self.monitor_regular or self.monitor_afterhours):
            raise ValueError("At least one session must be enabled for monitoring.")
        return self


class AlertToggleRequest(BaseModel):
    is_enabled: bool


class AlertResponse(BaseModel):
    id: int
    ticker: str
    condition_type: ConditionTypeLiteral
    ma_window: AllowedMAWindow | None = None
    target_price: float | None = None
    monitor_premarket: bool
    monitor_regular: bool
    monitor_afterhours: bool
    is_enabled: bool
    last_triggered_at: datetime | None = None
    last_triggered_price: float | None = None
    cooldown_until: datetime | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class DeviceRegisterRequest(BaseModel):
    expo_push_token: str = Field(min_length=10, max_length=255)


class DeviceRegisterResponse(BaseModel):
    id: int
    expo_push_token: str
    is_active: bool
    last_seen_at: datetime
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class DeviceTestPushRequest(BaseModel):
    title: str = Field(min_length=1, max_length=120)
    body: str = Field(min_length=1, max_length=500)


class DeviceTestPushResponse(BaseModel):
    attempted: int
    sent: int
