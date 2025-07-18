import re

def parse_mention(content: str) -> str | None:
    """Parse @mention from content, returning agent name or None.
    
    Valid agent names must:
    - Start with a letter (a-z, A-Z)
    - Can contain letters, numbers, and underscores
    - Cannot start with numbers or be empty after @
    """
    # Match @ followed by letter, then letters/numbers/underscores
    match = re.search(r"@([a-zA-Z][a-zA-Z0-9_]*)", content)
    if match:
        return match.group(1)
    return None
