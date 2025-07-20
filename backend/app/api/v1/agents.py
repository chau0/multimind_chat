from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.logging_config import get_logger
from app.schemas.agent import Agent
from app.services import agent_service
from app.utils.db import get_db

router = APIRouter()
logger = get_logger(__name__)


@router.get("", response_model=List[Agent])
def list_agents(db: Session = Depends(get_db)):
    """Get all available agents."""
    try:
        logger.info("Fetching all available agents")
        agents = agent_service.get_agents(db)
        logger.info(f"Retrieved {len(agents)} agents")
        return agents
    except Exception as e:
        logger.error(f"Error fetching agents: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
