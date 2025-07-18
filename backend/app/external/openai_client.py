import openai
from openai import AzureOpenAI
import asyncio
from app.config import settings
import logging

logger = logging.getLogger(__name__)

# Azure OpenAI configuration
AZURE_ENDPOINT = settings.azure_openai_endpoint  # e.g., "https://your-resource.cognitiveservices.azure.com/"
API_VERSION = "2024-12-01-preview"
DEPLOYMENT_NAME = settings.azure_openai_deployment  # e.g., "gpt-4" or "gpt-3.5-turbo"

def get_openai_response(prompt: str) -> str:
    """Sync Azure OpenAI response for backward compatibility."""
    try:
        client = AzureOpenAI(
            api_version=API_VERSION,
            azure_endpoint=AZURE_ENDPOINT,
            api_key=settings.azure_openai_api_key,
        )
        
        response = client.chat.completions.create(
            model=DEPLOYMENT_NAME,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=150,
            temperature=0.7
        )
        
        return response.choices[0].message.content.strip()
        
    except Exception as e:
        logger.error(f"Azure OpenAI API error: {str(e)}")
        return f"I apologize, but I'm experiencing technical difficulties. Please try again later."

async def get_openai_response_async(prompt: str) -> str:
    """Async Azure OpenAI response using newer API."""
    try:
        client = openai.AsyncAzureOpenAI(
            api_version=API_VERSION,
            azure_endpoint=AZURE_ENDPOINT,
            api_key=settings.azure_openai_api_key,
        )
        
        response = await client.chat.completions.create(
            model=DEPLOYMENT_NAME,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=150,
            temperature=0.7
        )
        
        return response.choices[0].message.content.strip()
        
    except Exception as e:
        logger.error(f"Azure OpenAI API error: {str(e)}")
        return f"I apologize, but I'm experiencing technical difficulties. Please try again later."
