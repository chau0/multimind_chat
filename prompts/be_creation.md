ame Context → Task → Guidelines → Constraints pattern that works well with LLM coding copilots.

txt
Copy
Edit
# Context
You are an AI backend engineer building the **server side** for “Multimind,” a multi‑persona AI chat web app.
Stack baseline: **FastAPI ( Python 3.11+ ) + SQLAlchemy + Alembic + PostgreSQL** running behind Uvicorn.
The backend exposes versioned REST endpoints under `/api/v1/` and orchestrates calls to OpenAI GPT‑4o (or a local Ollama/Mistral instance).

# Task
1. Generate a complete backend codebase with the folder tree shown in *Guidelines → Architecture*.
2. Implement API routers, services, repositories, models, and Pydantic schemas.
3. Add unit, integration, and end‑to‑end tests plus sample cURL verification commands.
4. Produce a concise `README.md` with **setup, run, test, Docker, and deploy** instructions.

# Guidelines
• **Architecture** – layered pattern: API → Service → Repository → DB / External LLM :contentReference[oaicite:6]{index=6}
/Multimind/backend/
├── app/
│ ├── main.py # FastAPI entry
│ ├── config.py
│ ├── api/v1/ # routers: chat.py, agents.py, health.py
│ ├── models/ # SQLAlchemy models: Message, Agent, ChatSession, …
│ ├── schemas/ # Pydantic schemas
│ ├── services/ # chat_service, agent_service, llm_service, …
│ ├── repositories/ # data‑access layer
│ ├── external/ # openai_client, ollama_client, llm_factory
│ └── utils/ # db, logging, validators
├── tests/{unit,integration,e2e}/
├── migrations/
├── scripts/ # seed_agents.py, reset_db.py
├── requirements/{base,dev,prod}.txt
├── docker-compose.yml & Dockerfile
└── pyproject.toml

:contentReference[oaicite:7]{index=7}
Copy
Edit

• **Core Endpoints**
- `POST /chat/messages` – accept `{content, session_id}`, parse `@AgentName`, return agent reply.
- `GET  /chat/sessions/{session_id}/messages` – history.
- `GET  /agents` – list available agents.
- `GET  /health` – liveness probe.

• **Business Rules**
– Mention parser must extract first agent mention; 404 on unknown agent.
– ChatService builds full context, calls LLMService, stores both request & response messages.

• **Testing**
- **Unit:** ChatService, AgentService, MentionParser, Repositories.
- **Integration:** `/chat` & `/agents` endpoints with test DB fixtures.
- **E2E:** Happy‑path chat flow against running server.
Use PyTest, AsyncClient, and 90 %+ coverage target :contentReference[oaicite:8]{index=8}.

• **Dev Experience**
- `make dev` → `uvicorn app.main:app --reload --port 8000`.
- `make test` → full test suite with coverage.
- `docker-compose up --build` spins Postgres + backend for local dev :contentReference[oaicite:9]{index=9}.

• **Docs & Verification**
Include cURL snippets for health, agent list, and send‑message checks :contentReference[oaicite:10]{index=10}.

# Constraints
• Use only open‑source Python libs (no paid SDKs).
• Keep code `black` / `isort` / `flake8` / `mypy` clean; provide Makefile targets.
• Respect the exact folder tree above; output the **tree view first**, then full file contents.
• Tests must run with `pytest -v`; provide sample `.env.example` and Alembic config.
• Generate a single project rooted at `/Multimind/backend/` – no extra commentary.
