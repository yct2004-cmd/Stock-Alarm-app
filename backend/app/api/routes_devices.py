import logging
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Device
from app.schemas import (
    DeviceRegisterRequest,
    DeviceRegisterResponse,
    DeviceTestPushRequest,
    DeviceTestPushResponse,
)
from app.services.notification import send_expo_push

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/devices", tags=["devices"])


@router.post(
    "/register",
    response_model=DeviceRegisterResponse,
    status_code=status.HTTP_201_CREATED,
)
def register_device(payload: DeviceRegisterRequest, db: Session = Depends(get_db)):
    token = payload.expo_push_token.strip()
    if not token.startswith("ExponentPushToken["):
        raise HTTPException(
            status_code=400,
            detail="Invalid Expo push token format.",
        )

    device = db.query(Device).filter(Device.expo_push_token == token).first()
    now = datetime.utcnow()
    if device:
        device.is_active = True
        device.last_seen_at = now
        try:
            db.commit()
            db.refresh(device)
            return device
        except SQLAlchemyError as exc:
            db.rollback()
            logger.exception("Failed to update device token: %s", exc)
            raise HTTPException(status_code=500, detail="Failed to register device.") from exc

    new_device = Device(
        expo_push_token=token,
        is_active=True,
        last_seen_at=now,
    )
    try:
        db.add(new_device)
        db.commit()
        db.refresh(new_device)
        return new_device
    except SQLAlchemyError as exc:
        db.rollback()
        logger.exception("Failed to create device token: %s", exc)
        raise HTTPException(status_code=500, detail="Failed to register device.") from exc


@router.post("/test-push", response_model=DeviceTestPushResponse)
def test_push(payload: DeviceTestPushRequest, db: Session = Depends(get_db)):
    devices = db.query(Device).filter(Device.is_active.is_(True)).all()
    if not devices:
        raise HTTPException(status_code=404, detail="No active devices found.")

    sent = 0
    for device in devices:
        ok = send_expo_push(
            token=device.expo_push_token,
            title=payload.title,
            body=payload.body,
            data={"type": "manual_test"},
        )
        if ok:
            sent += 1

    return DeviceTestPushResponse(attempted=len(devices), sent=sent)
