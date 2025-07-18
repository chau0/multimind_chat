import openai
import asyncio
from app.config import settings
import logging

logger = logging.getLogger(__name__)

openai.api_key = settings.openai_api_key

def get_openai_response(prompt: str) -> str:
    """Sync OpenAI response for backward compatibility."""
    try:
        response = openai.Completion.create(
            engine="text-davinci-003",
            prompt=prompt,
            max_tokens=150,
            temperature=0.7
        )
        return response.choices[0].text.strip()
    except Exception as e:
        logger.error(f"OpenAI API error: {str(e)}")
        return f"I apologize, but I'm experiencing technical difficulties. Please try again later."

async def get_openai_response_async(prompt: str) -> str:
    """Async OpenAI response using newer API."""
    try:
        client = openai.AsyncOpenAI(api_key=settings.openai_api_key)
        
        response = await client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=150,
            temperature=0.7
        )
        
        return response.choices[0].message.content.strip()
        
    except Exception as e:
        logger.error(f"OpenAI API error: {str(e)}")
        return f"I apologize, but I'm experiencing technical difficulties. Please try again later."
