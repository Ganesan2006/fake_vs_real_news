import os

# Remove or comment out this line:
# os.makedirs("data", exist_ok=True)

# Use environment variable to determine database connection
DATABASE_URL = os.getenv("DATABASE_URL")

if DATABASE_URL:
    # PostgreSQL connection for production (Vercel)
    SQLALCHEMY_DATABASE_URI = DATABASE_URL
    if SQLALCHEMY_DATABASE_URI.startswith("postgres://"):
        # Fix SQLAlchemy dialect error
        SQLALCHEMY_DATABASE_URI = SQLALCHEMY_DATABASE_URI.replace("postgres://", "postgresql://", 1)
else:
    # SQLite for local development only
    os.makedirs("data", exist_ok=True)
    SQLALCHEMY_DATABASE_URI = "sqlite:///data/database.db"
