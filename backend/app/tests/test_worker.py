"""Tests for the background worker that fetches and stores facts."""
from unittest.mock import AsyncMock, patch

import pytest

from app.models.fact import FetchedFact


@pytest.mark.asyncio
async def test_fetch_and_store_inserts_new_fact():
    """Worker inserts a new fact into the database."""
    from app.worker.scheduler import fetch_and_store_fact

    fake_fact = FetchedFact(text="Bananas are berries.", source_url="https://example.com")

    mock_pool = AsyncMock()
    mock_pool.fetchval = AsyncMock(return_value=0)  # no duplicate
    mock_pool.execute = AsyncMock()

    with (
        patch("app.worker.scheduler.fetch_random_fact", return_value=fake_fact),
        patch("app.worker.scheduler.get_pool", return_value=mock_pool),
    ):
        await fetch_and_store_fact()

    mock_pool.execute.assert_called_once()
    call_args = mock_pool.execute.call_args
    assert "INSERT INTO facts" in call_args[0][0]
    assert call_args[0][1] == "Bananas are berries."


@pytest.mark.asyncio
async def test_fetch_and_store_skips_duplicate():
    """Worker skips insertion when fact_text already exists."""
    from app.worker.scheduler import fetch_and_store_fact

    fake_fact = FetchedFact(text="Duplicate fact.", source_url=None)

    mock_pool = AsyncMock()
    mock_pool.fetchval = AsyncMock(return_value=1)  # duplicate exists

    with (
        patch("app.worker.scheduler.fetch_random_fact", return_value=fake_fact),
        patch("app.worker.scheduler.get_pool", return_value=mock_pool),
    ):
        await fetch_and_store_fact()

    mock_pool.execute.assert_not_called()


@pytest.mark.asyncio
async def test_fetch_and_store_handles_fetch_failure():
    """Worker does nothing when fetcher returns None."""
    from app.worker.scheduler import fetch_and_store_fact

    mock_pool = AsyncMock()

    with (
        patch("app.worker.scheduler.fetch_random_fact", return_value=None),
        patch("app.worker.scheduler.get_pool", return_value=mock_pool),
    ):
        await fetch_and_store_fact()

    mock_pool.execute.assert_not_called()
    mock_pool.fetchval.assert_not_called()
