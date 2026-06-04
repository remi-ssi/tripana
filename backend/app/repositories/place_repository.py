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
    
    async def create(self, googleplaceid: Optional[str] = None, destination: Optional[str] = None, 
                    address: Optional[str] = None, city: Optional[str] = None,
                    latitude: Optional[float] = None, longitude: Optional[float] = None, 
                    rating: Optional[float] = None, userratingtotal: Optional[int] = None, 
                    openinghours: Optional[str] = None, is_open_now: Optional[bool] = None, 
                    photos: Optional[str] = None, website: Optional[str] = None, 
                    pricelevel: Optional[int] = None, phonenumber: Optional[str] = None,
                    name: Optional[str] = None, 
                    opening_hours: Optional[str] = None, user_ratings_total: Optional[int] = None,
                    google_place_id: Optional[str] = None, price_level: Optional[int] = None) -> Place:
        """Create a new place record.
        
        Supports both old and new parameter naming conventions for backward compatibility:
        - googleplaceid / google_place_id
        - destination / name
        - openinghours / opening_hours
        - userratingtotal / user_ratings_total
        - pricelevel / price_level
        - photos: JSON array of photos with photo_reference for dynamic URL generation
        
        NOTE: Types are NOT saved here - they are handled separately via TypesRepository
        and PlaceTypesRepository to maintain the junction table structure.
        """
        # Handle alternative parameter names for backward compatibility
        final_googleplaceid = googleplaceid or google_place_id
        final_destination = destination or name
        final_openinghours = openinghours or opening_hours
        final_userratingtotal = userratingtotal or user_ratings_total
        final_pricelevel = pricelevel or price_level
        
        place = Place(
            googleplaceid=final_googleplaceid,
            destination=final_destination,
            address=address,
            city=city,
            latitude=latitude,
            longitude=longitude,
            rating=rating,
            userratingtotal=final_userratingtotal,
            openinghours=final_openinghours,
            is_open_now=is_open_now,
            photos=photos,
            website=website,
            pricelevel=final_pricelevel,
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
        try:
            result = await self.db.execute(
                select(Place).where(Place.googleplaceid == google_place_id).limit(1)
            )
            return result.scalars().first() is not None
        except Exception as e:
            # If there's any error, assume it doesn't exist to avoid blocking the flow
            import logging
            logger = logging.getLogger(__name__)
            logger.warning(f"Error checking if place exists {google_place_id}: {str(e)}")
            return False
    
    async def search_by_destination(self, destination: str, limit: int = 50) -> List[Place]:
        """Search for places by destination."""
        result = await self.db.execute(
            select(Place)
            .where(Place.destination.ilike(f"%{destination}%"))
            .limit(limit)
        )
        return result.scalars().all()
    
    async def search_by_city(self, city: str, limit: int = 100) -> List[Place]:
        """Search for places by city (exact match)."""
        result = await self.db.execute(
            select(Place)
            .where(Place.city == city)
            .limit(limit)
        )
        return result.scalars().all()
    
    async def search_by_city_and_preferences(
        self, 
        city: str, 
        user_preferences: List[str],
        preference_to_keywords: dict,
        limit: int = 100
    ) -> List[Place]:
        """
        Search for places by city and user preferences.
        
        Args:
            city: The city to search in (case-insensitive)
            user_preferences: List of user preference names
            preference_to_keywords: Mapping of preferences to keywords
            limit: Maximum number of results
        
        Returns:
            List of Place objects matching the city and preferences
        """
        # Get all places in the city first (case-insensitive search)
        result = await self.db.execute(
            select(Place)
            .where(Place.city.ilike(city))
            .limit(limit * 2)  # Get extra results to filter by preferences
        )
        all_places = result.scalars().all()
        
        if not all_places:
            return []
        
        # Filter by preferences if any keywords match
        filtered_places = []
        for place in all_places:
            destination_lower = (place.destination or "").lower()
            address_lower = (place.address or "").lower()
            
            # Check if any preference keywords match the place
            for pref in user_preferences:
                keywords = preference_to_keywords.get(pref, [pref.lower()])
                for keyword in keywords:
                    if keyword.lower() in destination_lower or keyword.lower() in address_lower:
                        filtered_places.append(place)
                        break
                else:
                    continue
                break
        
        return filtered_places[:limit]
    
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
    
    async def search_by_normalized_city(self, normalized_city: str, limit: int = 100) -> List[Place]:
        """
        Search for places by normalized city (exact match on lowercase city).
        Also tries fuzzy matching if exact match returns no results.
        
        Args:
            normalized_city: Already normalized city name (lowercase, stripped)
            limit: Maximum number of results
        
        Returns:
            List of Place objects in the city
        """
        # First try exact normalized match
        result = await self.db.execute(
            select(Place)
            .where(Place.city == normalized_city)
            .limit(limit)
        )
        places = result.scalars().all()
        
        # If no exact match, try fuzzy matching
        if not places:
            result = await self.db.execute(
                select(Place)
                .where(Place.city.ilike(f"%{normalized_city}%"))
                .limit(limit)
            )
            places = result.scalars().all()
        
        return places
    
    async def get_active_places_by_city(self, normalized_city: str, limit: int = 100) -> List[Place]:
        """
        Get active (isactive=True) places for a city.
        
        Args:
            normalized_city: Already normalized city name
            limit: Maximum number of results
        
        Returns:
            List of active Place objects in the city
        """
        result = await self.db.execute(
            select(Place)
            .where(Place.city == normalized_city)
            .where(Place.isactive == True)
            .limit(limit)
        )
        return result.scalars().all()
    
    async def upsert_place(self, google_place_id: str, place_data: dict) -> Place:
        """
        Upsert a place (update if exists, insert if not).
        
        Args:
            google_place_id: The Google Place ID
            place_data: Dictionary of place attributes to set
        
        Returns:
            The inserted or updated Place object
        """
        # Check if place exists
        existing_place = await self.get_by_google_place_id(google_place_id)
        
        if existing_place:
            # Update existing place
            for key, value in place_data.items():
                if hasattr(existing_place, key):
                    setattr(existing_place, key, value)
            # Mark as active if re-appearing
            existing_place.isactive = True
            await self.db.flush()
            return existing_place
        else:
            # Insert new place
            place_data['googleplaceid'] = google_place_id
            place = Place(**place_data)
            self.db.add(place)
            await self.db.flush()
            return place
    
    async def mark_inactive_places(self, normalized_city: str, active_google_ids: set) -> int:
        """
        Mark places as inactive if they're no longer in the active set from Google API.
        This implements soft-delete.
        
        Args:
            normalized_city: Already normalized city name
            active_google_ids: Set of Google Place IDs that are currently active
        
        Returns:
            Number of places marked as inactive
        """
        # Get all currently active places in the city
        result = await self.db.execute(
            select(Place)
            .where(Place.city == normalized_city)
            .where(Place.isactive == True)
        )
        current_places = result.scalars().all()
        
        # Mark places as inactive if not in the active set
        marked_count = 0
        for place in current_places:
            if place.googleplaceid not in active_google_ids:
                place.isactive = False
                marked_count += 1
        
        if marked_count > 0:
            await self.db.flush()
        
        return marked_count
