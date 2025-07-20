# Backend Design - Multi-Persona AI Chat Application

This document outlines the backend architecture, implementation plan, and testing strategy for the Multi-Persona AI Chat Application using FastAPI, Python 3.11+, and PostgreSQL.

## 🏗️ Architecture Overview

The backend follows a layered architecture pattern with clear separation of concerns:

- **API Layer**: FastAPI routers handling HTTP requests/responses
- **Service Layer**: Business logic and orchestration
- **Repository Layer**: Data access and persistence
- **External Services**: LLM providers (OpenAI, Ollama) and third-party APIs

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   FastAPI       │    │   Service        │    │   Repository    │
│   Routers       │───▶│   Layer          │───▶│   Layer         │
│                 │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Middleware    │    │   LLM Services   │    │   PostgreSQL    │
│   (Auth, CORS)  │    │   (OpenAI/Local) │    │   Database      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 📁 Recommended Folder Structure

```
/home/azureuser/repo/Multimind/backend/
├── app/
│   ├── __init__.py
│   ├── main.py                    # FastAPI app entry point
│   ├── config.py                  # Configuration settings
│   ├── dependencies.py            # Dependency injection
│   │
│   ├── api/
│   │   ├── __init__.py
│   │   ├── v1/
│   │   │   ├── __init__.py
│   │   │   ├── router.py          # Main API router
│   │   │   ├── chat.py            # Chat endpoints
│   │   │   ├── agents.py          # Agent management endpoints
│   │   │   └── health.py          # Health check endpoints
│   │   └── middleware/
│   │       ├── __init__.py
│   │       ├── cors.py            # CORS middleware
│   │       ├── logging.py         # Request logging
│   │       └── rate_limit.py      # Rate limiting
│   │
│   ├── core/
│   │   ├── __init__.py
│   │   ├── security.py            # Security utilities
│   │   ├── exceptions.py          # Custom exceptions
│   │   └── events.py              # Event handlers
│   │
│   ├── models/
│   │   ├── __init__.py
│   │   ├── base.py                # Base SQLAlchemy model
│   │   ├── message.py             # Message model
│   │   ├── agent.py               # Agent model
│   │   ├── chat_session.py        # Chat session model
│   │   └── user.py                # User model (future)
│   │
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── message.py             # Message Pydantic schemas
│   │   ├── agent.py               # Agent Pydantic schemas
│   │   ├── chat.py                # Chat Pydantic schemas
│   │   └── common.py              # Common schemas
│   │
│   ├── services/
│   │   ├── __init__.py
│   │   ├── chat_service.py        # Chat orchestration
│   │   ├── agent_service.py       # Agent management
│   │   ├── llm_service.py         # LLM provider abstraction
│   │   ├── mention_parser.py      # Mention parsing logic
│   │   └── context_builder.py     # Context preparation
│   │
│   ├── repositories/
│   │   ├── __init__.py
│   │   ├── base.py                # Base repository pattern
│   │   ├── message_repository.py  # Message data access
│   │   ├── agent_repository.py    # Agent data access
│   │   └── session_repository.py  # Session data access
│   │
│   ├── external/
│   │   ├── __init__.py
│   │   ├── openai_client.py       # OpenAI API client
│   │   ├── ollama_client.py       # Ollama API client
│   │   └── llm_factory.py         # LLM provider factory
│   │
│   └── utils/
│       ├── __init__.py
│       ├── database.py            # Database utilities
│       ├── logging.py             # Logging configuration
│       └── validators.py          # Custom validators
│
├── tests/
│   ├── __init__.py
│   ├── conftest.py                # Pytest configuration
│   ├── fixtures/
│   │   ├── __init__.py
│   │   ├── database.py            # Database fixtures
│   │   ├── agents.py              # Agent test data
│   │   └── messages.py            # Message test data
│   │
│   ├── unit/
│   │   ├── __init__.py
│   │   ├── test_chat_service.py   # Chat service tests
│   │   ├── test_agent_service.py  # Agent service tests
│   │   ├── test_mention_parser.py # Mention parser tests
│   │   ├── test_llm_service.py    # LLM service tests
│   │   └── test_repositories.py   # Repository tests
│   │
│   ├── integration/
│   │   ├── __init__.py
│   │   ├── test_api_chat.py       # Chat API integration tests
│   │   ├── test_api_agents.py     # Agent API integration tests
│   │   └── test_database.py       # Database integration tests
│   │
│   └── e2e/
│       ├── __init__.py
│       └── test_chat_flow.py      # End-to-end chat flow tests
│
├── migrations/
│   ├── versions/
│   └── alembic.ini
│
├── scripts/
│   ├── seed_agents.py             # Seed default agents
│   ├── migrate.py                 # Migration utilities
│   └── deploy.py                  # Deployment script
│
├── data/
│   ├── agents/
│   │   ├── default_agents.json    # Default agent configurations
│   │   └── agent_prompts.json     # System prompts library
│   └── seeds/
│       └── initial_data.sql       # Initial database data
│
├── requirements/
│   ├── base.txt                   # Core dependencies
│   ├── dev.txt                    # Development dependencies
│   └── prod.txt                   # Production dependencies
│
├── .env.example                   # Environment variables template
├── .gitignore
├── docker-compose.yml             # Local development stack
├── Dockerfile                     # Production container
├── pyproject.toml                 # Python project configuration
├── pytest.ini                     # Pytest configuration
└── README.md                      # Backend documentation
```

## 🧪 Test Cases

### Unit Tests

#### Chat Service Tests

```python
# tests/unit/test_chat_service.py
import pytest
from unittest.mock import Mock, AsyncMock
from app.services.chat_service import ChatService
from app.schemas.message import MessageCreate, MessageResponse
from app.schemas.agent import Agent

class TestChatService:

    @pytest.fixture
    def chat_service(self):
        """Create ChatService with mocked dependencies."""
        mock_message_repo = Mock()
        mock_agent_repo = Mock()
        mock_llm_service = Mock()
        mock_mention_parser = Mock()

        return ChatService(
            message_repository=mock_message_repo,
            agent_repository=mock_agent_repo,
            llm_service=mock_llm_service,
            mention_parser=mock_mention_parser
        )

    @pytest.mark.asyncio
    async def test_send_message_with_agent_mention(self, chat_service):
        """Test sending message with agent mention triggers agent response."""
        # Given
        message_content = "@ProductManager What's our next milestone?"
        session_id = "test-session-123"

        chat_service.mention_parser.extract_mentions.return_value = ["ProductManager"]
        chat_service.agent_repository.get_by_name = AsyncMock(return_value=Mock(id=1, name="ProductManager"))
        chat_service.message_repository.get_session_history = AsyncMock(return_value=[])
        chat_service.llm_service.generate_response = AsyncMock(return_value="Let's prioritize user feedback.")
        chat_service.message_repository.create = AsyncMock()

        # When
        result = await chat_service.send_message(
            MessageCreate(content=message_content, session_id=session_id)
        )

        # Then
        assert result.agent_name == "ProductManager"
        assert "prioritize user feedback" in result.content
        chat_service.llm_service.generate_response.assert_called_once()

    @pytest.mark.asyncio
    async def test_send_message_without_mention_returns_error(self, chat_service):
        """Test sending message without agent mention returns appropriate error."""
        # Given
        message_content = "Hello world"
        session_id = "test-session-123"

        chat_service.mention_parser.extract_mentions.return_value = []

        # When & Then
        with pytest.raises(ValueError, match="No agent mentioned"):
            await chat_service.send_message(
                MessageCreate(content=message_content, session_id=session_id)
            )

    @pytest.mark.asyncio
    async def test_build_context_includes_message_history(self, chat_service):
        """Test context builder includes previous messages."""
        # Given
        session_id = "test-session-123"
        mock_messages = [
            Mock(content="Previous user message", author="user"),
            Mock(content="Previous agent response", author="Developer")
        ]

        chat_service.message_repository.get_session_history = AsyncMock(return_value=mock_messages)

        # When
        context = await chat_service._build_context(session_id)

        # Then
        assert len(context) == 2
        assert "Previous user message" in str(context)
        assert "Previous agent response" in str(context)
```

#### Mention Parser Tests

```python
# tests/unit/test_mention_parser.py
import pytest
from app.services.mention_parser import MentionParser

class TestMentionParser:

    @pytest.fixture
    def parser(self):
        return MentionParser()

    def test_extract_single_mention(self, parser):
        """Test extracting single agent mention."""
        text = "@ProductManager let's discuss the roadmap"
        mentions = parser.extract_mentions(text)
        assert mentions == ["ProductManager"]

    def test_extract_multiple_mentions(self, parser):
        """Test extracting multiple agent mentions."""
        text = "@Developer and @Designer please collaborate on this"
        mentions = parser.extract_mentions(text)
        assert set(mentions) == {"Developer", "Designer"}

    def test_extract_no_mentions(self, parser):
        """Test text without mentions returns empty list."""
        text = "This is a regular message without any mentions"
        mentions = parser.extract_mentions(text)
        assert mentions == []

    def test_extract_mentions_case_insensitive(self, parser):
        """Test mention extraction is case insensitive."""
        text = "@productmanager and @DEVELOPER"
        mentions = parser.extract_mentions(text)
        assert set(mentions) == {"productmanager", "DEVELOPER"}

    def test_extract_mentions_with_special_characters(self, parser):
        """Test mentions with underscores and numbers."""
        text = "@AI_Assistant_2 and @Bot_3 help me"
        mentions = parser.extract_mentions(text)
        assert set(mentions) == {"AI_Assistant_2", "Bot_3"}

    def test_validate_mention_format(self, parser):
        """Test mention format validation."""
        assert parser.is_valid_mention("@ValidAgent") == True
        assert parser.is_valid_mention("@Invalid Agent") == False
        assert parser.is_valid_mention("@123Invalid") == False
        assert parser.is_valid_mention("@") == False
```

#### LLM Service Tests

```python
# tests/unit/test_llm_service.py
import pytest
from unittest.mock import Mock, AsyncMock
from app.services.llm_service import LLMService
from app.external.llm_factory import LLMProvider
from app.schemas.agent import Agent

class TestLLMService:

    @pytest.fixture
    def llm_service(self):
        mock_provider = Mock()
        return LLMService(provider=mock_provider)

    @pytest.mark.asyncio
    async def test_generate_response_with_agent_context(self, llm_service):
        """Test LLM response generation with agent context."""
        # Given
        agent = Agent(
            name="ProductManager",
            system_prompt="You are a strategic product manager.",
            description="Focuses on user needs and business goals"
        )
        context = ["User: What should we build next?"]
        user_message = "Focus on user retention"

        llm_service.provider.generate = AsyncMock(return_value="Let's analyze user churn data first.")

        # When
        response = await llm_service.generate_response(agent, context, user_message)

        # Then
        assert response == "Let's analyze user churn data first."
        llm_service.provider.generate.assert_called_once()

        # Verify system prompt was included
        call_args = llm_service.provider.generate.call_args
        messages = call_args[0][0]
        assert any("strategic product manager" in msg.get("content", "") for msg in messages)

    @pytest.mark.asyncio
    async def test_generate_response_handles_provider_error(self, llm_service):
        """Test error handling when LLM provider fails."""
        # Given
        agent = Agent(name="TestAgent", system_prompt="Test prompt")
        context = []
        user_message = "Test message"

        llm_service.provider.generate = AsyncMock(side_effect=Exception("API Error"))

        # When & Then
        with pytest.raises(Exception, match="Failed to generate response"):
            await llm_service.generate_response(agent, context, user_message)

    def test_format_messages_for_llm(self, llm_service):
        """Test message formatting for LLM API."""
        # Given
        agent = Agent(name="TestAgent", system_prompt="You are a test agent.")
        context = [
            "User: Hello",
            "Agent: Hi there!",
            "User: How are you?"
        ]
        user_message = "Tell me about yourself"

        # When
        formatted = llm_service._format_messages(agent, context, user_message)

        # Then
        assert formatted[0]["role"] == "system"
        assert "test agent" in formatted[0]["content"]
        assert formatted[-1]["role"] == "user"
        assert formatted[-1]["content"] == "Tell me about yourself"
```

### Integration Tests

#### Chat API Integration Tests

```python
# tests/integration/test_api_chat.py
import pytest
from httpx import AsyncClient
from app.main import app
from tests.fixtures.database import test_db

class TestChatAPI:

    @pytest.mark.asyncio
    async def test_send_message_endpoint(self, test_db):
        """Test POST /api/v1/chat/messages endpoint."""
        async with AsyncClient(app=app, base_url="http://test") as client:
            # Given
            payload = {
                "content": "@ProductManager What's our Q4 strategy?",
                "session_id": "test-session-001"
            }

            # When
            response = await client.post("/api/v1/chat/messages", json=payload)

            # Then
            assert response.status_code == 200
            data = response.json()
            assert data["agent_name"] == "ProductManager"
            assert "session_id" in data
            assert len(data["content"]) > 0

    @pytest.mark.asyncio
    async def test_get_session_history(self, test_db):
        """Test GET /api/v1/chat/sessions/{session_id}/messages endpoint."""
        async with AsyncClient(app=app, base_url="http://test") as client:
            # Given - Send a message first
            payload = {
                "content": "@Developer Hello",
                "session_id": "test-session-002"
            }
            await client.post("/api/v1/chat/messages", json=payload)

            # When
            response = await client.get("/api/v1/chat/sessions/test-session-002/messages")

            # Then
            assert response.status_code == 200
            data = response.json()
            assert len(data) >= 1
            assert data[0]["content"] == "@Developer Hello"

    @pytest.mark.asyncio
    async def test_send_message_invalid_agent(self, test_db):
        """Test sending message with invalid agent mention."""
        async with AsyncClient(app=app, base_url="http://test") as client:
            # Given
            payload = {
                "content": "@NonExistentAgent Help me",
                "session_id": "test-session-003"
            }

            # When
            response = await client.post("/api/v1/chat/messages", json=payload)

            # Then
            assert response.status_code == 404
            data = response.json()
            assert "Agent not found" in data["detail"]
```

## 🚀 Setup & Run Guide

### Prerequisites

- Python 3.11+
- PostgreSQL 14+
- Docker & Docker Compose (optional, for containerized development)
- Git

### Step-by-Step Setup

#### 1. Clone Repository & Navigate to Backend

```bash
# Clone the repository
git clone https://github.com/yourusername/Multimind.git
cd Multimind/backend
```

#### 2. Environment Setup

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Copy environment template
cp .env.example .env

# Edit .env file with your configuration
nano .env
```

#### 3. Environment Variables Configuration

```bash
# .env file content
DATABASE_URL=postgresql://user:password@localhost:5432/multimind_db
OPENAI_API_KEY=your_openai_api_key_here
OLLAMA_BASE_URL=http://localhost:11434
ENVIRONMENT=development
LOG_LEVEL=DEBUG
RATE_LIMIT_PER_MINUTE=60
CORS_ORIGINS=["http://localhost:3000", "http://localhost:5173"]
```

#### 4. Install Dependencies

```bash
# Install production dependencies
pip install -r requirements/base.txt

# Install development dependencies (for testing and development)
pip install -r requirements/dev.txt
```

#### 5. Database Setup

```bash
# Option A: Using Docker Compose (Recommended for development)
docker-compose up -d postgres

# Option B: Local PostgreSQL
# Make sure PostgreSQL is running and create database:
createdb multimind_db

# Run database migrations
alembic upgrade head

# Seed initial data (default agents)
python scripts/seed_agents.py
```

#### 6. Start Development Server

```bash
# Start FastAPI development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Server will be available at:
# http://localhost:8000
# API documentation: http://localhost:8000/docs
# Alternative docs: http://localhost:8000/redoc
```

### Running Tests

#### Unit Tests

```bash
# Run all unit tests
pytest tests/unit/ -v

# Run specific test file
pytest tests/unit/test_chat_service.py -v

# Run with coverage
pytest tests/unit/ --cov=app --cov-report=html
```

#### Integration Tests

```bash
# Run integration tests (requires test database)
pytest tests/integration/ -v

# Run all tests
pytest -v

# Run tests with coverage report
pytest --cov=app --cov-report=term-missing
```

#### End-to-End Tests

```bash
# Run e2e tests (requires running server)
pytest tests/e2e/ -v --base-url=http://localhost:8000
```

### Development Commands

```bash
# Format code
black app/ tests/
isort app/ tests/

# Lint code
flake8 app/ tests/
mypy app/

# Generate new migration
alembic revision --autogenerate -m "Description of changes"

# Run migration
alembic upgrade head

# Rollback migration
alembic downgrade -1

# Reset database (development only)
python scripts/reset_db.py
```

### Docker Development (Alternative)

```bash
# Build and start all services
docker-compose up --build

# Run tests in container
docker-compose exec backend pytest

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down
```

### Production Deployment

```bash
# Build production image
docker build -t multimind-backend .

# Run production container
docker run -p 8000:8000 --env-file .env multimind-backend

# Or use docker-compose for production
docker-compose -f docker-compose.prod.yml up -d
```

### Verification Steps

#### 1. Health Check

```bash
# Check API health
curl http://localhost:8000/api/v1/health

# Expected response:
# {"status": "healthy", "timestamp": "2024-01-15T10:30:00Z"}
```

#### 2. Agent List

```bash
# Check available agents
curl http://localhost:8000/api/v1/agents

# Expected response with default agents:
# [{"name": "ProductManager", "description": "..."}, ...]
```

#### 3. Send Test Message

```bash
# Send a test message
curl -X POST http://localhost:8000/api/v1/chat/messages \
  -H "Content-Type: application/json" \
  -d '{
    "content": "@ProductManager What should we prioritize?",
    "session_id": "test-session"
  }'
```

### Troubleshooting

| Issue | Solution |
|-------|----------|
| `ImportError: No module named 'app'` | Ensure you're in the backend directory and virtual environment is activated |
| Database connection errors | Check PostgreSQL is running and DATABASE_URL is correct |
| Port 8000 already in use | Kill existing process: `lsof -ti:8000 | xargs kill -9` |
| OpenAI API errors | Verify OPENAI_API_KEY is set correctly in .env |
| Migration errors | Reset database: `alembic downgrade base && alembic upgrade head` |
| Test failures | Ensure test database is set up: `createdb multimind_test_db` |

### Performance Monitoring

```bash
# Monitor API performance
curl http://localhost:8000/metrics

# View logs
tail -f logs/app.log

# Database performance
docker-compose exec postgres psql -U user -d multimind_db -c "SELECT * FROM pg_stat_activity;"
```

This backend design provides a solid foundation for the Multi-Persona AI Chat Application with comprehensive testing, clear architecture, and production-ready deployment strategies.
