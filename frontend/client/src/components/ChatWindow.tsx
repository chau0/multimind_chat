import { useEffect, useRef } from "react";
import { MessageBubble } from "./MessageBubble";
import { useChat } from "@/hooks/useChat";
import { useAgents } from "@/hooks/useAgents";
import { getAvatarEmoji } from "@/utils/avatarMapping";

export const ChatWindow = () => {
  const { messages, isLoading, typingAgent } = useChat();
  const { data: agents = [] } = useAgents();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingAgent]);

  const getAgentById = (agentId?: number) => {
    return agents.find(agent => agent.id === agentId);
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-y-auto px-4 py-6 sm:px-6 space-y-4">
      {/* Welcome Message */}
      {messages.length === 0 && (
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm font-semibold">🤖</span>
          </div>
          <div className="flex-1">
            <div className="bg-white rounded-2xl shadow-sm p-4 max-w-md">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-sm font-semibold text-gray-900">System</span>
                <span className="text-xs text-gray-500">Welcome</span>
              </div>
              <p className="text-sm text-gray-700">
                Welcome to Multimind! You can mention specific agents using @AgentName to get specialized help. Try{' '}
                <span className="bg-blue-100 text-blue-800 px-1 rounded">@Coder</span>,{' '}
                <span className="bg-green-100 text-green-800 px-1 rounded">@Writer</span>, or{' '}
                <span className="bg-purple-100 text-purple-800 px-1 rounded">@Researcher</span>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          agent={getAgentById(message.agentId)}
        />
      ))}

      {/* Typing Indicator */}
      {typingAgent && (
        <div className="flex items-start space-x-3">
          <div className={`w-10 h-10 bg-gradient-to-br ${typingAgent.color} rounded-full flex items-center justify-center flex-shrink-0`}>
            <span className="text-white text-sm font-semibold">{getAvatarEmoji(typingAgent.avatar)}</span>
          </div>
          <div className="flex-1">
            <div className="bg-white rounded-2xl shadow-sm p-4 max-w-md">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-sm font-medium text-gray-500">{typingAgent.display_name || typingAgent.name} is typing</span>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
};
