from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import Session
from app.services import chat_service
from app.utils.db import get_db, get_async_db
from app.schemas.chat import MessageCreate, Message
from app.logging_config import get_logger

logger = get_logger(__name__)
router = APIRouter()

@router.post("/messages", response_model=dict)
async def send_message(
    message: MessageCreate, 
    db: AsyncSession = Depends(get_async_db)
):
    """Send a message to an agent."""
    logger.info(f"Received message: '{message.content}' for session: {message.session_id}")
    logger.info(f"Message agent_id: {message.agent_id}, mentions: {message.mentions}")
    
    try:
        # Parse mention to find target agent
        from app.utils.mention_parser import parse_mention
        from app.repositories.agent_repo import get_agent_by_name_async
        
        agent_name = parse_mention(message.content)
        agent_id = None
        
        if agent_name:
            # Get agent by name to find the correct ID
            agent = await get_agent_by_name_async(db, agent_name)
            if agent:
                agent_id = agent.id
        
        # Fallback to Assistant if no mention found
        if not agent_id:
            agent_id = 3  # Default to Assistant (ID: 3)
        
        response = {
            "id": 1,
            "content": f"Hello! I'm responding to: {message.content}",
            "agent_id": agent_id,
            "session_id": message.session_id,
            "timestamp": "2024-01-01T00:00:00Z"
        }
        
        logger.info(f"Message processed successfully for session: {message.session_id}")
        return response
    except ValueError as e:
        logger.warning(f"Validation error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error processing message: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/sessions/{session_id}/messages", response_model=list[Message])
def get_messages(session_id: str, db: Session = Depends(get_db)):
    """Get message history for a session."""
    try:
        messages = chat_service.get_messages_by_session(db, session_id)
        return messages
    except Exception as e:
        logger.error(f"Error retrieving messages: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")
