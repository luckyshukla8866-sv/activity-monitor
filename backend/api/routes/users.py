"""
User management API routes.
Handles user registration, login, and profile management.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent.parent))
from config import settings
from api.database import get_db
from api.models import User
from api.schemas import UserCreate, UserResponse, UserLogin, Token
from api.auth import (
    get_password_hash,
    authenticate_user,
    create_access_token,
    get_current_active_user
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user.
    
    Args:
        user: User registration data
        db: Database session
    
    Returns:
        Created user information
    
    Raises:
        HTTPException: If username already exists
    """
    # Check if username already exists
    existing_user = db.query(User).filter(User.username == user.username).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    # Create new user
    db_user = User(
        username=user.username,
        password_hash=get_password_hash(user.password),
        device_name=user.device_name
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user


@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """
    Login and receive access token.
    
    Args:
        form_data: OAuth2 form with username and password
        db: Database session
    
    Returns:
        Access token
    
    Raises:
        HTTPException: If authentication fails
    """
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.JWT_EXPIRATION_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username},
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_active_user)):
    """
    Get current user information.
    
    Args:
        current_user: Current authenticated user
    
    Returns:
        User information with computed is_demo flag
    """
    return UserResponse.from_user(current_user)


@router.put("/me", response_model=UserResponse)
async def update_current_user(
    device_name: str = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Update current user profile.
    
    Args:
        device_name: New device name
        current_user: Current authenticated user
        db: Database session
    
    Returns:
        Updated user information
    """
    if device_name is not None:
        current_user.device_name = device_name
    
    db.commit()
    db.refresh(current_user)
    
    return current_user
