from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class MessageBase(BaseModel):
    content: str
    session_id: str

class MessageCreate(MessageBase):
    agent_id: Optional[int] = None
    mentions: Optional[List[str]] = []

class Message(MessageBase):
    id: int
    agent_id: Optional[int] = None
    is_user: bool = True
    timestamp: Optional[str] = None

    class Config:
        from_attributes = True
        
    @classmethod
    def model_validate(cls, obj, **kwargs):
        """Custom validation to handle datetime conversion."""
        if hasattr(obj, '__dict__'):  # ORM object
            data = {
                "id": obj.id,
                "content": obj.content,
                "session_id": obj.session_id,
                "agent_id": obj.agent_id,
                "is_user": obj.agent_id is None,
                "timestamp": obj.created_at.isoformat() if hasattr(obj, 'created_at') and obj.created_at else None
            }
            return cls(**data)
        else:  # Dict or other data
            return super().model_validate(obj, **kwargs)
