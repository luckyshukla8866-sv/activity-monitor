"""
Database connection and session management.
Provides SQLAlchemy engine, session factory, and database initialization.
"""

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool
from typing import Generator
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.append(str(Path(__file__).parent.parent))

from config import settings
from api.models import Base


# Create SQLAlchemy engine
db_url = settings.DATABASE_URL
# Fix: Ensure URL uses postgresql+psycopg2 for explicit driver
if db_url.startswith("postgres://") and "psycopg2" not in db_url:
    db_url = db_url.replace("postgres://", "postgresql+psycopg2://", 1)
elif db_url.startswith("postgresql://") and "psycopg2" not in db_url:
    db_url = db_url.replace("postgresql://", "postgresql+psycopg2://", 1)

if db_url.startswith("sqlite"):
    # SQLite-specific configuration
    engine = create_engine(
        db_url,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
        echo=settings.DEBUG,
    )
else:
    # PostgreSQL or other databases
    engine = create_engine(db_url, pool_pre_ping=True, echo=settings.DEBUG)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db():
    """Initialize database and run migrations."""
    from sqlalchemy import inspect
    import alembic.config
    import alembic.command
    
    # Alembic configuration
    alembic_cfg = alembic.config.Config(str(Path(__file__).parent.parent / "alembic.ini"))
    
    inspector = inspect(engine)
    
    # Check if this is an existing database without Alembic tracking
    if inspector.has_table("users") and not inspector.has_table("alembic_version"):
        # This handles existing SQLite databases. Stamp it to "head" so we don't try to recreate tables.
        print("Existing database detected. Stamping Alembic to head...")
        alembic.command.stamp(alembic_cfg, "head")
    else:
        # For new databases (like a fresh PostgreSQL DB) or already-tracked databases, upgrade to head.
        print("Running Alembic migrations to upgrade database to head...")
        alembic.command.upgrade(alembic_cfg, "head")
        
    print("[OK] Database initialized successfully")


def get_db() -> Generator[Session, None, None]:
    """
    Dependency function to get database session.
    Yields a database session and ensures it's closed after use.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def reset_db():
    """Drop all tables and recreate them. USE WITH CAUTION!"""
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    print("[OK] Database reset successfully")


if __name__ == "__main__":
    # Initialize database when run directly
    init_db()
