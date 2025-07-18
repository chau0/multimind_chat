from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import chat, agents, health
from app.logging_config import init_logging, get_logger
import os

# Initialize logging first
init_logging()
logger = get_logger(__name__)

# Import test endpoints only in test environment
if os.getenv("ENVIRONMENT") == "test":
    from app.api.v1 import test_endpoints

app = FastAPI(title="Multimind API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Log application startup
logger.info("Starting Multimind API application")
logger.info(f"Environment: {os.getenv('ENVIRONMENT', 'development')}")
logger.info(f"Debug mode: {os.getenv('DEBUG', 'false')}")

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
    logger.info("Application startup completed")

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Application shutdown initiated")
