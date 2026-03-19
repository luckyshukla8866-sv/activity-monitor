"""
AI Chat API route.
Provides a productivity coach powered by Groq (free tier),
with context from the user's recent activity sessions.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from pydantic import BaseModel, Field
import os
import sys
from pathlib import Path

try:
    from groq import Groq
    _HAS_GROQ = True
except ImportError:
    Groq = None
    _HAS_GROQ = False

sys.path.append(str(Path(__file__).parent.parent.parent))
from api.database import get_db
from api.models import User, ActivitySession

router = APIRouter(prefix="/api/ai", tags=["ai"])


# ── Schemas ──────────────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    question: str = Field(..., min_length=1, max_length=2000)
    user_id: int


class ChatResponse(BaseModel):
    answer: str
    tokens_used: int


# ── Helpers ──────────────────────────────────────────────────────────────

def _format_duration(seconds: float) -> str:
    """Convert seconds to a human readable string like '2h 14m'."""
    if seconds < 60:
        return f"{int(seconds)}s"
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    if hours > 0:
        return f"{hours}h {minutes}m"
    return f"{minutes}m"


def _build_session_summary(db: Session, user_id: int) -> str:
    """
    Fetch the user's activity sessions from the last 7 days and
    format them into a concise summary string for the AI to reason over.
    """
    cutoff = datetime.utcnow() - timedelta(days=7)

    # ── Per-day, per-app aggregation ─────────────────────────────────
    rows = (
        db.query(
            func.date(ActivitySession.start_time).label("day"),
            ActivitySession.app_name,
            func.sum(ActivitySession.duration_seconds).label("total_seconds"),
            func.count(ActivitySession.id).label("session_count"),
        )
        .filter(
            ActivitySession.user_id == user_id,
            ActivitySession.start_time >= cutoff,
        )
        .group_by(
            func.date(ActivitySession.start_time),
            ActivitySession.app_name,
        )
        .order_by(func.date(ActivitySession.start_time))
        .all()
    )

    if not rows:
        return "No activity data found for the past 7 days."

    # ── Build day-by-day summary ─────────────────────────────────────
    from collections import defaultdict

    days: dict[str, list] = defaultdict(list)
    grand_total_seconds = 0.0

    for day, app_name, total_secs, sess_count in rows:
        day_str = str(day)
        days[day_str].append(
            {
                "app": app_name,
                "duration": total_secs,
                "sessions": sess_count,
            }
        )
        grand_total_seconds += total_secs

    lines = [
        f"=== Activity Summary (past 7 days) ===",
        f"Period: {min(days.keys())} → {max(days.keys())}",
        f"Total tracked time: {_format_duration(grand_total_seconds)}",
        "",
    ]

    for day_str in sorted(days.keys()):
        apps = sorted(days[day_str], key=lambda a: a["duration"], reverse=True)
        day_total = sum(a["duration"] for a in apps)
        day_name = datetime.strptime(day_str, "%Y-%m-%d").strftime("%A %b %d")

        lines.append(f"── {day_name} ({_format_duration(day_total)} total) ──")
        for a in apps:
            pct = (a["duration"] / day_total * 100) if day_total else 0
            lines.append(
                f"  • {a['app']}: {_format_duration(a['duration'])} "
                f"({pct:.0f}%) — {a['sessions']} session(s)"
            )
        lines.append("")

    return "\n".join(lines)


# ── System Prompt ────────────────────────────────────────────────────────

SYSTEM_PROMPT = """\
You are an expert productivity coach and data analyst embedded inside an \
activity-monitoring application.

Your job:
1. Analyse the user's recent computer-usage data provided below.
2. Answer their question with specific numbers drawn from the data \
   (durations, percentages, comparisons across days).
3. When relevant, give actionable advice to improve focus and deep-work time.
4. Be concise — keep answers under 200 words unless the user asks for detail.

Classify apps into these categories when helpful:
  • Deep Work: VS Code, IntelliJ, Terminal, Figma, Notion, etc.
  • Communication: Slack, Teams, Discord, Outlook, Gmail, etc.
  • Distraction: YouTube, Twitter/X, Reddit, TikTok, Instagram, etc.
  • Productive utility: Chrome, Firefox, Explorer, Finder, etc.

Use the "deep work ratio" metric:
  deep_work_ratio = deep_work_time / total_tracked_time

When comparing days, highlight meaningful differences. \
Be encouraging but honest.\
"""


# ── Endpoint ─────────────────────────────────────────────────────────────

@router.post("/chat", response_model=ChatResponse)
async def ai_chat(request: ChatRequest, db: Session = Depends(get_db)):
    """
    AI-powered productivity coach.

    Fetches the user's last 7 days of activity sessions, formats them as
    context, and sends the question to Groq (free tier LLaMA) for analysis.

    Args:
        request: ChatRequest with question and user_id
        db: Database session

    Returns:
        ChatResponse with the AI answer and token usage
    """
    # ── Validate user exists ─────────────────────────────────────────
    user = db.query(User).filter(User.id == request.user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id {request.user_id} not found",
        )

    # ── Check package is installed ───────────────────────────────────
    if not _HAS_GROQ:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="groq package is not installed. Run: pip install groq",
        )

    # ── Check API key is set ─────────────────────────────────────────
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI service not configured. Set GROQ_API_KEY in environment.",
        )

    # ── Fetch & format session data ──────────────────────────────────
    session_summary = _build_session_summary(db, request.user_id)

    # ── Call Groq API ────────────────────────────────────────────────
    try:
        client = Groq(api_key=api_key)

        model = os.getenv("GROQ_MODEL", "llama-3.1-70b-versatile")

        completion = client.chat.completions.create(
            model=model,
            max_tokens=1024,
            messages=[
                {
                    "role": "system",
                    "content": SYSTEM_PROMPT,
                },
                {
                    "role": "user",
                    "content": (
                        f"Here is my activity data:\n\n"
                        f"{session_summary}\n\n"
                        f"My question: {request.question}"
                    ),
                },
            ],
        )

        answer_text = completion.choices[0].message.content
        tokens_used = (
            completion.usage.prompt_tokens + completion.usage.completion_tokens
        )

        return ChatResponse(answer=answer_text, tokens_used=tokens_used)

    except Exception as e:
        error_str = str(e).lower()

        if "authentication" in error_str or "api key" in error_str or "unauthorized" in error_str:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid Groq API key. Check your GROQ_API_KEY environment variable.",
            )
        if "rate limit" in error_str or "429" in error_str:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Groq rate limit reached. Please wait a moment and try again.",
            )
        if "model" in error_str and "not found" in error_str:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Groq model not found. Check your GROQ_MODEL value: {model}",
            )
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Groq API error: {str(e)}",
        )