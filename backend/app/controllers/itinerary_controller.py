from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.itinerary_schema import ItineraryCreate, ItineraryRead
from app.services.itinerary_service import ItineraryService

router = APIRouter()


@router.post("/", response_model=ItineraryRead, status_code=status.HTTP_201_CREATED)
async def create_itinerary(
    payload: ItineraryCreate, db: AsyncSession = Depends(get_db)
):
    service = ItineraryService(db)
    return await service.create_itinerary(payload)


@router.get("/{itinerary_id}", response_model=ItineraryRead)
async def get_itinerary(itinerary_id: int, db: AsyncSession = Depends(get_db)):
    service = ItineraryService(db)
    itinerary = await service.get_itinerary(itinerary_id)
    if not itinerary:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Itinerary not found"
        )
    return itinerary


@router.get("/", response_model=list[ItineraryRead])
async def list_itineraries(
    skip: int = 0, limit: int = 20, db: AsyncSession = Depends(get_db)
):
    service = ItineraryService(db)
    return await service.list_itineraries(skip=skip, limit=limit)
