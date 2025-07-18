from fastapi import FastAPI
from app.api.v1 import chat, agents, health
import os

# Import test endpoints only in test environment
if os.getenv("ENVIRONMENT") == "test":
    from app.api.v1 import test_endpoints

app = FastAPI(title="Multimind API", version="1.0.0")

app.include_router(health.router, prefix="/api/v1", tags=["health"])
app.include_router(agents.router, prefix="/api/v1/agents", tags=["agents"])
app.include_router(chat.router, prefix="/api/v1/chat", tags=["chat"])

# Include test endpoints only in test environment
if os.getenv("ENVIRONMENT") == "test":
    app.include_router(test_endpoints.router, prefix="/api/v1/test", tags=["test"])
