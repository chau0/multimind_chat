import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.utils.db import get_db, get_async_db, SessionLocal
from app.models.chat import Agent, Base
from app.services import llm_service
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
import asyncio
from unittest.mock import AsyncMock, patch

# Create test database engines
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
ASYNC_SQLALCHEMY_DATABASE_URL = "sqlite+aiosqlite:///./test.db"

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
async_engine = create_async_engine(ASYNC_SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
AsyncTestingSessionLocal = async_sessionmaker(autocommit=False, autoflush=False, bind=async_engine)

@pytest.fixture(scope="function")
def db_session():
    """Create a fresh database session for each test."""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
async def async_db_session():
    """Create a fresh async database session for each test."""
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    async with AsyncTestingSessionLocal() as session:
        try:
            yield session
        finally:
            pass
    
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

@pytest.fixture(scope="function")
def mock_llm_service():
    """Mock the LLM service to avoid API calls during testing."""
    with patch.object(llm_service, 'generate_response_async') as mock:
        mock.return_value = "Hello! This is a test response from the agent."
        yield mock

@pytest.fixture(scope="function")
def client(db_session, mock_llm_service):
    """Create a test client with dependency overrides."""
    async def override_get_async_db():
        async with AsyncTestingSessionLocal() as session:
            try:
                yield session
            finally:
                pass
    
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_async_db] = override_get_async_db
    
    with TestClient(app) as test_client:
        yield test_client
    
    app.dependency_overrides.clear()

@pytest.fixture(scope="function")
def test_agents(db_session):
    """Create test agents in the database."""
    agents = [
        Agent(name="Echo", description="A simple agent that echoes your message."),
        Agent(name="TestBot", description="A test agent for e2e testing.")
    ]
    
    for agent in agents:
        db_session.add(agent)
    
    db_session.commit()
    return agents