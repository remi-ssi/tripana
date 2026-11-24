from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.itinerary import Itinerary
from app.models.itineraryActivity import ItineraryActivity
from app.models.itineraryDays import ItineraryDays
from app.models.trip import Trip


class ItineraryRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    @staticmethod
    def _load_options():
        return (
            selectinload(Itinerary.trip).selectinload(Trip.breaks),
            selectinload(Itinerary.days)
            .selectinload(ItineraryDays.activities)
            .selectinload(ItineraryActivity.place_detail),
        )

    async def get_owned(self, itinerary_id: int, user_id: int) -> Itinerary | None:
        result = await self.db.execute(
            select(Itinerary)
            .join(Itinerary.trip)
            .options(*self._load_options())
            .where(
                Itinerary.itineraryid == itinerary_id,
                Trip.userid == user_id,
                Trip.deletedat.is_(None),
            )
        )
        return result.scalars().unique().first()

    async def list_owned(
        self,
        user_id: int,
        skip: int = 0,
        limit: int = 20,
    ) -> list[Itinerary]:
        result = await self.db.execute(
            select(Itinerary)
            .join(Itinerary.trip)
            .options(*self._load_options())
            .where(Trip.userid == user_id, Trip.deletedat.is_(None))
            .order_by(Itinerary.datecreated.desc(), Itinerary.itineraryid.desc())
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().unique().all())
