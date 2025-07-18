import { useState, useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { chatService } from "@/services/chatService";
import type { Message, Agent, SendMessageRequest } from "@/types";

export function useChat(sessionId: string = "default") {
  const [typingAgent, setTypingAgent] = useState<Agent | null>(null);
  const queryClient = useQueryClient();

  const messagesQuery = useQuery({
    queryKey: [`/api/v1/chat/sessions/${sessionId}/messages`],
    queryFn: () => chatService.getMessages(sessionId),
    refetchInterval: false,
  });

  const sendMessageMutation = useMutation({
    mutationFn: (messageData: SendMessageRequest) => chatService.sendMessage(messageData),
    onMutate: async (messageData) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: [`/api/v1/chat/sessions/${sessionId}/messages`] });

      // Snapshot previous value
      const previousMessages = queryClient.getQueryData<Message[]>([`/api/v1/chat/sessions/${sessionId}/messages`]);

      // Optimistically update with user message
      const optimisticMessage: Message = {
        id: Date.now(), // Temporary ID
        content: messageData.content,
        isUser: true,
        timestamp: new Date(),
        mentions: messageData.mentions,
      };

      queryClient.setQueryData<Message[]>([`/api/v1/chat/sessions/${sessionId}/messages`], (old = []) => [
        ...old,
        optimisticMessage,
      ]);

      return { previousMessages };
    },
    onSuccess: (data) => {
      // Update with real messages from server
      queryClient.setQueryData<Message[]>([`/api/v1/chat/sessions/${sessionId}/messages`], (old = []) => {
        // Remove the optimistic message and add real messages
        const withoutOptimistic = old.filter(msg => msg.id !== data.userMessage.id || msg.id < 1000000);
        return [...withoutOptimistic, data.userMessage, ...data.responses];
      });
      setTypingAgent(null);
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousMessages) {
        queryClient.setQueryData([`/api/v1/chat/sessions/${sessionId}/messages`], context.previousMessages);
      }
      setTypingAgent(null);
    },
  });

  const sendMessage = useCallback(async (content: string, mentions: string[] = []) => {
    if (!content.trim()) return;

    // Find typing agent for simulation
    if (mentions.length > 0) {
      const agentsQuery = queryClient.getQueryData<Agent[]>(["/api/v1/agents"]);
      const firstMentionedAgent = agentsQuery?.find(agent => 
        mentions.some(mention => mention.toLowerCase() === agent.name.toLowerCase())
      );
      if (firstMentionedAgent) {
        setTypingAgent(firstMentionedAgent);
      }
    }

    const messageData: SendMessageRequest = {
      content: content.trim(),
      isUser: true,
      mentions,
      sessionId
    };

    return sendMessageMutation.mutateAsync(messageData);
  }, [sendMessageMutation, queryClient, sessionId]);

  return {
    messages: messagesQuery.data || [],
    isLoading: messagesQuery.isLoading,
    isSending: sendMessageMutation.isPending,
    typingAgent,
    sendMessage,
    error: messagesQuery.error || sendMessageMutation.error,
  };
}
