from sqlalchemy.orm import Session
from app.models import chat as models
from app.schemas import chat as schemas

def create_message(db: Session, message: schemas.MessageCreate):
    db_message = models.Message(**message.dict())
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message

def get_messages_by_session(db: Session, session_id: str):
    return db.query(models.Message).filter(models.Message.session_id == session_id).all()
