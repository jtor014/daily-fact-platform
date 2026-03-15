import logging
import os

import asyncpg

logger = logging.getLogger(__name__)

pool: asyncpg.Pool | None = None


async def connect_db() -> None:
    global pool
    database_url = os.environ["DATABASE_URL"]
    logger.info("Connecting to database")
    pool = await asyncpg.create_pool(dsn=database_url)
    logger.info("Database connection pool created")


async def disconnect_db() -> None:
    global pool
    if pool:
        await pool.close()
        logger.info("Database connection pool closed")
        pool = None


def get_pool() -> asyncpg.Pool:
    if pool is None:
        raise RuntimeError("Database pool is not initialised")
    return pool
