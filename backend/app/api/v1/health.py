from fastapi import APIRouter

from app.logging_config import get_logger

router = APIRouter()
logger = get_logger(__name__)


@router.get("/health")
def health_check():
    logger.info("Health check endpoint accessed")
    return {"status": "ok"}
