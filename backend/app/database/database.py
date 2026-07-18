import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Load configuration from .env file
# This loads from the backend/.env directory
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./sql_app.db")

# Resolve common 'postgres://' prefix incompatibilities with SQLAlchemy 2.0
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Setup SQLite connect args (necessary for concurrent FastAPI threads)
connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

# Create engine with connection pool parameters for serverless databases
engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    pool_recycle=300,        # Recycle connections every 5 minutes
    pool_pre_ping=True       # Test connection availability before running queries
)

# Create session maker
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Declarative Base for models
Base = declarative_base()

# DB Dependency injection helper
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()