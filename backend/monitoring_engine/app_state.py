"""
Global application state singleton.
Shared between main.py and API routes to allow remote monitoring control.
"""

import asyncio
import threading
from datetime import datetime
from typing import Optional, Callable, Any


class MonitoringState:
    """
    Singleton that holds the running ActivityTracker instance and WebSocket manager.
    Allows API routes to start/stop monitoring and broadcast events.
    """

    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return
        self._initialized = True

        self.activity_tracker = None          # Set by main.py after tracker is created
        self.ws_manager = None                # Set by api/main.py after app starts
        self.is_monitoring: bool = False
        self.start_time: Optional[datetime] = None
        self.action_log: list = []            # List of {time, action} dicts

        # The asyncio event loop running the FastAPI server.
        # Stored at startup so we can safely schedule coroutines from
        # pynput's background threads using run_coroutine_threadsafe().
        self._loop: Optional[asyncio.AbstractEventLoop] = None

        # Factory function to create a fresh ActivityTracker (set by main.py)
        self._tracker_factory: Optional[Callable] = None

        # Per-session input counters — reset each time a new session starts
        self._session_mouse_clicks: int = 0
        self._session_key_presses: int = 0

    def set_tracker_factory(self, factory: Callable):
        """Register the factory function that creates an ActivityTracker."""
        self._tracker_factory = factory

    def set_ws_manager(self, manager):
        """Register the WebSocket connection manager."""
        self.ws_manager = manager

    def set_event_loop(self, loop: asyncio.AbstractEventLoop):
        """Store the asyncio event loop so threads can schedule broadcasts safely."""
        self._loop = loop

    def log_action(self, action: str):
        """Add an entry to the action log."""
        self.action_log.append({
            "time": datetime.now().isoformat(),
            "action": action
        })
        # Keep only last 50 entries
        if len(self.action_log) > 50:
            self.action_log = self.action_log[-50:]

    def start_monitoring(self) -> bool:
        """
        Start the activity tracker.
        Returns True if started successfully, False if already running.
        """
        if self.is_monitoring and self.activity_tracker:
            return False

        if self._tracker_factory is None:
            raise RuntimeError("Tracker factory not registered. Call set_tracker_factory() first.")

        self.activity_tracker = self._tracker_factory()
        self.activity_tracker.start_monitoring()
        self.is_monitoring = True
        self.start_time = datetime.now()
        self.log_action("Monitoring started")

        # Broadcast to WebSocket clients
        self._broadcast_sync({
            "type": "monitoring_started",
            "timestamp": datetime.now().isoformat()
        })

        return True

    def stop_monitoring(self) -> bool:
        """
        Stop the activity tracker.
        Returns True if stopped successfully, False if not running.
        """
        if not self.is_monitoring or not self.activity_tracker:
            return False

        self.activity_tracker.stop_monitoring()
        self.activity_tracker = None
        self.is_monitoring = False
        self.log_action("Monitoring stopped")

        # Broadcast to WebSocket clients
        self._broadcast_sync({
            "type": "monitoring_stopped",
            "timestamp": datetime.now().isoformat()
        })

        return True

    def get_status(self) -> dict:
        """Get current monitoring status."""
        stats = {}
        if self.activity_tracker and self.is_monitoring:
            try:
                stats = self.activity_tracker.get_stats()
            except Exception:
                pass

        return {
            "is_monitoring": self.is_monitoring,
            "start_time": self.start_time.isoformat() if self.start_time else None,
            "total_sessions": stats.get("total_sessions", 0),
            "total_screenshots": stats.get("total_screenshots", 0),
            "is_idle": stats.get("is_idle", False),
            "current_app": stats.get("current_app"),
            "action_log": self.action_log[-10:]  # Last 10 entries
        }

    def broadcast(self, event: dict):
        """
        Thread-safe broadcast to all WebSocket clients.

        This method is called from pynput listener threads (not the asyncio
        event loop thread). We use run_coroutine_threadsafe() to safely
        schedule the async broadcast coroutine onto the stored event loop.
        """
        # Count input events for the current session
        etype = event.get('type')
        if etype == 'mouse_click':
            self._session_mouse_clicks += 1
        elif etype == 'key_press':
            self._session_key_presses += 1

        if self.ws_manager is None:
            return
        if self._loop is None:
            return
        try:
            asyncio.run_coroutine_threadsafe(
                self.ws_manager.broadcast(event),
                self._loop
            )
        except Exception:
            pass

    def snapshot_and_reset_input_counts(self) -> dict:
        """
        Return the current per-session input counts and reset them to zero.
        Call this when a session ends so the counts can be saved to the DB.
        """
        counts = {
            'mouse_clicks': self._session_mouse_clicks,
            'key_presses': self._session_key_presses,
        }
        self._session_mouse_clicks = 0
        self._session_key_presses = 0
        return counts

    def _broadcast_sync(self, event: dict):
        """Broadcast from sync context (same as broadcast)."""
        self.broadcast(event)


# Module-level singleton instance
monitoring_state = MonitoringState()
