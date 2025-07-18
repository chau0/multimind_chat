import re

def parse_mention(content: str) -> str | None:
    match = re.search(r"@(\w+)", content)
    if match:
        return match.group(1)
    return None
