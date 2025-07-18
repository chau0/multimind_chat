from sqlalchemy.orm import Session
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models import chat as models
from typing import List, Optional

def get_agents(db: Session):
    return db.query(models.Agent).all()

async def get_agents_async(db: AsyncSession) -> List[models.Agent]:
    """Get all agents asynchronously."""
    result = await db.execute(select(models.Agent))
    return result.scalars().all()

async def get_agent_by_name_async(db: AsyncSession, name: str) -> Optional[models.Agent]:
    """Get agent by name asynchronously."""
    result = await db.execute(select(models.Agent).where(models.Agent.name == name))
    return result.scalar_one_or_none()

async def get_agent_by_id_async(db: AsyncSession, agent_id: int) -> Optional[models.Agent]:
    """Get agent by ID asynchronously."""
    result = await db.execute(select(models.Agent).where(models.Agent.id == agent_id))
    return result.scalar_one_or_none()
