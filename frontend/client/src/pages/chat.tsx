import { useState } from "react";
import { ChatWindow } from "@/components/ChatWindow";
import { ChatInput } from "@/components/ChatInput";
import { AgentSelector } from "@/components/AgentSelector";
import { useChat } from "@/hooks/useChat";
import type { Agent } from "@/types";

export default function ChatPage() {
  const [selectedAgent, setSelectedAgent] = useState<Agent>();
  const { sendMessage, isSending, shouldFocusInput } = useChat();

  const handleSendMessage = async (content: string, mentions: string[]) => {
    await sendMessage(content, mentions);
  };

  return (
    <div className="flex flex-col h-screen max-w-6xl mx-auto bg-chat-bg">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-3 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">🤖 Multi-Agent Chat</h1>
            <span className="hidden sm:inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">v1.0</span>
          </div>
          
          <AgentSelector
            selectedAgent={selectedAgent}
            onAgentSelect={setSelectedAgent}
          />
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col min-h-0">
        <ChatWindow />
        <ChatInput 
          onSendMessage={handleSendMessage}
          disabled={isSending}
          shouldFocus={shouldFocusInput}
        />
      </main>
    </div>
  );
}
