from sqlalchemy.orm import Session
from app.models import chat as models

def get_agents(db: Session):
    return db.query(models.Agent).all()
