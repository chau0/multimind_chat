from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.services import agent_service
from app.utils.db import get_db
from app.schemas.agent import Agent
from typing import List

router = APIRouter()

@router.get("", response_model=List[Agent])
def list_agents(db: Session = Depends(get_db)):
    return agent_service.get_agents(db)
