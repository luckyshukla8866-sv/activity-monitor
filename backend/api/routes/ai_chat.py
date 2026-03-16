"""
AI Chat API route.
Provides a productivity coach powered by Anthropic Claude,
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
    format them into a concise summary string that Claude can reason over.
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
        day_str = str(day)  # e.g. "2026-03-10"
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
    context, and sends the question to Anthropic Claude for analysis.

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

    # ── Fetch & format session data ──────────────────────────────────
    session_summary = _build_session_summary(db, request.user_id)

    # ── Call Anthropic Claude API ────────────────────────────────────
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI service not configured. Set ANTHROPIC_API_KEY in environment.",
        )

    try:
        import anthropic

        client = anthropic.Anthropic(api_key=api_key)

        message = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=1024,
            system=SYSTEM_PROMPT,
            messages=[
                {
                    "role": "user",
                    "content": (
                        f"Here is my activity data:\n\n"
                        f"{session_summary}\n\n"
                        f"My question: {request.question}"
                    ),
                }
            ],
        )

        answer_text = message.content[0].text
        tokens_used = message.usage.input_tokens + message.usage.output_tokens

        return ChatResponse(answer=answer_text, tokens_used=tokens_used)

    except anthropic.AuthenticationError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Anthropic API key.",
        )
    except anthropic.RateLimitError:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="AI rate limit reached. Please try again in a moment.",
        )
    except anthropic.APIError as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"AI service error: {str(e)}",
        )
    except ImportError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="anthropic package is not installed. Run: pip install anthropic",
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unexpected error communicating with AI: {str(e)}",
        )
