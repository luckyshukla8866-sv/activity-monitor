"""
Core activity tracker that orchestrates monitoring of user activity.
Integrates mouse/keyboard detection, window tracking, idle detection, and screenshot capture.
"""

import threading
import time
from datetime import datetime
from typing import Optional, Callable, Dict
from pynput import mouse, keyboard
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent))
from config import settings
from monitoring_engine.window_detector import WindowDetector
from monitoring_engine.idle_detector import IdleDetector
from monitoring_engine.screenshot_manager import ScreenshotManager


class ActivityTracker:
    """
    Main activity tracking orchestrator.
    Monitors user input, tracks active windows, manages sessions, and captures screenshots.
    """
    
    def __init__(
        self,
        on_session_start: Optional[Callable] = None,
        on_session_end: Optional[Callable] = None,
        on_screenshot: Optional[Callable] = None,
        on_activity_event: Optional[Callable] = None
    ):
        """
        Initialize activity tracker.
        
        Args:
            on_session_start: Callback when new session starts (receives window_info dict)
            on_session_end: Callback when session ends (receives session_data dict)
            on_screenshot: Callback when screenshot captured (receives screenshot_info dict)
        """
        # Components
        self.window_detector = WindowDetector(poll_interval=2.0)
        self.idle_detector = IdleDetector()
        self.screenshot_manager = ScreenshotManager()
        
        # Callbacks
        self.on_session_start = on_session_start
        self.on_session_end = on_session_end
        self.on_screenshot = on_screenshot
        self.on_activity_event = on_activity_event  # Lightweight signal: mouse_move / key_press
        
        # State
        self.is_monitoring = False
        self.current_session = None
        self.last_screenshot_time = None
        
        # Threading
        self.stop_event = threading.Event()
        self.monitor_thread = None
        self.screenshot_thread = None
        
        # Input listeners
        self.mouse_listener = None
        self.keyboard_listener = None
        
        # Statistics
        self.total_sessions = 0
        self.total_screenshots = 0

        # Throttle mouse broadcasts — max 1 per 100ms to avoid flooding WebSocket
        self._last_mouse_broadcast = 0.0
        self._mouse_throttle_interval = 0.1  # seconds

    def _on_mouse_activity(self, x, y, button, pressed):
        """Internal callback for mouse clicks only. Fires on press AND release — only count press."""
        if not pressed:
            return  # Ignore release events — otherwise each click counts twice
        if self.is_monitoring:
            self.idle_detector.reset_activity()
            if self.on_activity_event:
                try:
                    self.on_activity_event({"type": "mouse_click", "timestamp": datetime.now().isoformat()})
                except Exception:
                    pass

    def _on_keyboard_activity(self, *args):
        """Internal callback for keyboard activity."""
        if self.is_monitoring:
            self.idle_detector.reset_activity()
            # Broadcast lightweight signal (NO key content — privacy safe)
            if self.on_activity_event:
                try:
                    self.on_activity_event({"type": "key_press", "timestamp": datetime.now().isoformat()})
                except Exception:
                    pass
    
    def start_monitoring(self):
        """Start monitoring user activity."""
        if self.is_monitoring:
            print("Monitoring already active")
            return
        
        print("Starting activity monitoring...")
        self.is_monitoring = True
        self.stop_event.clear()
        
        # Start input listeners
        self.mouse_listener = mouse.Listener(
            on_click=self._on_mouse_activity   # Count clicks only, not movement
        )
        self.keyboard_listener = keyboard.Listener(
            on_press=self._on_keyboard_activity  # Count press only, not release
        )
        
        self.mouse_listener.start()
        self.keyboard_listener.start()
        
        # Start monitoring thread
        self.monitor_thread = threading.Thread(target=self._monitor_loop, daemon=True)
        self.monitor_thread.start()
        
        # Start screenshot thread if enabled
        if settings.SCREENSHOT_ENABLED:
            self.screenshot_thread = threading.Thread(target=self._screenshot_loop, daemon=True)
            self.screenshot_thread.start()
        
        print("✓ Activity monitoring started")
    
    def stop_monitoring(self):
        """Stop monitoring user activity."""
        if not self.is_monitoring:
            print("Monitoring not active")
            return
        
        print("Stopping activity monitoring...")
        self.is_monitoring = False
        self.stop_event.set()
        
        # Stop input listeners
        if self.mouse_listener:
            self.mouse_listener.stop()
        if self.keyboard_listener:
            self.keyboard_listener.stop()
        
        # End current session if active
        if self.current_session:
            self._end_session()
        
        # Wait for threads to finish
        if self.monitor_thread:
            self.monitor_thread.join(timeout=2.0)
        if self.screenshot_thread:
            self.screenshot_thread.join(timeout=2.0)
        
        print("✓ Activity monitoring stopped")
    
    def _monitor_loop(self):
        """Main monitoring loop that checks window changes and idle state."""
        previous_window = None
        
        while not self.stop_event.is_set():
            try:
                # Check idle state
                is_idle = self.idle_detector.check_idle()
                
                if is_idle:
                    # User is idle - end current session if active
                    if self.current_session:
                        self._end_session()
                else:
                    # User is active - check for window changes
                    current_window = self.window_detector.get_active_window()
                    
                    if current_window:
                        # Check if window changed
                        has_changed = self.window_detector.has_window_changed(current_window)
                        
                        if has_changed:
                            print(f"Window changed to: {current_window['app_name']}")
                            
                            # Update the window detector's current window
                            self.window_detector.update_current_window(current_window)
                            
                            # End previous session
                            if self.current_session:
                                self._end_session()
                            
                            # Start new session
                            self._start_session(current_window)
                        
                        previous_window = current_window
                
                time.sleep(1.0)  # Check every second
                
            except Exception as e:
                print(f"Error in monitor loop: {e}")
                time.sleep(1.0)
    
    def _screenshot_loop(self):
        """Background loop for periodic screenshot capture."""
        while not self.stop_event.is_set():
            try:
                # Only capture if there's an active session and user is not idle
                if self.current_session and not self.idle_detector.is_idle:
                    # Check if it's time for a screenshot
                    now = datetime.now()
                    
                    if self.last_screenshot_time is None:
                        should_capture = True
                    else:
                        time_since_last = (now - self.last_screenshot_time).total_seconds()
                        should_capture = time_since_last >= settings.SCREENSHOT_INTERVAL_SECONDS
                    
                    if should_capture:
                        self._capture_screenshot()
                        self.last_screenshot_time = now
                
                time.sleep(10)  # Check every 10 seconds
                
            except Exception as e:
                print(f"Error in screenshot loop: {e}")
                time.sleep(10)
    
    def _start_session(self, window_info: Dict):
        """Start a new activity session."""
        self.current_session = {
            'app_name': window_info['app_name'],
            'window_title': window_info['window_title'],
            'process_id': window_info['process_id'],
            'start_time': datetime.now(),
            'screenshots': []
        }
        
        self.total_sessions += 1
        
        print(f"Session started: {window_info['app_name']} - {window_info['window_title']}")
        
        # Call callback
        if self.on_session_start:
            try:
                self.on_session_start(self.current_session.copy())
            except Exception as e:
                print(f"Error in session start callback: {e}")
    
    def _end_session(self):
        """End the current activity session."""
        if not self.current_session:
            return
        
        self.current_session['end_time'] = datetime.now()
        
        # Calculate duration
        duration = (
            self.current_session['end_time'] - self.current_session['start_time']
        ).total_seconds()
        self.current_session['duration_seconds'] = duration
        
        print(f"Session ended: {self.current_session['app_name']} ({duration:.1f}s)")
        
        # Call callback
        if self.on_session_end:
            try:
                self.on_session_end(self.current_session.copy())
            except Exception as e:
                print(f"Error in session end callback: {e}")
        
        self.current_session = None
        self.last_screenshot_time = None
    
    def _capture_screenshot(self):
        """Capture a screenshot for the current session."""
        if not self.current_session:
            return
        
        session_id = self.current_session.get('id')  # May be None if not saved to DB yet
        
        screenshot_info = self.screenshot_manager.capture_screenshot(
            session_id=session_id,
            encrypt=settings.ENCRYPTION_KEY is not None
        )
        
        if screenshot_info:
            self.current_session['screenshots'].append(screenshot_info)
            self.total_screenshots += 1
            
            print(f"Screenshot captured: {screenshot_info['file_path']}")
            
            # Call callback
            if self.on_screenshot:
                try:
                    self.on_screenshot(screenshot_info)
                except Exception as e:
                    print(f"Error in screenshot callback: {e}")
    
    def get_stats(self) -> Dict:
        """Get current tracking statistics."""
        return {
            'is_monitoring': self.is_monitoring,
            'total_sessions': self.total_sessions,
            'total_screenshots': self.total_screenshots,
            'current_session': self.current_session.copy() if self.current_session else None,
            'is_idle': self.idle_detector.is_idle,
            'time_since_activity': self.idle_detector.get_time_since_activity()
        }


if __name__ == "__main__":
    # Test activity tracker
    def on_start(session):
        print(f"[CALLBACK] Session started: {session}")
    
    def on_end(session):
        print(f"[CALLBACK] Session ended: {session}")
    
    def on_screenshot(screenshot):
        print(f"[CALLBACK] Screenshot captured: {screenshot['file_path']}")
    
    tracker = ActivityTracker(
        on_session_start=on_start,
        on_session_end=on_end,
        on_screenshot=on_screenshot
    )
    
    print("Starting activity tracker test...")
    print("Switch between applications to test session tracking")
    print("Press Ctrl+C to stop\n")
    
    try:
        tracker.start_monitoring()
        
        # Keep running
        while True:
            time.sleep(5)
            stats = tracker.get_stats()
            print(f"\n[STATS] Sessions: {stats['total_sessions']}, Screenshots: {stats['total_screenshots']}, Idle: {stats['is_idle']}")
            
    except KeyboardInterrupt:
        print("\nStopping...")
        tracker.stop_monitoring()
        print("Stopped")
