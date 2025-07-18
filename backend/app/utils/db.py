from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from app.config import settings

# Sync engine for migrations and sync operations
engine = create_engine(
    settings.database_url,
    echo=settings.debug,
    pool_pre_ping=True,
    pool_recycle=300,
    connect_args={
        "timeout": 30,
        "autocommit": False
    }
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Async engine for application
async_engine = create_async_engine(
    settings.async_database_url,
    echo=settings.debug,
    pool_pre_ping=True,
    pool_recycle=300
)

AsyncSessionLocal = async_sessionmaker(
    bind=async_engine,
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
