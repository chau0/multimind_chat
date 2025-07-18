import openai
from app.config import settings

openai.api_key = settings.openai_api_key

def get_openai_response(prompt: str) -> str:
    response = openai.Completion.create(
        engine="text-davinci-003",
        prompt=prompt,
        max_tokens=150
    )
    return response.choices[0].text.strip()
