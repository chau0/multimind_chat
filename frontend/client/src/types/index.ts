export interface Message {
  id: number;
  content: string;
  isUser: boolean;
  agentId?: number;
  timestamp: Date;
  mentions?: string[];
}

export interface Agent {
  id: number;
  name: string;
  display_name: string;  // Match backend snake_case
  description: string;
  color: string;
  avatar: string;
  isActive?: boolean;  // Make optional since backend doesn't return it
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  typingAgent: Agent | null;
}

export interface SendMessageRequest {
  content: string;
  isUser: boolean;
  agentId?: number;
  mentions?: string[];
  sessionId?: string;
}

export interface SendMessageResponse {
  userMessage: Message;
  responses: Message[];
}

export interface MentionMatch {
  start: number;
  end: number;
  agent: string;
}
