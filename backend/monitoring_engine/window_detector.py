"""
Window detector for tracking active application windows.
Uses pygetwindow and psutil to detect active windows and process information.
"""

import time
import psutil
from typing import Optional, Dict
from datetime import datetime
import sys
from pathlib import Path

try:
    import pygetwindow as gw
except ImportError:
    print("Warning: pygetwindow not available. Window detection will be limited.")
    gw = None


class WindowDetector:
    """Detects and tracks active application windows."""
    
    def __init__(self, poll_interval: float = 1.0):
        """
        Initialize window detector.
        
        Args:
            poll_interval: Time in seconds between window checks
        """
        self.poll_interval = poll_interval
        self.current_window = None
        self.last_check_time = None
    
    def get_active_window(self) -> Optional[Dict[str, any]]:
        """
        Get information about the currently active window.
        
        Returns:
            Dictionary with window information or None if unavailable
            {
                'app_name': str,
                'window_title': str,
                'process_id': int,
                'timestamp': datetime
            }
        """
        try:
            if gw is None:
                return self._get_active_window_fallback()
            
            # Get active window using pygetwindow
            active_window = gw.getActiveWindow()
            
            if active_window is None:
                return None
            
            window_title = active_window.title
            
            # Try to get process information
            process_id = None
            app_name = "Unknown"
            
            try:
                # Get process ID from window (platform-specific)
                if hasattr(active_window, '_hWnd'):  # Windows
                    import win32process
                    import win32gui
                    _, process_id = win32process.GetWindowThreadProcessId(active_window._hWnd)
                    
                    if process_id:
                        process = psutil.Process(process_id)
                        app_name = process.name()
            except Exception as e:
                # Fallback: try to extract app name from window title
                if window_title:
                    # Common pattern: "Document - Application Name"
                    parts = window_title.split(' - ')
                    if len(parts) > 1:
                        app_name = parts[-1]
                    else:
                        app_name = window_title.split()[0] if window_title else "Unknown"
            
            window_info = {
                'app_name': app_name,
                'window_title': window_title,
                'process_id': process_id,
                'timestamp': datetime.now()
            }
            
            # Don't update self.current_window here - let the caller do it after checking for changes
            self.last_check_time = datetime.now()
            
            return window_info
            
        except Exception as e:
            print(f"Error detecting active window: {e}")
            return None
    
    def _get_active_window_fallback(self) -> Optional[Dict[str, any]]:
        """
        Fallback method for getting active window on Windows.
        Uses win32gui if available.
        """
        try:
            import win32gui
            import win32process
            
            hwnd = win32gui.GetForegroundWindow()
            window_title = win32gui.GetWindowText(hwnd)
            
            _, process_id = win32process.GetWindowThreadProcessId(hwnd)
            
            app_name = "Unknown"
            if process_id:
                try:
                    process = psutil.Process(process_id)
                    app_name = process.name()
                except:
                    pass
            
            return {
                'app_name': app_name,
                'window_title': window_title,
                'process_id': process_id,
                'timestamp': datetime.now()
            }
        except ImportError:
            print("Warning: win32gui not available. Install pywin32 for better window detection.")
            return None
        except Exception as e:
            print(f"Error in fallback window detection: {e}")
            return None
    
    def has_window_changed(self, new_window: Dict[str, any]) -> bool:
        """
        Check if the window has changed from the last detected window.
        
        Args:
            new_window: New window information
        
        Returns:
            True if window has changed, False otherwise
        """
        if self.current_window is None:
            return True
        
        # Compare app name and window title
        return (
            new_window.get('app_name') != self.current_window.get('app_name') or
            new_window.get('window_title') != self.current_window.get('window_title')
        )
    
    def update_current_window(self, window_info: Dict[str, any]):
        """
        Update the current window after confirming it has changed.
        
        Args:
            window_info: New window information to set as current
        """
        self.current_window = window_info
    
    def monitor_window_changes(self, callback, stop_event=None):
        """
        Continuously monitor for window changes and call callback when detected.
        
        Args:
            callback: Function to call when window changes. Receives window info dict.
            stop_event: Optional threading.Event to signal monitoring stop
        """
        print("Starting window monitoring...")
        
        while True:
            if stop_event and stop_event.is_set():
                print("Window monitoring stopped")
                break
            
            window_info = self.get_active_window()
            
            if window_info and self.has_window_changed(window_info):
                callback(window_info)
            
            time.sleep(self.poll_interval)


if __name__ == "__main__":
    # Test window detector
    def on_window_change(window_info):
        print(f"Window changed: {window_info['app_name']} - {window_info['window_title']}")
    
    detector = WindowDetector(poll_interval=2.0)
    
    print("Testing window detection (Ctrl+C to stop)...")
    print(f"Current window: {detector.get_active_window()}")
    
    try:
        detector.monitor_window_changes(on_window_change)
    except KeyboardInterrupt:
        print("\nStopped")
