# MultiMind - Multi-Agent Chat Application

This project integrates a React frontend with a FastAPI backend to create a multi-agent chat application.

## Project Structure

- `frontend/`: React frontend application
- `backend/`: FastAPI backend application

## Prerequisites

- Node.js 18+
- Python 3.9+
- Docker and Docker Compose (optional)

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
# Azure SQL Database
AZURE_SQL_SERVER=your-server.database.windows.net
AZURE_SQL_DATABASE=your-database
AZURE_SQL_USERNAME=your-username
AZURE_SQL_PASSWORD=your-password

# Azure OpenAI
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_API_KEY=your-api-key
AZURE_OPENAI_DEPLOYMENT=your-deployment-name
```

## Running with Docker Compose

The easiest way to run both the frontend and backend together is using Docker Compose:

```bash
docker-compose up
```

This will start both services:
- Frontend: http://localhost:3000
- Backend: http://localhost:8000

## Running Locally (Development)

### Backend

```bash
cd backend
pip install -r requirements/dev.txt
uvicorn app.main:app --reload
```

The backend API will be available at http://localhost:8000.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at http://localhost:5173.

## API Integration

The frontend communicates with the backend through the following endpoints:

- `GET /api/v1/agents`: Get all available agents
- `GET /api/v1/chat/sessions/{session_id}/messages`: Get messages for a specific chat session
- `POST /api/v1/chat/messages`: Send a message to an agent

## Features

- Multi-agent chat interface
- Agent mentions using @AgentName syntax
- Real-time typing indicators
- Message history