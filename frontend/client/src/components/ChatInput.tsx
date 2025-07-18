import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Paperclip, Smile } from "lucide-react";
import { useMentionParser } from "@/hooks/useMentionParser";
import { useAgents } from "@/hooks/useAgents";

interface ChatInputProps {
  onSendMessage: (content: string, mentions: string[]) => void;
  disabled?: boolean;
}

export function ChatInput({ onSendMessage, disabled }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [cursorPosition, setCursorPosition] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const { data: agents = [] } = useAgents();
  const {
    parseMentions,
    handleInputChange,
    insertMention,
    showMentionSuggestions,
    mentionQuery,
    getFilteredAgents,
    setShowMentionSuggestions,
  } = useMentionParser(agents);

  const filteredAgents = getFilteredAgents(mentionQuery);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 128) + 'px';
    }
  }, [message]);

  const handleInputChangeInternal = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const cursor = e.target.selectionStart;
    
    setMessage(value);
    setCursorPosition(cursor);
    handleInputChange(value, cursor);
  }, [handleInputChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, []);

  const handleSend = useCallback(() => {
    if (!message.trim() || disabled) return;
    
    const mentions = parseMentions(message);
    onSendMessage(message, mentions);
    setMessage("");
    setShowMentionSuggestions(false);
  }, [message, disabled, parseMentions, onSendMessage, setShowMentionSuggestions]);

  const handleMentionSelect = useCallback((agentName: string) => {
    const { newValue, newCursorPosition } = insertMention(message, cursorPosition, agentName);
    setMessage(newValue);
    setShowMentionSuggestions(false);
    
    // Focus textarea and set cursor position
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
      }
    }, 0);
  }, [message, cursorPosition, insertMention, setShowMentionSuggestions]);

  return (
    <div className="border-t border-gray-200 bg-white px-4 py-4 sm:px-6">
      {/* Mention suggestions */}
      {showMentionSuggestions && filteredAgents.length > 0 && (
        <div className="absolute bottom-20 left-4 right-4 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
          <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Mention Agent
          </div>
          
          {filteredAgents.map((agent) => (
            <button
              key={agent.id}
              onClick={() => handleMentionSelect(agent.name)}
              className="w-full flex items-center space-x-3 px-3 py-2 hover:bg-gray-50 transition-colors"
            >
              <div className={`w-6 h-6 bg-gradient-to-br ${agent.color} rounded-full flex items-center justify-center`}>
                <span className="text-white text-xs font-semibold">{agent.avatar}</span>
              </div>
              <span className="text-sm font-medium text-gray-900">@{agent.name}</span>
            </button>
          ))}
        </div>
      )}

      <div className="flex items-end space-x-3">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChangeInternal}
            onKeyDown={handleKeyDown}
            placeholder="Type your message... Use @AgentName to mention specific agents"
            className="w-full resize-none rounded-2xl border border-gray-300 px-4 py-3 pr-12 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-colors text-sm max-h-32"
            rows={1}
            disabled={disabled}
          />
          
          {/* Attachment button */}
          <button 
            className="absolute right-12 bottom-3 p-1 text-gray-400 hover:text-gray-600 transition-colors"
            type="button"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          
          {/* Emoji button */}
          <button 
            className="absolute right-3 bottom-3 p-1 text-gray-400 hover:text-gray-600 transition-colors"
            type="button"
          >
            <Smile className="w-5 h-5" />
          </button>
        </div>

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!message.trim() || disabled}
          className="flex-shrink-0 bg-blue-600 text-white p-3 rounded-2xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
      
      {/* Character count and shortcuts */}
      <div className="flex items-center justify-between mt-2 px-1">
        <div className="flex items-center space-x-4 text-xs text-gray-500">
          <span>{agents.length} agents available</span>
          <span className="hidden sm:inline">Press Enter to send • Shift+Enter for new line</span>
        </div>
        <span className="text-xs text-gray-400">{message.length}/2000</span>
      </div>
    </div>
  );
}
