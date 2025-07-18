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

1. **Install Python 3.11+ and uv**
   
2. **Install Microsoft ODBC Driver 18 for SQL Server**
   
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

3. **Clone and navigate to the project**
   ```bash
   cd /home/azureuser/repo/Multimind/backend
   ```

4. **Create virtual environment and install dependencies**
   ```bash
   # Create virtual environment and install dependencies
   make install
   
   # Or manually:
   make venv
   uv pip install -r requirements/dev.txt
   ```

5. **Configure Azure SQL Database**
   
   Create an Azure SQL Database instance and configure the connection:
   
   ```bash
   cp .env.example .env
   # Edit .env and fill in your Azure SQL Database details:
   # - AZURE_SQL_SERVER: your-server.database.windows.net
   # - AZURE_SQL_DATABASE: your database name
   # - AZURE_SQL_USERNAME: your username
   # - AZURE_SQL_PASSWORD: your password
   # - OPENAI_API_KEY: Your OpenAI API key
   ```

6. **Run database migrations**
   ```bash
   # Initialize Alembic (first time only)
   alembic revision --autogenerate -m "Initial migration"
   
   # Run migrations
   alembic upgrade head
   ```

## Running the application

### Development mode
```bash
make dev
```

This will start the application on `http://localhost:8000` with auto-reload enabled.

### Using Docker
```bash
docker-compose up --build
```

This will start the backend connected to your Azure SQL Database.

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
