from app.utils.mention_parser import parse_mention

def test_parse_mention():
    assert parse_mention("@Echo Hello") == "Echo"
    assert parse_mention("Hello @Reverse") == "Reverse"
    assert parse_mention("Hello") is None
