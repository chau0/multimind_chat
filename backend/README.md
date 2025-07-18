# Multimind Backend

This is the backend for the Multimind AI chat application built with FastAPI and Azure SQL Database.

## Features

- FastAPI web framework with automatic API documentation
- Azure SQL Database with SQLAlchemy ORM
- OpenAI integration for AI chat functionality
- Agent-based chat system
- Session-based message history
- Docker support for easy deployment

## Requirements

- Python 3.11+
- uv (Python package manager)
- Azure SQL Database instance
- Microsoft ODBC Driver 18 for SQL Server

## Setup

### 1. Install Python 3.11+ and uv

**Install uv (Python package manager):**
```bash
# On macOS and Linux:
curl -LsSf https://astral.sh/uv/install.sh | sh

# Or using pip:
pip install uv
```

### 2. Install Microsoft ODBC Driver 18 for SQL Server
   
**Ubuntu/Debian:**
```bash
curl https://packages.microsoft.com/keys/microsoft.asc | sudo apt-key add -
curl "https://packages.microsoft.com/config/ubuntu/$(lsb_release -rs)/prod.list" | sudo tee /etc/apt/sources.list.d/mssql-release.list
sudo apt-get update
sudo ACCEPT_EULA=Y apt-get install -y msodbcsql18
sudo apt-get install -y unixodbc-dev
```

**RHEL/CentOS:**
```bash
curl https://packages.microsoft.com/config/rhel/8/prod.repo | sudo tee /etc/yum.repos.d/mssql-release.repo
sudo yum remove unixODBC-utf16 unixODBC-utf16-devel
sudo ACCEPT_EULA=Y yum install -y msodbcsql18
sudo yum install -y unixODBC-devel
```

**macOS:**
```bash
brew tap microsoft/mssql-release https://github.com/Microsoft/homebrew-mssql-release
brew update
HOMEBREW_NO_ENV_FILTERING=1 ACCEPT_EULA=Y brew install msodbcsql18 mssql-tools18
```

### 3. Project Setup

**Clone and navigate to the project:**
```bash
cd /home/azureuser/repo/Multimind/backend
```

**Create virtual environment and install dependencies:**
```bash
# Quick setup (recommended)
make install

# Or step by step:
make venv                    # Create virtual environment
uv pip install -r requirements/dev.txt  # Install all dependencies including test tools
```

### 4. Environment Configuration

**Create environment file:**
```bash
cp .env.example .env
```

**Edit `.env` with your configuration:**
```bash
# Azure SQL Database (for production/development)
AZURE_SQL_SERVER=your-server.database.windows.net
AZURE_SQL_DATABASE=your-database-name
AZURE_SQL_USERNAME=your-username
AZURE_SQL_PASSWORD=your-password

# OpenAI API
OPENAI_API_KEY=your-openai-api-key

# Optional: ODBC Driver (defaults to "ODBC Driver 18 for SQL Server")
AZURE_SQL_DRIVER=ODBC Driver 18 for SQL Server
```

### 5. Database Setup

**Run database migrations:**
```bash
# Activate virtual environment first
source .venv/bin/activate

# Initialize Alembic (first time only)
alembic revision --autogenerate -m "Initial migration"

# Run migrations
alembic upgrade head

# Seed initial agents (optional)
python scripts/seed_agents.py
```

## Running the Application

### Development Mode
```bash
make dev
```
This starts the FastAPI server with hot reload on `http://localhost:8000`

### Using Docker
```bash
docker-compose up --build
```

## Testing

The project includes comprehensive test coverage with unit, integration, and end-to-end tests.

### Quick Test Commands

```bash
# Run all tests
make test

# Run tests with coverage report
uv run pytest --cov=app --cov-report=html --cov-report=term

# Run specific test types
uv run pytest tests/unit/          # Unit tests only
uv run pytest tests/integration/   # Integration tests only  
uv run pytest tests/e2e/          # End-to-end tests only

# Run tests with verbose output
uv run pytest -v

# Run specific test file
uv run pytest tests/unit/test_mention_parser.py

# Run tests matching a pattern
uv run pytest -k "test_mention"
```

### Test Structure

```
tests/
├── conftest.py          # Test configuration and fixtures
├── unit/                # Unit tests for individual functions/classes
│   └── test_mention_parser.py
├── integration/         # Integration tests for API endpoints
│   └── test_api.py
└── e2e/                # End-to-end tests for complete workflows
    └── test_chat.py
```

### Test Database

Tests automatically use an in-memory SQLite database (`test.db`) that is:
- Created fresh for each test function
- Automatically cleaned up after each test
- Populated with test agents via fixtures
- Isolated from your development/production database

### Test Dependencies

Testing requires these additional packages (included in `requirements/dev.txt`):
- `pytest` - Testing framework
- `pytest-asyncio` - Async test support
- `pytest-cov` - Coverage reporting
- `factory-boy` - Test data factories
- `faker` - Fake data generation

### Mocking External Services

Tests automatically mock external services:
- **OpenAI API calls** are mocked to avoid API charges during testing
- **LLM responses** return predictable test data
- **Database operations** use the test database

### Running Tests in Different Environments

**With coverage reporting:**
```bash
uv run pytest --cov=app --cov-report=html
# View coverage report: open htmlcov/index.html
```

**With specific pytest markers:**
```bash
# Run only fast tests (if you add markers)
uv run pytest -m "not slow"

# Run with specific verbosity
uv run pytest -v --tb=short
```

**Debugging test failures:**
```bash
# Stop on first failure
uv run pytest -x

# Drop into debugger on failures
uv run pytest --pdb
```

### Writing New Tests

**Unit Test Example:**
```python
# tests/unit/test_new_feature.py
from app.utils.your_module import your_function

def test_your_function():
    result = your_function("input")
    assert result == "expected_output"
```

**Integration Test Example:**
```python
# tests/integration/test_new_endpoint.py
def test_new_endpoint(client):
    response = client.get("/api/v1/new-endpoint")
    assert response.status_code == 200
    assert response.json()["key"] == "value"
```

**End-to-End Test Example:**
```python
# tests/e2e/test_new_workflow.py
def test_complete_workflow(client, test_agents):
    # Test a complete user workflow
    response = client.post("/api/v1/start-workflow", json={"data": "test"})
    assert response.status_code == 200
    # Continue testing the full workflow...
```

## Troubleshooting

### ODBC Driver Issues
If you encounter "ODBC Driver not found" errors:

1. **Verify driver installation:**
   ```bash
   odbcinst -q -d -n "ODBC Driver 18 for SQL Server"
   ```

2. **List available drivers:**
   ```bash
   odbcinst -q -d
   ```

3. **Update driver name in .env if needed:**
   ```bash
   AZURE_SQL_DRIVER=ODBC Driver 17 for SQL Server  # if v18 not available
   ```

### Test Issues

**Import errors:**
```bash
# Ensure you're in the virtual environment
source .venv/bin/activate

# Verify Python path
echo $PYTHONPATH

# Run with explicit path
PYTHONPATH=. uv run pytest
```

**Database connection issues in tests:**
- Tests use SQLite by default, no Azure SQL needed for testing
- If you see connection errors, ensure SQLite is available
- Check that `test.db` can be created in the project directory

**Slow tests:**
```bash
# Run tests in parallel (install pytest-xdist first)
uv pip install pytest-xdist
uv run pytest -n auto
```

### Azure SQL Database Connection Issues

1. **Check firewall rules:** Ensure your IP is allowed in Azure SQL Database firewall
2. **Verify connection string:** Test connection using Azure Data Studio or sqlcmd
3. **Check credentials:** Ensure username/password are correct

### SSL/TLS Issues
If you encounter SSL certificate errors, you can temporarily disable SSL verification (not recommended for production):
```bash
# In your .env file, modify the driver string:
AZURE_SQL_DRIVER=ODBC Driver 18 for SQL Server;TrustServerCertificate=yes;
```

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

# Run tests
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

## Code Quality

```bash
# Format code
make format

# Run all linting tools
make lint

# Run both linting and tests
make check
```

The project uses:
- **black** - Code formatting
- **isort** - Import sorting
- **flake8** - Linting
- **mypy** - Static type checking

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

The application is containerized and ready for deployment to Azure:

1. **Azure Container Instances:**
   ```bash
   # Build and push to Azure Container Registry
   az acr build --registry myregistry --image multimind-backend .
   ```

2. **Azure App Service:**
   - Deploy using Docker container
   - Set environment variables in App Service configuration

3. **Azure Kubernetes Service (AKS):**
   - Use the provided Dockerfile
   - Configure secrets for database connection

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `AZURE_SQL_SERVER` | Azure SQL Server hostname | Yes |
| `AZURE_SQL_DATABASE` | Database name | Yes |
| `AZURE_SQL_USERNAME` | Database username | Yes |
| `AZURE_SQL_PASSWORD` | Database password | Yes |
| `AZURE_SQL_DRIVER` | ODBC driver name | No (defaults to ODBC Driver 18) |
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
