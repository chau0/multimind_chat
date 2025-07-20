from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.utils.db import Base


class Agent(Base):
    __tablename__ = "agents"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, index=True)  # Limited length for indexing
    description = Column(String(500))  # Limited length for better performance
    system_prompt = Column(Text)  # Can be unlimited for system prompts
    display_name = Column(String(255))  # Display name for UI
    avatar = Column(String(10))  # Emoji or short avatar string
    color = Column(String(100))  # CSS color classes


class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id = Column(
        String(255), primary_key=True, index=True
    )  # Limited length for indexing


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text)  # Messages can be long
    session_id = Column(String(255), ForeignKey("chat_sessions.id"))
    agent_id = Column(Integer, ForeignKey("agents.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    session = relationship("ChatSession")
    agent = relationship("Agent")
