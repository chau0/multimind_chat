# 🤖 MultiMind - Multi-Agent Chat Application

A sophisticated multi-persona AI chat application that allows users to summon different AI agents using @mentions. Each agent has unique personalities and specializations, providing contextual responses based on their expertise while maintaining full conversation context.

## ✨ Features

- **Multi-Agent System**: Chat with specialized AI agents (Assistant, Coder, Writer, Researcher)
- **@Mention System**: Summon specific agents using @AgentName mentions
- **Session-Based Conversations**: Persistent chat sessions with full context
- **Real-time Chat**: Live messaging with typing indicators and optimistic updates
- **Responsive Design**: Works seamlessly on mobile and desktop
- **Modern UI**: Clean, professional interface with agent avatars and message bubbles
- **Context Awareness**: Agents respond with full conversation context
- **Flexible Database Support**: Supabase (PostgreSQL), Azure SQL, or SQLite

## 🏗️ Architecture

### Frontend
- **Framework**: React 18 with TypeScript and Vite
- **UI Components**: Custom components with Tailwind CSS and Radix UI
- **State Management**: TanStack Query for API state management
- **Routing**: Wouter for client-side routing
- **Testing**: Vitest + React Testing Library + Playwright

### Backend
- **Framework**: FastAPI with Python 3.11+
- **Database**: Multi-provider support (Supabase/PostgreSQL, Azure SQL, SQLite)
- **LLM Integration**: OpenAI GPT-4 and Azure OpenAI
- **Architecture**: Clean layered architecture (API → Service → Repository → Models)
- **Testing**: Pytest with comprehensive unit and integration tests

### Key Components
- **Mention Parser**: Intelligent @AgentName detection and routing
- **Agent Engine**: Configurable personas with unique system prompts
- **Session Management**: Persistent conversation context
- **Message History**: Full conversation persistence and retrieval

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- Docker and Docker Compose (recommended)

### Option 1: Docker Compose (Recommended)

1. **Clone and setup environment**
   ```bash
   git clone <repository-url>
   cd multimind
   cp .env.example .env
   # Edit .env with your credentials
   ```

2. **Start all services**
   ```bash
   docker-compose up
   ```

3. **Access the application**
   - Frontend: http://localhost:5000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### Option 2: Local Development

#### Backend Setup
```bash
cd backend
# Install uv package manager
curl -LsSf https://astral.sh/uv/install.sh | sh

# Install dependencies
uv pip install -r requirements/dev.txt

# Run database migrations
alembic upgrade head

# Seed initial agents
python scripts/seed_agents.py

# Start the server
uvicorn app.main:app --reload
```

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 🔧 Configuration

### Database Options

#### Option 1: Supabase (Recommended)
```bash
# .env
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_KEY=your-anon-public-key-here
OPENAI_API_KEY=sk-your-openai-api-key-here
```

#### Option 2: Direct PostgreSQL
```bash
# .env
DATABASE_URL=postgresql://user:password@host:port/database
OPENAI_API_KEY=sk-your-openai-api-key-here
```

#### Option 3: Azure SQL (Legacy)
```bash
# .env
AZURE_SQL_SERVER=your-server.database.windows.net
AZURE_SQL_DATABASE=your-database
AZURE_SQL_USERNAME=your-username
AZURE_SQL_PASSWORD=your-password
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_API_KEY=your-api-key
AZURE_OPENAI_DEPLOYMENT=your-deployment-name
```

### LLM Provider Options
- **OpenAI**: Standard OpenAI API with GPT-4
- **Azure OpenAI**: Enterprise Azure OpenAI service
- **Local Models**: Future support for Ollama/local models

## 📡 API Endpoints

### Core Endpoints
- `GET /api/v1/health` - Health check
- `GET /api/v1/agents` - Get all available agents
- `GET /api/v1/chat/sessions/{session_id}/messages` - Get session messages
- `POST /api/v1/chat/messages` - Send message to agent

### Agent System
- Pre-configured agents with unique personalities
- Configurable system prompts and behaviors
- Extensible agent definitions via database

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest                    # Run all tests
pytest --cov             # Run with coverage
python tests/run_tests.py # Comprehensive test runner
```

### Frontend Tests
```bash
cd frontend
npm test                  # Unit tests
npm run test:integration  # Integration tests
npm run test:e2e          # End-to-end tests
npm run test:coverage     # Coverage report
```

## 🔧 Code Quality & Pre-commit Hooks

This project has **separate pre-commit setups** for backend and frontend, matching the independent CI/CD workflows.

### Setup Pre-commit Hooks

#### **Backend Setup**
```bash
cd backend
./scripts/setup-precommit.sh
```

#### **Frontend Setup**
```bash
cd frontend
./scripts/setup-precommit.sh
```

### What Gets Checked

#### **Backend Pre-commit** (Python)
- ✅ **Black**: Code formatting (`black --check app/`)
- ✅ **isort**: Import sorting (`isort --check-only app/`)
- ✅ **Flake8**: Linting (`flake8 app/ --max-line-length=88 --extend-ignore=E203,W503`)
- ✅ **MyPy**: Type checking (`mypy app/ --ignore-missing-imports`)
- ✅ **Pytest**: Full test suite (`pytest tests/ -v --cov=app --cov-report=term-missing`)

#### **Frontend Pre-commit** (TypeScript/React)
- ✅ **TypeScript**: Type checking (`npm run check`)
- ✅ **ESLint**: JavaScript/TypeScript linting
- ✅ **Prettier**: Code formatting
- ✅ **Tests**: Unit and integration tests (`npm run test && npm run test:integration`)
- ✅ **Build**: Build verification (`npm run build`)

### 🎯 **Deployment Guarantee**
Each pre-commit setup runs **exactly the same commands** as the respective GitHub Actions CI/CD pipeline:

**✅ Backend pre-commit passes → backend deployment succeeds!**  
**✅ Frontend pre-commit passes → frontend deployment succeeds!**

### Manual Commands
```bash
# Backend checks
cd backend && pre-commit run --all-files

# Frontend checks  
cd frontend && pre-commit run --all-files
```

See [PRECOMMIT_SETUP.md](PRECOMMIT_SETUP.md) for detailed setup and configuration information.

## 🚀 Deployment

### Production Deployment (Free Tier)
- **Frontend**: Vercel (free tier)
- **Backend**: Render (free tier)
- **Database**: Supabase (free tier)

See [DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md) for detailed deployment instructions.

### CI/CD
- GitHub Actions workflows for automated testing and deployment
- Automated tests on every pull request
- Deployment triggers on main branch updates

## 📊 Project Status

### ✅ Completed (MVP Ready)
- **Phase 1**: Core chat skeleton with React + FastAPI
- **Phase 2**: Agent engine with configurable personas
- **Phase 3**: Database persistence with session management
- **Integration**: Full frontend-backend integration
- **Testing**: Comprehensive test suites (75+ tests)
- **Deployment**: Production-ready Docker setup
- **Documentation**: Complete setup and deployment guides

### 🚧 In Progress
- **Phase 4**: Enhanced UX with markdown rendering and optimistic updates
- **Phase 5**: Security, rate limiting, and observability

### 🔮 Planned
- **Phase 6**: Live collaboration and agent-to-agent debates
- **Phase 7**: Monetization and scaling features

## 🛠️ Development

### Project Structure
```
multimind/
├── frontend/              # React frontend
│   ├── client/           # React app source
│   ├── server/           # Express server + API proxy
│   └── e2e/              # Playwright tests
├── backend/              # FastAPI backend
│   ├── app/              # Application code
│   ├── tests/            # Test suite
│   ├── migrations/       # Database migrations
│   └── scripts/          # Utility scripts
├── docs/                 # Documentation
├── agent_docs/           # Project status reports
└── docker-compose.yml    # Multi-service setup
```

### Key Technologies
- **Frontend**: React, TypeScript, Vite, TailwindCSS, Radix UI
- **Backend**: FastAPI, SQLAlchemy, Alembic, Pydantic
- **Database**: PostgreSQL (Supabase), Azure SQL, SQLite
- **LLM**: OpenAI GPT-4, Azure OpenAI
- **Testing**: Vitest, Playwright, Pytest
- **Deployment**: Docker, Vercel, Render

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and add tests
4. Run the test suite: `npm test` and `pytest`
5. Commit your changes: `git commit -m 'Add feature'`
6. Push to the branch: `git push origin feature-name`
7. Submit a pull request

## 📚 Documentation

- [Product Requirements Document](docs/prd.md)
- [Deployment Guide](docs/DEPLOYMENT_GUIDE.md)
- [Backend Design](docs/be_design.md)
- [Frontend Design](docs/fe_design.md)
- [Project Status Report](agent_docs/project-status-report.md)
- [Integration Summary](agent_docs/integration-summary.md)

## 📄 License

This project is licensed under the MIT License.

---

**Built with ❤️ for the future of AI collaboration**
