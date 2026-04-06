"""
Smart Activity Classifier.
Categorizes sessions as Deep Work, Communication, or Distraction
and calculates a Productivity Score (0-100).

Uses a trained RandomForest model when available, with keyword-based
fallback if the .pkl model files are not found.
"""

from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from typing import List, Dict, Any

import sys
import logging
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent.parent))
from api.models import ActivitySession

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# 1. Attempt to load the trained ML model + vectorizer at module load time
# ---------------------------------------------------------------------------
_ML_MODEL = None
_TFIDF_VECTORIZER = None
_USE_ML = False

_ML_DIR = Path(__file__).parent.parent.parent / "ml_training"
_MODEL_PATH = _ML_DIR / "productivity_model.pkl"
_VECTORIZER_PATH = _ML_DIR / "tfidf_vectorizer.pkl"

try:
    import joblib

    if _MODEL_PATH.exists() and _VECTORIZER_PATH.exists():
        _ML_MODEL = joblib.load(str(_MODEL_PATH))
        _TFIDF_VECTORIZER = joblib.load(str(_VECTORIZER_PATH))
        _USE_ML = True
        logger.info("ML classifier loaded successfully from %s", _ML_DIR)
    else:
        logger.warning(
            "ML model files not found at %s — falling back to keyword matching",
            _ML_DIR,
        )
except ImportError:
    logger.warning("joblib not installed — falling back to keyword matching")
except Exception as exc:
    logger.warning("Failed to load ML model (%s) — falling back to keyword matching", exc)


# ---------------------------------------------------------------------------
# 2. Category → score / label mappings
# ---------------------------------------------------------------------------
_CATEGORY_META = {
    "deep_work":      {"score": 90, "label": "Deep Work"},
    "communication":  {"score": 60, "label": "Communication"},
    "distraction":    {"score": 10, "label": "Distraction"},
    "neutral":        {"score": 50, "label": "Neutral"},
}


# ---------------------------------------------------------------------------
# 3. Keyword fallback rules (used only when ML model is unavailable)
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


def _classify_with_keywords(combined: str) -> Dict[str, Any]:
    """Original keyword-based fallback classifier."""
    for kw in DEEP_WORK_KEYWORDS:
        if kw in combined:
            return {"category": "deep_work", "score": 90, "label": "Deep Work"}

    for kw in DISTRACTION_KEYWORDS:
        if kw in combined:
            return {"category": "distraction", "score": 10, "label": "Distraction"}

    for kw in COMMUNICATION_KEYWORDS:
        if kw in combined:
            return {"category": "communication", "score": 60, "label": "Communication"}

    return {"category": "neutral", "score": 50, "label": "Neutral"}


def classify_session(app_name: str, window_title: str = "") -> Dict[str, Any]:
    """
    Classify a single session into a category.

    Uses the trained RandomForest model when available; otherwise
    falls back to keyword matching.

    Returns:
        { "category": str, "score": int, "label": str }
    """
    combined = f"{app_name} {window_title}".lower()

    # ── ML path ──────────────────────────────────────────────────────
    if _USE_ML and _ML_MODEL is not None and _TFIDF_VECTORIZER is not None:
        try:
            features = _TFIDF_VECTORIZER.transform([combined])
            predicted_category = _ML_MODEL.predict(features)[0]
            meta = _CATEGORY_META.get(
                predicted_category,
                {"score": 50, "label": "Neutral"},
            )
            return {
                "category": predicted_category,
                "score": meta["score"],
                "label": meta["label"],
            }
        except Exception as exc:
            logger.warning("ML prediction failed (%s) — using keyword fallback", exc)

    # ── Keyword fallback ─────────────────────────────────────────────
    return _classify_with_keywords(combined)


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
