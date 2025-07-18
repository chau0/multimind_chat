from sqlalchemy.orm import Session
from app.repositories import chat_repo
from app.schemas.chat import MessageCreate
from app.services import llm_service
from app.utils.mention_parser import parse_mention

def create_message(db: Session, message: MessageCreate):
    agent_name = parse_mention(message.content)
    # TODO: Get agent by name and pass to LLM
    response_content = llm_service.get_response(message.content)
    chat_repo.create_message(db, message)
    # TODO: Save response message
    return {"id": 1, "content": response_content, "session_id": message.session_id}

def get_messages_by_session(db: Session, session_id: str):
    return chat_repo.get_messages_by_session(db, session_id)
