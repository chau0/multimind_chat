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
  displayName: string;
  description: string;
  color: string;
  avatar: string;
  isActive: boolean;
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
