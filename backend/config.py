"""
Configuration management for Activity Monitor application.
Supports environment variables and .env file for secure configuration.
"""

import os
from pathlib import Path
from typing import Optional
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Settings:
    """Application settings with environment variable support."""
    
    # Base directories
    BASE_DIR = Path(__file__).parent
    SCREENSHOT_DIR = BASE_DIR / "screenshots"
    DATABASE_DIR = BASE_DIR / "data"
    
    # Database configuration
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        f"sqlite:///{DATABASE_DIR / 'activity_monitor_empty.db'}"
    )
    
    # Monitoring settings
    IDLE_TIMEOUT_SECONDS: int = int(os.getenv("IDLE_TIMEOUT_SECONDS", "120"))
    SCREENSHOT_INTERVAL_SECONDS: int = int(os.getenv("SCREENSHOT_INTERVAL_SECONDS", "300"))
    SCREENSHOT_QUALITY: int = int(os.getenv("SCREENSHOT_QUALITY", "85"))
    SCREENSHOT_ENABLED: bool = os.getenv("SCREENSHOT_ENABLED", "true").lower() == "true"
    
    # Security settings
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
    ENCRYPTION_KEY: Optional[str] = os.getenv("ENCRYPTION_KEY")
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_MINUTES: int = int(os.getenv("JWT_EXPIRATION_MINUTES", "1440"))  # 24 hours
    
    # Storage settings
    SCREENSHOT_RETENTION_DAYS: int = int(os.getenv("SCREENSHOT_RETENTION_DAYS", "30"))
    MAX_SCREENSHOT_SIZE_MB: int = int(os.getenv("MAX_SCREENSHOT_SIZE_MB", "5"))
    
    # API settings
    API_HOST: str = os.getenv("API_HOST", "127.0.0.1")
    API_PORT: int = int(os.getenv("API_PORT", "8000"))
    API_RELOAD: bool = os.getenv("API_RELOAD", "false").lower() == "true"
    
    # CORS settings
    CORS_ORIGINS: list = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:3001,activity-monitor-seven.vercel.app").split(",")
    
    # Application settings
    APP_NAME: str = "Activity Monitor"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"
    
    @classmethod
    def ensure_directories(cls):
        """Create necessary directories if they don't exist."""
        cls.SCREENSHOT_DIR.mkdir(parents=True, exist_ok=True)
        cls.DATABASE_DIR.mkdir(parents=True, exist_ok=True)
    
    @classmethod
    def get_screenshot_path(cls, filename: str) -> Path:
        """Get full path for a screenshot file."""
        return cls.SCREENSHOT_DIR / filename
    
    @classmethod
    def validate_settings(cls) -> bool:
        """Validate critical settings."""
        has_issues = False
        
        # Check SECRET_KEY
        if cls.SECRET_KEY == "your-secret-key-change-in-production":
            if not cls.DEBUG:
                print("❌ CRITICAL ERROR: Using default SECRET_KEY in production mode!")
                print("   Generate a strong key with: openssl rand -hex 32")
                print("   Add it to .env as SECRET_KEY=<generated-key>")
                raise ValueError("Cannot start in production mode with default SECRET_KEY")
            else:
                print("⚠️  WARNING: Using default SECRET_KEY in development mode")
                print("   This is OK for development but MUST be changed for production")
                has_issues = True
        
        # Check ENCRYPTION_KEY
        if not cls.ENCRYPTION_KEY:
            if cls.SCREENSHOT_ENABLED:
                if not cls.DEBUG:
                    print("❌ CRITICAL ERROR: No ENCRYPTION_KEY set with screenshots enabled in production!")
                    print("   Generate a key with: python -c \"from api.utils.encryption import EncryptionManager; print(EncryptionManager.generate_key())\"")
                    print("   Add it to .env as ENCRYPTION_KEY=<generated-key>")
                    raise ValueError("Cannot start in production mode without ENCRYPTION_KEY when screenshots are enabled")
                else:
                    print("⚠️  WARNING: No ENCRYPTION_KEY set. Screenshots will NOT be encrypted!")
                    print("   Generate a key with: python -c \"from api.utils.encryption import EncryptionManager; print(EncryptionManager.generate_key())\"")
                    has_issues = True
        
        # Production mode validation summary
        if not cls.DEBUG and not has_issues:
            print("✓ Security configuration validated for production mode")
        
        return not has_issues


# Initialize settings
settings = Settings()
settings.ensure_directories()
settings.validate_settings()
