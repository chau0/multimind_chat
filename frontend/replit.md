# Multimind - Multi-Agent Chat Application

## Overview

Multimind is a sophisticated multi-persona AI chat web application that enables users to interact with specialized AI agents through @mention functionality. The application provides a real-time chat interface where users can summon different AI agents (Assistant, Coder, Writer, Researcher) using @AgentName mentions, with each agent providing contextual responses based on their specialization.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React 18** with TypeScript for type safety and modern development
- **Vite** as the build tool and development server for fast hot module replacement
- **TailwindCSS** for utility-first styling with shadcn/ui components
- **Wouter** for lightweight client-side routing
- **TanStack Query** for efficient state management and API calls with caching

### Backend Architecture
- **Express.js** server with TypeScript for type safety
- **In-memory storage** for development phase (MemStorage class)
- **Zod** for runtime validation and schema definition
- RESTful API design with `/api` endpoints

### Component Structure
- **Atomic Design Pattern**: Components organized as atoms → molecules → organisms → templates
- **Custom Hooks**: Specialized hooks for chat management, agent handling, and mention parsing
- **Shared Types**: Centralized type definitions for consistent data structures

## Key Components

### Core Chat Components
- **ChatWindow**: Main chat interface with message display and scroll management
- **MessageBubble**: Individual message rendering with agent avatars and timestamps
- **ChatInput**: Mention-aware input field with auto-complete and agent suggestions
- **AgentSelector**: Dropdown for selecting and viewing available agents

### State Management
- **useChat**: Manages chat state, message sending, and optimistic updates
- **useAgents**: Handles agent data fetching and caching
- **useMentionParser**: Parses @mentions and provides agent suggestions

### UI Components
- **shadcn/ui components**: Comprehensive UI library with Radix UI primitives
- **Responsive Design**: Mobile-first approach with desktop enhancements
- **Dark/Light Mode**: CSS variables for theme switching

## Data Flow

1. **User Input**: Messages entered through ChatInput component
2. **Mention Processing**: useMentionParser identifies @Agent mentions
3. **API Communication**: Messages sent to `/api/messages` endpoint
4. **Agent Response**: Server processes mentions and generates AI responses
5. **Real-time Updates**: TanStack Query manages optimistic updates and caching
6. **UI Rendering**: ChatWindow displays messages with appropriate agent styling

### API Endpoints
- `GET /api/agents` - Retrieve available agents
- `GET /api/messages` - Fetch message history
- `POST /api/messages` - Send message and receive agent responses

## External Dependencies

### Frontend Dependencies
- **React Ecosystem**: React 18, React DOM, React Testing Library
- **Styling**: TailwindCSS, class-variance-authority, clsx
- **UI Components**: Radix UI primitives, Lucide React icons
- **State Management**: TanStack Query for server state
- **Routing**: Wouter for client-side routing
- **Utilities**: date-fns for date formatting

### Backend Dependencies
- **Server Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM with PostgreSQL support
- **Validation**: Zod for schema validation
- **Session Management**: connect-pg-simple for PostgreSQL sessions
- **Development**: tsx for TypeScript execution

### Development Tools
- **Build Tools**: Vite, esbuild for production builds
- **Type Checking**: TypeScript with strict configuration
- **Code Quality**: ESLint, Prettier (configured via package.json)
- **Testing**: Jest, React Testing Library setup

## Deployment Strategy

### Development Setup
- **Environment**: Node.js 18+ required
- **Database**: PostgreSQL with Drizzle ORM migrations
- **Build Process**: Vite for frontend, esbuild for backend bundling
- **Development Server**: Concurrent frontend (Vite) and backend (Express) servers

### Production Configuration
- **Database**: PostgreSQL with connection pooling via @neondatabase/serverless
- **Environment Variables**: DATABASE_URL for database connection
- **Build Output**: 
  - Frontend: Static files in `dist/public`
  - Backend: Bundled server in `dist/index.js`
- **Deployment**: Single Node.js process serving both API and static files

### Database Schema
- **Users**: Authentication and user management
- **Agents**: AI agent configuration and metadata
- **Messages**: Chat history with user/agent attribution and mentions
- **Migrations**: Drizzle-managed database schema evolution

### Security Considerations
- **Input Validation**: Zod schemas for all API inputs
- **Session Management**: Secure session handling with PostgreSQL storage
- **Type Safety**: Full TypeScript coverage for runtime safety
- **CORS**: Configured for frontend-backend communication

The application follows a modular architecture with clear separation of concerns, making it maintainable and scalable for future enhancements.