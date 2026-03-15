"""Tests for GET /api/facts/random endpoint."""
import uuid
from datetime import datetime
from unittest.mock import AsyncMock, patch

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_random_fact_returns_200_when_facts_exist():
    """Endpoint returns a fact when the table has data."""
    fake_row = {
        "id": uuid.uuid4(),
        "fact_text": "Honey never spoils.",
        "source_url": "https://example.com",
        "fetched_at": datetime(2026, 1, 1, 12, 0, 0),
    }

    mock_pool = AsyncMock()
    mock_pool.fetchrow = AsyncMock(return_value=fake_row)

    with patch("app.api.facts.get_pool", return_value=mock_pool):
        response = client.get("/api/facts/random")

    assert response.status_code == 200
    data = response.json()
    assert data["text"] == "Honey never spoils."
    assert data["source_url"] == "https://example.com"
    assert "id" in data
    assert "fetched_at" in data


def test_random_fact_returns_404_when_empty():
    """Endpoint returns 404 when no facts in the database."""
    mock_pool = AsyncMock()
    mock_pool.fetchrow = AsyncMock(return_value=None)

    with patch("app.api.facts.get_pool", return_value=mock_pool):
        response = client.get("/api/facts/random")

    assert response.status_code == 404
    assert response.json()["detail"] == "No facts available in the database."
