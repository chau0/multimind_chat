import pytest
from datetime import datetime
from unittest.mock import MagicMock
from app.schemas.chat import MessageBase, MessageCreate, Message
from app.schemas.agent import Agent, AgentCreate
from app.models.chat import Message as MessageModel, Agent as AgentModel


class TestChatSchemas:

    def test_message_base_creation(self):
        """Test MessageBase schema creation."""
        message_base = MessageBase(content="Hello world", session_id="test-session")

        assert message_base.content == "Hello world"
        assert message_base.session_id == "test-session"

    def test_message_create_with_optional_fields(self):
        """Test MessageCreate schema with optional fields."""
        message_create = MessageCreate(
            content="@Assistant help me",
            session_id="test-session",
            agent_id=1,
            mentions=["Assistant"],
        )

        assert message_create.content == "@Assistant help me"
        assert message_create.session_id == "test-session"
        assert message_create.agent_id == 1
        assert message_create.mentions == ["Assistant"]

    def test_message_create_without_optional_fields(self):
        """Test MessageCreate schema without optional fields."""
        message_create = MessageCreate(content="Hello", session_id="test-session")

        assert message_create.content == "Hello"
        assert message_create.session_id == "test-session"
        assert message_create.agent_id is None
        assert message_create.mentions == []

    def test_message_schema_creation(self):
        """Test Message schema creation."""
        message = Message(
            id=1,
            content="Hello",
            session_id="test-session",
            agent_id=1,
            is_user=False,
            timestamp="2024-01-01T12:00:00",
        )

        assert message.id == 1
        assert message.content == "Hello"
        assert message.session_id == "test-session"
        assert message.agent_id == 1
        assert message.is_user is False
        assert message.timestamp == "2024-01-01T12:00:00"

    def test_message_schema_defaults(self):
        """Test Message schema with default values."""
        message = Message(id=1, content="Hello", session_id="test-session")

        assert message.agent_id is None
        assert message.is_user is True
        assert message.timestamp is None

    def test_message_model_validate_from_orm(self):
        """Test Message schema validation from ORM object."""
        # Create mock ORM object
        mock_orm_message = MagicMock(spec=MessageModel)
        mock_orm_message.id = 1
        mock_orm_message.content = "Test message"
        mock_orm_message.session_id = "test-session"
        mock_orm_message.agent_id = 2
        mock_orm_message.created_at = datetime(2024, 1, 1, 12, 0, 0)

        # Execute
        message = Message.model_validate(mock_orm_message)

        # Verify
        assert message.id == 1
        assert message.content == "Test message"
        assert message.session_id == "test-session"
        assert message.agent_id == 2
        assert message.is_user is False  # Because agent_id is not None
        assert message.timestamp == "2024-01-01T12:00:00"

    def test_message_model_validate_user_message(self):
        """Test Message schema validation for user message (no agent_id)."""
        # Create mock ORM object for user message
        mock_orm_message = MagicMock(spec=MessageModel)
        mock_orm_message.id = 1
        mock_orm_message.content = "User message"
        mock_orm_message.session_id = "test-session"
        mock_orm_message.agent_id = None
        mock_orm_message.created_at = datetime(2024, 1, 1, 12, 0, 0)

        # Execute
        message = Message.model_validate(mock_orm_message)

        # Verify
        assert message.is_user is True  # Because agent_id is None
        assert message.agent_id is None

    def test_message_model_validate_no_timestamp(self):
        """Test Message schema validation when ORM object has no created_at."""
        # Create mock ORM object without created_at
        mock_orm_message = MagicMock(spec=MessageModel)
        mock_orm_message.id = 1
        mock_orm_message.content = "Test message"
        mock_orm_message.session_id = "test-session"
        mock_orm_message.agent_id = None
        mock_orm_message.created_at = None

        # Execute
        message = Message.model_validate(mock_orm_message)

        # Verify
        assert message.timestamp is None

    def test_message_model_validate_from_dict(self):
        """Test Message schema validation from dictionary."""
        data = {
            "id": 1,
            "content": "Dict message",
            "session_id": "test-session",
            "agent_id": 1,
            "is_user": False,
            "timestamp": "2024-01-01T12:00:00",
        }

        # Execute
        message = Message.model_validate(data)

        # Verify
        assert message.id == 1
        assert message.content == "Dict message"
        assert message.is_user is False


class TestAgentSchemas:

    def test_agent_schema_creation(self):
        """Test Agent schema creation."""
        agent = Agent(
            id=1,
            name="Assistant",
            description="Helpful AI assistant",
            system_prompt="You are helpful",
            display_name="AI Assistant",
            avatar="🤖",
            color="blue",
        )

        assert agent.id == 1
        assert agent.name == "Assistant"
        assert agent.description == "Helpful AI assistant"
        assert agent.system_prompt == "You are helpful"
        assert agent.display_name == "AI Assistant"
        assert agent.avatar == "🤖"
        assert agent.color == "blue"

    def test_agent_schema_minimal(self):
        """Test Agent schema with minimal required fields."""
        agent = Agent(id=1, name="Coder", description="Programming expert")

        assert agent.id == 1
        assert agent.name == "Coder"
        assert agent.description == "Programming expert"
        assert agent.system_prompt is None
        assert agent.display_name is None
        assert agent.avatar is None
        assert agent.color is None

    def test_agent_computed_display_name(self):
        """Test computed display name property."""
        # With custom display name
        agent_with_display = Agent(
            id=1, name="Assistant", description="Helper", display_name="AI Assistant"
        )
        assert agent_with_display.computed_display_name == "AI Assistant"

        # Without custom display name
        agent_without_display = Agent(id=2, name="Coder", description="Helper")
        assert agent_without_display.computed_display_name == "Coder"

    def test_agent_computed_avatar(self):
        """Test computed avatar property."""
        # With custom avatar
        agent_with_avatar = Agent(
            id=1, name="Assistant", description="Helper", avatar="🤖"
        )
        assert agent_with_avatar.computed_avatar == "🤖"

        # Without custom avatar (should use first letter)
        agent_without_avatar = Agent(id=2, name="Coder", description="Helper")
        assert agent_without_avatar.computed_avatar == "C"

    def test_agent_computed_color(self):
        """Test computed color property."""
        # With custom color
        agent_with_color = Agent(
            id=1, name="Assistant", description="Helper", color="custom-blue"
        )
        assert agent_with_color.computed_color == "custom-blue"

        # Without custom color (should generate from name hash)
        agent_without_color = Agent(id=2, name="TestAgent", description="Helper")
        computed_color = agent_without_color.computed_color
        assert computed_color.startswith("from-")
        assert "to-" in computed_color

        # Same name should always generate same color
        agent_same_name = Agent(id=3, name="TestAgent", description="Another helper")
        assert agent_same_name.computed_color == computed_color

    def test_agent_computed_color_consistency(self):
        """Test that computed color is consistent for same name."""
        agent1 = Agent(id=1, name="SameName", description="First")
        agent2 = Agent(id=2, name="SameName", description="Second")

        assert agent1.computed_color == agent2.computed_color

    def test_agent_computed_color_variety(self):
        """Test that different names generate different colors."""
        names = ["Agent1", "Agent2", "Agent3", "Agent4", "Agent5"]
        colors = []

        for i, name in enumerate(names):
            agent = Agent(id=i + 1, name=name, description="Test")
            colors.append(agent.computed_color)

        # Should have some variety (not all the same)
        assert len(set(colors)) > 1

    def test_agent_create_schema(self):
        """Test AgentCreate schema."""
        agent_create = AgentCreate(
            name="NewAgent",
            description="A new agent",
            system_prompt="Custom prompt",
            display_name="New AI",
            avatar="🆕",
            color="green",
        )

        assert agent_create.name == "NewAgent"
        assert agent_create.description == "A new agent"
        assert agent_create.system_prompt == "Custom prompt"
        assert agent_create.display_name == "New AI"
        assert agent_create.avatar == "🆕"
        assert agent_create.color == "green"

    def test_agent_create_minimal(self):
        """Test AgentCreate schema with minimal fields."""
        agent_create = AgentCreate(
            name="MinimalAgent", description="Minimal description"
        )

        assert agent_create.name == "MinimalAgent"
        assert agent_create.description == "Minimal description"
        assert agent_create.system_prompt is None
        assert agent_create.display_name is None
        assert agent_create.avatar is None
        assert agent_create.color is None

    def test_agent_field_length_validation(self):
        """Test field length validation in schemas."""
        # Test name max length (255)
        long_name = "A" * 256
        with pytest.raises(ValueError):
            Agent(id=1, name=long_name, description="Test")

        # Test description max length (500)
        long_description = "A" * 501
        with pytest.raises(ValueError):
            Agent(id=1, name="Test", description=long_description)
