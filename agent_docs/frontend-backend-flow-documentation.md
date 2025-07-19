# Frontend to Backend Flow Documentation - Multimind Application

## Overview
This document explains the complete flow of data and requests from the frontend React application to the FastAPI backend in the Multimind multi-agent chat system.

## Architecture Overview

### Frontend Stack
- **React 18** with TypeScript
- **TanStack Query (React Query)** for state management and API calls
- **Wouter** for routing
- **Tailwind CSS** for styling
- **Vite** for build tooling

### Backend Stack
- **FastAPI** with Python
- **SQLAlchemy** with async support
- **PostgreSQL** database
- **Pydantic** for data validation
- **Alembic** for database migrations

## Complete Request Flow

### 1. Application Initialization

#### Frontend Startup
```
App.tsx → QueryClientProvider → Router → ChatPage
```

1. **App.tsx** initializes the React Query client and routing
2. **QueryClientProvider** wraps the app with TanStack Query context
3. **Router** handles navigation (currently only "/" route to ChatPage)
4. **ChatPage** renders the main chat interface

#### Backend Startup
```
main.py → FastAPI app → CORS middleware → Route registration
```

1. **main.py** creates FastAPI application instance
2. **CORS middleware** configured for cross-origin requests
3. **Route registration** includes:
   - `/api/v1/health` - Health check endpoints
   - `/api/v1/agents` - Agent management endpoints  
   - `/api/v1/chat` - Chat messaging endpoints

### 2. Initial Data Loading

#### Agents Loading Flow
```
ChatPage → AgentSelector → useAgents hook → chatService.getAgents() → Backend /api/v1/agents
```

**Frontend Process:**
1. **ChatPage** renders **AgentSelector** component
2. **AgentSelector** uses **useAgents** hook
3. **useAgents** hook triggers React Query to fetch agents
4. **chatService.getAgents()** makes HTTP GET request to `/api/v1/agents`

**HTTP Request:**
```http
GET /api/v1/agents
Accept: application/json
```

**Backend Process:**
1. **FastAPI** routes request to `agents.py` router
2. **list_agents()** function called with database dependency injection
3. **agent_service.get_agents()** retrieves agents from database
4. **Response** returns list of Agent objects

**Response Format:**
```json
[
  {
    "id": 1,
    "name": "assistant",
    "displayName": "AI Assistant", 
    "description": "General purpose AI assistant",
    "color": "#3B82F6",
    "avatar": "🤖",
    "isActive": true
  }
]
```

#### Message History Loading Flow
```
ChatPage → ChatWindow → useChat hook → chatService.getMessages() → Backend /api/v1/chat/sessions/{sessionId}/messages
```

**Frontend Process:**
1. **ChatWindow** component mounts
2. **useChat** hook automatically fetches message history
3. **chatService.getMessages()** makes HTTP GET request

**HTTP Request:**
```http
GET /api/v1/chat/sessions/default/messages
Accept: application/json
```

**Backend Process:**
1. **FastAPI** routes to `chat.py` router
2. **get_messages()** function retrieves session messages
3. **chat_service.get_messages_by_session()** queries database
4. **Response** returns array of Message objects

### 3. Sending Messages Flow

#### User Message Submission
```
ChatInput → handleSendMessage → useChat.sendMessage → chatService.sendMessage → Backend /api/v1/chat/messages
```

**Frontend Process:**
1. **User types message** in ChatInput component
2. **handleSendMessage** called with content and mentions
3. **useChat.sendMessage** processes the message:
   - Performs optimistic UI update
   - Calls chatService.sendMessage()
   - Handles success/error states

**Optimistic Update Process:**
```typescript
// Before API call - immediate UI update
const optimisticMessage: Message = {
  id: Date.now(), // Temporary ID
  content: messageData.content,
  isUser: true,
  timestamp: new Date(),
  mentions: messageData.mentions,
};

// Add to UI immediately
queryClient.setQueryData([`/api/v1/chat/sessions/${sessionId}/messages`], 
  (old = []) => [...old, optimisticMessage]
);
```

**HTTP Request:**
```http
POST /api/v1/chat/messages
Content-Type: application/json

{
  "content": "Hello @assistant, how are you?",
  "session_id": "default"
}
```

**Backend Process:**
1. **FastAPI** validates request against MessageCreate schema
2. **send_message()** function processes the message
3. **Mention parsing** extracts agent references (@assistant)
4. **Agent lookup** finds mentioned agent in database
5. **LLM service** generates response (currently mocked)
6. **Database operations** save user message and agent response
7. **Response** returns agent reply

**Response Format:**
```json
{
  "id": 123,
  "content": "Hello! I'm doing well, thank you for asking.",
  "agent_id": 1,
  "session_id": "default",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

**Frontend Response Handling:**
```typescript
// Transform backend response to frontend format
return {
  userMessage: {
    id: result.id || Date.now(),
    content: messageData.content,
    isUser: true,
    timestamp: new Date(),
    mentions: messageData.mentions || []
  },
  responses: [{
    id: result.id + 1 || Date.now() + 1,
    content: result.content,
    isUser: false,
    agentId: result.agent_id,
    timestamp: new Date(),
    mentions: []
  }]
};
```

## Data Flow Architecture

### Frontend State Management
```
React Components → Custom Hooks → TanStack Query → API Service Layer → HTTP Requests
```

**Key Hooks:**
- **useChat**: Manages message state, sending, and optimistic updates
- **useAgents**: Manages agent data fetching and caching
- **useMentionParser**: Parses @mentions in user messages

**Query Client Configuration:**
- **Caching**: Infinite stale time for static data
- **Optimistic Updates**: Immediate UI feedback
- **Error Handling**: Automatic rollback on failures
- **No Refetching**: Prevents unnecessary API calls

### Backend Request Processing
```
FastAPI Router → Dependency Injection → Service Layer → Repository Layer → Database
```

**Dependency Injection:**
- **Database Sessions**: Automatic session management
- **Logging**: Structured logging throughout request lifecycle
- **Error Handling**: Consistent HTTP error responses

**Service Layer Pattern:**
- **chat_service**: Business logic for message processing
- **agent_service**: Agent management operations
- **llm_service**: AI response generation (integration point)

## Error Handling

### Frontend Error Handling
```typescript
// React Query mutation error handling
onError: (error, variables, context) => {
  // Rollback optimistic update
  if (context?.previousMessages) {
    queryClient.setQueryData([`/api/v1/chat/sessions/${sessionId}/messages`], 
      context.previousMessages
    );
  }
  setTypingAgent(null);
}
```

### Backend Error Handling
```python
try:
    # Process message
    response = await chat_service.create_message_async(db, message)
    return response
except ValueError as e:
    logger.warning(f"Validation error: {str(e)}")
    raise HTTPException(status_code=400, detail=str(e))
except Exception as e:
    logger.error(f"Error processing message: {str(e)}")
    raise HTTPException(status_code=500, detail="Internal server error")
```

## API Endpoints Summary

| Method | Endpoint | Purpose | Frontend Hook |
|--------|----------|---------|---------------|
| GET | `/api/v1/agents` | List all agents | useAgents |
| GET | `/api/v1/chat/sessions/{id}/messages` | Get message history | useChat |
| POST | `/api/v1/chat/messages` | Send new message | useChat.sendMessage |
| GET | `/api/v1/health` | Health check | N/A |

## Security Considerations

### CORS Configuration
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Should be restricted in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Request Validation
- **Pydantic schemas** validate all incoming requests
- **Type safety** enforced throughout the stack
- **SQL injection protection** via SQLAlchemy ORM

## Performance Optimizations

### Frontend Optimizations
- **Optimistic Updates**: Immediate UI feedback
- **Query Caching**: Prevents redundant API calls
- **Code Splitting**: Lazy loading of components
- **Debounced Input**: Prevents excessive API calls

### Backend Optimizations
- **Async Operations**: Non-blocking database operations
- **Connection Pooling**: Efficient database connections
- **Response Caching**: Static data caching strategies
- **Structured Logging**: Performance monitoring

## Development Workflow

### Frontend Development
```bash
cd frontend
npm install
npm run dev  # Starts Vite dev server on port 5173
```

### Backend Development
```bash
cd backend
make install  # Install dependencies
make dev      # Start FastAPI server on port 8000
```

### Full Stack Development
```bash
docker-compose up  # Starts both frontend and backend
```

## Future Enhancements

### Planned Features
1. **Real-time Communication**: WebSocket integration for live chat
2. **Authentication**: User authentication and session management
3. **File Uploads**: Support for image and document sharing
4. **Agent Customization**: Dynamic agent creation and configuration
5. **Message Threading**: Conversation branching and threading
6. **Search Functionality**: Message history search and filtering

### Technical Improvements
1. **Caching Layer**: Redis for improved performance
2. **Rate Limiting**: API rate limiting and throttling
3. **Monitoring**: Application performance monitoring
4. **Testing**: Comprehensive test coverage
5. **Documentation**: OpenAPI/Swagger documentation
6. **Deployment**: Production deployment configurations

---

*This documentation reflects the current state of the Multimind application as of the latest codebase analysis.*