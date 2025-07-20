import pytest
import pytest_asyncio
from fastapi.testclient import TestClient
from httpx import AsyncClient
import os

# Set test environment variables before importing app modules
os.environ["AZURE_SQL_SERVER"] = "test"
os.environ["AZURE_SQL_DATABASE"] = "test"
os.environ["AZURE_SQL_USERNAME"] = "test"
os.environ["AZURE_SQL_PASSWORD"] = "test"

# Clear environment variables that might interfere with config tests
config_env_vars = [
    "DATABASE_URL",
    "SUPABASE_URL",
    "SUPABASE_KEY",
    "OPENAI_API_KEY",
    "AZURE_OPENAI_ENDPOINT",
    "AZURE_OPENAI_API_KEY",
    "AZURE_OPENAI_DEPLOYMENT",
    "DEBUG",
]
for var in config_env_vars:
    if var in os.environ:
        del os.environ[var]


# Create a fixture for config tests that bypasses .env file loading
@pytest.fixture
def isolated_settings():
    """Create Settings instance that doesn't load from .env file."""
    from app.config import Settings

    # Create a custom Settings class that doesn't load from .env
    class TestSettings(Settings):
        class Config:
            env_file = None  # Don't load from any env file

    return TestSettings


from app.main import app
from app.utils.db import get_db, get_async_db, SessionLocal
from app.models.chat import Agent, Base
from app.services import llm_service
from app.config import settings
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
import asyncio
from unittest.mock import AsyncMock, patch, MagicMock

# Create test database engines
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
ASYNC_SQLALCHEMY_DATABASE_URL = "sqlite+aiosqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
async_engine = create_async_engine(
    ASYNC_SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
AsyncTestingSessionLocal = async_sessionmaker(
    autocommit=False, autoflush=False, bind=async_engine
)


@pytest.fixture(scope="session", autouse=True)
def setup_test_database():
    """Setup test database engines to replace the application ones."""
    # Import and patch the database module
    import app.utils.db as db_module

    # Store original values
    original_engine = db_module.engine
    original_async_engine = db_module.async_engine
    original_session_local = db_module.SessionLocal
    original_async_session_local = db_module.AsyncSessionLocal

    # Replace with test engines
    db_module.engine = engine
    db_module.async_engine = async_engine
    db_module.SessionLocal = TestingSessionLocal
    db_module.AsyncSessionLocal = AsyncTestingSessionLocal

    yield

    # Restore original values (though this won't be reached in most test scenarios)
    db_module.engine = original_engine
    db_module.async_engine = original_async_engine
    db_module.SessionLocal = original_session_local
    db_module.AsyncSessionLocal = original_async_session_local


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
    with patch.object(llm_service, "generate_response_async") as mock:
        mock.return_value = "Hello! This is a test response from the agent."
        yield mock


@pytest.fixture(scope="function")
def client(db_session, mock_llm_service):
    """Create a test client with dependency overrides."""
    # Create database tables for sync tests
    Base.metadata.create_all(bind=engine)

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
    # Clean up database tables
    Base.metadata.drop_all(bind=engine)


@pytest_asyncio.fixture(scope="function")
async def async_client(mock_llm_service):
    """Async HTTP client for async tests."""
    # Create database tables
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async def override_get_async_db():
        async with AsyncTestingSessionLocal() as session:
            yield session

    def override_get_db():
        # For sync operations, we'll create a sync session from the same engine
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    # Override the database dependencies
    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_async_db] = override_get_async_db

    async with AsyncClient(app=app, base_url="http://test") as client:
        try:
            yield client
        finally:
            app.dependency_overrides.clear()
            # Clean up database tables
            async with async_engine.begin() as conn:
                await conn.run_sync(Base.metadata.drop_all)


@pytest.fixture(scope="function")
def test_agents(db_session):
    """Create test agents in the database."""
    agents = [
        Agent(name="Echo", description="A simple agent that echoes your message."),
        Agent(name="TestBot", description="A test agent for e2e testing."),
    ]

    for agent in agents:
        db_session.add(agent)

    db_session.commit()
    return agents


@pytest_asyncio.fixture(scope="function")
async def async_test_agents():
    """Create test agents in the async database."""
    async with AsyncTestingSessionLocal() as session:
        agents = [
            Agent(name="Echo", description="A simple agent that echoes your message."),
            Agent(name="TestBot", description="A test agent for e2e testing."),
        ]

        for agent in agents:
            session.add(agent)

        await session.commit()
        return agents
