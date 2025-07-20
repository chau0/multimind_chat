import re


def parse_mention(content: str) -> str | None:
    """Parse @mention from content, returning agent name or None.

    Valid agent names must:
    - Start with a letter (a-z, A-Z)
    - Can contain letters, numbers, and underscores
    - Cannot start with numbers or be empty after @
    """
    if not content or not isinstance(content, str):
        return None

    # Match @ followed by a valid name that is not part of another word (e.g. an email)
    # The negative lookbehind ensures the @ is either at the start of the string
    # or preceded by a non-word character so that strings like "email@domain.com"
    # are ignored.
    # Also ensure we don't match @@Double by requiring the @ is not preceded by @
    match = re.search(r"(?<![@\w])@([a-zA-Z][a-zA-Z0-9_]*)", content)
    if match:
        return match.group(1)
    return None
