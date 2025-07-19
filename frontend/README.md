# 🤖 Multimind - Multi-Agent Chat Application

A sophisticated multi-persona AI chat web application that allows users to summon different AI agents using @mentions. Each agent has unique personalities and specializations, providing contextual responses based on their expertise.

## ✨ Features

- **Multi-Agent System**: Chat with specialized AI agents (Assistant, Coder, Writer, Researcher)
- **@Mention System**: Summon specific agents using @AgentName mentions
- **Real-time Chat**: Live messaging with typing indicators
- **Responsive Design**: Works seamlessly on mobile and desktop
- **Modern UI**: Clean, professional interface with agent avatars and message bubbles
- **Context Awareness**: Agents respond with full conversation context

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling and development
- **TailwindCSS** for styling
- **Lucide React** for icons
- **TanStack Query** for state management and API calls
- **Wouter** for client-side routing

### Backend
- **Express.js** server
- **In-memory storage** for development
- **TypeScript** for type safety
- **Zod** for validation

### Development Tools
- **ESLint + Prettier** for code formatting
- **Jest + React Testing Library** for testing
- **TypeScript** for type safety throughout

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Multimind/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup** (Optional)
   ```bash
   # Create .env file if needed
   cp .env.example .env
   ```

### Running the Application

#### Development Mode
Start the development server with hot reload:

```bash
npm run dev
```

The application will be available at `http://localhost:5000`

- Frontend (React) is served at the root path
- API endpoints are available at `/api/*`
- Hot reload is enabled for both frontend and backend changes

#### Production Build
Build and run the production version:

```bash
# Build the application
npm run build

# Start the production server
npm start
```

#### Type Checking
Run TypeScript type checking:

```bash
npm run check
```

#### Database Operations
If using a database, push schema changes:

```bash
npm run db:push
```

### Project Structure

```
frontend/
├── client/               # React frontend source
│   ├── src/             # Main application code
│   └── public/          # Static assets
├── server/              # Express backend
│   ├── index.ts         # Server entry point
│   ├── routes/          # API routes
│   └── vite.ts          # Vite development setup
├── dist/                # Built application (generated)
├── vite.config.ts       # Vite configuration
└── package.json         # Dependencies and scripts
```

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run check` - Run TypeScript type checking
- `npm run db:push` - Push database schema changes

### Development Notes

- The server runs on port 5000 by default (configurable via `PORT` environment variable)
- In development mode, Vite handles frontend bundling and hot reload
- The Express server serves both API routes and the React application
- TypeScript is used throughout for type safety

### Troubleshooting

#### Common Issues

1. **Port already in use**
   ```bash
   # Kill process on port 5000
   lsof -ti:5000 | xargs kill -9
   ```

2. **Module not found errors**
   ```bash
   # Clear node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Build failures**
   ```bash
   # Check TypeScript errors
   npm run check
   
   # Clear build cache
   rm -rf dist
   npm run build
   ```

4. **Development server not starting**
   - Ensure Node.js version is 18+
   - Check for conflicting processes on port 5000
   - Verify all dependencies are installed

### Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and test them
4. Run type checking: `npm run check`
5. Commit your changes: `git commit -m 'Add feature'`
6. Push to the branch: `git push origin feature-name`
7. Submit a pull request

## 📝 License

This project is licensed under the MIT License.
