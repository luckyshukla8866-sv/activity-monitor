"""
Admin API routes.
Provides system management endpoints for admin users.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from typing import List, Optional
from pydantic import BaseModel
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent.parent))
from api.database import get_db
from api.models import User, ActivitySession, Screenshot
from api.auth import get_current_user, get_password_hash

router = APIRouter(prefix="/api/admin", tags=["admin"])


# ── Schemas ──────────────────────────────────────────────────────────────

class AdminUserResponse(BaseModel):
    id: int
    username: str
    device_name: Optional[str]
    is_admin: bool
    created_at: datetime
    session_count: int
    total_duration_hours: float

    class Config:
        from_attributes = True


class SystemStats(BaseModel):
    total_users: int
    total_sessions: int
    total_screenshots: int
    desktop_sessions: int
    browser_sessions: int
    total_tracked_hours: float
    active_users_7d: int
    db_size_estimate: str


class UserUpdateRequest(BaseModel):
    is_admin: Optional[bool] = None
    password: Optional[str] = None


class CreateUserRequest(BaseModel):
    username: str
    password: str
    is_admin: bool = False


# ── Admin Guard ──────────────────────────────────────────────────────────

async def require_admin(
    current_user: User = Depends(get_current_user),
) -> User:
    """Dependency that requires the current user to be an admin."""
    if not getattr(current_user, 'is_admin', False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return current_user


# ── Endpoints ────────────────────────────────────────────────────────────

@router.get("/stats", response_model=SystemStats)
async def get_system_stats(
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Get system-wide statistics."""
    total_users = db.query(User).count()
    total_sessions = db.query(ActivitySession).count()
    total_screenshots = db.query(Screenshot).count()

    desktop_sessions = db.query(ActivitySession).filter(
        ActivitySession.source == "desktop"
    ).count()
    browser_sessions = db.query(ActivitySession).filter(
        ActivitySession.source == "browser"
    ).count()

    total_seconds = db.query(
        func.sum(ActivitySession.duration_seconds)
    ).scalar() or 0
    total_tracked_hours = round(total_seconds / 3600, 1)

    week_ago = datetime.utcnow() - timedelta(days=7)
    active_users_7d = db.query(
        func.count(func.distinct(ActivitySession.user_id))
    ).filter(ActivitySession.start_time >= week_ago).scalar() or 0

    # Rough estimate: sessions * 200 bytes avg
    size_bytes = total_sessions * 200 + total_screenshots * 5000
    if size_bytes > 1_000_000:
        db_size = f"{size_bytes / 1_000_000:.1f} MB"
    else:
        db_size = f"{size_bytes / 1_000:.0f} KB"

    return SystemStats(
        total_users=total_users,
        total_sessions=total_sessions,
        total_screenshots=total_screenshots,
        desktop_sessions=desktop_sessions,
        browser_sessions=browser_sessions,
        total_tracked_hours=total_tracked_hours,
        active_users_7d=active_users_7d,
        db_size_estimate=db_size,
    )


@router.get("/users", response_model=List[AdminUserResponse])
async def list_users(
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """List all users with usage stats."""
    users = db.query(User).order_by(User.created_at.desc()).all()
    result = []

    for user in users:
        session_count = db.query(ActivitySession).filter(
            ActivitySession.user_id == user.id
        ).count()

        total_seconds = db.query(
            func.sum(ActivitySession.duration_seconds)
        ).filter(ActivitySession.user_id == user.id).scalar() or 0

        result.append(AdminUserResponse(
            id=user.id,
            username=user.username,
            device_name=user.device_name,
            is_admin=getattr(user, 'is_admin', False),
            created_at=user.created_at,
            session_count=session_count,
            total_duration_hours=round(total_seconds / 3600, 1),
        ))

    return result


@router.post("/users", response_model=AdminUserResponse)
async def create_user(
    req: CreateUserRequest,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Create a new user."""
    existing = db.query(User).filter(User.username == req.username).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")

    user = User(
        username=req.username,
        password_hash=get_password_hash(req.password),
        is_admin=req.is_admin,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return AdminUserResponse(
        id=user.id,
        username=user.username,
        device_name=user.device_name,
        is_admin=user.is_admin,
        created_at=user.created_at,
        session_count=0,
        total_duration_hours=0,
    )


@router.put("/users/{user_id}")
async def update_user(
    user_id: int,
    req: UserUpdateRequest,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Update user (toggle admin, reset password)."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if req.is_admin is not None:
        user.is_admin = req.is_admin
    if req.password:
        user.password_hash = get_password_hash(req.password)

    db.commit()
    return {"success": True, "message": f"User '{user.username}' updated"}


@router.delete("/users/{user_id}")
async def delete_user(
    user_id: int,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Delete a user and all their data."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")

    db.delete(user)  # Cascade deletes sessions + screenshots
    db.commit()
    return {"success": True, "message": f"User '{user.username}' deleted"}


@router.delete("/sessions")
async def clear_all_sessions(
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Delete all activity sessions across the system."""
    count = db.query(ActivitySession).delete()
    db.commit()
    return {"success": True, "sessions_deleted": count}
