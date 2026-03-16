"""
Burnout & Anomaly Detection.
Detects unhealthy work patterns using statistical analysis (Z-score)
and input density metrics.
"""

from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from typing import Dict, Any, List
import math

import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent.parent))
from api.models import ActivitySession


def _calculate_daily_hours(
    db: Session,
    user_id: int,
    days: int = 14
) -> List[Dict[str, Any]]:
    """
    Calculate total active hours for each of the past `days` days.
    Returns a list of { date, hours, sessions, first_active, last_active }.
    """
    results = []
    now = datetime.utcnow()

    for i in range(days):
        day = now - timedelta(days=i)
        day_start = day.replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day.replace(hour=23, minute=59, second=59, microsecond=999999)

        sessions = db.query(ActivitySession).filter(
            ActivitySession.user_id == user_id,
            ActivitySession.start_time >= day_start,
            ActivitySession.start_time <= day_end,
        ).all()

        total_seconds = sum(s.duration_seconds or 0 for s in sessions)
        total_clicks = sum((s.mouse_clicks or 0) for s in sessions)
        total_keys = sum((s.key_presses or 0) for s in sessions)

        first_active = None
        last_active = None
        if sessions:
            sorted_sessions = sorted(sessions, key=lambda s: s.start_time)
            first_active = sorted_sessions[0].start_time.strftime("%H:%M")
            last_s = sorted_sessions[-1]
            end_t = last_s.end_time or last_s.start_time
            last_active = end_t.strftime("%H:%M")

        results.append({
            "date": day_start.strftime("%Y-%m-%d"),
            "hours": round(total_seconds / 3600, 2),
            "sessions": len(sessions),
            "total_inputs": total_clicks + total_keys,
            "first_active": first_active,
            "last_active": last_active,
        })

    return list(reversed(results))  # oldest first


def _mean(values: List[float]) -> float:
    return sum(values) / len(values) if values else 0


def _std_dev(values: List[float]) -> float:
    if len(values) < 2:
        return 0
    avg = _mean(values)
    variance = sum((v - avg) ** 2 for v in values) / len(values)
    return math.sqrt(variance)


def detect_burnout(
    db: Session,
    user_id: int,
    days: int = 14
) -> Dict[str, Any]:
    """
    Analyze work patterns and detect burnout risk.

    Checks:
    1. Z-score of recent daily hours (are you working way more than usual?)
    2. Late-night work detection (working after 10 PM)
    3. Input density (low inputs despite high hours = passive/fatigued)
    4. Trending increase in hours (overwork trajectory)
    """
    daily_data = _calculate_daily_hours(db, user_id, days)

    # Filter days with activity
    active_days = [d for d in daily_data if d["hours"] > 0]

    if len(active_days) < 3:
        return {
            "score": 0.0,
            "level": "low",
            "message": "Not enough active data to analyze your patterns fully (need at least 3 active days). Check back as you use the application more!"
        }

    hours_list = [d["hours"] for d in active_days]
    avg_hours = _mean(hours_list)
    std_hours = _std_dev(hours_list)
    latest_hours = hours_list[-1] if hours_list else 0

    warnings = []
    risk_score = 0  # 0-100

    # --- Check 1: Z-score of latest day ---
    if std_hours > 0:
        z_score = (latest_hours - avg_hours) / std_hours
        if z_score > 2.0:
            risk_score += 35
            warnings.append({
                "type": "extreme_hours",
                "severity": "high",
                "message": f"Your latest day ({latest_hours:.1f}h) is significantly above your average ({avg_hours:.1f}h).",
            })
        elif z_score > 1.0:
            risk_score += 15
            warnings.append({
                "type": "above_average",
                "severity": "medium",
                "message": f"Your latest day ({latest_hours:.1f}h) is above your average ({avg_hours:.1f}h).",
            })

    # --- Check 2: Consistently long days ---
    long_days = sum(1 for h in hours_list[-7:] if h > 10)
    if long_days >= 3:
        risk_score += 25
        warnings.append({
            "type": "long_days",
            "severity": "high",
            "message": f"You worked over 10 hours on {long_days} of the last 7 days.",
        })

    # --- Check 3: Late-night work ---
    late_nights = 0
    for d in active_days[-7:]:
        if d["last_active"] and d["last_active"] > "22:00":
            late_nights += 1
    if late_nights >= 3:
        risk_score += 20
        warnings.append({
            "type": "late_nights",
            "severity": "medium",
            "message": f"You worked past 10 PM on {late_nights} of the last 7 days.",
        })

    # --- Check 4: Increasing trend ---
    if len(hours_list) >= 5:
        first_half = _mean(hours_list[:len(hours_list)//2])
        second_half = _mean(hours_list[len(hours_list)//2:])
        if second_half > first_half * 1.3:
            risk_score += 15
            warnings.append({
                "type": "increasing_trend",
                "severity": "medium",
                "message": f"Your working hours are trending up ({first_half:.1f}h → {second_half:.1f}h avg).",
            })

    # --- Check 5: Low input density (fatigue indicator) ---
    recent_days = active_days[-5:]
    for d in recent_days:
        if d["hours"] > 4 and d["total_inputs"] < 100:
            risk_score += 5
            warnings.append({
                "type": "low_inputs",
                "severity": "low",
                "message": f"On {d['date']}, you were active {d['hours']}h but had very few inputs — possible fatigue.",
            })

    # Clamp risk_score
    score = float(min(risk_score, 100))

    # Determine risk level and message (0-40: low, 41-70: medium, 71+: high)
    if score > 70:
        level = "high"
        message = "Your work patterns indicate a high risk of burnout. It's crucial to take immediate time off and rest to recover."
    elif score > 40:
        level = "medium"
        message = "You are showing moderate signs of fatigue. Consider setting stricter boundaries and taking regular breaks."
    else:
        level = "low"
        message = "Your work patterns look healthy and sustainable. Keep maintaining this good balance!"

    return {
        "score": score,
        "level": level,
        "message": message
    }
