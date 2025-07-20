import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from app.services.llm_service import generate_response_async, get_response
from app.models.chat import Agent


class TestLLMService:

    @pytest.mark.asyncio
    async def test_generate_response_async_success(self):
        """Test successful response generation with agent context."""
        # Setup
        mock_agent = MagicMock(spec=Agent)
        mock_agent.name = "Assistant"
        mock_agent.description = "Helpful assistant"
        mock_agent.system_prompt = "You are a helpful AI assistant"

        context = ["User: Hello", "Assistant: Hi there!"]
        user_message = "How are you?"

        with patch(
            "app.services.llm_service.get_openai_response_with_messages_async"
        ) as mock_openai:
            mock_openai.return_value = "I'm doing well, thank you for asking!"

            # Execute
            result = await generate_response_async(mock_agent, context, user_message)

            # Verify
            assert result == "I'm doing well, thank you for asking!"
            mock_openai.assert_called_once()

            # Verify the messages structure
            call_args = mock_openai.call_args[0][0]
            assert len(call_args) == 4  # system + 2 context + user message
            assert call_args[0]["role"] == "system"
            assert call_args[0]["content"] == "You are a helpful AI assistant"
            assert call_args[-1]["role"] == "user"
            assert call_args[-1]["content"] == "How are you?"

    @pytest.mark.asyncio
    async def test_generate_response_async_no_system_prompt(self):
        """Test response generation when agent has no custom system prompt."""
        # Setup
        mock_agent = MagicMock(spec=Agent)
        mock_agent.name = "Coder"
        mock_agent.description = "Programming expert"
        mock_agent.system_prompt = None

        context = []
        user_message = "Write a function"

        with patch(
            "app.services.llm_service.get_openai_response_with_messages_async"
        ) as mock_openai:
            mock_openai.return_value = "Here's a function for you"

            # Execute
            result = await generate_response_async(mock_agent, context, user_message)

            # Verify
            assert result == "Here's a function for you"

            # Verify fallback system prompt
            call_args = mock_openai.call_args[0][0]
            assert call_args[0]["content"] == "You are Coder, Programming expert"

    @pytest.mark.asyncio
    async def test_generate_response_async_with_long_context(self):
        """Test response generation with long context (should limit to last 8 messages)."""
        # Setup
        mock_agent = MagicMock(spec=Agent)
        mock_agent.name = "Assistant"
        mock_agent.description = "Helpful assistant"
        mock_agent.system_prompt = "You are helpful"

        # Create 10 context messages
        context = [f"User: Message {i}" for i in range(10)]
        user_message = "Current message"

        with patch(
            "app.services.llm_service.get_openai_response_with_messages_async"
        ) as mock_openai:
            mock_openai.return_value = "Response"

            # Execute
            await generate_response_async(mock_agent, context, user_message)

            # Verify only last 8 context messages + system + current = 10 total
            call_args = mock_openai.call_args[0][0]
            assert len(call_args) == 10  # system + 8 context + current

    @pytest.mark.asyncio
    async def test_generate_response_async_error_handling(self):
        """Test error handling when OpenAI API fails."""
        # Setup
        mock_agent = MagicMock(spec=Agent)
        mock_agent.name = "Assistant"
        mock_agent.description = "Helpful assistant"
        mock_agent.system_prompt = "You are helpful"

        context = []
        user_message = "Hello"

        with patch(
            "app.services.llm_service.get_openai_response_with_messages_async"
        ) as mock_openai:
            mock_openai.side_effect = Exception("API Error")

            # Execute
            result = await generate_response_async(mock_agent, context, user_message)

            # Verify fallback response
            assert "I apologize, but I'm having trouble" in result
            assert "Assistant" in result

    @pytest.mark.asyncio
    async def test_generate_response_async_context_parsing(self):
        """Test proper parsing of context messages with different formats."""
        # Setup
        mock_agent = MagicMock(spec=Agent)
        mock_agent.name = "Assistant"
        mock_agent.description = "Helpful assistant"
        mock_agent.system_prompt = "You are helpful"

        context = [
            "User: Hello there",
            "Assistant: Hi! How can I help?",
            "Coder: Here's some code",
            "User: Thanks",
            "Writer: Here's a story: Once upon a time...",
            "InvalidFormat",  # Should be ignored
            "Agent: ",  # Empty response should be ignored
        ]
        user_message = "Continue"

        with patch(
            "app.services.llm_service.get_openai_response_with_messages_async"
        ) as mock_openai:
            mock_openai.return_value = "Continuing..."

            # Execute
            await generate_response_async(mock_agent, context, user_message)

            # Verify message structure
            call_args = mock_openai.call_args[0][0]

            # Should have: system + valid user/assistant messages + current
            user_messages = [msg for msg in call_args if msg["role"] == "user"]
            assistant_messages = [
                msg for msg in call_args if msg["role"] == "assistant"
            ]

            assert len(user_messages) == 3  # 2 from context + current
            assert len(assistant_messages) == 3  # 3 from context

            # Verify content parsing
            assert "Hello there" in user_messages[0]["content"]
            assert "Hi! How can I help?" in assistant_messages[0]["content"]

    def test_get_response_sync(self):
        """Test synchronous response generation (legacy method)."""
        prompt = "Hello world"

        with patch("app.services.llm_service.get_openai_response") as mock_openai:
            mock_openai.return_value = "Hello back!"

            # Execute
            result = get_response(prompt)

            # Verify
            assert result == "Hello back!"
            mock_openai.assert_called_once_with(prompt)

    @pytest.mark.asyncio
    async def test_generate_response_async_empty_context(self):
        """Test response generation with empty context."""
        # Setup
        mock_agent = MagicMock(spec=Agent)
        mock_agent.name = "Writer"
        mock_agent.description = "Creative writer"
        mock_agent.system_prompt = "You are a creative writer"

        context = []
        user_message = "Write a story"

        with patch(
            "app.services.llm_service.get_openai_response_with_messages_async"
        ) as mock_openai:
            mock_openai.return_value = "Once upon a time..."

            # Execute
            result = await generate_response_async(mock_agent, context, user_message)

            # Verify
            assert result == "Once upon a time..."

            # Should only have system message + user message
            call_args = mock_openai.call_args[0][0]
            assert len(call_args) == 2
            assert call_args[0]["role"] == "system"
            assert call_args[1]["role"] == "user"
