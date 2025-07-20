import pytest
from unittest.mock import MagicMock
from sqlalchemy.orm import Session
from app.services.agent_service import get_agents
from app.models.chat import Agent


class TestAgentService:

    def test_get_agents_success(self):
        """Test successful retrieval of all agents."""
        # Setup
        db_mock = MagicMock(spec=Session)

        # Mock agents
        mock_agents = [
            MagicMock(
                spec=Agent, id=1, name="Assistant", description="Helpful assistant"
            ),
            MagicMock(spec=Agent, id=2, name="Coder", description="Programming expert"),
            MagicMock(spec=Agent, id=3, name="Writer", description="Content creator"),
        ]

        with patch("app.services.agent_service.agent_repo") as mock_agent_repo:
            mock_agent_repo.get_agents.return_value = mock_agents

            # Execute
            result = get_agents(db_mock)

            # Verify
            assert len(result) == 3
            assert result == mock_agents
            mock_agent_repo.get_agents.assert_called_once_with(db_mock)

    def test_get_agents_empty_result(self):
        """Test retrieval when no agents exist."""
        # Setup
        db_mock = MagicMock(spec=Session)

        with patch("app.services.agent_service.agent_repo") as mock_agent_repo:
            mock_agent_repo.get_agents.return_value = []

            # Execute
            result = get_agents(db_mock)

            # Verify
            assert result == []
            mock_agent_repo.get_agents.assert_called_once_with(db_mock)


# Import patch after defining the test class to avoid issues
from unittest.mock import patch
