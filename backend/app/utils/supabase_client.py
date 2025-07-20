"""
Supabase client utility for direct Supabase operations.
This complements the SQLAlchemy database connection for operations
that benefit from Supabase's features.
"""

import logging
from typing import Optional

from supabase import Client, create_client

from app.config import settings

logger = logging.getLogger(__name__)

_supabase_client: Optional[Client] = None


def get_supabase_client() -> Optional[Client]:
    """
    Get the Supabase client instance.
    Returns None if Supabase is not configured (e.g., using Azure SQL instead).
    """
    global _supabase_client

    if _supabase_client is None and settings.supabase_url and settings.supabase_key:
        try:
            _supabase_client = create_client(
                settings.supabase_url, settings.supabase_key
            )
            logger.info("Supabase client initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Supabase client: {e}")
            return None

    return _supabase_client


def is_supabase_configured() -> bool:
    """Check if Supabase is properly configured."""
    return bool(settings.supabase_url and settings.supabase_key)


# Optional: Helper functions for common Supabase operations


async def test_supabase_connection() -> bool:
    """Test the Supabase connection."""
    try:
        client = get_supabase_client()
        if client is None:
            return False

        # Simple test query
        _ = client.table("agents").select("count").execute()
        logger.info("Supabase connection test successful")
        return True
    except Exception as e:
        logger.error(f"Supabase connection test failed: {e}")
        return False
