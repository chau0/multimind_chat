from pydantic import BaseModel
from typing import Optional, List

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
    timestamp: str

    class Config:
        from_attributes = True
