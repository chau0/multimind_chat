import pytest
from app.utils.mention_parser import parse_mention


class TestMentionParser:
    
    def test_parse_mention_basic(self):
        """Test basic mention parsing functionality."""
        assert parse_mention("@Echo Hello") == "Echo"
        assert parse_mention("Hello @Reverse") == "Reverse"
        assert parse_mention("Hello") is None

    def test_parse_mention_case_sensitive(self):
        """Test that mention parsing preserves case."""
        assert parse_mention("@ProductManager help") == "ProductManager"
        assert parse_mention("@AI_Assistant_2 hello") == "AI_Assistant_2"
        assert parse_mention("@assistant help") == "assistant"
        assert parse_mention("@ASSISTANT help") == "ASSISTANT"

    def test_parse_mention_with_underscores_and_numbers(self):
        """Test mentions with underscores and numbers."""
        assert parse_mention("@Bot_3 assist me") == "Bot_3"
        assert parse_mention("@Data_Analyst help") == "Data_Analyst"
        assert parse_mention("@Agent123 hello") == "Agent123"
        assert parse_mention("@Test_Agent_v2 help") == "Test_Agent_v2"

    def test_parse_mention_multiple_at_symbols(self):
        """Test that only the first @ mention is parsed."""
        assert parse_mention("@Echo and @Reverse") == "Echo"
        assert parse_mention("Contact @Support or @Admin") == "Support"
        assert parse_mention("@First @Second @Third") == "First"

    def test_parse_mention_edge_cases(self):
        """Test edge cases for mention parsing."""
        assert parse_mention("@ InvalidMention") is None
        assert parse_mention("@123Invalid") is None
        assert parse_mention("email@domain.com") is None
        assert parse_mention("") is None
        assert parse_mention("@") is None
        assert parse_mention("@@Double") is None

    def test_parse_mention_whitespace_handling(self):
        """Test mention parsing with various whitespace scenarios."""
        assert parse_mention("  @Agent  hello  ") == "Agent"
        assert parse_mention("\t@Agent\thello") == "Agent"
        assert parse_mention("\n@Agent\nhello") == "Agent"
        assert parse_mention("@Agent") == "Agent"

    def test_parse_mention_punctuation_boundaries(self):
        """Test mentions with punctuation boundaries."""
        assert parse_mention("Hello @Agent!") == "Agent"
        assert parse_mention("@Agent, how are you?") == "Agent"
        assert parse_mention("(@Agent)") == "Agent"
        assert parse_mention("[@Agent]") == "Agent"
        assert parse_mention("{@Agent}") == "Agent"
        assert parse_mention("'@Agent'") == "Agent"
        assert parse_mention('"@Agent"') == "Agent"

    def test_parse_mention_invalid_characters(self):
        """Test mentions with invalid characters."""
        assert parse_mention("@Agent-Name") == "Agent"  # Stops at hyphen
        assert parse_mention("@Agent.Name") == "Agent"  # Stops at dot
        assert parse_mention("@Agent@Name") == "Agent"  # Stops at second @
        assert parse_mention("@Agent Name") == "Agent"  # Stops at space
        assert parse_mention("@Agent+Name") == "Agent"  # Stops at plus

    def test_parse_mention_email_exclusion(self):
        """Test that email addresses are not parsed as mentions."""
        assert parse_mention("Contact support@company.com") is None
        assert parse_mention("Email me at user@domain.org") is None
        assert parse_mention("admin@localhost") is None
        assert parse_mention("test.user@example.co.uk") is None

    def test_parse_mention_url_exclusion(self):
        """Test that URLs with @ symbols are not parsed as mentions."""
        assert parse_mention("Visit https://user@server.com/path") is None
        assert parse_mention("ftp://user@ftp.example.com") is None

    def test_parse_mention_social_media_style(self):
        """Test social media style mentions."""
        assert parse_mention("Hey @john_doe, check this out!") == "john_doe"
        assert parse_mention("Thanks @team_lead for the help") == "team_lead"
        assert parse_mention("@everyone please review") == "everyone"

    def test_parse_mention_programming_context(self):
        """Test mentions in programming-like contexts."""
        assert parse_mention("@Coder write a function") == "Coder"
        assert parse_mention("@DevOps deploy this") == "DevOps"
        assert parse_mention("@QA_Engineer test this feature") == "QA_Engineer"

    def test_parse_mention_unicode_characters(self):
        """Test mentions with unicode characters in surrounding text."""
        assert parse_mention("Hello @Agent 👋") == "Agent"
        assert parse_mention("@Agent помогите") == "Agent"
        assert parse_mention("¿@Agent ayuda?") == "Agent"

    def test_parse_mention_long_names(self):
        """Test mentions with long agent names."""
        long_name = "VeryLongAgentNameWithManyCharacters"
        assert parse_mention(f"@{long_name} help") == long_name
        
        # Test with underscores and numbers
        complex_name = "Complex_Agent_Name_With_Numbers_123"
        assert parse_mention(f"@{complex_name} assist") == complex_name

    def test_parse_mention_empty_and_none_inputs(self):
        """Test mention parsing with empty and None inputs."""
        assert parse_mention("") is None
        assert parse_mention("   ") is None
        assert parse_mention("\t\n") is None
        
        # Test None input handling
        with pytest.raises((TypeError, AttributeError)):
            parse_mention(None)

    def test_parse_mention_special_agent_names(self):
        """Test parsing of special agent names used in the system."""
        system_agents = ["Assistant", "Coder", "Writer", "Researcher"]
        
        for agent in system_agents:
            assert parse_mention(f"@{agent} help me") == agent
            assert parse_mention(f"Hey @{agent}, can you assist?") == agent

    def test_parse_mention_regex_edge_cases(self):
        """Test regex edge cases and potential security issues."""
        # Test regex injection attempts
        assert parse_mention("@Agent.*") == "Agent"
        assert parse_mention("@Agent[a-z]") == "Agent"
        assert parse_mention("@Agent\\w+") == "Agent"
        
        # Test very long strings
        very_long_text = "a" * 10000 + "@Agent" + "b" * 10000
        assert parse_mention(very_long_text) == "Agent"

    def test_parse_mention_performance(self):
        """Test mention parsing performance with large inputs."""
        # Create a large text with mention at the end
        large_text = "Lorem ipsum " * 1000 + "@Agent help"
        assert parse_mention(large_text) == "Agent"
        
        # Create a large text with mention at the beginning
        large_text_start = "@Agent " + "lorem ipsum " * 1000
        assert parse_mention(large_text_start) == "Agent"
