from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.schemas.itinerary_schema import (
    ItineraryGenerateRequest,
    ItineraryScheduleUpdate,
)
from app.services.itinerary_service import ItineraryService
from app.utils.auth import get_current_user

router = APIRouter()


@router.post("/generate", status_code=status.HTTP_201_CREATED)
async def generate_itinerary(
    payload: ItineraryGenerateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await ItineraryService(db).generate(payload, current_user.user_id)


@router.get("")
async def list_itineraries(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return {
        "results": await ItineraryService(db).list(
            current_user.user_id,
            skip=skip,
            limit=limit,
        )
    }


@router.get("/{itinerary_id}")
async def get_itinerary(
    itinerary_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await ItineraryService(db).get(itinerary_id, current_user.user_id)


@router.put("/{itinerary_id}/schedule")
async def update_itinerary_schedule(
    itinerary_id: int,
    payload: ItineraryScheduleUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await ItineraryService(db).update_schedule(
        itinerary_id,
        payload,
        current_user.user_id,
    )


@router.delete("/{itinerary_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_itinerary(
    itinerary_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await ItineraryService(db).delete(itinerary_id, current_user.user_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
