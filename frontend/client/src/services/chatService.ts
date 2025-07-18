import { apiRequest } from "@/lib/queryClient";
import type { Agent, Message, SendMessageRequest, SendMessageResponse } from "@/types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

export const chatService = {
  async getAgents(): Promise<Agent[]> {
    const response = await apiRequest("GET", `${API_BASE_URL}/agents`);
    return response.json();
  },

  async getMessages(): Promise<Message[]> {
    const response = await apiRequest("GET", `${API_BASE_URL}/messages`);
    return response.json();
  },

  async sendMessage(messageData: SendMessageRequest): Promise<SendMessageResponse> {
    const response = await apiRequest("POST", `${API_BASE_URL}/messages`, messageData);
    return response.json();
  },
};
