from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.itinerary_repository import ItineraryRepository
from app.schemas.itinerary_schema import ItineraryCreate, ItineraryRead


class ItineraryService:
    """Encapsulates business logic for itinerary operations."""

    def __init__(self, db: AsyncSession):
        self.repo = ItineraryRepository(db)

    async def create_itinerary(self, payload: ItineraryCreate) -> ItineraryRead:
        itinerary = await self.repo.create(payload)
        return ItineraryRead.model_validate(itinerary)

    async def get_itinerary(self, itinerary_id: int) -> ItineraryRead | None:
        itinerary = await self.repo.get_by_id(itinerary_id)
        if not itinerary:
            return None
        return ItineraryRead.model_validate(itinerary)

    async def list_itineraries(self, skip: int = 0, limit: int = 20) -> list[ItineraryRead]:
        itineraries = await self.repo.list_all(skip=skip, limit=limit)
        return [ItineraryRead.model_validate(i) for i in itineraries]
