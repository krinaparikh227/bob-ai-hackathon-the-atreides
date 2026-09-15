"""
Database Session Manager
========================
Provides connection pooling, engine configuration, and session factory
for PostgreSQL and SQLite with zero external setup friction.
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Database URL retrieval with SQLite fallback
DEFAULT_SQLITE_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "atreides_enterprise.db"))
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{DEFAULT_SQLITE_PATH}")

# If SQLite, ensure connect_args allows multi-threaded requests
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},
        echo=False
    )
else:
    engine = create_engine(
        DATABASE_URL,
        pool_size=10,
        max_overflow=20,
        pool_recycle=3600,
        echo=False
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """
    Dependency generator yielding a scoped database session.

    @purpose     - Provide managed transactional database session to API route handlers.
    @param       - None
    @returns     - Generator yielding SQLAlchemy Session instance.
    @validates   - Ensures session closure after request termination.
    @redirects   - None
    @edge-cases  - Automatically closes session upon exception or unhandled exit.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
