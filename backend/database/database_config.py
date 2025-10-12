import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool

# Get database URL from environment variable
DATABASE_URL = os.getenv("DATABASE_URL")

# Determine if running on Vercel (production) or locally
if DATABASE_URL:
    # Production: PostgreSQL/Supabase connection
    # Fix SQLAlchemy dialect if needed
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
    
    # Use NullPool for serverless environments
    engine = create_engine(
        DATABASE_URL,
        poolclass=NullPool,
        connect_args={"sslmode": "require"}
    )
else:
    # Local development: SQLite connection
    os.makedirs("data", exist_ok=True)
    DATABASE_URL = "sqlite:///./data/database.db"
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False}
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Dependency for getting database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
