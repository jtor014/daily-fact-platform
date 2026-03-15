"""Tests for the fact fetcher module."""
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.worker.fetcher import fetch_random_fact


@pytest.mark.asyncio
async def test_fetch_random_fact_success():
    """Fetcher returns a typed model on success."""
    mock_json = {
        "id": "abc123",
        "text": "Honey never spoils.",
        "source": "https://example.com",
        "source_url": "https://example.com",
        "language": "en",
        "permalink": "https://uselessfacts.jsph.pl/api/v2/facts/abc123",
    }
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = mock_json
    mock_response.raise_for_status = MagicMock()

    with patch("app.worker.fetcher.httpx.AsyncClient") as mock_client_cls:
        mock_client = AsyncMock()
        mock_client.get.return_value = mock_response
        mock_client.__aenter__ = AsyncMock(return_value=mock_client)
        mock_client.__aexit__ = AsyncMock(return_value=False)
        mock_client_cls.return_value = mock_client

        result = await fetch_random_fact()

    assert result is not None
    assert result.text == "Honey never spoils."
    assert result.source_url == "https://example.com"


@pytest.mark.asyncio
async def test_fetch_random_fact_timeout():
    """Fetcher returns None on timeout."""
    import httpx

    with patch("app.worker.fetcher.httpx.AsyncClient") as mock_client_cls:
        mock_client = AsyncMock()
        mock_client.get.side_effect = httpx.TimeoutException("timeout")
        mock_client.__aenter__ = AsyncMock(return_value=mock_client)
        mock_client.__aexit__ = AsyncMock(return_value=False)
        mock_client_cls.return_value = mock_client

        result = await fetch_random_fact()

    assert result is None


@pytest.mark.asyncio
async def test_fetch_random_fact_http_error():
    """Fetcher returns None on HTTP error."""
    import httpx

    with patch("app.worker.fetcher.httpx.AsyncClient") as mock_client_cls:
        mock_client = AsyncMock()
        mock_client.get.side_effect = httpx.HTTPStatusError(
            "500", request=AsyncMock(), response=AsyncMock()
        )
        mock_client.__aenter__ = AsyncMock(return_value=mock_client)
        mock_client.__aexit__ = AsyncMock(return_value=False)
        mock_client_cls.return_value = mock_client

        result = await fetch_random_fact()

    assert result is None
