import logging
import sys

from fastapi import FastAPI

# Structured logging configuration
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s %(message)s",
    datefmt="%Y-%m-%dT%H:%M:%S",
    stream=sys.stdout,
)
logger = logging.getLogger(__name__)

app = FastAPI(title="Daily Fact Platform")


@app.get("/api/health")
async def health() -> dict:
    logger.info("Health check requested")
    return {"status": "ok"}
