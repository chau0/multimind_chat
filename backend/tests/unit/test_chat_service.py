import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from sqlalchemy.ext.asyncio import AsyncSession
from app.services.chat_service import create_message_async, _build_context_async
from app.schemas.chat import MessageCreate
from app.models.chat import Agent, Message
from app.utils.mention_parser import parse_mention


class TestChatService:
    
    @pytest.mark.asyncio
    async def test_create_message_async_success(self):
        """Test successful message creation with agent response."""
        # Setup
        db_mock = AsyncMock(spec=AsyncSession)
        message = MessageCreate(content="@Assistant help me", session_id="test-session")
        
        # Mock agent
        mock_agent = MagicMock(spec=Agent)
        mock_agent.id = 1
        mock_agent.name = "Assistant"
        mock_agent.description = "Helpful assistant"
        mock_agent.system_prompt = "You are a helpful assistant"
        
        # Mock message objects
        mock_user_message = MagicMock(spec=Message)
        mock_user_message.id = 1
        
        mock_response_message = MagicMock(spec=Message)
        mock_response_message.id = 2
        mock_response_message.created_at = None
        
        with patch('app.services.chat_service.agent_repo') as mock_agent_repo, \
             patch('app.services.chat_service.chat_repo') as mock_chat_repo, \
             patch('app.services.chat_service.llm_service') as mock_llm_service, \
             patch('app.services.chat_service._build_context_async') as mock_build_context:
            
            # Configure mocks
            mock_agent_repo.get_agent_by_name_async.return_value = mock_agent
            mock_chat_repo.create_message_async.side_effect = [mock_user_message, mock_response_message]
            mock_llm_service.generate_response_async.return_value = "Hello! How can I help you?"
            mock_build_context.return_value = []
            
            # Execute
            result = await create_message_async(db_mock, message)
            
            # Verify
            assert result["id"] == 2
            assert result["content"] == "Hello! How can I help you?"
            assert result["agent_id"] == 1
            assert result["agent_name"] == "Assistant"
            assert result["session_id"] == "test-session"
            
            # Verify function calls
            mock_agent_repo.get_agent_by_name_async.assert_called_once_with(db_mock, "Assistant")
            mock_llm_service.generate_response_async.assert_called_once()
            assert mock_chat_repo.create_message_async.call_count == 2

    @pytest.mark.asyncio
    async def test_create_message_async_no_mention(self):
        """Test error when no agent is mentioned."""
        db_mock = AsyncMock(spec=AsyncSession)
        message = MessageCreate(content="Hello world", session_id="test-session")
        
        with pytest.raises(ValueError, match="No agent mentioned in message"):
            await create_message_async(db_mock, message)

    @pytest.mark.asyncio
    async def test_create_message_async_agent_not_found(self):
        """Test error when mentioned agent doesn't exist."""
        db_mock = AsyncMock(spec=AsyncSession)
        message = MessageCreate(content="@NonExistent help", session_id="test-session")
        
        with patch('app.services.chat_service.agent_repo') as mock_agent_repo:
            mock_agent_repo.get_agent_by_name_async.return_value = None
            
            with pytest.raises(ValueError, match="Agent 'NonExistent' not found"):
                await create_message_async(db_mock, message)

    @pytest.mark.asyncio
    async def test_build_context_async(self):
        """Test building conversation context from message history."""
        db_mock = AsyncMock(spec=AsyncSession)
        session_id = "test-session"
        
        # Mock messages
        mock_user_message = MagicMock(spec=Message)
        mock_user_message.content = "Hello"
        mock_user_message.agent_id = None
        
        mock_agent_message = MagicMock(spec=Message)
        mock_agent_message.content = "Hi there!"
        mock_agent_message.agent_id = 1
        
        mock_agent = MagicMock(spec=Agent)
        mock_agent.name = "Assistant"
        
        with patch('app.services.chat_service.chat_repo') as mock_chat_repo, \
             patch('app.services.chat_service.agent_repo') as mock_agent_repo:
            
            mock_chat_repo.get_messages_by_session_async.return_value = [
                mock_user_message, mock_agent_message
            ]
            mock_agent_repo.get_agent_by_id_async.return_value = mock_agent
            
            # Execute
            context = await _build_context_async(db_mock, session_id)
            
            # Verify
            assert len(context) == 2
            assert "User: Hello" in context
            assert "Assistant: Hi there!" in context

    @pytest.mark.asyncio
    async def test_build_context_async_empty_history(self):
        """Test building context with no message history."""
        db_mock = AsyncMock(spec=AsyncSession)
        session_id = "empty-session"
        
        with patch('app.services.chat_service.chat_repo') as mock_chat_repo:
            mock_chat_repo.get_messages_by_session_async.return_value = []
            
            # Execute
            context = await _build_context_async(db_mock, session_id)
            
            # Verify
            assert context == []

    @pytest.mark.asyncio
    async def test_create_message_async_llm_error_handling(self):
        """Test error handling when LLM service fails."""
        db_mock = AsyncMock(spec=AsyncSession)
        message = MessageCreate(content="@Assistant help", session_id="test-session")
        
        mock_agent = MagicMock(spec=Agent)
        mock_agent.id = 1
        mock_agent.name = "Assistant"
        
        with patch('app.services.chat_service.agent_repo') as mock_agent_repo, \
             patch('app.services.chat_service.llm_service') as mock_llm_service, \
             patch('app.services.chat_service._build_context_async') as mock_build_context:
            
            mock_agent_repo.get_agent_by_name_async.return_value = mock_agent
            mock_build_context.return_value = []
            mock_llm_service.generate_response_async.side_effect = Exception("API Error")
            
            # Execute and verify exception is raised
            with pytest.raises(Exception):
                await create_message_async(db_mock, message)