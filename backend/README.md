# Multimind Backend

This is the backend for the Multimind AI chat application built with FastAPI.

## Features

- FastAPI web framework with automatic API documentation
- PostgreSQL database with SQLAlchemy ORM
- OpenAI integration for AI chat functionality
- Agent-based chat system
- Session-based message history
- Docker support for easy deployment

## Requirements

- Python 3.11+
- uv (Python package manager)
- PostgreSQL (for production) or Docker (for development)

## Setup

1. **Install Python 3.11+ and uv**
   
2. **Clone and navigate to the project**
   ```bash
   cd /home/azureuser/repo/Multimind/backend
   ```

3. **Create virtual environment and install dependencies**
   ```bash
   # Create virtual environment and install dependencies
   make install
   
   # Or manually:
   make venv
   uv pip install -r requirements/dev.txt
   ```

4. **Environment configuration**
   ```bash
   cp .env.example .env
   # Edit .env and fill in the required values:
   # - DATABASE_URL: PostgreSQL connection string
   # - OPENAI_API_KEY: Your OpenAI API key
   ```

## Running the application

### Development mode
```bash
make dev
```

This will start the application on `http://localhost:8000` with auto-reload enabled.

### Using Docker (Recommended for development)
```bash
docker-compose up --build
```

This will start both the backend and a PostgreSQL database.

## API Documentation

Once running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Development Commands

The project includes a Makefile with common development tasks:

```bash
# Show all available commands
make help

# Create virtual environment
make venv

# Install dependencies (creates venv first)
make install

# Run development server
make dev

# Run tests with coverage
make test

# Run code formatting
make format

# Run linting tools
make lint

# Run both linting and tests
make check

# Generate requirements.txt
make requirements

# Clean up (remove venv and cache files)
make clean
```

## Testing

```bash
make test
```

This runs the test suite with coverage reporting.

## Code Quality

```bash
# Format code
make format

# Run all linting tools
make lint

# Run both linting and tests
make check
```

## API Endpoints

### Health Check
```bash
curl http://localhost:8000/api/v1/health
```

### List Available Agents
```bash
curl http://localhost:8000/api/v1/agents
```

### Send a Chat Message
```bash
curl -X POST http://localhost:8000/api/v1/chat/messages \
  -H "Content-Type: application/json" \
  -d '{"content": "@Echo Hello!", "session_id": "123"}'
```

### Get Chat History
```bash
curl http://localhost:8000/api/v1/chat/sessions/123/messages
```

## Project Structure

```
app/
├── main.py              # FastAPI application entry point
├── config.py            # Application configuration
├── api/v1/              # API routes
│   ├── health.py        # Health check endpoint
│   ├── agents.py        # Agent management endpoints
│   └── chat.py          # Chat functionality endpoints
├── services/            # Business logic layer
├── schemas/             # Pydantic models for API
├── utils/               # Utility functions
└── models/              # Database models
```

## Deployment

The application is containerized and ready for deployment:

1. **Using Docker Compose** (for development/staging):
   ```bash
   docker-compose up -d
   ```

2. **Production deployment**: Configure your production database URL and deploy the Docker container to your preferred platform.

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `OPENAI_API_KEY` | OpenAI API key for AI functionality | Yes |

## Development

The project uses modern Python development tools:
- **FastAPI**: High-performance web framework
- **SQLAlchemy**: SQL toolkit and ORM
- **Pydantic**: Data validation using Python type hints
- **Alembic**: Database migration tool
- **pytest**: Testing framework
- **black/isort**: Code formatting
- **mypy**: Static type checking
