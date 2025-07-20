import pytest
from unittest.mock import MagicMock, patch, AsyncMock
from app.external.openai_client import (
    get_openai_client, get_async_openai_client, get_model_name,
    get_openai_response, get_openai_response_async, get_openai_response_with_messages_async
)


class TestOpenAIClient:

    @patch('app.external.openai_client.settings')
    def test_get_openai_client_azure(self, mock_settings):
        """Test getting Azure OpenAI client."""
        # Setup
        mock_settings.is_using_azure_openai = True
        mock_settings.azure_openai_api_key = "test-azure-key"
        mock_settings.azure_openai_api_version = "2024-12-01-preview"
        mock_settings.azure_openai_endpoint = "https://test.openai.azure.com/"

        with patch('app.external.openai_client.AzureOpenAI') as mock_azure_client:
            # Execute
            result = get_openai_client()

            # Verify
            mock_azure_client.assert_called_once_with(
                api_key="test-azure-key",
                api_version="2024-12-01-preview",
                azure_endpoint="https://test.openai.azure.com/"
            )

    @patch('app.external.openai_client.settings')
    def test_get_openai_client_standard(self, mock_settings):
        """Test getting standard OpenAI client."""
        # Setup
        mock_settings.is_using_azure_openai = False
        mock_settings.effective_openai_api_key = "sk-test-key"

        with patch('app.external.openai_client.OpenAI') as mock_openai_client:
            # Execute
            result = get_openai_client()

            # Verify
            mock_openai_client.assert_called_once_with(api_key="sk-test-key")

    @patch('app.external.openai_client.settings')
    def test_get_async_openai_client_azure(self, mock_settings):
        """Test getting async Azure OpenAI client."""
        # Setup
        mock_settings.is_using_azure_openai = True
        mock_settings.azure_openai_api_key = "test-azure-key"
        mock_settings.azure_openai_api_version = "2024-12-01-preview"
        mock_settings.azure_openai_endpoint = "https://test.openai.azure.com/"

        with patch('app.external.openai_client.openai.AsyncAzureOpenAI') as mock_async_azure:
            # Execute
            result = get_async_openai_client()

            # Verify
            mock_async_azure.assert_called_once_with(
                api_key="test-azure-key",
                api_version="2024-12-01-preview",
                azure_endpoint="https://test.openai.azure.com/"
            )

    @patch('app.external.openai_client.settings')
    def test_get_async_openai_client_standard(self, mock_settings):
        """Test getting async standard OpenAI client."""
        # Setup
        mock_settings.is_using_azure_openai = False
        mock_settings.effective_openai_api_key = "sk-test-key"

        with patch('app.external.openai_client.openai.AsyncOpenAI') as mock_async_openai:
            # Execute
            result = get_async_openai_client()

            # Verify
            mock_async_openai.assert_called_once_with(api_key="sk-test-key")

    @patch('app.external.openai_client.settings')
    def test_get_model_name_azure(self, mock_settings):
        """Test getting model name for Azure OpenAI."""
        # Setup
        mock_settings.is_using_azure_openai = True
        mock_settings.azure_openai_deployment = "gpt-4-deployment"

        # Execute
        result = get_model_name()

        # Verify
        assert result == "gpt-4-deployment"

    @patch('app.external.openai_client.settings')
    def test_get_model_name_standard(self, mock_settings):
        """Test getting model name for standard OpenAI."""
        # Setup
        mock_settings.is_using_azure_openai = False

        # Execute
        result = get_model_name()

        # Verify
        assert result == "gpt-4"

    def test_get_openai_response_success(self):
        """Test successful sync OpenAI response."""
        prompt = "Hello, world!"

        # Mock response object
        mock_choice = MagicMock()
        mock_choice.message.content = "Hello back!"

        mock_response = MagicMock()
        mock_response.choices = [mock_choice]

        mock_client = MagicMock()
        mock_client.chat.completions.create.return_value = mock_response

        with patch('app.external.openai_client.get_openai_client') as mock_get_client, \
             patch('app.external.openai_client.get_model_name') as mock_get_model:

            mock_get_client.return_value = mock_client
            mock_get_model.return_value = "gpt-4"

            # Execute
            result = get_openai_response(prompt)

            # Verify
            assert result == "Hello back!"
            mock_client.chat.completions.create.assert_called_once_with(
                model="gpt-4",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=150,
                temperature=0.7
            )

    def test_get_openai_response_error_handling(self):
        """Test error handling in sync OpenAI response."""
        prompt = "Hello, world!"

        mock_client = MagicMock()
        mock_client.chat.completions.create.side_effect = Exception("API Error")

        with patch('app.external.openai_client.get_openai_client') as mock_get_client, \
             patch('app.external.openai_client.get_model_name') as mock_get_model:

            mock_get_client.return_value = mock_client
            mock_get_model.return_value = "gpt-4"

            # Execute
            result = get_openai_response(prompt)

            # Verify fallback response
            assert "I apologize, but I'm experiencing technical difficulties" in result

    @pytest.mark.asyncio
    async def test_get_openai_response_async_success(self):
        """Test successful async OpenAI response."""
        prompt = "Hello, async world!"

        # Mock response object
        mock_choice = MagicMock()
        mock_choice.message.content = "Hello back async!"

        mock_response = MagicMock()
        mock_response.choices = [mock_choice]

        mock_client = AsyncMock()
        mock_client.chat.completions.create.return_value = mock_response

        with patch('app.external.openai_client.get_async_openai_client') as mock_get_client, \
             patch('app.external.openai_client.get_model_name') as mock_get_model:

            mock_get_client.return_value = mock_client
            mock_get_model.return_value = "gpt-4"

            # Execute
            result = await get_openai_response_async(prompt)

            # Verify
            assert result == "Hello back async!"
            mock_client.chat.completions.create.assert_called_once_with(
                model="gpt-4",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=150,
                temperature=0.7
            )

    @pytest.mark.asyncio
    async def test_get_openai_response_async_error_handling(self):
        """Test error handling in async OpenAI response."""
        prompt = "Hello, world!"

        mock_client = AsyncMock()
        mock_client.chat.completions.create.side_effect = Exception("Async API Error")

        with patch('app.external.openai_client.get_async_openai_client') as mock_get_client, \
             patch('app.external.openai_client.get_model_name') as mock_get_model:

            mock_get_client.return_value = mock_client
            mock_get_model.return_value = "gpt-4"

            # Execute
            result = await get_openai_response_async(prompt)

            # Verify fallback response
            assert "I apologize, but I'm experiencing technical difficulties" in result

    @pytest.mark.asyncio
    async def test_get_openai_response_with_messages_async_success(self):
        """Test successful async OpenAI response with message format."""
        messages = [
            {"role": "system", "content": "You are a helpful assistant"},
            {"role": "user", "content": "Hello"}
        ]

        # Mock response object
        mock_choice = MagicMock()
        mock_choice.message.content = "Hello! How can I help you today?"

        mock_response = MagicMock()
        mock_response.choices = [mock_choice]

        mock_client = AsyncMock()
        mock_client.chat.completions.create.return_value = mock_response

        with patch('app.external.openai_client.get_async_openai_client') as mock_get_client, \
             patch('app.external.openai_client.get_model_name') as mock_get_model:

            mock_get_client.return_value = mock_client
            mock_get_model.return_value = "gpt-4"

            # Execute
            result = await get_openai_response_with_messages_async(messages)

            # Verify
            assert result == "Hello! How can I help you today?"
            mock_client.chat.completions.create.assert_called_once_with(
                model="gpt-4",
                messages=messages,
                max_tokens=500,
                temperature=0.8,
                presence_penalty=0.1,
                frequency_penalty=0.1
            )

    @pytest.mark.asyncio
    async def test_get_openai_response_with_messages_async_error_handling(self):
        """Test error handling in async OpenAI response with messages."""
        messages = [{"role": "user", "content": "Hello"}]

        mock_client = AsyncMock()
        mock_client.chat.completions.create.side_effect = Exception("Messages API Error")

        with patch('app.external.openai_client.get_async_openai_client') as mock_get_client, \
             patch('app.external.openai_client.get_model_name') as mock_get_model:

            mock_get_client.return_value = mock_client
            mock_get_model.return_value = "gpt-4"

            # Execute
            result = await get_openai_response_with_messages_async(messages)

            # Verify fallback response
            assert "I apologize, but I'm experiencing technical difficulties" in result

    def test_get_openai_response_content_stripping(self):
        """Test that response content is properly stripped of whitespace."""
        prompt = "Test prompt"

        # Mock response with whitespace
        mock_choice = MagicMock()
        mock_choice.message.content = "  \n  Response with whitespace  \n  "

        mock_response = MagicMock()
        mock_response.choices = [mock_choice]

        mock_client = MagicMock()
        mock_client.chat.completions.create.return_value = mock_response

        with patch('app.external.openai_client.get_openai_client') as mock_get_client, \
             patch('app.external.openai_client.get_model_name') as mock_get_model:

            mock_get_client.return_value = mock_client
            mock_get_model.return_value = "gpt-4"

            # Execute
            result = get_openai_response(prompt)

            # Verify content is stripped
            assert result == "Response with whitespace"
