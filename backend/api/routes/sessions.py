"""
Activity session API routes.
Handles session listing, creation, updates, and deletion.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime, timedelta
from typing import Optional, List
from pydantic import BaseModel, Field
from urllib.parse import urlparse
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent.parent))
from api.database import get_db
from api.models import User, ActivitySession, Screenshot
from api.schemas import (
    ActivitySessionCreate,
    ActivitySessionResponse,
    ActivitySessionUpdate,
    PaginatedResponse
)
from api.auth import get_optional_user

router = APIRouter(prefix="/api/sessions", tags=["sessions"])


# ── Browser extension schemas ───────────────────────────────────────────

class BrowserSessionItem(BaseModel):
    url: str
    title: str = ""
    duration_seconds: float = Field(..., ge=0)
    timestamp: str  # ISO 8601

class BrowserSessionBatch(BaseModel):
    sessions: List[BrowserSessionItem]


# ── Domain → Friendly App Name mapping ──────────────────────────────────
# Maps known hostnames (without www.) to clean display names.

DOMAIN_TO_APP: dict[str, str] = {
    # Dev & Code
    "github.com":         "GitHub",
    "gitlab.com":         "GitLab",
    "bitbucket.org":      "Bitbucket",
    "stackoverflow.com":  "Stack Overflow",
    "codepen.io":         "CodePen",
    "codesandbox.io":     "CodeSandbox",
    "replit.com":         "Replit",
    "vercel.com":         "Vercel",
    "render.com":         "Render",
    "netlify.com":        "Netlify",
    "npmjs.com":          "npm",
    "pypi.org":           "PyPI",
    "hub.docker.com":     "Docker Hub",

    # Productivity & Docs
    "notion.so":          "Notion",
    "docs.google.com":    "Google Docs",
    "sheets.google.com":  "Google Sheets",
    "slides.google.com":  "Google Slides",
    "drive.google.com":   "Google Drive",
    "figma.com":          "Figma",
    "miro.com":           "Miro",
    "trello.com":         "Trello",
    "asana.com":          "Asana",
    "linear.app":         "Linear",
    "jira.atlassian.com": "Jira",
    "confluence.atlassian.com": "Confluence",
    "airtable.com":       "Airtable",
    "calendar.google.com":"Google Calendar",

    # Communication
    "slack.com":          "Slack",
    "discord.com":        "Discord",
    "teams.microsoft.com":"Microsoft Teams",
    "mail.google.com":    "Gmail",
    "outlook.office.com": "Outlook",
    "outlook.live.com":   "Outlook",
    "web.whatsapp.com":   "WhatsApp Web",
    "web.telegram.org":   "Telegram Web",
    "zoom.us":            "Zoom",
    "meet.google.com":    "Google Meet",

    # Social & Distraction
    "youtube.com":        "YouTube",
    "twitter.com":        "Twitter / X",
    "x.com":              "Twitter / X",
    "reddit.com":         "Reddit",
    "facebook.com":       "Facebook",
    "instagram.com":      "Instagram",
    "tiktok.com":         "TikTok",
    "linkedin.com":       "LinkedIn",
    "twitch.tv":          "Twitch",
    "pinterest.com":      "Pinterest",

    # Reference & Learning
    "medium.com":         "Medium",
    "dev.to":             "DEV Community",
    "hashnode.com":       "Hashnode",
    "wikipedia.org":      "Wikipedia",
    "en.wikipedia.org":   "Wikipedia",
    "chatgpt.com":        "ChatGPT",
    "chat.openai.com":    "ChatGPT",
    "gemini.google.com":  "Gemini",
    "claude.ai":          "Claude",
    "coursera.org":       "Coursera",
    "udemy.com":          "Udemy",

    # Entertainment
    "netflix.com":        "Netflix",
    "open.spotify.com":   "Spotify Web",
    "music.youtube.com":  "YouTube Music",
    "primevideo.com":     "Prime Video",

    # Shopping & Other
    "amazon.com":         "Amazon",
    "amazon.in":          "Amazon",
    "news.ycombinator.com": "Hacker News",
}


# ── Domain → Category mapping ───────────────────────────────────────────

DOMAIN_TO_CATEGORY: dict[str, str] = {
    # Deep Work
    "github.com": "deep_work", "gitlab.com": "deep_work",
    "bitbucket.org": "deep_work", "stackoverflow.com": "deep_work",
    "codepen.io": "deep_work", "codesandbox.io": "deep_work",
    "replit.com": "deep_work", "vercel.com": "deep_work",
    "render.com": "deep_work", "netlify.com": "deep_work",
    "npmjs.com": "deep_work", "pypi.org": "deep_work",
    "hub.docker.com": "deep_work",

    # Productivity
    "notion.so": "productivity", "docs.google.com": "productivity",
    "sheets.google.com": "productivity", "slides.google.com": "productivity",
    "drive.google.com": "productivity", "figma.com": "productivity",
    "miro.com": "productivity", "trello.com": "productivity",
    "asana.com": "productivity", "linear.app": "productivity",
    "jira.atlassian.com": "productivity",
    "confluence.atlassian.com": "productivity",
    "airtable.com": "productivity", "calendar.google.com": "productivity",

    # Communication
    "slack.com": "communication", "discord.com": "communication",
    "teams.microsoft.com": "communication",
    "mail.google.com": "communication",
    "outlook.office.com": "communication",
    "outlook.live.com": "communication",
    "web.whatsapp.com": "communication",
    "web.telegram.org": "communication",
    "zoom.us": "communication", "meet.google.com": "communication",

    # Distraction
    "youtube.com": "distraction", "twitter.com": "distraction",
    "x.com": "distraction", "reddit.com": "distraction",
    "facebook.com": "distraction", "instagram.com": "distraction",
    "tiktok.com": "distraction", "twitch.tv": "distraction",
    "pinterest.com": "distraction",

    # Reference / Learning
    "medium.com": "reference", "dev.to": "reference",
    "hashnode.com": "reference", "wikipedia.org": "reference",
    "en.wikipedia.org": "reference",
    "chatgpt.com": "reference", "chat.openai.com": "reference",
    "gemini.google.com": "reference", "claude.ai": "reference",
    "coursera.org": "reference", "udemy.com": "reference",
    "news.ycombinator.com": "reference",

    # Entertainment
    "netflix.com": "entertainment", "open.spotify.com": "entertainment",
    "music.youtube.com": "entertainment",
    "primevideo.com": "entertainment",

    # Social (professional)
    "linkedin.com": "communication",
}


def _resolve_domain(url: str) -> tuple[str, str, str]:
    """
    Given a URL, return (app_name, hostname, category).
    Tries exact match, then parent domain match.
    """
    parsed = urlparse(url)
    hostname = (parsed.hostname or "unknown").lower()
    if hostname.startswith("www."):
        hostname = hostname[4:]

    # Exact match
    if hostname in DOMAIN_TO_APP:
        return DOMAIN_TO_APP[hostname], hostname, DOMAIN_TO_CATEGORY.get(hostname, "neutral")

    # Try parent domain (e.g. "m.youtube.com" → "youtube.com")
    parts = hostname.split(".")
    if len(parts) > 2:
        parent = ".".join(parts[-2:])
        if parent in DOMAIN_TO_APP:
            return DOMAIN_TO_APP[parent], parent, DOMAIN_TO_CATEGORY.get(parent, "neutral")

    # Fallback: capitalize the domain name
    display = parts[-2].capitalize() if len(parts) >= 2 else hostname
    return f"Chrome — {display}", hostname, "neutral"


# ── Browser extension endpoint ──────────────────────────────────────────

@router.post("/browser")
async def ingest_browser_sessions(
    payload: BrowserSessionBatch,
    current_user: User = Depends(get_optional_user),
    db: Session = Depends(get_db),
):
    """
    Receive a batch of browser sessions from the Chrome extension.

    Each session contains {url, title, duration_seconds, timestamp}.
    Resolves the URL domain to a friendly app name (e.g. github.com → 'GitHub')
    and assigns a category (deep_work, communication, distraction, etc.).
    Sessions are saved with source='browser'.
    """
    created = 0
    skipped = 0
    categories_seen: dict[str, int] = {}

    for item in payload.sessions:
        try:
            # Parse timestamp
            start_time = datetime.fromisoformat(
                item.timestamp.replace("Z", "+00:00")
            )

            app_name, hostname, category = _resolve_domain(item.url)
            end_time = start_time + timedelta(seconds=item.duration_seconds)

            session = ActivitySession(
                user_id=current_user.id,
                app_name=app_name,
                window_title=item.title[:500] if item.title else "",
                process_id=None,
                start_time=start_time,
                end_time=end_time,
                duration_seconds=item.duration_seconds,
                mouse_clicks=0,
                key_presses=0,
                source="browser",
            )
            db.add(session)
            created += 1
            categories_seen[category] = categories_seen.get(category, 0) + 1

        except Exception:
            skipped += 1
            continue

    db.commit()

    return {
        "success": True,
        "sessions_created": created,
        "sessions_skipped": skipped,
        "categories": categories_seen,
    }

@router.get("", response_model=PaginatedResponse)
async def list_sessions(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
    app_name: Optional[str] = None,
    current_user: User = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    """
    List activity sessions with pagination and filtering.
    
    Args:
        page: Page number (1-indexed)
        page_size: Number of items per page
        date_from: Filter sessions starting from this date
        date_to: Filter sessions up to this date
        app_name: Filter by application name
        current_user: Current authenticated user
        db: Database session
    
    Returns:
        Paginated list of sessions
    """
    # Build query
    query = db.query(ActivitySession).filter(ActivitySession.user_id == current_user.id)
    
    # Apply filters
    if date_from:
        query = query.filter(ActivitySession.start_time >= date_from)
    if date_to:
        query = query.filter(ActivitySession.start_time <= date_to)
    if app_name:
        query = query.filter(ActivitySession.app_name.ilike(f"%{app_name}%"))
    
    # Get total count
    total = query.count()
    
    # Apply pagination
    offset = (page - 1) * page_size
    sessions = query.order_by(desc(ActivitySession.start_time)).offset(offset).limit(page_size).all()
    
    # Add screenshot count to each session
    session_responses = []
    for session in sessions:
        session_dict = ActivitySessionResponse.model_validate(session).model_dump()
        session_dict['screenshot_count'] = db.query(Screenshot).filter(
            Screenshot.session_id == session.id
        ).count()
        session_responses.append(ActivitySessionResponse(**session_dict))
    
    total_pages = (total + page_size - 1) // page_size
    
    return {
        "items": session_responses,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages
    }


@router.get("/{session_id}", response_model=ActivitySessionResponse)
async def get_session(
    session_id: int,
    current_user: User = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific session by ID.
    
    Args:
        session_id: Session ID
        current_user: Current authenticated user
        db: Database session
    
    Returns:
        Session details
    
    Raises:
        HTTPException: If session not found or unauthorized
    """
    session = db.query(ActivitySession).filter(
        ActivitySession.id == session_id,
        ActivitySession.user_id == current_user.id
    ).first()
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )
    
    # Add screenshot count
    session_dict = ActivitySessionResponse.model_validate(session).model_dump()
    session_dict['screenshot_count'] = db.query(Screenshot).filter(
        Screenshot.session_id == session.id
    ).count()
    
    return ActivitySessionResponse(**session_dict)


@router.post("", response_model=ActivitySessionResponse, status_code=status.HTTP_201_CREATED)
async def create_session(
    session: ActivitySessionCreate,
    current_user: User = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    """
    Create a new activity session.
    
    Args:
        session: Session creation data
        current_user: Current authenticated user
        db: Database session
    
    Returns:
        Created session
    """
    db_session = ActivitySession(
        user_id=current_user.id,
        app_name=session.app_name,
        window_title=session.window_title,
        process_id=session.process_id,
        start_time=session.start_time
    )
    
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    
    return db_session


@router.put("/{session_id}", response_model=ActivitySessionResponse)
async def update_session(
    session_id: int,
    session_update: ActivitySessionUpdate,
    current_user: User = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    """
    Update an existing session (typically to set end time).
    
    Args:
        session_id: Session ID
        session_update: Session update data
        current_user: Current authenticated user
        db: Database session
    
    Returns:
        Updated session
    
    Raises:
        HTTPException: If session not found or unauthorized
    """
    db_session = db.query(ActivitySession).filter(
        ActivitySession.id == session_id,
        ActivitySession.user_id == current_user.id
    ).first()
    
    if not db_session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )
    
    # Update fields
    if session_update.end_time is not None:
        db_session.end_time = session_update.end_time
        db_session.update_duration()
    
    if session_update.duration_seconds is not None:
        db_session.duration_seconds = session_update.duration_seconds
    
    db.commit()
    db.refresh(db_session)
    
    return db_session


@router.delete("/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_session(
    session_id: int,
    current_user: User = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    """
    Delete a session and its associated screenshots.
    
    Args:
        session_id: Session ID
        current_user: Current authenticated user
        db: Database session
    
    Raises:
        HTTPException: If session not found or unauthorized
    """
    db_session = db.query(ActivitySession).filter(
        ActivitySession.id == session_id,
        ActivitySession.user_id == current_user.id
    ).first()
    
    if not db_session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )
    
    # Delete associated screenshots (cascade should handle this, but being explicit)
    screenshots = db.query(Screenshot).filter(Screenshot.session_id == session_id).all()
    for screenshot in screenshots:
        # Delete file
        try:
            Path(screenshot.file_path).unlink(missing_ok=True)
        except:
            pass
    
    db.delete(db_session)
    db.commit()
    
    return None


@router.post("/bulk-delete")
async def bulk_delete_sessions(
    payload: dict,
    current_user: User = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    """
    Delete multiple sessions (and their screenshots) by ID.

    Body: { "ids": [1, 2, 3] }
    Returns: { "deleted": N, "not_found": M }
    """
    ids = payload.get("ids", [])
    if not ids:
        return {"deleted": 0, "not_found": 0}

    deleted = 0
    not_found = 0

    for session_id in ids:
        db_session = db.query(ActivitySession).filter(
            ActivitySession.id == session_id,
            ActivitySession.user_id == current_user.id
        ).first()

        if not db_session:
            not_found += 1
            continue

        # Delete associated screenshot files
        screenshots = db.query(Screenshot).filter(
            Screenshot.session_id == session_id
        ).all()
        for screenshot in screenshots:
            try:
                Path(screenshot.file_path).unlink(missing_ok=True)
            except Exception as e:
                print(f"Error deleting screenshot file: {e}")

        db.delete(db_session)
        deleted += 1

    db.commit()
    return {"deleted": deleted, "not_found": not_found}


@router.get("/stats/summary")
async def get_session_stats(
    current_user: User = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    """
    Get session statistics summary.
    
    Args:
        current_user: Current authenticated user
        db: Database session
    
    Returns:
        Statistics summary
    """
    # Total sessions
    total_sessions = db.query(ActivitySession).filter(
        ActivitySession.user_id == current_user.id
    ).count()
    
    # Total duration
    total_duration = db.query(func.sum(ActivitySession.duration_seconds)).filter(
        ActivitySession.user_id == current_user.id
    ).scalar() or 0
    
    # Unique apps
    unique_apps = db.query(func.count(func.distinct(ActivitySession.app_name))).filter(
        ActivitySession.user_id == current_user.id
    ).scalar() or 0
    
    return {
        "total_sessions": total_sessions,
        "total_duration_hours": total_duration / 3600,
        "unique_apps": unique_apps
    }
