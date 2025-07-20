from sqlalchemy.orm import Session

from app.repositories import agent_repo


def get_agents(db: Session):
    return agent_repo.get_agents(db)
