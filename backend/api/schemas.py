"""
Pydantic schemas for request/response validation.
Defines data transfer objects for API endpoints.
"""

from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import Optional, List


# User Schemas
class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=100)
    device_name: Optional[str] = Field(None, max_length=255)


class UserCreate(UserBase):
    password: str = Field(..., min_length=6, max_length=100)


class UserLogin(BaseModel):
    username: str
    password: str


# Usernames that are considered demo accounts (read-only, no uploads)
DEMO_USERNAMES = {"cloud_user"}


class UserResponse(UserBase):
    id: int
    is_admin: bool = False
    is_demo: bool = False
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

    @classmethod
    def from_user(cls, user) -> "UserResponse":
        """Create a UserResponse with computed is_demo flag."""
        return cls(
            id=user.id,
            username=user.username,
            device_name=user.device_name,
            is_admin=getattr(user, "is_admin", False),
            is_demo=user.username in DEMO_USERNAMES,
            created_at=user.created_at,
            updated_at=user.updated_at,
        )


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    username: Optional[str] = None


# Activity Session Schemas
class ActivitySessionBase(BaseModel):
    app_name: str = Field(..., max_length=255)
    window_title: Optional[str] = Field(None, max_length=500)
    process_id: Optional[int] = None


class ActivitySessionCreate(ActivitySessionBase):
    user_id: int
    start_time: datetime


class ActivitySessionUpdate(BaseModel):
    end_time: Optional[datetime] = None
    duration_seconds: Optional[float] = None


class ActivitySessionResponse(ActivitySessionBase):
    id: int
    user_id: int
    start_time: datetime
    end_time: Optional[datetime]
    duration_seconds: float
    source: str = "desktop"
    created_at: datetime
    screenshot_count: Optional[int] = 0
    
    model_config = ConfigDict(from_attributes=True)


# Screenshot Schemas
class ScreenshotBase(BaseModel):
    session_id: int
    captured_at: datetime


class ScreenshotCreate(ScreenshotBase):
    file_path: str
    file_size: Optional[int] = None
    is_encrypted: bool = False


class ScreenshotResponse(ScreenshotBase):
    id: int
    file_path: str
    file_size: Optional[int]
    is_encrypted: bool
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


# Analytics Schemas
class OverviewStats(BaseModel):
    total_active_hours_today: float
    total_sessions_today: int
    total_apps_tracked: int
    idle_time_today: float
    active_time_today: float


class AppDistribution(BaseModel):
    app_name: str
    total_duration: float
    session_count: int
    percentage: float


class TimelineData(BaseModel):
    hour: int
    active_minutes: float
    session_count: int


class TopApp(BaseModel):
    app_name: str
    total_duration: float
    session_count: int


class AnalyticsResponse(BaseModel):
    overview: OverviewStats
    app_distribution: List[AppDistribution]
    timeline: List[TimelineData]
    top_apps: List[TopApp]


# Pagination
class PaginatedResponse(BaseModel):
    items: List[ActivitySessionResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


# Export Schemas
class ExportRequest(BaseModel):
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
    app_name: Optional[str] = None
    format: str = Field("csv", pattern="^(csv|pdf)$")
