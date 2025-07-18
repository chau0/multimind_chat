import { useQuery } from "@tanstack/react-query";
import { chatService } from "@/services/chatService";

export function useAgents() {
  return useQuery({
    queryKey: ["/api/agents"],
    queryFn: () => chatService.getAgents(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
