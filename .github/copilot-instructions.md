# Copilot Instructions for Multimind

## Project Overview
Multimind is a multi-persona AI chat application that allows users to summon different AI agents using @mentions. The architecture consists of a FastAPI backend with Azure SQL Database and a React/Vite frontend with TypeScript.

## Architecture Patterns

### Backend (FastAPI + Azure SQL)
- **Repository Pattern**: Data access through `app/repositories/` (e.g., `chat_repo.py`, `agent_repo.py`)
- **Service Layer**: Business logic in `app/services/` orchestrates repos and external APIs
- **Router → Service → Repository**: API routes delegate to services, services coordinate repositories
- **Async/Sync Dual Pattern**: Most functions have both sync and async versions (e.g., `create_message()` and `create_message_async()`)

### Frontend (React + TanStack Query)
- **Hook-Based State**: Custom hooks like `useChat()` and `useAgents()` manage component state
- **Optimistic Updates**: `useChat()` immediately shows user messages before server confirmation
- **Service Layer**: `chatService.ts` abstracts API calls from components
- **Shadcn/ui Components**: UI built with Radix primitives in `components/ui/`

### Core Mention System
The @mention parsing is the heart of the application:
```typescript
// Frontend: useMentionParser.ts extracts @AgentName from input
// Backend: mention_parser.py routes messages to specific agents
parse_mention(content: str) -> str | None  // Returns agent name or None
```

## Development Workflows

### Backend Development
```bash
# Use uv package manager (not pip)
make dev          # Start FastAPI with hot reload on :8000
make test         # Run pytest with coverage
make lint         # Run flake8, isort, black, mypy
```

### Frontend Development
```bash
cd frontend
npm run dev       # Start Vite dev server with full-stack proxy
npm run build     # Build for production
npm run check     # TypeScript type checking
```

### Database Operations
- **Migrations**: Use Alembic via `alembic upgrade head`
- **Seeding**: Run `python scripts/seed_agents.py` to populate initial agents
- **Connection**: Azure SQL with ODBC Driver 18, configured in `app/config.py`

## Key Integration Points

### Message Flow
1. User types message with @mention in React frontend
2. `useMentionParser()` extracts agent name from input
3. `chatService.sendMessage()` posts to `/api/v1/chat/send`
4. `chat_service.py` uses `parse_mention()` to find target agent
5. `llm_service.py` generates response with agent's system prompt + conversation context
6. Response streams back through optimistic updates in `useChat()`

### Agent System
- Agents defined in database with `name`, `description` fields
- Agent routing via exact string match from mention parser
- Each agent has unique system prompt (stored in database or hardcoded in service)
- Context includes full conversation history when calling LLM

## Critical Configuration

### Environment Variables (Backend)
```bash
AZURE_SQL_SERVER=your-server.database.windows.net
AZURE_SQL_DATABASE=your-db-name
AZURE_SQL_USERNAME=your-username
AZURE_SQL_PASSWORD=your-password
OPENAI_API_KEY=your-openai-key
```

### Frontend Environment
```bash
VITE_API_BASE_URL=http://localhost:8000/api  # Points to FastAPI backend
```

## Testing Patterns

### Backend Tests
- **Unit**: Test individual functions in `tests/unit/`
- **Integration**: Test API endpoints in `tests/integration/`
- **E2E**: Full chat flow in `tests/e2e/`

### Frontend Testing
- TanStack Query testing with mock providers
- Component testing with React Testing Library
- Type safety enforced with strict TypeScript config

## Common Pitfalls

1. **Async/Sync Mismatch**: Always use `_async` versions for FastAPI endpoints
2. **Mention Parsing**: Agent names are case-sensitive and must match database exactly
3. **CORS**: FastAPI backend must enable CORS for frontend development
4. **Database URLs**: Azure SQL requires specific ODBC driver and TrustServerCertificate=yes
5. **Package Management**: Backend uses `uv`, not `pip` - always use `uv pip install`

## Adding New Features

### New Agent
1. Add to database via migration or `seed_agents.py`
2. Optionally add custom system prompt in `llm_service.py`
3. Frontend automatically discovers via `/api/v1/agents` endpoint

### New API Endpoint
1. Add route in `app/api/v1/`
2. Create service function in `app/services/`
3. Add repository method if database access needed
4. Update frontend `chatService.ts` and add corresponding hook
