"""
Place Repository - handles database operations for places/attractions
"""

from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.place import Place


class PlaceRepository:
    """Repository for Place model operations."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def create(self, googleplaceid: str, destination: Optional[str] = None, 
                    address: Optional[str] = None, latitude: Optional[float] = None, 
                    longitude: Optional[float] = None, rating: Optional[float] = None,
                    userratinqtotal: Optional[int] = None, openinghours: Optional[str] = None, 
                    is_open_now: Optional[bool] = None, photos: Optional[str] = None,
                    website: Optional[str] = None, pricelevel: Optional[int] = None,
                    phonenumber: Optional[str] = None) -> Place:
        """Create a new place record."""
        place = Place(
            googleplaceid=googleplaceid,
            destination=destination,
            address=address,
            latitude=latitude,
            longitude=longitude,
            rating=rating,
            userratinqtotal=userratinqtotal,
            openinghours=openinghours,
            is_open_now=is_open_now,
            photos=photos,
            website=website,
            pricelevel=pricelevel,
            phonenumber=phonenumber,
        )
        self.db.add(place)
        await self.db.flush()
        return place
    
    async def get_by_google_place_id(self, google_place_id: str) -> Optional[Place]:
        """Get a place by its Google Place ID."""
        result = await self.db.execute(
            select(Place).where(Place.googleplaceid == google_place_id)
        )
        return result.scalars().first()
    
    async def exists_by_google_place_id(self, google_place_id: str) -> bool:
        """Check if a place already exists by Google Place ID."""
        result = await self.db.execute(
            select(Place).where(Place.googleplaceid == google_place_id).limit(1)
        )
        return result.scalars().first() is not None
    
    async def search_by_destination(self, destination: str, limit: int = 50) -> List[Place]:
        """Search for places by destination."""
        result = await self.db.execute(
            select(Place)
            .where(Place.destination.ilike(f"%{destination}%"))
            .limit(limit)
        )
        return result.scalars().all()
    
    async def get_all(self, limit: int = 100, offset: int = 0) -> List[Place]:
        """Get all places with pagination."""
        result = await self.db.execute(
            select(Place).offset(offset).limit(limit)
        )
        return result.scalars().all()
    
    async def update(self, place_id: int, **kwargs) -> Optional[Place]:
        """Update a place record."""
        place = await self.db.get(Place, place_id)
        if place:
            for key, value in kwargs.items():
                if hasattr(place, key):
                    setattr(place, key, value)
            await self.db.flush()
        return place
    
    async def delete(self, place_id: int) -> bool:
        """Delete a place record."""
        place = await self.db.get(Place, place_id)
        if place:
            await self.db.delete(place)
            await self.db.flush()
            return True
        return False
