import { useState, useCallback } from "react";
import type { Agent, MentionMatch } from "@/types";

export function useMentionParser(agents: Agent[] = []) {
  const [showMentionSuggestions, setShowMentionSuggestions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");

  const parseMentions = useCallback((text: string): string[] => {
    const mentionRegex = /@(\w+)/g;
    const mentions = [];
    let match;

    while ((match = mentionRegex.exec(text)) !== null) {
      const agentName = match[1];
      const agent = agents.find(a =>
        a.name.toLowerCase() === agentName.toLowerCase()
      );
      if (agent) {
        mentions.push(agent.name);
      }
    }

    return [...new Set(mentions)];
  }, [agents]);

  const findMentionMatches = useCallback((text: string): MentionMatch[] => {
    const mentionRegex = /@(\w+)/g;
    const matches = [];
    let match;

    while ((match = mentionRegex.exec(text)) !== null) {
      matches.push({
        start: match.index,
        end: match.index + match[0].length,
        agent: match[1],
      });
    }

    return matches;
  }, []);

  const getFilteredAgents = useCallback((query: string) => {
    if (!query) return agents;

    return agents.filter(agent =>
      agent.name.toLowerCase().includes(query.toLowerCase()) ||
      (agent.display_name && agent.display_name.toLowerCase().includes(query.toLowerCase()))
    );
  }, [agents]);

  const handleInputChange = useCallback((value: string, cursorPosition: number) => {
    // Check if we're typing after an @
    const beforeCursor = value.substring(0, cursorPosition);
    const lastAtIndex = beforeCursor.lastIndexOf('@');

    if (lastAtIndex !== -1) {
      const afterAt = beforeCursor.substring(lastAtIndex + 1);
      // Check if it's a valid mention context (no spaces)
      if (!afterAt.includes(' ') && afterAt.length >= 0) {
        setMentionQuery(afterAt);
        setShowMentionSuggestions(true);
        return;
      }
    }

    setShowMentionSuggestions(false);
    setMentionQuery("");
  }, []);

  const insertMention = useCallback((
    currentValue: string,
    cursorPosition: number,
    agentName: string
  ): { newValue: string; newCursorPosition: number } => {
    const beforeCursor = currentValue.substring(0, cursorPosition);
    const afterCursor = currentValue.substring(cursorPosition);
    const lastAtIndex = beforeCursor.lastIndexOf('@');

    if (lastAtIndex !== -1) {
      const beforeAt = beforeCursor.substring(0, lastAtIndex);
      const newValue = `${beforeAt}@${agentName} ${afterCursor}`;
      const newCursorPosition = lastAtIndex + agentName.length + 2;

      return { newValue, newCursorPosition };
    }

    return { newValue: currentValue, newCursorPosition: cursorPosition };
  }, []);

  return {
    parseMentions,
    findMentionMatches,
    getFilteredAgents,
    handleInputChange,
    insertMention,
    showMentionSuggestions,
    mentionQuery,
    setShowMentionSuggestions,
  };
}
