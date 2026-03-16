from app.controllers.itinerary_controller import router as itinerary_router
from app.controllers.user_controller import router as user_router
from fastapi import APIRouter

router = APIRouter()

router.include_router(user_router, prefix="/users", tags=["users"])
router.include_router(itinerary_router, prefix="/itineraries", tags=["itineraries"])
