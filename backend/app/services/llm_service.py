from app.external.openai_client import get_openai_response

def get_response(prompt: str) -> str:
    return get_openai_response(prompt)
