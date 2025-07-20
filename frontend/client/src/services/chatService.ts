import { apiRequest } from "@/lib/queryClient";
import type { Agent, Message, SendMessageRequest, SendMessageResponse } from "@/types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api/v1";

export const chatService = {
  async getAgents(): Promise<Agent[]> {
    const response = await apiRequest("GET", `${API_BASE_URL}/agents`);
    return response.json();
  },

  async getMessages(sessionId: string = "default"): Promise<Message[]> {
    const response = await apiRequest("GET", `${API_BASE_URL}/chat/sessions/${sessionId}/messages`);
    return response.json();
  },

  async sendMessage(messageData: SendMessageRequest): Promise<SendMessageResponse> {
    // Add session_id if not present
    const sessionId = messageData.sessionId || "default";
    const payload = {
      content: messageData.content,
      session_id: sessionId
    };

    const response = await apiRequest("POST", `${API_BASE_URL}/chat/messages`, payload);
    const result = await response.json();

    // Transform the backend response to match frontend expected format
    const baseId = Date.now();
    return {
      userMessage: {
        id: baseId,
        content: messageData.content,
        isUser: true,
        timestamp: new Date(),
        mentions: messageData.mentions || []
      },
      responses: [{
        id: baseId + 1,
        content: result.content,
        isUser: false,
        agentId: result.agent_id,
        timestamp: new Date(),
        mentions: []
      }]
    };
  },
};
