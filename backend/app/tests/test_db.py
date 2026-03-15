"""Tests for database connection and Fact model."""
import uuid
from datetime import datetime

from app.models.fact import FactResponse


def test_fact_response_model():
    """Fact Pydantic model accepts valid data with correct types."""
    data = {
        "id": uuid.uuid4(),
        "text": "Honey never spoils.",
        "source_url": "https://example.com",
        "fetched_at": datetime.now(),
    }
    fact = FactResponse(**data)
    assert fact.text == "Honey never spoils."
    assert fact.source_url == "https://example.com"
    assert isinstance(fact.id, uuid.UUID)
    assert isinstance(fact.fetched_at, datetime)


def test_fact_response_model_optional_source():
    """Fact model handles None source_url."""
    data = {
        "id": uuid.uuid4(),
        "text": "A fact without a source.",
        "source_url": None,
        "fetched_at": datetime.now(),
    }
    fact = FactResponse(**data)
    assert fact.source_url is None
