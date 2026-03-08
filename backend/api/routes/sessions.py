"""
Activity session API routes.
Handles session listing, creation, updates, and deletion.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime, timedelta
from typing import Optional, List
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
