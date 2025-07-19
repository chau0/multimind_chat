from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import Session
from app.repositories import chat_repo, agent_repo
from app.schemas.chat import MessageCreate, Message
from app.services import llm_service
from app.utils.mention_parser import parse_mention
from app.models.chat import Agent
from typing import List, Optional
import logging

logger = logging.getLogger(__name__)

class ChatService:
    def __init__(self, message_repo=None, agent_repo=None, llm_service=None):
        self.message_repo = message_repo or chat_repo
        self.agent_repo = agent_repo or agent_repo
        self.llm_service = llm_service or llm_service

async def create_message_async(db: AsyncSession, message: MessageCreate) -> dict:
    """Create message with async database operations."""
    try:
        # Parse mention to find target agent
        agent_name = parse_mention(message.content)
        
        if not agent_name:
            raise ValueError("No agent mentioned in message. Please mention an agent using @AgentName format.")
        
        # Get agent by name
        agent = await agent_repo.get_agent_by_name_async(db, agent_name)
        if not agent:
            raise ValueError(f"Agent '{agent_name}' not found.")
        
        # Access agent attributes while session is active
        agent_id = agent.id
        agent_name_str = agent.name
        
        # Build context from session history
        context = await _build_context_async(db, message.session_id)
        
        # Generate LLM response
        response_content = await llm_service.generate_response_async(
            agent=agent,
            context=context,
            user_message=message.content
        )
        
        # Save user message
        user_message = await chat_repo.create_message_async(db, message)
        
        # Save agent response
        agent_response = MessageCreate(
            content=response_content,
            session_id=message.session_id,
            agent_id=agent_id
        )
        response_message = await chat_repo.create_message_async(db, agent_response)
        
        return {
            "id": response_message.id,
            "content": response_content,
            "agent_id": agent_id,
            "agent_name": agent_name_str,
            "session_id": message.session_id,
            "timestamp": response_message.created_at.isoformat() if hasattr(response_message, 'created_at') else None
        }
        
    except Exception as e:
        logger.error(f"Error creating message: {str(e)}")
        raise

async def _build_context_async(db: AsyncSession, session_id: str) -> List[str]:
    """Build conversation context from message history."""
    messages = await chat_repo.get_messages_by_session_async(db, session_id, limit=10)
    context = []
    
    for msg in messages:
        if msg.agent_id:
            agent = await agent_repo.get_agent_by_id_async(db, msg.agent_id)
            if agent:
                agent_name = agent.name  # Access name while session is active
                context.append(f"{agent_name}: {msg.content}")
        else:
            context.append(f"User: {msg.content}")
    
    return context

def create_message(db: Session, message: MessageCreate):
    """Legacy sync version for backward compatibility."""
    agent_name = parse_mention(message.content)
    if not agent_name:
        raise ValueError("No agent mentioned in message")
    
    # TODO: Implement proper agent lookup and response generation
    response_content = llm_service.get_response(message.content)
    chat_repo.create_message(db, message)
    return {"id": 1, "content": response_content, "session_id": message.session_id}

def get_messages_by_session(db: Session, session_id: str):
    return chat_repo.get_messages_by_session(db, session_id)
