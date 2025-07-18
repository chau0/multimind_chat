from app.external.openai_client import get_openai_response, get_openai_response_async
from app.models.chat import Agent
from typing import List
import logging

logger = logging.getLogger(__name__)

def get_response(prompt: str) -> str:
    """Legacy sync method for backward compatibility."""
    return get_openai_response(prompt)

async def generate_response_async(agent: Agent, context: List[str], user_message: str) -> str:
    """Generate response using agent's system prompt and conversation context."""
    try:
        # Build full prompt with agent context
        system_prompt = f"You are {agent.name}. {agent.description}"
        
        # Add conversation history
        conversation_history = "\n".join(context[-5:])  # Last 5 messages for context
        
        # Combine everything
        full_prompt = f"""System: {system_prompt}

Conversation History:
{conversation_history}

User: {user_message}

Respond as {agent.name}:"""
        
        response = await get_openai_response_async(full_prompt)
        logger.info(f"Generated response for agent {agent.name}")
        return response
        
    except Exception as e:
        logger.error(f"Error generating response for agent {agent.name}: {str(e)}")
        raise Exception(f"Failed to generate response: {str(e)}")
