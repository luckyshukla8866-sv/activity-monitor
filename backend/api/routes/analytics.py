"""
Analytics API routes.
Provides aggregated data for dashboard visualizations and exports.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query, Response
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, case
from datetime import datetime, timedelta, time
from typing import Optional, List
from io import BytesIO, StringIO
import csv
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent.parent))
from api.database import get_db
from api.models import User, ActivitySession, Screenshot
from api.schemas import (
    OverviewStats,
    AppDistribution,
    TimelineData,
    TopApp,
    AnalyticsResponse
)
from api.auth import get_optional_user

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("/overview", response_model=OverviewStats)
async def get_overview_stats(
    current_user: User = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    """
    Get overview statistics for today.
    
    Args:
        current_user: Current authenticated user
        db: Database session
    
    Returns:
        Overview statistics
    """
    # Get today's date range
    today_start = datetime.combine(datetime.today(), time.min)
    today_end = datetime.combine(datetime.today(), time.max)
    
    # Total active hours today
    total_duration = db.query(func.sum(ActivitySession.duration_seconds)).filter(
        ActivitySession.user_id == current_user.id,
        ActivitySession.start_time >= today_start,
        ActivitySession.start_time <= today_end
    ).scalar() or 0
    
    total_active_hours = total_duration / 3600
    
    # Total sessions today
    total_sessions = db.query(ActivitySession).filter(
        ActivitySession.user_id == current_user.id,
        ActivitySession.start_time >= today_start,
        ActivitySession.start_time <= today_end
    ).count()
    
    # Total unique apps tracked
    total_apps = db.query(func.count(func.distinct(ActivitySession.app_name))).filter(
        ActivitySession.user_id == current_user.id,
        ActivitySession.start_time >= today_start,
        ActivitySession.start_time <= today_end
    ).scalar() or 0
    
    # Calculate idle time (assuming 8 hour work day for now)
    work_hours = 8 * 3600  # 8 hours in seconds
    idle_time = max(0, work_hours - total_duration)
    
    return {
        "total_active_hours_today": total_active_hours,
        "total_sessions_today": total_sessions,
        "total_apps_tracked": total_apps,
        "idle_time_today": idle_time / 3600,
        "active_time_today": total_active_hours
    }


@router.get("/app-distribution", response_model=List[AppDistribution])
async def get_app_distribution(
    days: int = Query(7, ge=1, le=90),
    current_user: User = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    """
    Get application usage distribution for pie chart.
    
    Args:
        days: Number of days to analyze
        current_user: Current authenticated user
        db: Database session
    
    Returns:
        List of app usage data
    """
    start_date = datetime.now() - timedelta(days=days)
    
    # Query app usage
    results = db.query(
        ActivitySession.app_name,
        func.sum(ActivitySession.duration_seconds).label('total_duration'),
        func.count(ActivitySession.id).label('session_count')
    ).filter(
        ActivitySession.user_id == current_user.id,
        ActivitySession.start_time >= start_date
    ).group_by(
        ActivitySession.app_name
    ).order_by(
        desc('total_duration')
    ).all()
    
    # Calculate total for percentages
    total_duration = sum(r.total_duration for r in results)
    
    # Build response
    distribution = []
    for result in results:
        percentage = (result.total_duration / total_duration * 100) if total_duration > 0 else 0
        distribution.append({
            "app_name": result.app_name,
            "total_duration": result.total_duration,
            "session_count": result.session_count,
            "percentage": round(percentage, 2)
        })
    
    return distribution


@router.get("/timeline", response_model=List[TimelineData])
async def get_activity_timeline(
    date: Optional[datetime] = None,
    current_user: User = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    """
    Get hourly activity timeline for line chart.
    
    Args:
        date: Date to analyze (defaults to today)
        current_user: Current authenticated user
        db: Database session
    
    Returns:
        Hourly activity data
    """
    target_date = date or datetime.today()
    day_start = datetime.combine(target_date, time.min)
    day_end = datetime.combine(target_date, time.max)
    
    # Get all sessions for the day
    sessions = db.query(ActivitySession).filter(
        ActivitySession.user_id == current_user.id,
        ActivitySession.start_time >= day_start,
        ActivitySession.start_time <= day_end
    ).all()
    
    # Aggregate by hour
    hourly_data = {}
    for hour in range(24):
        hourly_data[hour] = {'active_minutes': 0, 'session_count': 0}
    
    for session in sessions:
        hour = session.start_time.hour
        hourly_data[hour]['active_minutes'] += session.duration_seconds / 60
        hourly_data[hour]['session_count'] += 1
    
    # Build response
    timeline = []
    for hour in range(24):
        timeline.append({
            "hour": hour,
            "active_minutes": round(hourly_data[hour]['active_minutes'], 2),
            "session_count": hourly_data[hour]['session_count']
        })
    
    return timeline


@router.get("/top-apps", response_model=List[TopApp])
async def get_top_apps(
    limit: int = Query(5, ge=1, le=20),
    days: int = Query(7, ge=1, le=90),
    current_user: User = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    """
    Get top N most used applications.
    
    Args:
        limit: Number of top apps to return
        days: Number of days to analyze
        current_user: Current authenticated user
        db: Database session
    
    Returns:
        List of top apps
    """
    start_date = datetime.now() - timedelta(days=days)
    
    results = db.query(
        ActivitySession.app_name,
        func.sum(ActivitySession.duration_seconds).label('total_duration'),
        func.count(ActivitySession.id).label('session_count')
    ).filter(
        ActivitySession.user_id == current_user.id,
        ActivitySession.start_time >= start_date
    ).group_by(
        ActivitySession.app_name
    ).order_by(
        desc('total_duration')
    ).limit(limit).all()
    
    top_apps = []
    for result in results:
        top_apps.append({
            "app_name": result.app_name,
            "total_duration": result.total_duration,
            "session_count": result.session_count
        })
    
    return top_apps


@router.get("/export/csv")
async def export_csv(
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
    current_user: User = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    """
    Export activity data as CSV.
    
    Args:
        date_from: Start date for export
        date_to: End date for export
        current_user: Current authenticated user
        db: Database session
    
    Returns:
        CSV file
    """
    # Build query
    query = db.query(ActivitySession).filter(ActivitySession.user_id == current_user.id)
    
    if date_from:
        query = query.filter(ActivitySession.start_time >= date_from)
    if date_to:
        query = query.filter(ActivitySession.start_time <= date_to)
    
    sessions = query.order_by(ActivitySession.start_time).all()
    
    # Create CSV
    output = StringIO()
    writer = csv.writer(output)
    
    # Write header
    writer.writerow([
        'Session ID',
        'App Name',
        'Window Title',
        'Process ID',
        'Start Time',
        'End Time',
        'Duration (seconds)',
        'Duration (minutes)',
        'Duration (hours)',
        'Mouse Clicks',
        'Key Presses',
        'Total Inputs'
    ])

    # Write data
    for session in sessions:
        mouse_clicks = getattr(session, 'mouse_clicks', 0) or 0
        key_presses  = getattr(session, 'key_presses',  0) or 0
        writer.writerow([
            session.id,
            session.app_name,
            session.window_title,
            session.process_id,
            session.start_time.isoformat(),
            session.end_time.isoformat() if session.end_time else '',
            session.duration_seconds,
            round(session.duration_seconds / 60, 2),
            round(session.duration_seconds / 3600, 2),
            mouse_clicks,
            key_presses,
            mouse_clicks + key_presses
        ])
    
    # Return CSV
    output.seek(0)
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename=activity_export_{datetime.now().strftime('%Y%m%d')}.csv"
        }
    )


@router.get("/export/summary")
async def export_summary(
    days: int = Query(7, ge=1, le=90),
    current_user: User = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    """
    Get activity summary for the specified period.
    
    Args:
        days: Number of days to summarize
        current_user: Current authenticated user
        db: Database session
    
    Returns:
        Summary statistics
    """
    start_date = datetime.now() - timedelta(days=days)
    
    # Total sessions
    total_sessions = db.query(ActivitySession).filter(
        ActivitySession.user_id == current_user.id,
        ActivitySession.start_time >= start_date
    ).count()
    
    # Total duration
    total_duration = db.query(func.sum(ActivitySession.duration_seconds)).filter(
        ActivitySession.user_id == current_user.id,
        ActivitySession.start_time >= start_date
    ).scalar() or 0
    
    # Average session duration
    avg_duration = total_duration / total_sessions if total_sessions > 0 else 0
    
    # Most used app
    most_used = db.query(
        ActivitySession.app_name,
        func.sum(ActivitySession.duration_seconds).label('total_duration')
    ).filter(
        ActivitySession.user_id == current_user.id,
        ActivitySession.start_time >= start_date
    ).group_by(
        ActivitySession.app_name
    ).order_by(
        desc('total_duration')
    ).first()
    
    return {
        "period_days": days,
        "total_sessions": total_sessions,
        "total_hours": round(total_duration / 3600, 2),
        "average_session_minutes": round(avg_duration / 60, 2),
        "most_used_app": most_used.app_name if most_used else "N/A",
        "most_used_app_hours": round(most_used.total_duration / 3600, 2) if most_used else 0
    }
