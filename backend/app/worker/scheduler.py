import asyncio
import logging

from app.core.database import get_pool
from app.worker.fetcher import fetch_random_fact

logger = logging.getLogger(__name__)

FETCH_INTERVAL_SECONDS = 300  # 5 minutes


async def fetch_and_store_fact() -> None:
    """Fetch a random fact and insert it into the database if not a duplicate."""
    fact = await fetch_random_fact()
    if fact is None:
        logger.warning("Fetcher returned no fact, skipping")
        return

    pool = get_pool()

    # Check for duplicate
    count = await pool.fetchval(
        "SELECT COUNT(*) FROM facts WHERE fact_text = $1", fact.text
    )
    if count > 0:
        logger.info("Duplicate fact skipped: %s", fact.text[:80])
        return

    await pool.execute(
        "INSERT INTO facts (fact_text, source_url) VALUES ($1, $2)",
        fact.text,
        fact.source_url,
    )
    logger.info("Stored new fact: %s", fact.text[:80])


async def run_worker() -> None:
    """Background loop that fetches facts every 5 minutes."""
    logger.info("Background worker started (interval: %ds)", FETCH_INTERVAL_SECONDS)
    while True:
        try:
            await fetch_and_store_fact()
        except Exception as e:
            logger.error("Worker error: %s", e)
        await asyncio.sleep(FETCH_INTERVAL_SECONDS)
