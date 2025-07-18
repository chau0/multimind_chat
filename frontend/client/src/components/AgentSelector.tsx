import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useAgents } from "@/hooks/useAgents";
import type { Agent } from "@/types";

interface AgentSelectorProps {
  selectedAgent?: Agent;
  onAgentSelect?: (agent: Agent) => void;
}

export function AgentSelector({ selectedAgent, onAgentSelect }: AgentSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { data: agents = [], isLoading } = useAgents();
  
  const currentAgent = selectedAgent || agents.find(agent => agent.name === "Assistant");

  const handleAgentSelect = (agent: Agent) => {
    onAgentSelect?.(agent);
    setIsOpen(false);
  };

  if (isLoading || !currentAgent) {
    return (
      <div className="flex items-center space-x-2 px-4 py-2 bg-gray-100 border border-gray-300 rounded-xl shadow-sm animate-pulse">
        <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
        <span className="text-sm font-medium text-gray-500">Loading...</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-xl shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
      >
        <div className={`w-6 h-6 bg-gradient-to-br ${currentAgent.color} rounded-full flex items-center justify-center`}>
          <span className="text-white text-xs font-semibold">{currentAgent.avatar}</span>
        </div>
        <span className="text-sm font-medium text-gray-700">{currentAgent.displayName}</span>
        <ChevronDown className="w-4 h-4 text-gray-500" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Available Agents
            </div>
            
            {agents.map((agent) => (
              <button
                key={agent.id}
                onClick={() => handleAgentSelect(agent)}
                className="w-full flex items-center space-x-3 px-3 py-2 hover:bg-gray-50 transition-colors"
              >
                <div className={`w-8 h-8 bg-gradient-to-br ${agent.color} rounded-full flex items-center justify-center`}>
                  <span className="text-white text-sm font-semibold">{agent.avatar}</span>
                </div>
                <div className="text-left">
                  <div className="text-sm font-medium text-gray-900">{agent.displayName}</div>
                  <div className="text-xs text-gray-500">{agent.description}</div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
