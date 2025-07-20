# Backup of original conftest.py for reference
import pytest
import asyncio
from unittest.mock import AsyncMock, MagicMock
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.chat import Base
from app.repositories.agent_repo import AgentRepository
from app.schemas.agent import AgentCreate


@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture
def test_db():
    """Create a test database."""
    engine = create_engine("sqlite:///test.db", echo=False)
    Base.metadata.create_all(engine)

    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = SessionLocal()

    yield session

    session.close()
    Base.metadata.drop_all(engine)


@pytest.fixture
def agent_repo(test_db):
    """Create an agent repository with test database."""
    return AgentRepository(test_db)


@pytest.fixture
def sample_agents():
    """Sample agent data for testing."""
    return [
        AgentCreate(
            name="Echo",
            description="Echoes back your message",
            system_prompt="You are an echo bot. Repeat what the user says.",
            is_active=True,
        ),
        AgentCreate(
            name="Reverse",
            description="Reverses your message",
            system_prompt="You are a reverse bot. Reverse what the user says.",
            is_active=True,
        ),
    ]


@pytest.fixture
async def mock_llm_service():
    """Mock LLM service for testing."""
    mock = AsyncMock()
    mock.generate_response.return_value = "Mocked response"
    return mock


@pytest.fixture
def mock_openai_client():
    """Mock OpenAI client for testing."""
    mock_client = MagicMock()
    mock_response = MagicMock()
    mock_response.choices = [MagicMock()]
    mock_response.choices[0].message.content = "Test response"
    mock_client.chat.completions.create.return_value = mock_response
    return mock_client
