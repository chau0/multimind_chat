import pytest

@pytest.mark.asyncio
async def test_chat_flow(client, async_client, test_agents):
    """Test the complete chat flow using both sync and async clients."""
    
    # 1. List agents (sync endpoint)
    response = client.get("/api/v1/agents")
    assert response.status_code == 200
    agents = response.json()
    assert len(agents) > 0

    # 2. Send a message to the first agent (async endpoint)
    agent_name = agents[0]["name"]
    message = f"@{agent_name} Hello!"
    session_id = "test_session"
    
    response = await async_client.post(
        "/api/v1/chat/messages",
        json={"content": message, "session_id": session_id}
    )
    assert response.status_code == 200
    result = response.json()
    assert result["content"] is not None
    assert result["agent_name"] == agent_name

    # 3. Get message history (sync endpoint)
    response = client.get(f"/api/v1/chat/sessions/{session_id}/messages")
    assert response.status_code == 200
    messages = response.json()
    assert len(messages) > 0
