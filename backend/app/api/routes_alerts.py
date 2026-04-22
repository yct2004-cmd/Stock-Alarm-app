import logging

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Alert
from app.schemas import AlertCreate, AlertResponse, AlertToggleRequest
from app.services.market_data import MarketDataError, validate_ticker

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/alerts", tags=["alerts"])


@router.post("", response_model=AlertResponse, status_code=status.HTTP_201_CREATED)
def create_alert(payload: AlertCreate, db: Session = Depends(get_db)):
    try:
        validate_ticker(payload.ticker)
    except MarketDataError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    alert = Alert(
        ticker=payload.ticker,
        condition_type=payload.condition_type,
        ma_window=payload.ma_window,
        target_price=payload.target_price,
        monitor_premarket=payload.monitor_premarket,
        monitor_regular=payload.monitor_regular,
        monitor_afterhours=payload.monitor_afterhours,
        is_enabled=payload.is_enabled,
    )
    try:
        db.add(alert)
        db.commit()
        db.refresh(alert)
        return alert
    except SQLAlchemyError as exc:
        db.rollback()
        logger.exception("Failed to create alert: %s", exc)
        raise HTTPException(status_code=500, detail="Failed to create alert.") from exc


@router.get("", response_model=list[AlertResponse])
def list_alerts(db: Session = Depends(get_db)):
    alerts = db.query(Alert).order_by(Alert.created_at.desc()).all()
    return alerts


@router.patch("/{alert_id}/toggle", response_model=AlertResponse)
def toggle_alert(alert_id: int, payload: AlertToggleRequest, db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found.")

    alert.is_enabled = payload.is_enabled
    try:
        db.commit()
        db.refresh(alert)
        return alert
    except SQLAlchemyError as exc:
        db.rollback()
        logger.exception("Failed to toggle alert id=%s: %s", alert_id, exc)
        raise HTTPException(status_code=500, detail="Failed to update alert.") from exc


@router.delete("/{alert_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_alert(alert_id: int, db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found.")

    try:
        db.delete(alert)
        db.commit()
    except SQLAlchemyError as exc:
        db.rollback()
        logger.exception("Failed to delete alert id=%s: %s", alert_id, exc)
        raise HTTPException(status_code=500, detail="Failed to delete alert.") from exc
