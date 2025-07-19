from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.services import agent_service
from app.utils.db import get_db
from app.schemas.agent import Agent
from app.logging_config import get_logger
from typing import List

router = APIRouter()
logger = get_logger(__name__)

@router.get("", response_model=List[Agent])
def list_agents(db: Session = Depends(get_db)):
    """Get all available agents."""
    logger.info("Fetching all available agents")
    agents = agent_service.get_agents(db)
    logger.info(f"Retrieved {len(agents)} agents")
    return agents
