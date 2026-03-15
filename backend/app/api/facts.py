import logging

from fastapi import APIRouter, HTTPException

from app.core.database import get_pool
from app.models.fact import FactResponse

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/api/facts/random", response_model=FactResponse)
async def get_random_fact() -> FactResponse:
    pool = get_pool()
    row = await pool.fetchrow(
        "SELECT id, fact_text, source_url, fetched_at "
        "FROM facts ORDER BY RANDOM() LIMIT 1"
    )
    if row is None:
        raise HTTPException(
            status_code=404,
            detail="No facts available in the database.",
        )

    return FactResponse(
        id=row["id"],
        text=row["fact_text"],
        source_url=row["source_url"],
        fetched_at=row["fetched_at"],
    )
