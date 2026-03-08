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
if settings.DATABASE_URL.startswith("sqlite"):
    # SQLite-specific configuration
    engine = create_engine(
        settings.DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
        echo=settings.DEBUG
    )
else:
    # PostgreSQL or other databases
    engine = create_engine(
        settings.DATABASE_URL,
        pool_pre_ping=True,
        echo=settings.DEBUG
    )

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db():
    """Initialize database by creating all tables and running migrations."""
    Base.metadata.create_all(bind=engine)
    _run_migrations()
    print("✓ Database initialized successfully")


def _run_migrations():
    """
    Safe column migrations for existing databases.
    SQLite doesn't support ALTER TABLE ... ADD COLUMN IF NOT EXISTS,
    so we catch the error and skip if the column already exists.
    """
    migrations = [
        "ALTER TABLE activity_sessions ADD COLUMN mouse_clicks INTEGER NOT NULL DEFAULT 0",
        "ALTER TABLE activity_sessions ADD COLUMN key_presses INTEGER NOT NULL DEFAULT 0",
    ]
    with engine.connect() as conn:
        for sql in migrations:
            try:
                conn.execute(text(sql))
                conn.commit()
            except Exception:
                # Column already exists — safe to ignore
                pass


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
    print("✓ Database reset successfully")


if __name__ == "__main__":
    # Initialize database when run directly
    init_db()
