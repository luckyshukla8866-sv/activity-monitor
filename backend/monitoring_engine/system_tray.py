"""
System tray integration for background monitoring.
Provides start/stop controls and status indicator in system tray.
"""

import threading
from pystray import Icon, Menu, MenuItem
from PIL import Image, ImageDraw
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent))
from config import settings


class SystemTrayApp:
    """System tray application for activity monitoring."""
    
    def __init__(self, activity_tracker=None):
        """
        Initialize system tray app.
        
        Args:
            activity_tracker: ActivityTracker instance to control
        """
        self.activity_tracker = activity_tracker
        self.icon = None
        self.is_monitoring = False
    
    def create_icon_image(self, color="green"):
        """
        Create a simple icon image.
        
        Args:
            color: Icon color (green for active, red for paused)
        
        Returns:
            PIL Image
        """
        # Create a simple colored circle icon
        image = Image.new('RGB', (64, 64), color='white')
        draw = ImageDraw.Draw(image)
        draw.ellipse([8, 8, 56, 56], fill=color, outline='black')
        return image
    
    def toggle_monitoring(self, icon, item):
        """Toggle monitoring on/off."""
        if self.activity_tracker:
            if self.is_monitoring:
                self.activity_tracker.stop_monitoring()
                self.is_monitoring = False
                self.icon.icon = self.create_icon_image("red")
                self.icon.title = f"{settings.APP_NAME} - Paused"
            else:
                self.activity_tracker.start_monitoring()
                self.is_monitoring = True
                self.icon.icon = self.create_icon_image("green")
                self.icon.title = f"{settings.APP_NAME} - Monitoring"
    
    def show_stats(self, icon, item):
        """Show current statistics."""
        if self.activity_tracker:
            stats = self.activity_tracker.get_stats()
            print("\n=== Activity Monitor Stats ===")
            print(f"Status: {'Monitoring' if stats['is_monitoring'] else 'Paused'}")
            print(f"Total Sessions: {stats['total_sessions']}")
            print(f"Total Screenshots: {stats['total_screenshots']}")
            print(f"Currently Idle: {stats['is_idle']}")
            if stats['current_session']:
                print(f"Current App: {stats['current_session']['app_name']}")
            print("============================\n")
    
    def quit_app(self, icon, item):
        """Quit the application."""
        if self.activity_tracker and self.is_monitoring:
            self.activity_tracker.stop_monitoring()
        icon.stop()
    
    def run(self):
        """Run the system tray application."""
        # Create menu
        menu = Menu(
            MenuItem(
                'Start Monitoring' if not self.is_monitoring else 'Stop Monitoring',
                self.toggle_monitoring,
                default=True
            ),
            MenuItem('Show Stats', self.show_stats),
            MenuItem('Quit', self.quit_app)
        )
        
        # Create icon
        icon_color = "green" if self.is_monitoring else "red"
        self.icon = Icon(
            settings.APP_NAME,
            self.create_icon_image(icon_color),
            f"{settings.APP_NAME} - {'Monitoring' if self.is_monitoring else 'Paused'}",
            menu
        )
        
        # Run icon (blocking)
        self.icon.run()
    
    def run_in_thread(self):
        """Run system tray in a separate thread."""
        tray_thread = threading.Thread(target=self.run, daemon=True)
        tray_thread.start()
        return tray_thread


if __name__ == "__main__":
    # Test system tray
    print("Starting system tray test...")
    print("Right-click the tray icon to see menu")
    
    tray = SystemTrayApp()
    tray.run()
