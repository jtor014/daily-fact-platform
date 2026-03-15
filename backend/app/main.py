import logging
import sys
from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.core.database import connect_db, disconnect_db

# Structured logging configuration
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s %(message)s",
    datefmt="%Y-%m-%dT%H:%M:%S",
    stream=sys.stdout,
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    logger.info("Application started")
    yield
    await disconnect_db()
    logger.info("Application shut down")


app = FastAPI(title="Daily Fact Platform", lifespan=lifespan)


@app.get("/api/health")
async def health() -> dict:
    logger.info("Health check requested")
    return {"status": "ok"}
