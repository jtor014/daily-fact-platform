import asyncio
import logging
import sys
from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.api.facts import router as facts_router
from app.core.database import connect_db, disconnect_db
from app.worker.scheduler import run_worker

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
    worker_task = asyncio.create_task(run_worker())
    logger.info("Application started")
    yield
    worker_task.cancel()
    await disconnect_db()
    logger.info("Application shut down")


app = FastAPI(title="Daily Fact Platform", lifespan=lifespan)
app.include_router(facts_router)


@app.get("/api/health")
async def health() -> dict:
    logger.info("Health check requested")
    return {"status": "ok"}
