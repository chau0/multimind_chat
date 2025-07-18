from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import Session
from app.services import chat_service
from app.utils.db import get_db, get_async_db
from app.schemas.chat import MessageCreate, Message
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/messages", response_model=dict)
async def send_message(
    message: MessageCreate, 
    db: AsyncSession = Depends(get_async_db)
):
    """Send a message to an agent."""
    try:
        result = await chat_service.create_message_async(db, message)
        return result
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
