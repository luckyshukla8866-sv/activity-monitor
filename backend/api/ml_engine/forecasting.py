"""
Productivity Forecasting.
Analyzes hourly patterns over the past N days and predicts
the user's most productive hours for tomorrow.
"""

from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Dict, Any, List
import math
import random

import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent.parent))
from api.models import ActivitySession
from api.ml_engine.classifier import classify_session


def _mean(vals: List[float]) -> float:
    return sum(vals) / len(vals) if vals else 0.0


def _std(vals: List[float]) -> float:
    if len(vals) < 2:
        return 0.0
    avg = _mean(vals)
    return math.sqrt(sum((v - avg) ** 2 for v in vals) / len(vals))


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


# ═══════════════════════════════════════════════════════════════════════
# NEW: Weekly Activity Heatmap
# ═══════════════════════════════════════════════════════════════════════

def get_weekly_heatmap(
    db: Session,
    user_id: int,
    weeks: int = 4
) -> Dict[str, Any]:
    """
    Build a GitHub-contribution-style heatmap of activity intensity.

    Returns `weeks` × 7 grid entries, each with:
        { date, day_name, week_index, intensity (0-4), minutes, sessions }
    """
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    start_date = today - timedelta(days=weeks * 7 - 1)

    sessions = db.query(ActivitySession).filter(
        ActivitySession.user_id == user_id,
        ActivitySession.start_time >= start_date,
    ).all()

    # Bucket sessions per calendar day
    day_map: Dict[str, Dict] = {}
    for i in range(weeks * 7):
        d = start_date + timedelta(days=i)
        key = d.strftime("%Y-%m-%d")
        day_map[key] = {"minutes": 0.0, "sessions": 0}

    for s in sessions:
        key = s.start_time.strftime("%Y-%m-%d")
        if key in day_map:
            day_map[key]["minutes"] += (s.duration_seconds or 0) / 60
            day_map[key]["sessions"] += 1

    # Determine max for normalisation
    max_minutes = max((d["minutes"] for d in day_map.values()), default=1) or 1

    days_of_week = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    grid = []
    for i, (date_str, data) in enumerate(sorted(day_map.items())):
        dt = datetime.strptime(date_str, "%Y-%m-%d")
        ratio = data["minutes"] / max_minutes
        if data["minutes"] == 0:
            intensity = 0
        elif ratio < 0.25:
            intensity = 1
        elif ratio < 0.50:
            intensity = 2
        elif ratio < 0.75:
            intensity = 3
        else:
            intensity = 4

        grid.append({
            "date": date_str,
            "day_name": days_of_week[dt.weekday()],
            "week_index": i // 7,
            "day_index": dt.weekday(),
            "intensity": intensity,
            "minutes": round(data["minutes"], 1),
            "sessions": data["sessions"],
        })

    return {
        "grid": grid,
        "weeks": weeks,
        "max_minutes": round(max_minutes, 1),
        "total_days": weeks * 7,
    }


# ═══════════════════════════════════════════════════════════════════════
# NEW: 7-Day Focus Forecast (with confidence bands)
# ═══════════════════════════════════════════════════════════════════════

def get_focus_forecast(
    db: Session,
    user_id: int,
    history_days: int = 30
) -> Dict[str, Any]:
    """
    Predict the next 7 days' focus score using day-of-week weighted
    averages from the past `history_days`.

    Returns for each predicted day:
        { date, day_name, predicted_score, lower_bound, upper_bound }
    """
    now = datetime.utcnow()
    start_date = now - timedelta(days=history_days)

    sessions = db.query(ActivitySession).filter(
        ActivitySession.user_id == user_id,
        ActivitySession.start_time >= start_date,
    ).all()

    # Group scores by weekday (0=Mon..6=Sun)
    weekday_scores: Dict[int, List[float]] = {i: [] for i in range(7)}

    # Group by date first, then compute daily score
    daily_buckets: Dict[str, List] = {}
    for s in sessions:
        key = s.start_time.strftime("%Y-%m-%d")
        if key not in daily_buckets:
            daily_buckets[key] = []
        daily_buckets[key].append(s)

    for date_str, day_sessions in daily_buckets.items():
        dt = datetime.strptime(date_str, "%Y-%m-%d")
        total_weighted = 0.0
        total_dur = 0.0
        for s in day_sessions:
            c = classify_session(s.app_name, s.window_title or "")
            dur = s.duration_seconds or 0
            total_weighted += c["score"] * dur
            total_dur += dur
        if total_dur > 0:
            score = total_weighted / total_dur
            weekday_scores[dt.weekday()].append(score)

    # Build the 7-day forecast
    today = now.replace(hour=0, minute=0, second=0, microsecond=0)
    days_of_week = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    forecast = []

    for offset in range(1, 8):
        target = today + timedelta(days=offset)
        wd = target.weekday()
        scores = weekday_scores[wd]

        if scores:
            avg = round(_mean(scores))
            sd = _std(scores)
            lower = max(0, round(avg - sd))
            upper = min(100, round(avg + sd))
        else:
            # Fallback: use global average across all weekdays
            all_scores = [s for lst in weekday_scores.values() for s in lst]
            avg = round(_mean(all_scores)) if all_scores else 50
            lower = max(0, avg - 15)
            upper = min(100, avg + 15)

        forecast.append({
            "date": target.strftime("%Y-%m-%d"),
            "day_name": days_of_week[wd],
            "predicted_score": avg,
            "lower_bound": lower,
            "upper_bound": upper,
        })

    return {"forecast": forecast}


# ═══════════════════════════════════════════════════════════════════════
# NEW: App Category Trends (for horizontal bar chart)
# ═══════════════════════════════════════════════════════════════════════

def get_category_trends(
    db: Session,
    user_id: int,
    days: int = 30
) -> Dict[str, Any]:
    """
    Classify all sessions from the past `days` days into categories
    and return percentage breakdown + per-category top apps.
    """
    start_date = datetime.utcnow() - timedelta(days=days)

    sessions = db.query(ActivitySession).filter(
        ActivitySession.user_id == user_id,
        ActivitySession.start_time >= start_date,
    ).all()

    cat_data: Dict[str, Dict[str, Any]] = {
        "deep_work":     {"label": "Deep Work",     "seconds": 0, "apps": {}},
        "communication": {"label": "Communication", "seconds": 0, "apps": {}},
        "distraction":   {"label": "Distraction",   "seconds": 0, "apps": {}},
        "neutral":       {"label": "Neutral",       "seconds": 0, "apps": {}},
    }

    total_seconds = 0.0
    for s in sessions:
        c = classify_session(s.app_name, s.window_title or "")
        dur = s.duration_seconds or 0
        cat = c["category"]
        cat_data[cat]["seconds"] += dur
        total_seconds += dur
        # Track top apps per category
        apps = cat_data[cat]["apps"]
        apps[s.app_name] = apps.get(s.app_name, 0) + dur

    # Build result, sorted by percentage desc
    categories = []
    for cat_key, data in cat_data.items():
        pct = round((data["seconds"] / total_seconds) * 100, 1) if total_seconds > 0 else 0
        # Top 3 apps in this category
        sorted_apps = sorted(data["apps"].items(), key=lambda x: -x[1])[:3]
        top_apps = [
            {"name": name, "hours": round(secs / 3600, 1)}
            for name, secs in sorted_apps
        ]
        categories.append({
            "category": cat_key,
            "label": data["label"],
            "percentage": pct,
            "hours": round(data["seconds"] / 3600, 1),
            "top_apps": top_apps,
        })

    categories.sort(key=lambda x: -x["percentage"])

    return {
        "categories": categories,
        "total_hours": round(total_seconds / 3600, 1),
        "period_days": days,
    }
