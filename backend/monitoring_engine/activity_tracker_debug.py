"""
Enhanced activity tracker with debug logging.
This version adds detailed logging to help diagnose why sessions aren't being created.
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


class ActivityTrackerDebug:
    """
    Activity tracker with enhanced debug logging.
    """
    
    def __init__(
        self,
        on_session_start: Optional[Callable] = None,
        on_session_end: Optional[Callable] = None,
        on_screenshot: Optional[Callable] = None
    ):
        print("[DEBUG] Initializing ActivityTrackerDebug...")
        
        # Components
        self.window_detector = WindowDetector(poll_interval=2.0)
        self.idle_detector = IdleDetector()
        self.screenshot_manager = ScreenshotManager()
        
        # Callbacks
        self.on_session_start = on_session_start
        self.on_session_end = on_session_end
        self.on_screenshot = on_screenshot
        
        print(f"[DEBUG] Callbacks registered: start={on_session_start is not None}, end={on_session_end is not None}, screenshot={on_screenshot is not None}")
        
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
        
        print("[DEBUG] ActivityTrackerDebug initialized successfully")
    
    def _on_mouse_activity(self, *args):
        """Internal callback for mouse activity."""
        if self.is_monitoring:
            self.idle_detector.reset_activity()
    
    def _on_keyboard_activity(self, *args):
        """Internal callback for keyboard activity."""
        if self.is_monitoring:
            self.idle_detector.reset_activity()
    
    def start_monitoring(self):
        """Start monitoring user activity."""
        if self.is_monitoring:
            print("[DEBUG] Monitoring already active")
            return
        
        print("[DEBUG] Starting activity monitoring...")
        self.is_monitoring = True
        self.stop_event.clear()
        
        # Start input listeners
        print("[DEBUG] Starting input listeners...")
        self.mouse_listener = mouse.Listener(
            on_move=self._on_mouse_activity,
            on_click=self._on_mouse_activity,
            on_scroll=self._on_mouse_activity
        )
        self.keyboard_listener = keyboard.Listener(
            on_press=self._on_keyboard_activity,
            on_release=self._on_keyboard_activity
        )
        
        self.mouse_listener.start()
        self.keyboard_listener.start()
        print("[DEBUG] Input listeners started")
        
        # Start monitoring thread
        print("[DEBUG] Starting monitor thread...")
        self.monitor_thread = threading.Thread(target=self._monitor_loop, daemon=True)
        self.monitor_thread.start()
        print("[DEBUG] Monitor thread started")
        
        # Start screenshot thread if enabled
        if settings.SCREENSHOT_ENABLED:
            print(f"[DEBUG] Starting screenshot thread (interval: {settings.SCREENSHOT_INTERVAL_SECONDS}s)...")
            self.screenshot_thread = threading.Thread(target=self._screenshot_loop, daemon=True)
            self.screenshot_thread.start()
            print("[DEBUG] Screenshot thread started")
        else:
            print("[DEBUG] Screenshots disabled in settings")
        
        print("✓ Activity monitoring started")
    
    def stop_monitoring(self):
        """Stop monitoring user activity."""
        if not self.is_monitoring:
            print("[DEBUG] Monitoring not active")
            return
        
        print("[DEBUG] Stopping activity monitoring...")
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
        """Main monitoring loop with debug logging."""
        previous_window = None
        loop_count = 0
        
        print("[DEBUG] Monitor loop started - entering main loop")
        
        while not self.stop_event.is_set():
            try:
                loop_count += 1
                
                # Debug logging every 10 iterations (10 seconds)
                if loop_count % 10 == 0:
                    print(f"[DEBUG] Monitor loop iteration {loop_count}")
                
                # Check idle state
                is_idle = self.idle_detector.check_idle()
                
                if loop_count <= 3:
                    print(f"[DEBUG] Idle status: {is_idle}")
                
                if is_idle:
                    # User is idle - end current session if active
                    if self.current_session:
                        print("[DEBUG] User is idle, ending session")
                        self._end_session()
                else:
                    # User is active - check for window changes
                    current_window = self.window_detector.get_active_window()
                    
                    if loop_count <= 3:
                        if current_window:
                            print(f"[DEBUG] Window detected: {current_window['app_name']} - {current_window['window_title'][:50]}")
                        else:
                            print("[DEBUG] No window detected")
                    
                    if current_window:
                        # Check if window changed
                        has_changed = self.window_detector.has_window_changed(current_window)
                        
                        if loop_count <= 3:
                            print(f"[DEBUG] Window changed: {has_changed}")
                        
                        if has_changed:
                            print(f"[DEBUG] Window changed to: {current_window['app_name']}")
                            
                            # Update the window detector's current window
                            self.window_detector.update_current_window(current_window)
                            
                            # End previous session
                            if self.current_session:
                                print("[DEBUG] Ending previous session")
                                self._end_session()
                            
                            # Start new session
                            print("[DEBUG] Starting new session")
                            self._start_session(current_window)
                        
                        previous_window = current_window
                
                time.sleep(1.0)  # Check every second
                
            except Exception as e:
                print(f"[ERROR] Error in monitor loop: {e}")
                import traceback
                traceback.print_exc()
                time.sleep(1.0)
    
    def _start_session(self, window_info: Dict):
        """Start a new activity session."""
        print(f"[DEBUG] _start_session called for: {window_info['app_name']}")
        
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
            print("[DEBUG] Calling on_session_start callback")
            try:
                self.on_session_start(self.current_session.copy())
                print("[DEBUG] on_session_start callback completed")
            except Exception as e:
                print(f"[ERROR] Error in session start callback: {e}")
                import traceback
                traceback.print_exc()
        else:
            print("[DEBUG] No on_session_start callback registered!")
    
    def _end_session(self):
        """End the current activity session."""
        if not self.current_session:
            print("[DEBUG] _end_session called but no current session")
            return
        
        print(f"[DEBUG] _end_session called for: {self.current_session['app_name']}")
        
        self.current_session['end_time'] = datetime.now()
        
        # Calculate duration
        duration = (
            self.current_session['end_time'] - self.current_session['start_time']
        ).total_seconds()
        self.current_session['duration_seconds'] = duration
        
        print(f"Session ended: {self.current_session['app_name']} ({duration:.1f}s)")
        
        # Call callback
        if self.on_session_end:
            print("[DEBUG] Calling on_session_end callback")
            try:
                self.on_session_end(self.current_session.copy())
                print("[DEBUG] on_session_end callback completed")
            except Exception as e:
                print(f"[ERROR] Error in session end callback: {e}")
                import traceback
                traceback.print_exc()
        else:
            print("[DEBUG] No on_session_end callback registered!")
        
        self.current_session = None
        self.last_screenshot_time = None
    
    def _screenshot_loop(self):
        """Background loop for periodic screenshot capture."""
        print("[DEBUG] Screenshot loop started")
        
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
                        print("[DEBUG] Capturing screenshot...")
                        self._capture_screenshot()
                        self.last_screenshot_time = now
                
                time.sleep(10)  # Check every 10 seconds
                
            except Exception as e:
                print(f"[ERROR] Error in screenshot loop: {e}")
                import traceback
                traceback.print_exc()
                time.sleep(10)
    
    def _capture_screenshot(self):
        """Capture a screenshot for the current session."""
        if not self.current_session:
            print("[DEBUG] _capture_screenshot called but no current session")
            return
        
        session_id = self.current_session.get('id')  # May be None if not saved to DB yet
        
        print(f"[DEBUG] Capturing screenshot for session_id: {session_id}")
        
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
                print("[DEBUG] Calling on_screenshot callback")
                try:
                    self.on_screenshot(screenshot_info)
                    print("[DEBUG] on_screenshot callback completed")
                except Exception as e:
                    print(f"[ERROR] Error in screenshot callback: {e}")
                    import traceback
                    traceback.print_exc()
            else:
                print("[DEBUG] No on_screenshot callback registered!")
        else:
            print("[DEBUG] Screenshot capture failed - no screenshot_info returned")
    
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
