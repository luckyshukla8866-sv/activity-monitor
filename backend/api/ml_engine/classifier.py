"""
Smart Activity Classifier.
Categorizes sessions as Deep Work, Communication, or Distraction
and calculates a Productivity Score (0-100).
"""

from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from typing import List, Dict, Any

import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent.parent))
from api.models import ActivitySession


# ---------------------------------------------------------------------------
# Category rules: keyword → (category, base_score)
# ---------------------------------------------------------------------------
DEEP_WORK_KEYWORDS = [
    "code", "vscode", "visual studio", "intellij", "pycharm", "sublime",
    "terminal", "powershell", "cmd", "git", "github", "gitlab", "bitbucket",
    "jupyter", "notebook", "postman", "figma", "photoshop", "illustrator",
    "notepad", "vim", "emacs", "docker", "stack overflow", "stackoverflow",
    "docs", "documentation", "notion", "obsidian", "trello", "jira",
    "asana", "linear", "confluence", "google docs", "google sheets",
    "excel", "word", "powerpoint", "libreoffice",
]

COMMUNICATION_KEYWORDS = [
    "teams", "slack", "zoom", "meet", "skype", "discord",
    "outlook", "gmail", "mail", "email", "thunderbird",
    "whatsapp", "telegram", "messenger", "chat",
    "meeting", "call", "conference",
]

DISTRACTION_KEYWORDS = [
    "youtube", "netflix", "twitch", "tiktok", "hulu", "disney",
    "twitter", "x.com", "instagram", "facebook", "reddit", "pinterest",
    "snapchat", "tumblr", "9gag",
    "game", "steam", "epic games", "minecraft", "fortnite", "valorant",
    "spotify", "music", "apple music",
    "amazon shopping", "flipkart", "ebay",
]


def classify_session(app_name: str, window_title: str = "") -> Dict[str, Any]:
    """
    Classify a single session into a category.

    Returns:
        { "category": str, "score": int, "label": str }
    """
    combined = f"{app_name} {window_title}".lower()

    # Check Deep Work first (highest priority)
    for kw in DEEP_WORK_KEYWORDS:
        if kw in combined:
            return {"category": "deep_work", "score": 90, "label": "Deep Work"}

    # Check Distraction
    for kw in DISTRACTION_KEYWORDS:
        if kw in combined:
            return {"category": "distraction", "score": 10, "label": "Distraction"}

    # Check Communication
    for kw in COMMUNICATION_KEYWORDS:
        if kw in combined:
            return {"category": "communication", "score": 60, "label": "Communication"}

    # Default: Neutral activity
    return {"category": "neutral", "score": 50, "label": "Neutral"}


def get_productivity_summary(
    db: Session,
    user_id: int,
    days: int = 7
) -> Dict[str, Any]:
    """
    Analyze all sessions over `days` and return a full productivity summary.
    """
    start_date = datetime.utcnow() - timedelta(days=days)

    sessions = db.query(ActivitySession).filter(
        ActivitySession.user_id == user_id,
        ActivitySession.start_time >= start_date,
    ).all()

    if not sessions:
        return {
            "productivity_score": 0,
            "total_hours": 0,
            "deep_work_hours": 0,
            "communication_hours": 0,
            "distraction_hours": 0,
            "neutral_hours": 0,
            "category_breakdown": [],
            "app_scores": [],
            "total_sessions": 0,
        }

    # Classify each session and accumulate time
    category_seconds = {
        "deep_work": 0,
        "communication": 0,
        "distraction": 0,
        "neutral": 0,
    }
    app_data: Dict[str, Dict] = {}  # app_name → { seconds, score, category }

    total_weighted_score = 0.0
    total_seconds = 0.0

    for s in sessions:
        c = classify_session(s.app_name, s.window_title or "")
        dur = s.duration_seconds or 0

        category_seconds[c["category"]] += dur
        total_weighted_score += c["score"] * dur
        total_seconds += dur

        if s.app_name not in app_data:
            app_data[s.app_name] = {
                "seconds": 0,
                "score": c["score"],
                "category": c["label"],
            }
        app_data[s.app_name]["seconds"] += dur

    overall_score = round(total_weighted_score / total_seconds) if total_seconds > 0 else 0

    # Build per-category breakdown
    category_breakdown = []
    for cat, secs in category_seconds.items():
        label = cat.replace("_", " ").title()
        pct = round((secs / total_seconds) * 100, 1) if total_seconds > 0 else 0
        category_breakdown.append({
            "category": cat,
            "label": label,
            "hours": round(secs / 3600, 2),
            "percentage": pct,
        })

    # Build per-app scores, sorted by duration
    app_scores = sorted(
        [
            {
                "app_name": name,
                "hours": round(data["seconds"] / 3600, 2),
                "score": data["score"],
                "category": data["category"],
            }
            for name, data in app_data.items()
        ],
        key=lambda x: x["hours"],
        reverse=True,
    )

    return {
        "productivity_score": overall_score,
        "total_hours": round(total_seconds / 3600, 2),
        "deep_work_hours": round(category_seconds["deep_work"] / 3600, 2),
        "communication_hours": round(category_seconds["communication"] / 3600, 2),
        "distraction_hours": round(category_seconds["distraction"] / 3600, 2),
        "neutral_hours": round(category_seconds["neutral"] / 3600, 2),
        "category_breakdown": category_breakdown,
        "app_scores": app_scores[:15],  # top 15 apps
        "total_sessions": len(sessions),
    }
