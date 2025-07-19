"""
Test endpoints for integration testing.
These endpoints are only available in test environment.
"""

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.utils.db import get_db
from app.models.chat import Message
from app.repositories.agent_repo import AgentRepository
from app.repositories.chat_repo import ChatRepository
import os

router = APIRouter()

# Only enable test endpoints in test environment
def check_test_environment():
    if os.getenv("ENVIRONMENT") != "test":
        raise HTTPException(status_code=404, detail="Test endpoints not available")

@router.post("/reset")
async def reset_test_data(db: Session = Depends(get_db)):
    """Reset all test data - clear messages and reset to default state."""
    check_test_environment()
    
    try:
        # Clear all messages
        db.query(Message).delete()
        db.commit()
        
        return {"status": "success", "message": "Test data reset successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to reset test data: {str(e)}")

@router.post("/seed")
async def seed_test_data(db: Session = Depends(get_db)):
    """Seed test data - ensure default agents exist."""
    check_test_environment()
    
    try:
        agent_repo = AgentRepository(db)
        
        # Ensure default agents exist
        default_agents = [
            {
                "name": "Assistant",
                "display_name": "AI Assistant",
                "description": "General purpose AI assistant",
                "color": "from-blue-500 to-purple-600",
                "avatar": "AI",
                "is_active": True
            },
            {
                "name": "Coder",
                "display_name": "Code Expert",
                "description": "Programming and development specialist",
                "color": "from-green-500 to-blue-600", 
                "avatar": "CE",
                "is_active": True
            },
            {
                "name": "Writer",
                "display_name": "Content Writer",
                "description": "Writing and content creation specialist",
                "color": "from-purple-500 to-pink-600",
                "avatar": "CW", 
                "is_active": True
            },
            {
                "name": "Researcher",
                "display_name": "Research Analyst",
                "description": "Research and analysis specialist",
                "color": "from-orange-500 to-red-600",
                "avatar": "RA",
                "is_active": True
            }
        ]
        
        for agent_data in default_agents:
            existing_agent = agent_repo.get_by_name(agent_data["name"])
            if not existing_agent:
                agent_repo.create(agent_data)
        
        db.commit()
        
        return {"status": "success", "message": "Test data seeded successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to seed test data: {str(e)}")

@router.get("/status")
async def test_status():
    """Get test environment status."""
    check_test_environment()
    
    return {
        "status": "test_environment_active",
        "environment": os.getenv("ENVIRONMENT"),
        "database_url": os.getenv("DATABASE_URL", "").replace("password", "***") if os.getenv("DATABASE_URL") else None
    }

@router.get("/agents/count")
async def get_agents_count(db: Session = Depends(get_db)):
    """Get count of agents for testing."""
    check_test_environment()
    
    agent_repo = AgentRepository(db)
    agents = agent_repo.get_all()
    
    return {
        "count": len(agents),
        "agents": [{"id": agent.id, "name": agent.name} for agent in agents]
    }

@router.get("/messages/count")
async def get_messages_count(session_id: str = "default", db: Session = Depends(get_db)):
    """Get count of messages for a session."""
    check_test_environment()
    
    chat_repo = ChatRepository(db)
    messages = chat_repo.get_messages(session_id)
    
    return {
        "session_id": session_id,
        "count": len(messages),
        "messages": [{"id": msg.id, "content": msg.content[:50]} for msg in messages]
    }

@router.post("/simulate-delay")
async def simulate_delay(delay_seconds: float = 1.0):
    """Simulate API delay for testing loading states."""
    check_test_environment()
    
    import asyncio
    await asyncio.sleep(delay_seconds)
    
    return {"status": "delay_completed", "delay_seconds": delay_seconds}

@router.post("/simulate-error")
async def simulate_error(error_code: int = 500, error_message: str = "Simulated error"):
    """Simulate API error for testing error handling."""
    check_test_environment()
    
    raise HTTPException(status_code=error_code, detail=error_message)