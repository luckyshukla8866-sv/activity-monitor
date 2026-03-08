"""
Database models for Activity Monitor application.
Defines Users, ActivitySessions, and Screenshots tables using SQLAlchemy ORM.
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, Float, BigInteger
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()


class User(Base):
    """User model for authentication and tracking."""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    device_name = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    sessions = relationship("ActivitySession", back_populates="user", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<User(id={self.id}, username='{self.username}', device='{self.device_name}')>"


class ActivitySession(Base):
    """Activity session model tracking application usage."""
    __tablename__ = "activity_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    app_name = Column(String(255), nullable=False, index=True)
    window_title = Column(String(500), nullable=True)
    process_id = Column(Integer, nullable=True)
    start_time = Column(DateTime, nullable=False, index=True)
    end_time = Column(DateTime, nullable=True, index=True)
    duration_seconds = Column(Float, default=0.0, nullable=False)
    mouse_clicks = Column(BigInteger, default=0, nullable=False)   # Total mouse clicks in this session
    key_presses  = Column(BigInteger, default=0, nullable=False)   # Total key presses in this session
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="sessions")
    screenshots = relationship("Screenshot", back_populates="session", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<ActivitySession(id={self.id}, app='{self.app_name}', duration={self.duration_seconds}s)>"
    
    def update_duration(self):
        """Calculate and update duration based on start and end times."""
        if self.end_time and self.start_time:
            delta = self.end_time - self.start_time
            self.duration_seconds = delta.total_seconds()


class Screenshot(Base):
    """Screenshot model for captured images during activity sessions."""
    __tablename__ = "screenshots"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("activity_sessions.id"), nullable=False, index=True)
    file_path = Column(String(500), nullable=False)
    captured_at = Column(DateTime, nullable=False, index=True)
    file_size = Column(Integer, nullable=True)  # Size in bytes
    is_encrypted = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    session = relationship("ActivitySession", back_populates="screenshots")
    
    def __repr__(self):
        return f"<Screenshot(id={self.id}, session_id={self.session_id}, captured_at={self.captured_at})>"
