import openai
from openai import OpenAI, AzureOpenAI
import asyncio
from app.config import settings
import logging

logger = logging.getLogger(__name__)

def get_openai_client():
    """Get the appropriate OpenAI client based on configuration."""
    if settings.is_using_azure_openai:
        return AzureOpenAI(
            api_key=settings.azure_openai_api_key,
            api_version=settings.azure_openai_api_version,
            azure_endpoint=settings.azure_openai_endpoint
        )
    else:
        return OpenAI(
            api_key=settings.effective_openai_api_key
        )

def get_async_openai_client():
    """Get the appropriate async OpenAI client based on configuration."""
    if settings.is_using_azure_openai:
        return openai.AsyncAzureOpenAI(
            api_key=settings.azure_openai_api_key,
            api_version=settings.azure_openai_api_version,
            azure_endpoint=settings.azure_openai_endpoint
        )
    else:
        return openai.AsyncOpenAI(
            api_key=settings.effective_openai_api_key
        )

def get_model_name():
    """Get the appropriate model name based on configuration."""
    if settings.is_using_azure_openai:
        return settings.azure_openai_deployment
    else:
        return "gpt-4"  # Default to GPT-4 for standard OpenAI

def get_openai_response(prompt: str) -> str:
    """Sync OpenAI response for backward compatibility."""
    try:
        client = get_openai_client()
        model_name = get_model_name()
        
        response = client.chat.completions.create(
            model=model_name,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=150,
            temperature=0.7
        )
        
        return response.choices[0].message.content.strip()
        
    except Exception as e:
        logger.error(f"OpenAI API error: {str(e)}")
        return f"I apologize, but I'm experiencing technical difficulties. Please try again later."

async def get_openai_response_async(prompt: str) -> str:
    """Async OpenAI response using newer API."""
    try:
        client = get_async_openai_client()
        model_name = get_model_name()
        
        response = await client.chat.completions.create(
            model=model_name,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=150,
            temperature=0.7
        )
        
        return response.choices[0].message.content.strip()
        
    except Exception as e:
        logger.error(f"OpenAI API error: {str(e)}")
        return f"I apologize, but I'm experiencing technical difficulties. Please try again later."

async def get_openai_response_with_messages_async(messages: list) -> str:
    """Async OpenAI response with proper message format for better conversation handling."""
    try:
        client = get_async_openai_client()
        model_name = get_model_name()
        
        response = await client.chat.completions.create(
            model=model_name,
            messages=messages,
            max_tokens=500,  # Increased for more detailed responses
            temperature=0.8,  # Slightly higher for more personality
            presence_penalty=0.1,  # Encourage diverse responses
            frequency_penalty=0.1   # Reduce repetition
        )
        
        return response.choices[0].message.content.strip()
        
    except Exception as e:
        logger.error(f"OpenAI API error: {str(e)}")
        return f"I apologize, but I'm experiencing technical difficulties. Please try again later."
