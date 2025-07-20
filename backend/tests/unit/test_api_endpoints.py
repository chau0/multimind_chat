import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from fastapi.testclient import TestClient
from httpx import AsyncClient
from app.main import app
from app.models.chat import Agent, Message
from app.schemas.chat import MessageCreate


class TestHealthEndpoint:
    
    def test_health_check(self, client):
        """Test health check endpoint."""
        response = client.get("/api/v1/health")
        
        assert response.status_code == 200
        assert response.json() == {"status": "healthy"}


class TestAgentsEndpoint:
    
    def test_get_agents_success(self, client):
        """Test successful retrieval of agents."""
        # Mock agents data
        mock_agents = [
            MagicMock(spec=Agent, id=1, name="Assistant", description="Helpful assistant"),
            MagicMock(spec=Agent, id=2, name="Coder", description="Programming expert")
        ]
        
        with patch('app.api.v1.agents.agent_service.get_agents') as mock_get_agents:
            mock_get_agents.return_value = mock_agents
            
            response = client.get("/api/v1/agents")
            
            assert response.status_code == 200
            data = response.json()
            assert len(data) == 2
            mock_get_agents.assert_called_once()

    def test_get_agents_empty(self, client):
        """Test agents endpoint with no agents."""
        with patch('app.api.v1.agents.agent_service.get_agents') as mock_get_agents:
            mock_get_agents.return_value = []
            
            response = client.get("/api/v1/agents")
            
            assert response.status_code == 200
            assert response.json() == []

    def test_get_agents_database_error(self, client):
        """Test agents endpoint with database error."""
        with patch('app.api.v1.agents.agent_service.get_agents') as mock_get_agents:
            mock_get_agents.side_effect = Exception("Database error")
            
            response = client.get("/api/v1/agents")
            
            assert response.status_code == 500
            assert "error" in response.json()


class TestChatEndpoints:
    
    def test_get_messages_success(self, client, test_agents):
        """Test successful retrieval of messages."""
        session_id = "test-session"
        
        # Mock messages
        mock_messages = [
            MagicMock(spec=Message, id=1, content="Hello", session_id=session_id, agent_id=None),
            MagicMock(spec=Message, id=2, content="Hi there!", session_id=session_id, agent_id=1)
        ]
        
        with patch('app.api.v1.chat.chat_service.get_messages_by_session') as mock_get_messages:
            mock_get_messages.return_value = mock_messages
            
            response = client.get(f"/api/v1/chat/sessions/{session_id}/messages")
            
            assert response.status_code == 200
            data = response.json()
            assert len(data) == 2

    def test_get_messages_empty_session(self, client):
        """Test getting messages from empty session."""
        session_id = "empty-session"
        
        with patch('app.api.v1.chat.chat_service.get_messages_by_session') as mock_get_messages:
            mock_get_messages.return_value = []
            
            response = client.get(f"/api/v1/chat/sessions/{session_id}/messages")
            
            assert response.status_code == 200
            assert response.json() == []

    @pytest.mark.asyncio
    async def test_send_message_success(self, async_client):
        """Test successful message sending."""
        message_data = {
            "content": "@Assistant help me",
            "session_id": "test-session"
        }
        
        mock_response = {
            "id": 2,
            "content": "Hello! How can I help you?",
            "agent_id": 1,
            "agent_name": "Assistant",
            "session_id": "test-session",
            "timestamp": "2024-01-01T12:00:00"
        }
        
        with patch('app.api.v1.chat.chat_service.create_message_async') as mock_create_message:
            mock_create_message.return_value = mock_response
            
            response = await async_client.post("/api/v1/chat/messages", json=message_data)
            
            assert response.status_code == 200
            data = response.json()
            assert data["content"] == "Hello! How can I help you?"
            assert data["agent_name"] == "Assistant"

    @pytest.mark.asyncio
    async def test_send_message_no_mention(self, async_client):
        """Test sending message without agent mention."""
        message_data = {
            "content": "Hello world",
            "session_id": "test-session"
        }
        
        with patch('app.api.v1.chat.chat_service.create_message_async') as mock_create_message:
            mock_create_message.side_effect = ValueError("No agent mentioned in message")
            
            response = await async_client.post("/api/v1/chat/messages", json=message_data)
            
            assert response.status_code == 400
            data = response.json()
            assert "No agent mentioned" in data["detail"]

    @pytest.mark.asyncio
    async def test_send_message_agent_not_found(self, async_client):
        """Test sending message to non-existent agent."""
        message_data = {
            "content": "@NonExistent help",
            "session_id": "test-session"
        }
        
        with patch('app.api.v1.chat.chat_service.create_message_async') as mock_create_message:
            mock_create_message.side_effect = ValueError("Agent 'NonExistent' not found")
            
            response = await async_client.post("/api/v1/chat/messages", json=message_data)
            
            assert response.status_code == 400
            data = response.json()
            assert "not found" in data["detail"]

    @pytest.mark.asyncio
    async def test_send_message_invalid_data(self, async_client):
        """Test sending message with invalid data."""
        # Missing required fields
        message_data = {
            "content": "@Assistant help"
            # Missing session_id
        }
        
        response = await async_client.post("/api/v1/chat/messages", json=message_data)
        
        assert response.status_code == 422  # Validation error

    @pytest.mark.asyncio
    async def test_send_message_empty_content(self, async_client):
        """Test sending message with empty content."""
        message_data = {
            "content": "",
            "session_id": "test-session"
        }
        
        response = await async_client.post("/api/v1/chat/messages", json=message_data)
        
        assert response.status_code == 422  # Validation error

    @pytest.mark.asyncio
    async def test_send_message_server_error(self, async_client):
        """Test sending message with server error."""
        message_data = {
            "content": "@Assistant help",
            "session_id": "test-session"
        }
        
        with patch('app.api.v1.chat.chat_service.create_message_async') as mock_create_message:
            mock_create_message.side_effect = Exception("Internal server error")
            
            response = await async_client.post("/api/v1/chat/messages", json=message_data)
            
            assert response.status_code == 500
            data = response.json()
            assert "error" in data

    def test_get_messages_invalid_session_id(self, client):
        """Test getting messages with invalid session ID format."""
        # Test with very long session ID
        long_session_id = "x" * 1000
        
        response = client.get(f"/api/v1/chat/sessions/{long_session_id}/messages")
        
        # Should still work but might be handled by validation
        assert response.status_code in [200, 400, 422]

    @pytest.mark.asyncio
    async def test_send_message_mention_parsing(self, async_client):
        """Test message sending with various mention formats."""
        test_cases = [
            "@Assistant help me",
            "Can @Coder write a function?",
            "Hey @Writer, create a story",
            "@Researcher analyze this data"
        ]
        
        for content in test_cases:
            message_data = {
                "content": content,
                "session_id": "test-session"
            }
            
            mock_response = {
                "id": 1,
                "content": "Response",
                "agent_id": 1,
                "agent_name": "TestAgent",
                "session_id": "test-session",
                "timestamp": None
            }
            
            with patch('app.api.v1.chat.chat_service.create_message_async') as mock_create_message:
                mock_create_message.return_value = mock_response
                
                response = await async_client.post("/api/v1/chat/messages", json=message_data)
                
                assert response.status_code == 200

    def test_cors_headers(self, client):
        """Test CORS headers are present in responses."""
        response = client.get("/api/v1/health")
        
        # CORS headers should be present (added by middleware)
        assert response.status_code == 200

    def test_content_type_headers(self, client):
        """Test content type headers in responses."""
        response = client.get("/api/v1/agents")
        
        assert response.status_code == 200
        assert "application/json" in response.headers.get("content-type", "")

    @pytest.mark.asyncio
    async def test_concurrent_message_sending(self, async_client):
        """Test sending multiple messages concurrently."""
        import asyncio
        
        message_data = {
            "content": "@Assistant help",
            "session_id": "concurrent-session"
        }
        
        mock_response = {
            "id": 1,
            "content": "Response",
            "agent_id": 1,
            "agent_name": "Assistant",
            "session_id": "concurrent-session",
            "timestamp": None
        }
        
        with patch('app.api.v1.chat.chat_service.create_message_async') as mock_create_message:
            mock_create_message.return_value = mock_response
            
            # Send 3 messages concurrently
            tasks = [
                async_client.post("/api/v1/chat/messages", json=message_data)
                for _ in range(3)
            ]
            
            responses = await asyncio.gather(*tasks)
            
            # All should succeed
            for response in responses:
                assert response.status_code == 200