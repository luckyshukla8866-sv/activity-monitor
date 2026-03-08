"""
Test script to diagnose window detection issues.
Run this to see if window detection is working.
"""

import sys
from pathlib import Path

# Add parent directory to path
sys.path.append(str(Path(__file__).parent))

from monitoring_engine.window_detector import WindowDetector
from monitoring_engine.idle_detector import IdleDetector
import time

def test_window_detection():
    """Test if window detection is working."""
    print("="*60)
    print("Window Detection Test")
    print("="*60)
    print()
    
    detector = WindowDetector()
    
    print("Testing window detection for 30 seconds...")
    print("Switch between different applications to test detection")
    print()
    
    for i in range(30):
        window = detector.get_active_window()
        
        if window:
            print(f"[{i+1}] App: {window['app_name']:<20} | Title: {window['window_title'][:50]}")
        else:
            print(f"[{i+1}] No window detected")
        
        time.sleep(1)
    
    print()
    print("Test complete!")

def test_idle_detection():
    """Test if idle detection is working."""
    print()
    print("="*60)
    print("Idle Detection Test")
    print("="*60)
    print()
    
    idle_detector = IdleDetector(idle_timeout=10)  # 10 seconds for testing
    
    print("Testing idle detection for 30 seconds...")
    print("Stop moving mouse/keyboard to test idle detection")
    print()
    
    for i in range(30):
        is_idle = idle_detector.check_idle()
        time_since = idle_detector.get_time_since_activity()
        
        status = "IDLE" if is_idle else "ACTIVE"
        print(f"[{i+1}] Status: {status:<10} | Time since activity: {time_since:.1f}s")
        
        time.sleep(1)
    
    print()
    print("Test complete!")

if __name__ == "__main__":
    try:
        test_window_detection()
        test_idle_detection()
    except KeyboardInterrupt:
        print("\n\nTest interrupted by user")
    except Exception as e:
        print(f"\n\nError during test: {e}")
        import traceback
        traceback.print_exc()
