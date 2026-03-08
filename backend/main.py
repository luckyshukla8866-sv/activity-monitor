"""
Main application entry point.
Integrates activity tracking, API server, and system tray.
"""

import sys
import threading
import time
from pathlib import Path
from datetime import datetime

sys.path.append(str(Path(__file__).parent))
from config import settings
from monitoring_engine.activity_tracker import ActivityTracker
from monitoring_engine.system_tray import SystemTrayApp
from monitoring_engine.app_state import monitoring_state
from api.database import init_db, get_db
from api.models import User, ActivitySession, Screenshot
from api.auth import get_password_hash


class ActivityMonitorApp:
    """Main application that coordinates all components."""

    def __init__(self):
        """Initialize the application."""
        self.system_tray = None
        self.api_thread = None
        self.current_user_id = None

        # Initialize database
        init_db()

        # Register the tracker factory in the global state singleton
        # This allows API routes to start/stop monitoring remotely
        monitoring_state.set_tracker_factory(self._create_tracker)

    # ------------------------------------------------------------------
    # Tracker factory — called by monitoring_state.start_monitoring()
    # ------------------------------------------------------------------

    def _create_tracker(self) -> ActivityTracker:
        """Create and return a configured ActivityTracker instance."""
        self.setup_user()
        tracker = ActivityTracker(
            on_session_start=self._on_session_start,
            on_session_end=self._on_session_end,
            on_screenshot=self._on_screenshot,
            on_activity_event=self._on_activity_event,
        )
        return tracker

    # ------------------------------------------------------------------
    # Callbacks
    # ------------------------------------------------------------------

    def _on_activity_event(self, event: dict):
        """
        Broadcast lightweight mouse/keyboard signals over WebSocket.
        No content is stored — only the event type and timestamp.
        """
        monitoring_state.broadcast(event)

    def _on_session_start(self, session_data):
        """Callback when a new session starts."""
        print(f"[APP] Session started: {session_data['app_name']}")

        # Save to database
        if self.current_user_id:
            try:
                db = next(get_db())
                db_session = ActivitySession(
                    user_id=self.current_user_id,
                    app_name=session_data['app_name'],
                    window_title=session_data['window_title'],
                    process_id=session_data['process_id'],
                    start_time=session_data['start_time']
                )
                db.add(db_session)
                db.commit()
                db.refresh(db_session)

                # Store session ID for screenshot linking
                tracker = monitoring_state.activity_tracker
                if tracker and tracker.current_session:
                    tracker.current_session['id'] = db_session.id

                db.close()

                # Broadcast session start event
                monitoring_state.broadcast({
                    "type": "session_start",
                    "app_name": session_data['app_name'],
                    "window_title": session_data.get('window_title', ''),
                    "session_id": db_session.id,
                    "timestamp": datetime.now().isoformat()
                })
            except Exception as e:
                print(f"Error saving session to database: {e}")

    def _on_session_end(self, session_data):
        """Callback when a session ends."""
        print(f"[APP] Session ended: {session_data['app_name']} ({session_data['duration_seconds']:.1f}s)")

        # Grab and reset per-session input counts from the global state
        input_counts = monitoring_state.snapshot_and_reset_input_counts()

        # Update in database
        if self.current_user_id and session_data.get('id'):
            try:
                db = next(get_db())
                db_session = db.query(ActivitySession).filter(
                    ActivitySession.id == session_data['id']
                ).first()

                if db_session:
                    db_session.end_time = session_data['end_time']
                    db_session.duration_seconds = session_data['duration_seconds']
                    db_session.mouse_clicks = input_counts['mouse_clicks']
                    db_session.key_presses  = input_counts['key_presses']
                    db.commit()

                db.close()

                # Broadcast session end event
                monitoring_state.broadcast({
                    "type": "session_end",
                    "app_name": session_data['app_name'],
                    "duration_seconds": round(session_data['duration_seconds'], 1),
                    "timestamp": datetime.now().isoformat()
                })
            except Exception as e:
                print(f"Error updating session in database: {e}")

    def _on_screenshot(self, screenshot_data):
        """Callback when a screenshot is captured."""
        print(f"[APP] Screenshot captured")

        # Save to database
        if self.current_user_id and screenshot_data.get('session_id'):
            try:
                db = next(get_db())
                db_screenshot = Screenshot(
                    session_id=screenshot_data['session_id'],
                    file_path=screenshot_data['file_path'],
                    captured_at=screenshot_data['captured_at'],
                    file_size=screenshot_data['file_size'],
                    is_encrypted=screenshot_data['is_encrypted']
                )
                db.add(db_screenshot)
                db.commit()
                db.close()

                # Broadcast screenshot event
                monitoring_state.broadcast({
                    "type": "screenshot",
                    "session_id": screenshot_data['session_id'],
                    "timestamp": datetime.now().isoformat()
                })
            except Exception as e:
                print(f"Error saving screenshot to database: {e}")

    # ------------------------------------------------------------------
    # User setup
    # ------------------------------------------------------------------

    def setup_user(self, username="default_user", device_name=None):
        """Setup or get user for tracking."""
        try:
            db = next(get_db())
            user = db.query(User).filter(User.username == username).first()

            if not user:
                user = User(
                    username=username,
                    password_hash=get_password_hash("default_password"),
                    device_name=device_name or "Local Development Machine"
                )
                db.add(user)
                db.commit()
                db.refresh(user)
                print(f"Created new user: {username}")

            self.current_user_id = user.id
            db.close()
            return user
        except Exception as e:
            print(f"Error setting up user: {e}")
            return None

    # ------------------------------------------------------------------
    # Startup modes
    # ------------------------------------------------------------------

    def start_api_server(self):
        """Start the FastAPI server in a separate thread."""
        def run_api():
            import uvicorn
            from api.main import app

            uvicorn.run(
                app,
                host=settings.API_HOST,
                port=settings.API_PORT,
                log_level="info"
            )

        self.api_thread = threading.Thread(target=run_api, daemon=True)
        self.api_thread.start()
        print(f"✓ API server started on http://{settings.API_HOST}:{settings.API_PORT}")

    def start_monitoring(self):
        """Start activity monitoring via the shared state singleton."""
        monitoring_state.start_monitoring()

    def run_with_tray(self):
        """Run application with system tray interface."""
        print(f"\n{'='*50}")
        print(f"  {settings.APP_NAME} v{settings.APP_VERSION}")
        print(f"{'='*50}\n")

        self.start_api_server()
        time.sleep(2)

        # Monitoring is NOT started automatically.
        # Users control it from the website's Monitor Control page.
        self.system_tray = SystemTrayApp()
        self.system_tray.is_monitoring = False

        print("\n✓ Application started successfully!")
        print(f"✓ API: http://{settings.API_HOST}:{settings.API_PORT}")
        print(f"✓ API Docs: http://{settings.API_HOST}:{settings.API_PORT}/docs")
        print("✓ Monitoring is NOT running — start it from the website")
        print("\nRight-click the system tray icon for controls\n")

        self.system_tray.run()

    def run_headless(self):
        """Run application without system tray (headless mode)."""
        print(f"\n{'='*50}")
        print(f"  {settings.APP_NAME} v{settings.APP_VERSION}")
        print(f"  Headless Mode")
        print(f"{'='*50}\n")

        self.start_api_server()
        time.sleep(2)

        # Monitoring is NOT started automatically.
        # Users control it from the website's Monitor Control page.

        print("\n✓ Application started successfully!")
        print(f"✓ API: http://{settings.API_HOST}:{settings.API_PORT}")
        print(f"✓ API Docs: http://{settings.API_HOST}:{settings.API_PORT}/docs")
        print(f"✓ WebSocket: ws://{settings.API_HOST}:{settings.API_PORT}/ws")
        print("✓ Monitoring is NOT running — start it from the website")
        print("\nPress Ctrl+C to stop\n")

        try:
            while True:
                time.sleep(5)
                status = monitoring_state.get_status()
                print(
                    f"[STATS] Sessions: {status['total_sessions']}, "
                    f"Screenshots: {status['total_screenshots']}, "
                    f"Idle: {status['is_idle']}, "
                    f"Monitoring: {status['is_monitoring']}"
                )
        except KeyboardInterrupt:
            print("\nStopping...")
            monitoring_state.stop_monitoring()
            print("✓ Stopped")


def main():
    """Main entry point."""
    import argparse

    parser = argparse.ArgumentParser(description="Activity Monitor Application")
    parser.add_argument(
        "--mode",
        choices=["tray", "headless", "api-only"],
        default="tray",
        help="Application mode"
    )

    args = parser.parse_args()

    app = ActivityMonitorApp()

    if args.mode == "tray":
        app.run_with_tray()
    elif args.mode == "headless":
        app.run_headless()
    elif args.mode == "api-only":
        print("Starting API server only (monitoring can be started from the website)...")
        app.start_api_server()
        print(f"✓ API: http://{settings.API_HOST}:{settings.API_PORT}")
        print("✓ Use the website to start/stop monitoring remotely")
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            print("\nStopped")


if __name__ == "__main__":
    main()
