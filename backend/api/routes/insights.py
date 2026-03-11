"""
ML Insights API routes.
Provides endpoints for productivity classification, burnout detection,
and productivity forecasting.
"""

from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional
import csv
import io
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent.parent))
from api.database import get_db
from api.models import User, ActivitySession
from api.auth import get_optional_user
from api.ml_engine.classifier import get_productivity_summary
from api.ml_engine.anomaly import detect_burnout
from api.ml_engine.forecasting import predict_peak_hours

router = APIRouter(prefix="/api/insights", tags=["insights"])


@router.get("/productivity")
async def get_productivity_insights(
    days: int = 7,
    current_user: User = Depends(get_optional_user),
    db: Session = Depends(get_db),
):
    """
    Get productivity classification and scoring.

    Returns category breakdown (Deep Work, Communication, Distraction),
    overall productivity score (0-100), and per-app scores.
    """
    return get_productivity_summary(db, current_user.id, days)


@router.get("/burnout")
async def get_burnout_analysis(
    current_user: User = Depends(get_optional_user),
    db: Session = Depends(get_db),
):
    """
    Get burnout risk analysis.

    Returns risk level (LOW/MEDIUM/HIGH), warnings, daily work data,
    and recommendations.
    """
    return detect_burnout(db, current_user.id)


@router.get("/forecast")
async def get_forecast(
    days: int = 7,
    current_user: User = Depends(get_optional_user),
    db: Session = Depends(get_db),
):
    """
    Get productivity forecast.

    Returns predicted peak hours, hourly heatmap data,
    and a human-readable insight summary.
    """
    return predict_peak_hours(db, current_user.id, days)


@router.post("/upload")
async def upload_csv(
    file: UploadFile = File(...),
    current_user: User = Depends(get_optional_user),
    db: Session = Depends(get_db),
):
    """
    Upload a CSV file of activity data.

    Expected columns: app_name, window_title, start_time, end_time, duration_seconds
    Optional columns: mouse_clicks, key_presses

    start_time and end_time should be in ISO format (e.g. 2026-03-10T09:30:00).
    """
    if not file.filename or not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Please upload a .csv file.")

    try:
        contents = await file.read()
        text = contents.decode("utf-8")
        reader = csv.DictReader(io.StringIO(text))

        required_cols = {"app_name", "start_time", "duration_seconds"}
        if not required_cols.issubset(set(reader.fieldnames or [])):
            raise HTTPException(
                status_code=400,
                detail=f"CSV must have columns: {', '.join(required_cols)}. Found: {', '.join(reader.fieldnames or [])}",
            )

        created = 0
        for row in reader:
            try:
                start_time = datetime.fromisoformat(row["start_time"].strip())
                end_time_str = row.get("end_time", "").strip()
                end_time = datetime.fromisoformat(end_time_str) if end_time_str else None
                duration = float(row["duration_seconds"])

                session = ActivitySession(
                    user_id=current_user.id,
                    app_name=row["app_name"].strip(),
                    window_title=row.get("window_title", "").strip(),
                    process_id=None,
                    start_time=start_time,
                    end_time=end_time,
                    duration_seconds=duration,
                    mouse_clicks=int(row.get("mouse_clicks", 0) or 0),
                    key_presses=int(row.get("key_presses", 0) or 0),
                )
                db.add(session)
                created += 1
            except (ValueError, KeyError) as e:
                continue  # Skip malformed rows

        db.commit()
        return {
            "success": True,
            "message": f"Successfully imported {created} sessions.",
            "sessions_created": created,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process CSV: {str(e)}")
