# 🤖 MultiMind - Multi-Agent Chat Application

[![Build Status](https://github.com/yourusername/multimind/workflows/CI/badge.svg)](https://github.com/yourusername/multimind/actions)
[![Frontend Deploy](https://github.com/yourusername/multimind/workflows/Deploy%20Frontend/badge.svg)](https://github.com/yourusername/multimind/actions)
[![Backend Deploy](https://github.com/yourusername/multimind/workflows/Deploy%20Backend/badge.svg)](https://github.com/yourusername/multimind/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![Node.js 18+](https://img.shields.io/badge/node.js-18+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-005571?logo=fastapi)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?logo=postgresql&logoColor=white)](https://www.postgresql.org/)

> A sophisticated multi-persona AI chat application that allows users to summon different AI agents using @mentions. Each agent has unique personalities and specializations, providing contextual responses based on their expertise while maintaining full conversation context.

## 📋 Table of Contents

- [✨ Features](#-features)
- [🏗️ Architecture](#️-architecture)
- [🚀 Quick Start](#-quick-start)
- [🔧 Configuration](#-configuration)
- [📡 API Reference](#-api-reference)
- [🧪 Testing](#-testing)
- [🔧 Code Quality](#-code-quality--pre-commit-hooks)
- [🚀 Deployment](#-deployment)
- [📊 Project Status](#-project-status)
- [🛠️ Development](#️-development)
- [🤝 Contributing](#-contributing)
- [📚 Documentation](#-documentation)
- [📄 License](#-license)

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

## 📡 API Reference

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

### 📈 Project Metrics
![GitHub repo size](https://img.shields.io/github/repo-size/yourusername/multimind)
![Lines of code](https://img.shields.io/tokei/lines/github/yourusername/multimind)
![GitHub commit activity](https://img.shields.io/github/commit-activity/m/yourusername/multimind)
![GitHub last commit](https://img.shields.io/github/last-commit/yourusername/multimind)

### 🎯 Development Progress

| Phase | Status | Description | Progress |
|-------|--------|-------------|----------|
| **Phase 1** | ✅ **Complete** | Core chat skeleton with React + FastAPI | ![100%](https://progress-bar.dev/100) |
| **Phase 2** | ✅ **Complete** | Agent engine with configurable personas | ![100%](https://progress-bar.dev/100) |
| **Phase 3** | ✅ **Complete** | Database persistence with session management | ![100%](https://progress-bar.dev/100) |
| **Integration** | ✅ **Complete** | Full frontend-backend integration | ![100%](https://progress-bar.dev/100) |
| **Testing** | ✅ **Complete** | Comprehensive test suites (75+ tests) | ![100%](https://progress-bar.dev/100) |
| **Deployment** | ✅ **Complete** | Production-ready Docker setup | ![100%](https://progress-bar.dev/100) |
| **Documentation** | ✅ **Complete** | Complete setup and deployment guides | ![100%](https://progress-bar.dev/100) |
| **Phase 4** | 🚧 **In Progress** | Enhanced UX with markdown rendering | ![75%](https://progress-bar.dev/75) |
| **Phase 5** | 🚧 **In Progress** | Security, rate limiting, observability | ![25%](https://progress-bar.dev/25) |
| **Phase 6** | 🔮 **Planned** | Live collaboration and agent debates | ![0%](https://progress-bar.dev/0) |
| **Phase 7** | 🔮 **Planned** | Monetization and scaling features | ![0%](https://progress-bar.dev/0) |

### 🏆 Key Achievements
- ✅ **MVP Ready**: Fully functional multi-agent chat system
- ✅ **Production Deployed**: Live on Vercel + Render + Supabase
- ✅ **Test Coverage**: 75+ comprehensive tests across frontend and backend
- ✅ **CI/CD Pipeline**: Automated testing and deployment
- ✅ **Multi-Database**: Support for PostgreSQL, Azure SQL, and SQLite
- ✅ **Type Safety**: Full TypeScript frontend and Python type hints

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

## 🎬 Demo & Screenshots

### Live Demo
🌐 **[Try MultiMind Live](https://multimind-frontend.vercel.app)** (Demo deployment)

### Key Features in Action
- **@Mention System**: Type `@Assistant`, `@Coder`, `@Writer`, or `@Researcher` to summon specific agents
- **Context Awareness**: All agents maintain full conversation history
- **Real-time Chat**: Instant responses with typing indicators
- **Responsive Design**: Works seamlessly on mobile and desktop

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### 🚀 Getting Started
1. **Fork the repository** and clone your fork
2. **Set up development environment** following the [Quick Start](#-quick-start) guide
3. **Install pre-commit hooks** for both frontend and backend
4. **Create a feature branch**: `git checkout -b feature/your-feature-name`

### 📝 Development Guidelines
- **Code Style**: Follow existing patterns and use provided linters
- **Testing**: Add tests for new features and ensure all tests pass
- **Documentation**: Update relevant documentation for your changes
- **Commits**: Use clear, descriptive commit messages

### 🧪 Before Submitting
```bash
# Backend checks
cd backend && pre-commit run --all-files
cd backend && pytest

# Frontend checks  
cd frontend && pre-commit run --all-files
cd frontend && npm run test && npm run test:integration
```

### 📤 Submission Process
1. **Push your changes**: `git push origin feature/your-feature-name`
2. **Create a Pull Request** with a clear description
3. **Ensure CI passes** - all GitHub Actions must be green
4. **Respond to feedback** and make requested changes
5. **Celebrate** when your PR gets merged! 🎉

### 🐛 Bug Reports
- Use the GitHub issue template
- Include steps to reproduce
- Provide environment details
- Add relevant logs or screenshots

### 💡 Feature Requests
- Check existing issues first
- Describe the use case clearly
- Explain why it would benefit users
- Consider implementation complexity

## 📚 Documentation

### 📖 Core Documentation
- [Product Requirements Document](docs/prd.md) - Project vision and requirements
- [Deployment Guide](docs/DEPLOYMENT_GUIDE.md) - Production deployment instructions
- [Backend Design](docs/be_design.md) - Backend architecture and API design
- [Frontend Design](docs/fe_design.md) - Frontend architecture and component design

### 📊 Project Reports
- [Project Status Report](agent_docs/project-status-report.md) - Current development status
- [Integration Summary](agent_docs/integration-summary.md) - Frontend-backend integration details
- [Final Instructions](agent_docs/final-instructions.md) - Setup and deployment summary

### 🔧 Technical Guides
- [Pre-commit Setup](backend/docs/PRE_COMMIT_SETUP.md) - Code quality automation
- [Supabase Integration](backend/docs/supabase.md) - Database setup and migration
- [Azure OpenAI Setup](backend/docs/azure_openai.md) - LLM provider configuration

## 🆘 Support & Community

### 🐛 Issues & Bug Reports
- **GitHub Issues**: [Report bugs or request features](https://github.com/yourusername/multimind/issues)
- **Bug Template**: Use our issue templates for faster resolution

### 💬 Community & Discussion
- **GitHub Discussions**: [Join the conversation](https://github.com/yourusername/multimind/discussions)
- **Discord**: [Join our Discord server](https://discord.gg/multimind) (Coming soon)

### 📧 Contact
- **Maintainer**: [@yourusername](https://github.com/yourusername)
- **Email**: support@multimind.dev (for security issues)

### 🔒 Security
- **Security Policy**: See [SECURITY.md](SECURITY.md) for reporting vulnerabilities
- **Responsible Disclosure**: We appreciate responsible security research

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenAI** for providing the GPT-4 API
- **Supabase** for the excellent PostgreSQL hosting
- **Vercel** and **Render** for free-tier hosting
- **React** and **FastAPI** communities for amazing frameworks
- All **contributors** who help make this project better

---

<div align="center">

### 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=yourusername/multimind&type=Date)](https://star-history.com/#yourusername/multimind&Date)

**Built with ❤️ for the future of AI collaboration**

![Visitors](https://visitor-badge.laobi.icu/badge?page_id=yourusername.multimind)
[![GitHub stars](https://img.shields.io/github/stars/yourusername/multimind?style=social)](https://github.com/yourusername/multimind/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/yourusername/multimind?style=social)](https://github.com/yourusername/multimind/network/members)

</div>
