"""
Idle detector for tracking user inactivity.
Monitors time since last input and triggers idle state when threshold exceeded.
"""

import time
from datetime import datetime, timedelta
from typing import Optional, Callable
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent))
from config import settings


class IdleDetector:
    """Detects user idle state based on activity timeout."""
    
    def __init__(self, idle_timeout: int = None):
        """
        Initialize idle detector.
        
        Args:
            idle_timeout: Idle timeout in seconds. Uses settings if None.
        """
        self.idle_timeout = idle_timeout or settings.IDLE_TIMEOUT_SECONDS
        self.last_activity_time = datetime.now()
        self.is_idle = False
        self.idle_start_time = None
    
    def reset_activity(self):
        """Reset activity timer (call when user input detected)."""
        was_idle = self.is_idle
        self.last_activity_time = datetime.now()
        self.is_idle = False
        
        if was_idle:
            # User became active again
            self.idle_start_time = None
            return True  # Indicates transition from idle to active
        return False
    
    def check_idle(self) -> bool:
        """
        Check if user is currently idle.
        
        Returns:
            True if idle, False if active
        """
        time_since_activity = (datetime.now() - self.last_activity_time).total_seconds()
        
        if time_since_activity >= self.idle_timeout:
            if not self.is_idle:
                # Just became idle
                self.is_idle = True
                self.idle_start_time = datetime.now()
            return True
        else:
            self.is_idle = False
            self.idle_start_time = None
            return False
    
    def get_idle_duration(self) -> float:
        """
        Get current idle duration in seconds.
        
        Returns:
            Idle duration in seconds, or 0 if not idle
        """
        if self.is_idle and self.idle_start_time:
            return (datetime.now() - self.idle_start_time).total_seconds()
        return 0.0
    
    def get_time_since_activity(self) -> float:
        """
        Get time since last activity in seconds.
        
        Returns:
            Seconds since last activity
        """
        return (datetime.now() - self.last_activity_time).total_seconds()
    
    def set_idle_timeout(self, timeout: int):
        """
        Update idle timeout.
        
        Args:
            timeout: New timeout in seconds
        """
        self.idle_timeout = timeout
    
    def monitor_idle_state(
        self,
        on_idle: Optional[Callable] = None,
        on_active: Optional[Callable] = None,
        check_interval: float = 1.0,
        stop_event=None
    ):
        """
        Continuously monitor idle state and trigger callbacks.
        
        Args:
            on_idle: Callback function when user becomes idle
            on_active: Callback function when user becomes active
            check_interval: Time between checks in seconds
            stop_event: Optional threading.Event to signal monitoring stop
        """
        print(f"Starting idle monitoring (timeout: {self.idle_timeout}s)...")
        
        previous_state = False
        
        while True:
            if stop_event and stop_event.is_set():
                print("Idle monitoring stopped")
                break
            
            current_state = self.check_idle()
            
            # Detect state transitions
            if current_state and not previous_state:
                # Became idle
                if on_idle:
                    on_idle()
            elif not current_state and previous_state:
                # Became active
                if on_active:
                    on_active()
            
            previous_state = current_state
            time.sleep(check_interval)


if __name__ == "__main__":
    # Test idle detector
    def on_idle_callback():
        print(f"[{datetime.now().strftime('%H:%M:%S')}] User is now IDLE")
    
    def on_active_callback():
        print(f"[{datetime.now().strftime('%H:%M:%S')}] User is now ACTIVE")
    
    detector = IdleDetector(idle_timeout=10)  # 10 seconds for testing
    
    print("Testing idle detection (10 second timeout)...")
    print("Move mouse or press keys to reset activity timer")
    print("Press Ctrl+C to stop\n")
    
    try:
        # Simulate activity for testing
        import threading
        
        def simulate_activity():
            time.sleep(5)
            print("Simulating activity...")
            detector.reset_activity()
            
            time.sleep(15)
            print("Simulating activity again...")
            detector.reset_activity()
        
        activity_thread = threading.Thread(target=simulate_activity)
        activity_thread.start()
        
        detector.monitor_idle_state(
            on_idle=on_idle_callback,
            on_active=on_active_callback,
            check_interval=1.0
        )
        
    except KeyboardInterrupt:
        print("\nStopped")
