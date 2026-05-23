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
    
    async def create(self, google_place_id: str, name: str, address: str, city: str,
                    latitude: float, longitude: float, rating: Optional[float] = None,
                    user_ratings_total: Optional[int] = None, types: Optional[list] = None,
                    opening_hours: Optional[str] = None, photos: Optional[list] = None,
                    website: Optional[str] = None, price_level: Optional[int] = None) -> Place:
        """Create a new place record."""
        place = Place(
            google_place_id=google_place_id,
            name=name,
            address=address,
            city=city,
            latitude=latitude,
            longitude=longitude,
            rating=rating,
            user_ratings_total=user_ratings_total,
            types=types or [],
            opening_hours=opening_hours,
            photos=photos or [],
            website=website,
            price_level=price_level,
        )
        self.db.add(place)
        await self.db.flush()
        return place
    
    async def get_by_google_place_id(self, google_place_id: str) -> Optional[Place]:
        """Get a place by its Google Place ID."""
        result = await self.db.execute(
            select(Place).where(Place.google_place_id == google_place_id)
        )
        return result.scalars().first()
    
    async def exists_by_google_place_id(self, google_place_id: str) -> bool:
        """Check if a place already exists by Google Place ID."""
        result = await self.db.execute(
            select(Place).where(Place.google_place_id == google_place_id).limit(1)
        )
        return result.scalars().first() is not None
    
    async def search_by_city_and_preferences(
        self, 
        city: str, 
        user_preferences: List[str],
        preference_keywords: dict
    ) -> List[Place]:
        """
        Search for places in a specific city matching user preferences by type.
        
        This implements the optimization logic:
        1. Filter by city (exact match)
        2. Filter by types (must match at least one user preference)
        
        Returns only places that match BOTH criteria.
        """
        if not user_preferences or not preference_keywords:
            return []
        
        # Build list of all keywords from user preferences
        all_keywords = []
        for pref in user_preferences:
            keywords = preference_keywords.get(pref, [pref.lower()])
            all_keywords.extend(keywords)
        
        # Query places by city
        stmt = select(Place).where(Place.city.ilike(f"%{city}%"))
        result = await self.db.execute(stmt)
        places = result.scalars().all()
        
        # Filter by type match (in-memory for simplicity)
        # Check if any of the place's types match any keyword from user preferences
        filtered_places = []
        for place in places:
            place_types = [t.lower() for t in (place.types or [])]
            
            # Check if any preference keyword matches any place type
            has_match = False
            for pref in user_preferences:
                pref_keywords = preference_keywords.get(pref, [pref.lower()])
                for keyword in pref_keywords:
                    if any(keyword.lower() in ptype for ptype in place_types):
                        has_match = True
                        break
                if has_match:
                    break
            
            if has_match:
                filtered_places.append(place)
        
        return filtered_places
    
    async def search_by_city(self, city: str, limit: int = 50) -> List[Place]:
        """Search for places in a specific city."""
        result = await self.db.execute(
            select(Place)
            .where(Place.city.ilike(f"%{city}%"))
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
    
    async def count_by_city(self, city: str) -> int:
        """Count places in a specific city."""
        result = await self.db.execute(
            select(len(Place)).where(Place.city.ilike(f"%{city}%"))
        )
        return result.scalar() or 0
