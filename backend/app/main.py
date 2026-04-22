from __future__ import annotations

import logging
import asyncio

from fastapi import FastAPI

from app.api.routes_alerts import router as alerts_router
from app.api.routes_devices import router as devices_router
from app.api.routes_market import router as market_router
from app.core.config import settings
from app.database import Base, engine
from app import models  # noqa: F401
from app.jobs.poll_alerts import run_polling_loop

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)

app = FastAPI(title=settings.app_name)
app.include_router(market_router, prefix=settings.api_prefix)
app.include_router(alerts_router, prefix=settings.api_prefix)
app.include_router(devices_router, prefix=settings.api_prefix)

poller_stop_event = asyncio.Event()
poller_task: asyncio.Task | None = None


@app.on_event("startup")
async def on_startup():
    global poller_task
    Base.metadata.create_all(bind=engine)
    poller_stop_event.clear()
    poller_task = asyncio.create_task(run_polling_loop(poller_stop_event))


@app.on_event("shutdown")
async def on_shutdown():
    global poller_task
    poller_stop_event.set()
    if poller_task:
        await poller_task


@app.get("/health")
def health_check():
    return {"status": "ok"}
