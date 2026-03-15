import logging

import httpx

from app.models.fact import FetchedFact

logger = logging.getLogger(__name__)

FACTS_API_URL = "https://uselessfacts.jsph.pl/api/v2/facts/random"


async def fetch_random_fact() -> FetchedFact | None:
    """Fetch a random fact from the useless facts API.

    Returns a FetchedFact on success, None on any failure.
    """
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(FACTS_API_URL)
            response.raise_for_status()
            data = response.json()
            fact = FetchedFact(
                text=data["text"],
                source_url=data.get("source_url"),
            )
            logger.info("Fetched fact: %s", fact.text[:80])
            return fact
    except httpx.TimeoutException:
        logger.error("Timeout fetching fact from %s", FACTS_API_URL)
        return None
    except httpx.HTTPStatusError as e:
        logger.error("HTTP error fetching fact: %s", e)
        return None
    except Exception as e:
        logger.error("Unexpected error fetching fact: %s", e)
        return None
