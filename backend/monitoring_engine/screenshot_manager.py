"""
Screenshot manager for capturing and managing screenshots during activity sessions.
Handles screenshot capture, compression, encryption, and storage.
"""

import os
import uuid
from datetime import datetime
from pathlib import Path
from typing import Optional, Dict, Any
from PIL import ImageGrab, Image
import sys

sys.path.append(str(Path(__file__).parent.parent))
from config import settings
from api.utils.encryption import encrypt_file


class ScreenshotManager:
    """Manages screenshot capture, storage, and encryption."""
    
    def __init__(self, screenshot_dir: Optional[Path] = None, quality: int = 85):
        """
        Initialize screenshot manager.
        
        Args:
            screenshot_dir: Directory to store screenshots. Uses settings if None.
            quality: JPEG compression quality (1-100)
        """
        self.screenshot_dir = screenshot_dir or settings.SCREENSHOT_DIR
        self.quality = quality
        self.screenshot_dir.mkdir(parents=True, exist_ok=True)
    
    def capture_screenshot(
        self,
        session_id: Optional[int] = None,
        encrypt: bool = True
    ) -> Optional[Dict[str, Any]]:
        """
        Capture a screenshot and save it to disk.
        
        Args:
            session_id: Optional session ID to associate with screenshot
            encrypt: Whether to encrypt the screenshot
        
        Returns:
            Dictionary with screenshot information or None if failed
            {
                'file_path': str,
                'file_size': int,
                'captured_at': datetime,
                'is_encrypted': bool,
                'session_id': int or None
            }
        """
        try:
            # Capture screenshot
            screenshot = ImageGrab.grab()
            
            # Generate unique filename
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            unique_id = str(uuid.uuid4())[:8]
            filename = f"screenshot_{timestamp}_{unique_id}.jpg"
            file_path = self.screenshot_dir / filename
            
            # Save screenshot with compression
            screenshot.save(file_path, "JPEG", quality=self.quality, optimize=True)
            
            # Get file size
            file_size = os.path.getsize(file_path)
            
            # Encrypt if requested
            is_encrypted = False
            if encrypt and settings.ENCRYPTION_KEY:
                if encrypt_file(file_path):
                    is_encrypted = True
            
            screenshot_info = {
                'file_path': str(file_path),
                'file_size': file_size,
                'captured_at': datetime.now(),
                'is_encrypted': is_encrypted,
                'session_id': session_id
            }
            
            return screenshot_info
            
        except Exception as e:
            print(f"Error capturing screenshot: {e}")
            return None
    
    def capture_region(
        self,
        bbox: tuple,
        session_id: Optional[int] = None,
        encrypt: bool = True
    ) -> Optional[Dict[str, Any]]:
        """
        Capture a specific region of the screen.
        
        Args:
            bbox: Bounding box as (left, top, right, bottom)
            session_id: Optional session ID
            encrypt: Whether to encrypt
        
        Returns:
            Screenshot information dictionary or None
        """
        try:
            screenshot = ImageGrab.grab(bbox=bbox)
            
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            unique_id = str(uuid.uuid4())[:8]
            filename = f"screenshot_region_{timestamp}_{unique_id}.jpg"
            file_path = self.screenshot_dir / filename
            
            screenshot.save(file_path, "JPEG", quality=self.quality, optimize=True)
            file_size = os.path.getsize(file_path)
            
            is_encrypted = False
            if encrypt and settings.ENCRYPTION_KEY:
                if encrypt_file(file_path):
                    is_encrypted = True
            
            return {
                'file_path': str(file_path),
                'file_size': file_size,
                'captured_at': datetime.now(),
                'is_encrypted': is_encrypted,
                'session_id': session_id
            }
            
        except Exception as e:
            print(f"Error capturing region screenshot: {e}")
            return None
    
    def delete_screenshot(self, file_path: Path) -> bool:
        """
        Delete a screenshot file.
        
        Args:
            file_path: Path to screenshot file
        
        Returns:
            True if deleted successfully, False otherwise
        """
        try:
            if file_path.exists():
                file_path.unlink()
                return True
            return False
        except Exception as e:
            print(f"Error deleting screenshot {file_path}: {e}")
            return False
    
    def cleanup_old_screenshots(self, days: int = 30) -> int:
        """
        Delete screenshots older than specified days.
        
        Args:
            days: Number of days to retain screenshots
        
        Returns:
            Number of screenshots deleted
        """
        from datetime import timedelta
        
        deleted_count = 0
        cutoff_time = datetime.now() - timedelta(days=days)
        
        try:
            for file_path in self.screenshot_dir.glob("screenshot_*.jpg"):
                # Get file modification time
                file_time = datetime.fromtimestamp(file_path.stat().st_mtime)
                
                if file_time < cutoff_time:
                    if self.delete_screenshot(file_path):
                        deleted_count += 1
            
            print(f"Cleaned up {deleted_count} old screenshots")
            return deleted_count
            
        except Exception as e:
            print(f"Error during cleanup: {e}")
            return deleted_count
    
    def get_screenshot_count(self) -> int:
        """Get total number of screenshots stored."""
        return len(list(self.screenshot_dir.glob("screenshot_*.jpg")))
    
    def get_total_size(self) -> int:
        """Get total size of all screenshots in bytes."""
        total_size = 0
        for file_path in self.screenshot_dir.glob("screenshot_*.jpg"):
            total_size += file_path.stat().st_size
        return total_size


if __name__ == "__main__":
    # Test screenshot manager
    manager = ScreenshotManager()
    
    print("Testing screenshot capture...")
    screenshot_info = manager.capture_screenshot(encrypt=False)
    
    if screenshot_info:
        print(f"Screenshot captured successfully:")
        print(f"  Path: {screenshot_info['file_path']}")
        print(f"  Size: {screenshot_info['file_size']} bytes")
        print(f"  Encrypted: {screenshot_info['is_encrypted']}")
        print(f"\nTotal screenshots: {manager.get_screenshot_count()}")
        print(f"Total size: {manager.get_total_size()} bytes")
    else:
        print("Failed to capture screenshot")
