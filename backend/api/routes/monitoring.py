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


def _can_monitor() -> bool:
    """
    Check whether this server environment supports activity monitoring.
    Returns False on cloud/headless servers where pynput cannot run.
    """
    try:
        import pynput  # noqa: F401
        return True
    except (ImportError, Exception):
        return False


@router.get("/status")
async def get_monitoring_status():
    """
    Get current monitoring status.
    Includes `can_monitor` flag so the frontend knows if this server
    supports live activity tracking (False on cloud deployments).
    """
    status = monitoring_state.get_status()
    status["can_monitor"] = _can_monitor()
    return status


@router.post("/start")
async def start_monitoring():
    """
    Start the activity monitoring engine.
    Returns a helpful message if the server doesn't support monitoring.
    """
    # Check if this environment supports monitoring at all
    if not _can_monitor():
        return {
            "success": False,
            "message": (
                "Monitoring is not available on this server. "
                "Activity tracking requires a physical computer with a screen, "
                "keyboard, and mouse. Please run the backend locally on your PC "
                "to use this feature."
            ),
            "is_cloud": True,
            **monitoring_state.get_status(),
            "can_monitor": False,
        }

    if monitoring_state.is_monitoring:
        return {
            "success": False,
            "message": "Monitoring is already running",
            **monitoring_state.get_status(),
            "can_monitor": True,
        }

    try:
        monitoring_state.start_monitoring()
        return {
            "success": True,
            "message": "Monitoring started successfully",
            **monitoring_state.get_status(),
            "can_monitor": True,
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
