import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool

# Get database URL from environment variable
DATABASE_URL = os.getenv("DATABASE_URL")

# Check if running on Vercel or local
if DATABASE_URL:
    # PRODUCTION: Running on Vercel with PostgreSQL/Supabase
    # Fix dialect name if needed
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
    
    # Use NullPool for serverless (no persistent connections)
    engine = create_engine(
        DATABASE_URL,
        poolclass=NullPool,
        connect_args={"sslmode": "require"}
    )
else:
    # LOCAL DEVELOPMENT: Use SQLite
    # ONLY create directory when DATABASE_URL is not set (local dev)
    os.makedirs("data", exist_ok=True)
    
    engine = create_engine(
        "sqlite:///./data/database.db",
        connect_args={"check_same_thread": False}
    )

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()

# Dependency for FastAPI routes
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
