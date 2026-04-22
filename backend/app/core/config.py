from pydantic import BaseModel


class Settings(BaseModel):
    app_name: str = "Stock Alarm MVP"
    api_prefix: str = "/api/v1"
    timezone_market: str = "US/Eastern"
    sqlite_url: str = "sqlite:///./stock_alarm.db"
    poll_interval_seconds: int = 300
    alert_cooldown_hours: int = 24
    expo_push_url: str = "https://exp.host/--/api/v2/push/send"
    expo_push_timeout_seconds: int = 10


settings = Settings()
