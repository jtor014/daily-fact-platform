import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class FetchedFact(BaseModel):
    """Raw fact data from the external API (before DB insertion)."""
    text: str
    source_url: str | None = None


class FactResponse(BaseModel):
    """Fact returned from our API (after DB retrieval)."""
    id: uuid.UUID
    text: str
    source_url: str | None = None
    fetched_at: datetime = Field(default_factory=datetime.now)
