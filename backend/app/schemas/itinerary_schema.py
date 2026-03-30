from datetime import datetime
from pydantic import BaseModel

# Pydantic models for itinerary data transfer objects (DTOs)
class ItineraryBase(BaseModel):
    title: str
    description: str | None = None
    destination: str
    start_date: datetime | None = None
    end_date: datetime | None = None

# ItineraryCreate extends ItineraryBase and adds an owner_id field for creating new itineraries
class ItineraryCreate(ItineraryBase):
    owner_id: int

# ItineraryRead extends ItineraryBase and includes additional fields for reading itinerary data, such as id, owner_id, and created_at timestamp
class ItineraryRead(ItineraryBase):
    id: int
    owner_id: int
    created_at: datetime

    model_config = {"from_attributes": True}
