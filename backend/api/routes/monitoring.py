"""
Monitoring control API routes.
Allows the frontend to start/stop monitoring and check status.
"""

from fastapi import APIRouter, HTTPException
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent.parent))
from monitoring_engine.app_state import monitoring_state

router = APIRouter(prefix="/api/monitoring", tags=["monitoring"])


@router.get("/status")
async def get_monitoring_status():
    """
    Get current monitoring status.
    Returns whether monitoring is running, session counts, current app, etc.
    """
    return monitoring_state.get_status()


@router.post("/start")
async def start_monitoring():
    """
    Start the activity monitoring engine.
    Safe to call even if already running (returns current status).
    """
    if monitoring_state.is_monitoring:
        return {
            "success": False,
            "message": "Monitoring is already running",
            **monitoring_state.get_status()
        }

    try:
        monitoring_state.start_monitoring()
        return {
            "success": True,
            "message": "Monitoring started successfully",
            **monitoring_state.get_status()
        }
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start monitoring: {e}")


@router.post("/stop")
async def stop_monitoring():
    """
    Stop the activity monitoring engine.
    The API server continues running — only tracking is paused.
    """
    if not monitoring_state.is_monitoring:
        return {
            "success": False,
            "message": "Monitoring is not running",
            **monitoring_state.get_status()
        }

    try:
        monitoring_state.stop_monitoring()
        return {
            "success": True,
            "message": "Monitoring stopped successfully",
            **monitoring_state.get_status()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to stop monitoring: {e}")
