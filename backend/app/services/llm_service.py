import logging
from typing import List

from app.external.openai_client import (
    get_openai_response,
    get_openai_response_with_messages_async,
)
from app.models.chat import Agent

logger = logging.getLogger(__name__)


def get_response(prompt: str) -> str:
    """Legacy sync method for backward compatibility."""
    return get_openai_response(prompt)


async def generate_response_async(
    agent: Agent, context: List[str], user_message: str
) -> str:
    """Generate response using agent's system prompt and conversation context."""
    try:
        # Use agent's custom system prompt if available, otherwise fallback
        system_prompt = (
            agent.system_prompt or f"You are {agent.name}, {agent.description}"
        )

        # Build conversation messages for better context handling
        messages = [{"role": "system", "content": system_prompt}]

        # Add conversation history (last 8 messages for better context
        # while staying within token limits)
        for ctx_message in context[-8:]:
            if ctx_message.startswith("User:"):
                messages.append({"role": "user", "content": ctx_message[5:].strip()})
            elif ":" in ctx_message:
                # Agent message
                agent_response = ctx_message.split(":", 1)[1].strip()
                if agent_response:  # Only add non-empty responses
                    messages.append({"role": "assistant", "content": agent_response})

        # Add current user message
        messages.append({"role": "user", "content": user_message})

        response = await get_openai_response_with_messages_async(messages)
        logger.info(
            f"Generated response for agent {agent.name} (length: {len(response)})"
        )
        return response

    except Exception as e:
        logger.error(f"Error generating response for agent {agent.name}: {str(e)}")
        # Return a fallback response instead of raising exception
        return (
            f"I apologize, but I'm having trouble processing your request "
            f"right now. As {agent.name}, I'd be happy to help you once "
            f"the technical issue is resolved."
        )
