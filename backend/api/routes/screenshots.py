"""
Screenshot API routes.
Handles screenshot listing, retrieval, and deletion.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import Response
from sqlalchemy.orm import Session
from sqlalchemy import desc
from datetime import datetime
from typing import Optional, List
from pathlib import Path
import sys

sys.path.append(str(Path(__file__).parent.parent.parent))
from api.database import get_db
from api.models import User, Screenshot, ActivitySession
from api.schemas import ScreenshotCreate, ScreenshotResponse
from api.auth import get_optional_user
from api.utils.encryption import decrypt_file

router = APIRouter(prefix="/api/screenshots", tags=["screenshots"])


@router.get("", response_model=List[ScreenshotResponse])
async def list_screenshots(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    session_id: Optional[int] = None,
    current_user: User = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    """
    List screenshots with pagination and filtering.
    
    Args:
        page: Page number
        page_size: Items per page
        session_id: Filter by session ID
        current_user: Current authenticated user
        db: Database session
    
    Returns:
        List of screenshots
    """
    # Build query - join with sessions to filter by user
    query = db.query(Screenshot).join(ActivitySession).filter(
        ActivitySession.user_id == current_user.id
    )
    
    if session_id:
        query = query.filter(Screenshot.session_id == session_id)
    
    # Apply pagination
    offset = (page - 1) * page_size
    screenshots = query.order_by(desc(Screenshot.captured_at)).offset(offset).limit(page_size).all()
    
    return screenshots


@router.get("/{screenshot_id}", response_class=Response)
async def get_screenshot(
    screenshot_id: int,
    current_user: User = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    """
    Get screenshot image file (decrypted if encrypted).
    
    Args:
        screenshot_id: Screenshot ID
        current_user: Current authenticated user
        db: Database session
    
    Returns:
        Image file
    
    Raises:
        HTTPException: If screenshot not found or unauthorized
    """
    # Get screenshot with user authorization check
    screenshot = db.query(Screenshot).join(ActivitySession).filter(
        Screenshot.id == screenshot_id,
        ActivitySession.user_id == current_user.id
    ).first()
    
    if not screenshot:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Screenshot not found"
        )
    
    file_path = Path(screenshot.file_path)
    
    if not file_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Screenshot file not found"
        )
    
    # Decrypt if encrypted
    if screenshot.is_encrypted:
        image_data = decrypt_file(file_path)
        if image_data is None:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to decrypt screenshot"
            )
    else:
        with open(file_path, 'rb') as f:
            image_data = f.read()
    
    return Response(content=image_data, media_type="image/jpeg")


@router.get("/session/{session_id}", response_model=List[ScreenshotResponse])
async def get_session_screenshots(
    session_id: int,
    current_user: User = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    """
    Get all screenshots for a specific session.
    
    Args:
        session_id: Session ID
        current_user: Current authenticated user
        db: Database session
    
    Returns:
        List of screenshots
    
    Raises:
        HTTPException: If session not found or unauthorized
    """
    # Verify session belongs to user
    session = db.query(ActivitySession).filter(
        ActivitySession.id == session_id,
        ActivitySession.user_id == current_user.id
    ).first()
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )
    
    screenshots = db.query(Screenshot).filter(
        Screenshot.session_id == session_id
    ).order_by(Screenshot.captured_at).all()
    
    return screenshots


@router.post("", response_model=ScreenshotResponse, status_code=status.HTTP_201_CREATED)
async def create_screenshot(
    screenshot: ScreenshotCreate,
    current_user: User = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    """
    Create a new screenshot record.
    
    Args:
        screenshot: Screenshot creation data
        current_user: Current authenticated user
        db: Database session
    
    Returns:
        Created screenshot
    
    Raises:
        HTTPException: If session not found or unauthorized
    """
    # Verify session belongs to user
    session = db.query(ActivitySession).filter(
        ActivitySession.id == screenshot.session_id,
        ActivitySession.user_id == current_user.id
    ).first()
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )
    
    db_screenshot = Screenshot(
        session_id=screenshot.session_id,
        file_path=screenshot.file_path,
        captured_at=screenshot.captured_at,
        file_size=screenshot.file_size,
        is_encrypted=screenshot.is_encrypted
    )
    
    db.add(db_screenshot)
    db.commit()
    db.refresh(db_screenshot)
    
    return db_screenshot


@router.delete("/{screenshot_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_screenshot(
    screenshot_id: int,
    current_user: User = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    """
    Delete a screenshot and its file.
    
    Args:
        screenshot_id: Screenshot ID
        current_user: Current authenticated user
        db: Database session
    
    Raises:
        HTTPException: If screenshot not found or unauthorized
    """
    # Get screenshot with user authorization check
    screenshot = db.query(Screenshot).join(ActivitySession).filter(
        Screenshot.id == screenshot_id,
        ActivitySession.user_id == current_user.id
    ).first()
    
    if not screenshot:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Screenshot not found"
        )
    
    # Delete file
    try:
        Path(screenshot.file_path).unlink(missing_ok=True)
    except Exception as e:
        print(f"Error deleting screenshot file: {e}")
    
    db.delete(screenshot)
    db.commit()
    
    return None


@router.post("/bulk-delete")
async def bulk_delete_screenshots(
    payload: dict,
    current_user: User = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    """
    Delete multiple screenshots by ID.

    Body: { "ids": [1, 2, 3] }
    Returns: { "deleted": N, "not_found": M }
    """
    ids = payload.get("ids", [])
    if not ids:
        return {"deleted": 0, "not_found": 0}

    deleted = 0
    not_found = 0

    for screenshot_id in ids:
        screenshot = db.query(Screenshot).join(ActivitySession).filter(
            Screenshot.id == screenshot_id,
            ActivitySession.user_id == current_user.id
        ).first()

        if not screenshot:
            not_found += 1
            continue

        # Delete file from disk
        try:
            Path(screenshot.file_path).unlink(missing_ok=True)
        except Exception as e:
            print(f"Error deleting screenshot file {screenshot.file_path}: {e}")

        db.delete(screenshot)
        deleted += 1

    db.commit()
    return {"deleted": deleted, "not_found": not_found}
