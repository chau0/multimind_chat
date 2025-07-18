from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.services import chat_service
from app.utils.db import get_db
from app.schemas.chat import MessageCreate, Message

router = APIRouter()

@router.post("/messages", response_model=Message)
def send_message(message: MessageCreate, db: Session = Depends(get_db)):
    return chat_service.create_message(db, message)

@router.get("/sessions/{session_id}/messages", response_model=list[Message])
def get_messages(session_id: str, db: Session = Depends(get_db)):
    return chat_service.get_messages_by_session(db, session_id)
