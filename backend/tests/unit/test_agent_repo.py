import pytest
from unittest.mock import MagicMock, AsyncMock
from sqlalchemy.orm import Session
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.agent_repo import (
    get_agents,
    get_agents_async,
    get_agent_by_name_async,
    get_agent_by_id_async,
)
from app.models.chat import Agent


class TestAgentRepo:

    def test_get_agents_success(self):
        """Test successful retrieval of all agents."""
        # Setup
        db_mock = MagicMock(spec=Session)

        mock_agents = [
            MagicMock(
                spec=Agent, id=1, name="Assistant", description="Helpful assistant"
            ),
            MagicMock(spec=Agent, id=2, name="Coder", description="Programming expert"),
            MagicMock(spec=Agent, id=3, name="Writer", description="Content creator"),
        ]

        db_mock.query.return_value.all.return_value = mock_agents

        # Execute
        result = get_agents(db_mock)

        # Verify
        assert result == mock_agents
        db_mock.query.assert_called_once_with(Agent)

    def test_get_agents_empty_result(self):
        """Test retrieval when no agents exist."""
        # Setup
        db_mock = MagicMock(spec=Session)
        db_mock.query.return_value.all.return_value = []

        # Execute
        result = get_agents(db_mock)

        # Verify
        assert result == []
        db_mock.query.assert_called_once_with(Agent)

    @pytest.mark.asyncio
    async def test_get_agents_async_success(self):
        """Test successful async retrieval of all agents."""
        # Setup
        db_mock = AsyncMock(spec=AsyncSession)

        mock_agents = [
            MagicMock(spec=Agent, id=1, name="Assistant"),
            MagicMock(spec=Agent, id=2, name="Coder"),
        ]

        mock_result = MagicMock()
        mock_result.scalars.return_value.all.return_value = mock_agents
        db_mock.execute.return_value = mock_result

        # Execute
        result = await get_agents_async(db_mock)

        # Verify
        assert result == mock_agents
        db_mock.execute.assert_called_once()

    @pytest.mark.asyncio
    async def test_get_agents_async_empty_result(self):
        """Test async retrieval when no agents exist."""
        # Setup
        db_mock = AsyncMock(spec=AsyncSession)

        mock_result = MagicMock()
        mock_result.scalars.return_value.all.return_value = []
        db_mock.execute.return_value = mock_result

        # Execute
        result = await get_agents_async(db_mock)

        # Verify
        assert result == []

    @pytest.mark.asyncio
    async def test_get_agent_by_name_async_found(self):
        """Test successful retrieval of agent by name."""
        # Setup
        db_mock = AsyncMock(spec=AsyncSession)
        agent_name = "Assistant"

        mock_agent = MagicMock(spec=Agent)
        mock_agent.id = 1
        mock_agent.name = "Assistant"
        mock_agent.description = "Helpful assistant"

        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = mock_agent
        db_mock.execute.return_value = mock_result

        # Execute
        result = await get_agent_by_name_async(db_mock, agent_name)

        # Verify
        assert result == mock_agent
        db_mock.execute.assert_called_once()

    @pytest.mark.asyncio
    async def test_get_agent_by_name_async_not_found(self):
        """Test retrieval when agent name doesn't exist."""
        # Setup
        db_mock = AsyncMock(spec=AsyncSession)
        agent_name = "NonExistent"

        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        db_mock.execute.return_value = mock_result

        # Execute
        result = await get_agent_by_name_async(db_mock, agent_name)

        # Verify
        assert result is None
        db_mock.execute.assert_called_once()

    @pytest.mark.asyncio
    async def test_get_agent_by_name_async_case_sensitive(self):
        """Test that agent name lookup is case sensitive."""
        # Setup
        db_mock = AsyncMock(spec=AsyncSession)
        agent_name = "assistant"  # lowercase

        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        db_mock.execute.return_value = mock_result

        # Execute
        result = await get_agent_by_name_async(db_mock, agent_name)

        # Verify
        assert result is None

    @pytest.mark.asyncio
    async def test_get_agent_by_id_async_found(self):
        """Test successful retrieval of agent by ID."""
        # Setup
        db_mock = AsyncMock(spec=AsyncSession)
        agent_id = 1

        mock_agent = MagicMock(spec=Agent)
        mock_agent.id = 1
        mock_agent.name = "Assistant"

        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = mock_agent
        db_mock.execute.return_value = mock_result

        # Execute
        result = await get_agent_by_id_async(db_mock, agent_id)

        # Verify
        assert result == mock_agent
        db_mock.execute.assert_called_once()

    @pytest.mark.asyncio
    async def test_get_agent_by_id_async_not_found(self):
        """Test retrieval when agent ID doesn't exist."""
        # Setup
        db_mock = AsyncMock(spec=AsyncSession)
        agent_id = 999

        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        db_mock.execute.return_value = mock_result

        # Execute
        result = await get_agent_by_id_async(db_mock, agent_id)

        # Verify
        assert result is None
        db_mock.execute.assert_called_once()

    @pytest.mark.asyncio
    async def test_get_agent_by_id_async_invalid_id(self):
        """Test retrieval with invalid agent ID types."""
        # Setup
        db_mock = AsyncMock(spec=AsyncSession)

        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        db_mock.execute.return_value = mock_result

        # Test with negative ID
        result = await get_agent_by_id_async(db_mock, -1)
        assert result is None

        # Test with zero ID
        result = await get_agent_by_id_async(db_mock, 0)
        assert result is None
