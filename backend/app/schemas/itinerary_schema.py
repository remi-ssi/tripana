from datetime import datetime

from pydantic import BaseModel


class ItineraryBase(BaseModel):
    title: str
    description: str | None = None
    destination: str
    start_date: datetime | None = None
    end_date: datetime | None = None


class ItineraryCreate(ItineraryBase):
    owner_id: int


class ItineraryRead(ItineraryBase):
    id: int
    owner_id: int
    created_at: datetime

    model_config = {"from_attributes": True}
