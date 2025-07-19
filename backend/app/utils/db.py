from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from app.config import settings
import logging

logger = logging.getLogger(__name__)

# Determine connection arguments based on database type
def get_connect_args(database_url: str) -> dict:
    """Get appropriate connection arguments based on database type."""
    if database_url.startswith("postgresql"):
        # PostgreSQL/Supabase connection args
        return {
            "connect_args": {
                "sslmode": "require",  # Supabase requires SSL
                "application_name": "multimind-backend"
            }
        }
    elif database_url.startswith("mssql"):
        # SQL Server connection args
        return {
            "timeout": 30,
            "autocommit": False
        }
    else:
        return {}

# Sync engine for migrations and sync operations
try:
    database_url = settings.effective_database_url
    logger.info(f"Initializing database connection to: {database_url[:50]}...")
    
    # Extract connection args properly
    connect_config = get_connect_args(database_url)
    connect_args = connect_config.get("connect_args", {})
    
    engine = create_engine(
        database_url,
        echo=settings.debug,
        pool_pre_ping=True,
        pool_recycle=300,
        connect_args=connect_args
    )
    logger.info("Database engine created successfully")
except Exception as e:
    logger.error(f"Failed to create database engine: {e}")
    raise

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Async engine for application
try:
    async_database_url = settings.effective_async_database_url
    logger.info(f"Initializing async database connection to: {async_database_url[:50]}...")
    
    # Extract connection args for async engine
    connect_config = get_connect_args(async_database_url)
    connect_args = connect_config.get("connect_args", {})
    
    async_engine = create_async_engine(
        async_database_url,
        echo=settings.debug,
        pool_pre_ping=True,
        pool_recycle=300,
        connect_args=connect_args
    )
    logger.info("Async database engine created successfully")
except Exception as e:
    logger.error(f"Failed to create async database engine: {e}")
    raise

AsyncSessionLocal = sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    autocommit=False,
    autoflush=False
)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

async def get_async_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
