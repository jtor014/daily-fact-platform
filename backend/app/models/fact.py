import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class FactResponse(BaseModel):
    id: uuid.UUID
    text: str
    source_url: str | None = None
    fetched_at: datetime = Field(default_factory=datetime.now)
