from sqlalchemy.orm import Session
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models import chat as models
from app.schemas import chat as schemas
from typing import List

def create_message(db: Session, message: schemas.MessageCreate):
    db_message = models.Message(**message.dict())
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message

def get_messages_by_session(db: Session, session_id: str):
    return db.query(models.Message).filter(models.Message.session_id == session_id).all()

async def create_message_async(db: AsyncSession, message: schemas.MessageCreate) -> models.Message:
    """Create message asynchronously."""
    db_message = models.Message(**message.dict())
    db.add(db_message)
    await db.commit()
    await db.refresh(db_message)
    return db_message

async def get_messages_by_session_async(
    db: AsyncSession, 
    session_id: str, 
    limit: int = 50
) -> List[models.Message]:
    """Get messages by session asynchronously with optional limit."""
    result = await db.execute(
        select(models.Message)
        .where(models.Message.session_id == session_id)
        .order_by(models.Message.id.desc())
        .limit(limit)
    )
    messages = result.scalars().all()
    return list(reversed(messages))  # Return in chronological order
