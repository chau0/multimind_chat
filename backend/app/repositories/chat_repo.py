from typing import List

from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import Session

from app.models import chat as models
from app.schemas import chat as schemas


def create_session(db: Session, session_id: str) -> models.ChatSession:
    """Create a chat session synchronously."""
    db_session = models.ChatSession(id=session_id)
    db.add(db_session)
    try:
        db.commit()
        db.refresh(db_session)
        return db_session
    except IntegrityError:
        # Session already exists, rollback and fetch existing
        db.rollback()
        return (
            db.query(models.ChatSession)
            .filter(models.ChatSession.id == session_id)
            .first()
        )


def create_message(db: Session, message: schemas.MessageCreate):
    # Ensure the session exists
    create_session(db, message.session_id)

    # Filter out fields that don't exist in the database model
    message_data = message.model_dump(exclude={"mentions"})
    db_message = models.Message(**message_data)
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message


def get_messages_by_session(db: Session, session_id: str):
    return (
        db.query(models.Message).filter(models.Message.session_id == session_id).all()
    )


async def create_session_async(db: AsyncSession, session_id: str) -> models.ChatSession:
    """Create a chat session asynchronously."""
    db_session = models.ChatSession(id=session_id)
    db.add(db_session)
    try:
        await db.commit()
        await db.refresh(db_session)
        return db_session
    except IntegrityError:
        # Session already exists, rollback and fetch existing
        await db.rollback()
        result = await db.execute(
            select(models.ChatSession).where(models.ChatSession.id == session_id)
        )
        return result.scalar_one()


async def create_message_async(
    db: AsyncSession, message: schemas.MessageCreate
) -> models.Message:
    """Create message asynchronously."""
    # Ensure the session exists
    await create_session_async(db, message.session_id)

    # Filter out fields that don't exist in the database model
    message_data = message.model_dump(exclude={"mentions"})
    db_message = models.Message(**message_data)
    db.add(db_message)
    await db.commit()
    await db.refresh(db_message)
    return db_message


async def get_messages_by_session_async(
    db: AsyncSession, session_id: str, limit: int = 50
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
