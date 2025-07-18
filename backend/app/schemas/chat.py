from pydantic import BaseModel

class MessageBase(BaseModel):
    content: str
    session_id: str

class MessageCreate(MessageBase):
    pass

class Message(MessageBase):
    id: int
    agent_id: int | None = None

    class Config:
        orm_mode = True
