# Context
You are an AI product engineer building the **frontend** for “Multimind” – a multi-persona AI chat web app.  
The app lets users summon AI agents via `@AgentName` mentions; each agent answers with full conversation context.  
Tech baseline: React 18 + TypeScript + Vite, TailwindCSS, lucide-react icons, Jest + React Testing Library.

# Task
1. Generate the complete frontend codebase.
2. Include tree-view folder/file structure.
3. Implement all React components, hooks, and utilities.
4. Wire the FE to a placeholder `/api` backend (FastAPI assumed) via axios-based `chatService`.

# Guidelines
• **UI / Layout**  
  – Header with title “🤖 Multi-Agent Chat” and *AgentSelector* dropdown.  
  – Main area: *ChatWindow* (scrollable message list) + *ChatInputArea* (mention-aware input, send button, typing indicator).  
  – Message bubbles: user vs. agent styling, agent avatar + name.  
• **Component Architecture**  
  – Atoms → Molecules → Organisms → Templates pattern.  
  – Core files: `App.tsx`, `ChatWindow.tsx`, `MessageBubble.tsx`, `ChatInput.tsx`, `AgentSelector.tsx`.  
  – Custom hooks: `useChat`, `useMentionParser`, `useAgents`.  
• **State Flow**  
  App ⟶ ChatWindow ⟶ MessageBubble (render).  
  ChatInput ⟶ App (handleSendMessage) ⟶ chatService (POST) ⟶ App (update messages).  
• **Testing**  
  – Jest + React Testing Library.  
  – Provide test suites for ChatWindow, ChatInput, MessageBubble, mentionParser, and hooks with the cases in the PRD.  
• **Styling**  
  – Tailwind; soft gray background `#f9f9f9`; cards & bubbles `rounded-2xl shadow-sm p-4`.  
  – Responsive: mobile ➜ desktop  at min-width 640 px.  
• **Setup Docs**  
  – Write a concise `README.md` with clone → install → dev → test → build steps.  
  – Include `vite.config.ts` with proxy `/api`→`http://localhost:8000`.  
• **Type Safety**  
  – Central `types/` folder for `Message`, `Agent`, `API` typings.  
• **Env**  
  – `.env.example` exposing `VITE_API_BASE_URL`.

# Constraints
• Use only open-source NPM packages (no paid UI kits).  
• Keep code ESLint- and Prettier-clean.  
• No unnecessary placeholders – generate functional components with minimal styling ready to run.  
• Output **just one project** rooted at `/Multimind/frontend/` with the exact tree view first, then file contents.  
• All code blocks must be markdown-formatted and runnable without edits.  
