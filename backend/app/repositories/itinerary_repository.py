from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.itinerary import Itinerary
from app.schemas.itinerary_schema import ItineraryCreate


class ItineraryRepository:
    """Handles all database operations for the Itinerary model."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, payload: ItineraryCreate) -> Itinerary:
        itinerary = Itinerary(**payload.model_dump())
        self.db.add(itinerary)
        await self.db.flush()
        await self.db.refresh(itinerary)
        return itinerary

    async def get_by_id(self, itinerary_id: int) -> Itinerary | None:
        result = await self.db.execute(
            select(Itinerary).where(Itinerary.id == itinerary_id)
        )
        return result.scalar_one_or_none()

    async def list_all(self, skip: int = 0, limit: int = 20) -> list[Itinerary]:
        result = await self.db.execute(select(Itinerary).offset(skip).limit(limit))
        return list(result.scalars().all())
