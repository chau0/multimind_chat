from app.utils.mention_parser import parse_mention

def test_parse_mention():
    assert parse_mention("@Echo Hello") == "Echo"
    assert parse_mention("Hello @Reverse") == "Reverse"
    assert parse_mention("Hello") is None

def test_parse_mention_case_sensitive():
    """Test that mention parsing preserves case."""
    assert parse_mention("@ProductManager help") == "ProductManager"
    assert parse_mention("@AI_Assistant_2 hello") == "AI_Assistant_2"

def test_parse_mention_with_underscores():
    """Test mentions with underscores and numbers."""
    assert parse_mention("@Bot_3 assist me") == "Bot_3"
    assert parse_mention("@Data_Analyst help") == "Data_Analyst"

def test_parse_mention_multiple_at_symbols():
    """Test that only the first @ mention is parsed."""
    assert parse_mention("@Echo and @Reverse") == "Echo"
    assert parse_mention("Contact @Support or @Admin") == "Support"

def test_parse_mention_edge_cases():
    """Test edge cases for mention parsing."""
    assert parse_mention("@ InvalidMention") is None
    assert parse_mention("@123Invalid") is None
    assert parse_mention("email@domain.com") is None
    assert parse_mention("") is None
