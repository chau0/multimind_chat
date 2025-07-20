import pytest
from unittest.mock import MagicMock, AsyncMock
from sqlalchemy.orm import Session
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError
from app.repositories.chat_repo import (
    create_session, create_message, get_messages_by_session,
    create_session_async, create_message_async, get_messages_by_session_async
)
from app.schemas.chat import MessageCreate
from app.models.chat import ChatSession, Message


class TestChatRepo:

    def test_create_session_success(self):
        """Test successful session creation."""
        # Setup
        db_mock = MagicMock(spec=Session)
        session_id = "test-session-123"

        mock_session = MagicMock(spec=ChatSession)
        mock_session.id = session_id

        # Configure mocks
        db_mock.commit.return_value = None
        db_mock.refresh.return_value = None

        # Execute
        result = create_session(db_mock, session_id)

        # Verify
        db_mock.add.assert_called_once()
        db_mock.commit.assert_called_once()
        db_mock.refresh.assert_called_once()

        # Verify the session object was created with correct ID
        added_session = db_mock.add.call_args[0][0]
        assert added_session.id == session_id

    def test_create_session_already_exists(self):
        """Test session creation when session already exists."""
        # Setup
        db_mock = MagicMock(spec=Session)
        session_id = "existing-session"

        existing_session = MagicMock(spec=ChatSession)
        existing_session.id = session_id

        # Configure mocks to simulate IntegrityError
        db_mock.commit.side_effect = IntegrityError("", "", "")
        db_mock.query.return_value.filter.return_value.first.return_value = existing_session

        # Execute
        result = create_session(db_mock, session_id)

        # Verify
        db_mock.rollback.assert_called_once()
        assert result == existing_session

    def test_create_message_success(self):
        """Test successful message creation."""
        # Setup
        db_mock = MagicMock(spec=Session)
        message_create = MessageCreate(
            content="Hello world",
            session_id="test-session",
            agent_id=1,
            mentions=["Assistant"]
        )

        mock_message = MagicMock(spec=Message)
        mock_message.id = 1

        with patch('app.repositories.chat_repo.create_session') as mock_create_session:
            mock_create_session.return_value = MagicMock()

            # Execute
            result = create_message(db_mock, message_create)

            # Verify
            mock_create_session.assert_called_once_with(db_mock, "test-session")
            db_mock.add.assert_called_once()
            db_mock.commit.assert_called_once()
            db_mock.refresh.assert_called_once()

            # Verify message data excludes mentions
            added_message = db_mock.add.call_args[0][0]
            assert added_message.content == "Hello world"
            assert added_message.session_id == "test-session"
            assert added_message.agent_id == 1

    def test_get_messages_by_session(self):
        """Test retrieving messages by session ID."""
        # Setup
        db_mock = MagicMock(spec=Session)
        session_id = "test-session"

        mock_messages = [
            MagicMock(spec=Message, id=1, content="Hello"),
            MagicMock(spec=Message, id=2, content="Hi there")
        ]

        db_mock.query.return_value.filter.return_value.all.return_value = mock_messages

        # Execute
        result = get_messages_by_session(db_mock, session_id)

        # Verify
        assert result == mock_messages
        db_mock.query.assert_called_once_with(Message)

    @pytest.mark.asyncio
    async def test_create_session_async_success(self):
        """Test successful async session creation."""
        # Setup
        db_mock = AsyncMock(spec=AsyncSession)
        session_id = "async-session-123"

        mock_session = MagicMock(spec=ChatSession)
        mock_session.id = session_id

        # Execute
        result = await create_session_async(db_mock, session_id)

        # Verify
        db_mock.add.assert_called_once()
        db_mock.commit.assert_called_once()
        db_mock.refresh.assert_called_once()

    @pytest.mark.asyncio
    async def test_create_session_async_already_exists(self):
        """Test async session creation when session already exists."""
        # Setup
        db_mock = AsyncMock(spec=AsyncSession)
        session_id = "existing-async-session"

        existing_session = MagicMock(spec=ChatSession)
        existing_session.id = session_id

        # Configure mocks
        db_mock.commit.side_effect = IntegrityError("", "", "")

        mock_result = MagicMock()
        mock_result.scalar_one.return_value = existing_session
        db_mock.execute.return_value = mock_result

        # Execute
        result = await create_session_async(db_mock, session_id)

        # Verify
        db_mock.rollback.assert_called_once()
        assert result == existing_session

    @pytest.mark.asyncio
    async def test_create_message_async_success(self):
        """Test successful async message creation."""
        # Setup
        db_mock = AsyncMock(spec=AsyncSession)
        message_create = MessageCreate(
            content="Async hello",
            session_id="async-session",
            agent_id=2
        )

        mock_message = MagicMock(spec=Message)
        mock_message.id = 1

        with patch('app.repositories.chat_repo.create_session_async') as mock_create_session:
            mock_create_session.return_value = MagicMock()

            # Execute
            result = await create_message_async(db_mock, message_create)

            # Verify
            mock_create_session.assert_called_once_with(db_mock, "async-session")
            db_mock.add.assert_called_once()
            db_mock.commit.assert_called_once()
            db_mock.refresh.assert_called_once()

    @pytest.mark.asyncio
    async def test_get_messages_by_session_async_success(self):
        """Test successful async message retrieval."""
        # Setup
        db_mock = AsyncMock(spec=AsyncSession)
        session_id = "async-session"

        mock_messages = [
            MagicMock(spec=Message, id=1, content="First"),
            MagicMock(spec=Message, id=2, content="Second")
        ]

        mock_result = MagicMock()
        mock_result.scalars.return_value.all.return_value = mock_messages
        db_mock.execute.return_value = mock_result

        # Execute
        result = await get_messages_by_session_async(db_mock, session_id)

        # Verify
        assert len(result) == 2
        db_mock.execute.assert_called_once()

    @pytest.mark.asyncio
    async def test_get_messages_by_session_async_with_limit(self):
        """Test async message retrieval with custom limit."""
        # Setup
        db_mock = AsyncMock(spec=AsyncSession)
        session_id = "async-session"
        limit = 5

        mock_messages = [MagicMock(spec=Message) for _ in range(5)]

        mock_result = MagicMock()
        mock_result.scalars.return_value.all.return_value = mock_messages
        db_mock.execute.return_value = mock_result

        # Execute
        result = await get_messages_by_session_async(db_mock, session_id, limit=limit)

        # Verify
        assert len(result) == 5
        db_mock.execute.assert_called_once()

    @pytest.mark.asyncio
    async def test_get_messages_by_session_async_empty_result(self):
        """Test async message retrieval with no messages."""
        # Setup
        db_mock = AsyncMock(spec=AsyncSession)
        session_id = "empty-session"

        mock_result = MagicMock()
        mock_result.scalars.return_value.all.return_value = []
        db_mock.execute.return_value = mock_result

        # Execute
        result = await get_messages_by_session_async(db_mock, session_id)

        # Verify
        assert result == []


# Import patch after defining the test class
from unittest.mock import patch
