from fastapi.testclient import TestClient
from app.main import app
from app.utils.db import get_db
from app.models.chat import Agent
from sqlalchemy.orm import Session

client = TestClient(app)

def setup_test_agents():
    """Setup test agents in the database."""
    db: Session = next(get_db())
    
    # Clear existing agents for clean test
    db.query(Agent).delete()
    
    # Add test agents
    test_agents = [
        Agent(name="Echo", description="A simple agent that echoes your message."),
        Agent(name="TestBot", description="A test agent for e2e testing.")
    ]
    
    for agent in test_agents:
        db.add(agent)
    
    db.commit()
    db.close()

def test_chat_flow(client, test_agents):
    # 1. List agents
    response = client.get("/api/v1/agents")
    assert response.status_code == 200
    agents = response.json()
    assert len(agents) > 0

    # 2. Send a message to the first agent
    agent_name = agents[0]["name"]
    message = f"@{agent_name} Hello!"
    session_id = "test_session"
    response = client.post(
        "/api/v1/chat/messages",
        json={"content": message, "session_id": session_id}
    )
    assert response.status_code == 200
    result = response.json()
    assert result["content"] is not None
    assert result["agent_name"] == agent_name

    # 3. Get message history
    response = client.get(f"/api/v1/chat/sessions/{session_id}/messages")
    assert response.status_code == 200
    messages = response.json()
    assert len(messages) > 0
