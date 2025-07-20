import os
import re

from fastapi import FastAPI, Request
from fastapi.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response

from app.api.v1 import agents, chat, health
from app.config import settings
from app.logging_config import get_logger, init_logging

# Initialize logging first
init_logging()
logger = get_logger(__name__)

# Import test endpoints only in test environment
if os.getenv("ENVIRONMENT") == "test":
    from app.api.v1 import test_endpoints


class CustomCORSMiddleware(BaseHTTPMiddleware):

    def __init__(self, app, allowed_origins: list[str], **kwargs):
        super().__init__(app)
        self.allowed_origins = allowed_origins
        self.allow_credentials = kwargs.get("allow_credentials", True)
        self.allow_methods = kwargs.get("allow_methods", ["*"])
        self.allow_headers = kwargs.get("allow_headers", ["*"])

    def is_origin_allowed(self, origin: str) -> bool:
        """Check if origin is allowed, supporting wildcards."""
        for allowed_origin in self.allowed_origins:
            if allowed_origin == "*":
                return True
            if allowed_origin == origin:
                return True
            # Handle wildcard patterns like https://*.vercel.app
            if "*" in allowed_origin:
                pattern = allowed_origin.replace("*", ".*")
                if re.match(f"^{pattern}$", origin):
                    return True
        return False

    async def dispatch(self, request: Request, call_next):
        origin = request.headers.get("origin")

        # Handle preflight requests
        if request.method == "OPTIONS":
            if origin and self.is_origin_allowed(origin):
                response = Response()
                response.headers["Access-Control-Allow-Origin"] = origin
                response.headers["Access-Control-Allow-Credentials"] = str(
                    self.allow_credentials
                ).lower()
                response.headers["Access-Control-Allow-Methods"] = ", ".join(
                    self.allow_methods
                )
                response.headers["Access-Control-Allow-Headers"] = ", ".join(
                    self.allow_headers
                )
                return response

        response = await call_next(request)

        # Add CORS headers to actual requests
        if origin and self.is_origin_allowed(origin):
            response.headers["Access-Control-Allow-Origin"] = origin
            response.headers["Access-Control-Allow-Credentials"] = str(
                self.allow_credentials
            ).lower()

        return response


app = FastAPI(title="Multimind API", version="1.0.0")

# Add custom CORS middleware that supports wildcard patterns
app.add_middleware(
    CustomCORSMiddleware,
    allowed_origins=settings.effective_cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Log application startup
logger.info("Starting Multimind API application")
logger.info(f"Environment: {os.getenv('ENVIRONMENT', 'development')}")
logger.info(f"Debug mode: {os.getenv('DEBUG', 'false')}")
logger.info(f"CORS origins: {settings.effective_cors_origins}")

app.include_router(health.router, prefix="/api/v1", tags=["health"])
app.include_router(agents.router, prefix="/api/v1/agents", tags=["agents"])
app.include_router(chat.router, prefix="/api/v1/chat", tags=["chat"])

# Include test endpoints only in test environment
if os.getenv("ENVIRONMENT") == "test":
    app.include_router(test_endpoints.router, prefix="/api/v1/test", tags=["test"])
    logger.info("Test endpoints enabled")


# Add startup and shutdown event handlers
@app.on_event("startup")
async def startup_event():
    logger.info("Application startup initiated")

    # Test database connection
    try:
        from app.utils.db import engine

        with engine.connect() as conn:
            conn.execute("SELECT 1")
        logger.info("Database connection test successful")
    except Exception as e:
        logger.error(f"Database connection test failed: {e}")

    # Test Supabase client if configured
    try:
        from app.utils.supabase_client import (
            is_supabase_configured,
            test_supabase_connection,
        )

        if is_supabase_configured():
            await test_supabase_connection()
    except Exception as e:
        logger.warning(f"Supabase client test failed: {e}")

    logger.info("Application startup completed")


@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Application shutdown initiated")
