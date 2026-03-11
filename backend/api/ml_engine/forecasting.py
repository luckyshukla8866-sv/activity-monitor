"""
Productivity Forecasting.
Analyzes hourly patterns over the past N days and predicts
the user's most productive hours for tomorrow.
"""

from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Dict, Any, List

import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent.parent))
from api.models import ActivitySession
from api.ml_engine.classifier import classify_session


def get_hourly_productivity(
    db: Session,
    user_id: int,
    days: int = 7
) -> List[Dict[str, Any]]:
    """
    Calculate average productivity score for each hour (0-23)
    over the past `days` days.

    Returns a list of 24 entries:
        { hour, avg_score, avg_minutes, total_sessions, label }
    """
    start_date = datetime.utcnow() - timedelta(days=days)

    sessions = db.query(ActivitySession).filter(
        ActivitySession.user_id == user_id,
        ActivitySession.start_time >= start_date,
    ).all()

    # Accumulate per-hour data
    hourly = {}
    for h in range(24):
        hourly[h] = {"total_score": 0.0, "total_seconds": 0.0, "count": 0}

    for s in sessions:
        hour = s.start_time.hour
        dur = s.duration_seconds or 0
        c = classify_session(s.app_name, s.window_title or "")

        hourly[hour]["total_score"] += c["score"] * dur
        hourly[hour]["total_seconds"] += dur
        hourly[hour]["count"] += 1

    # Build result
    result = []
    for h in range(24):
        data = hourly[h]
        if data["total_seconds"] > 0:
            avg_score = round(data["total_score"] / data["total_seconds"])
            avg_minutes = round(data["total_seconds"] / (60 * days), 1)
        else:
            avg_score = 0
            avg_minutes = 0

        # Human-readable label
        if avg_score >= 80:
            label = "High Focus"
        elif avg_score >= 60:
            label = "Moderate"
        elif avg_score >= 30:
            label = "Mixed"
        elif avg_score > 0:
            label = "Low Focus"
        else:
            label = "Inactive"

        result.append({
            "hour": h,
            "hour_label": f"{h:02d}:00",
            "avg_score": avg_score,
            "avg_minutes": avg_minutes,
            "total_sessions": data["count"],
            "label": label,
        })

    return result


def predict_peak_hours(
    db: Session,
    user_id: int,
    days: int = 7
) -> Dict[str, Any]:
    """
    Predict the user's peak productive hours for tomorrow.

    Returns:
        {
            peak_hours: [...],       # top 3 most productive hours
            low_hours: [...],        # bottom 3 least productive hours
            predicted_score: int,    # expected overall score tomorrow
            hourly_data: [...],      # full 24-hour breakdown
            insight: str,            # human-readable summary
        }
    """
    hourly_data = get_hourly_productivity(db, user_id, days)

    # Find hours with actual activity
    active_hours = [h for h in hourly_data if h["avg_score"] > 0]

    if len(active_hours) < 3:
        return {
            "peak_hours": [],
            "low_hours": [],
            "predicted_score": 0,
            "hourly_data": hourly_data,
            "insight": "Not enough data yet. Use the system for a few days to get predictions.",
            "total_active_hours": 0,
        }

    # Sort by score to find peaks and lows
    sorted_by_score = sorted(active_hours, key=lambda x: x["avg_score"], reverse=True)
    peak_hours = sorted_by_score[:3]
    low_hours = sorted_by_score[-3:]

    # Predicted overall score = average of all active hours weighted by duration
    total_weighted = sum(h["avg_score"] * h["avg_minutes"] for h in active_hours)
    total_minutes = sum(h["avg_minutes"] for h in active_hours)
    predicted_score = round(total_weighted / total_minutes) if total_minutes > 0 else 0

    # Build insight message
    peak_labels = ", ".join(h["hour_label"] for h in peak_hours)
    low_labels = ", ".join(h["hour_label"] for h in low_hours)

    insight = (
        f"Your most productive hours are around {peak_labels}. "
        f"Schedule important tasks during these times. "
        f"Your least productive times are around {low_labels} — "
        f"consider using those for breaks or lighter work."
    )

    return {
        "peak_hours": [
            {"hour": h["hour"], "label": h["hour_label"], "score": h["avg_score"]}
            for h in peak_hours
        ],
        "low_hours": [
            {"hour": h["hour"], "label": h["hour_label"], "score": h["avg_score"]}
            for h in low_hours
        ],
        "predicted_score": predicted_score,
        "hourly_data": hourly_data,
        "insight": insight,
        "total_active_hours": round(total_minutes / 60, 1),
    }
