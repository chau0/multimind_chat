from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_chat_flow():
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
    assert response.json()["content"] is not None

    # 3. Get message history
    response = client.get(f"/api/v1/chat/sessions/{session_id}/messages")
    assert response.status_code == 200
    messages = response.json()
    assert len(messages) > 0
