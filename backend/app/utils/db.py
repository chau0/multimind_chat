from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from app.config import settings

# Determine connection arguments based on database type
def get_connect_args(database_url: str) -> dict:
    """Get appropriate connection arguments based on database type."""
    if database_url.startswith("postgresql"):
        # PostgreSQL connection args
        return {}
    elif database_url.startswith("mssql"):
        # SQL Server connection args
        return {
            "timeout": 30,
            "autocommit": False
        }
    else:
        return {}

# Sync engine for migrations and sync operations
engine = create_engine(
    settings.effective_database_url,
    echo=settings.debug,
    pool_pre_ping=True,
    pool_recycle=300,
    connect_args=get_connect_args(settings.effective_database_url)
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Async engine for application
async_engine = create_async_engine(
    settings.effective_async_database_url,
    echo=settings.debug,
    pool_pre_ping=True,
    pool_recycle=300
)

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
