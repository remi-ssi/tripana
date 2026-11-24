"""
Place Repository - handles database operations for places/attractions
"""

from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import or_, select
from sqlalchemy.orm import selectinload

from app.models.place import Place
from app.models.placeTypes import PlaceTypes
from app.models.types import Types
from app.utils.city_utils import extract_city_search_tokens


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
            select(Place)
            .options(
                selectinload(Place.place_types).selectinload(PlaceTypes.category)
            )
            .where(Place.googleplaceid == google_place_id)
        )
        return result.scalars().first()

    async def get_by_google_place_ids(self, google_place_ids: set[str] | list[str]) -> List[Place]:
        """Get places by Google Place IDs with type relationships preloaded."""
        ids = list(google_place_ids)
        if not ids:
            return []

        result = await self.db.execute(
            select(Place)
            .options(
                selectinload(Place.place_types).selectinload(PlaceTypes.category)
            )
            .where(Place.googleplaceid.in_(ids))
        )
        return result.scalars().unique().all()
    
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
    
    @staticmethod
    def _build_city_filter(city: str):
        """Build an OR filter matching any extracted city/province token against Place.city or Place.address."""
        tokens = extract_city_search_tokens(city)
        if not tokens:
            cleaned = (city or "").strip()
            return Place.city.ilike(f"%{cleaned}%")
        clauses = []
        for token in tokens:
            clauses.append(Place.city.ilike(token))
            clauses.append(Place.city.ilike(f"%{token}%"))
            clauses.append(Place.address.ilike(f"%{token}%"))
        return or_(*clauses)

    async def search_by_city_and_preferences(
        self, 
        city: str, 
        user_preferences: List[str],
        preference_to_keywords: dict,
        limit: int = 100
    ) -> List[Place]:
        """
        Search for places by city and user preferences.
        Supports full Mapbox strings (e.g. 'Baguio, Benguet, Philippines').
        """
        city_filter = self._build_city_filter(city)
        result = await self.db.execute(
            select(Place)
            .options(
                selectinload(Place.place_types).selectinload(PlaceTypes.category)
            )
            .where(Place.isactive == True)
            .where(city_filter)
            .limit(limit * 2)
        )
        all_places = result.scalars().unique().all()
        
        if not all_places:
            return []
        
        # Filter by preferences if any keywords match
        filtered_places = []
        unmatched_places = []
        for place in all_places:
            destination_lower = (place.destination or "").lower()
            address_lower = (place.address or "").lower()
            place_types = [
                place_type.category.category.lower()
                for place_type in place.place_types
                if place_type.category and place_type.category.category
            ]
            
            matched = False
            for pref in user_preferences:
                keywords = preference_to_keywords.get(pref, [pref.lower()])
                for keyword in keywords:
                    keyword_lower = keyword.lower()
                    if (
                        keyword_lower in destination_lower
                        or keyword_lower in address_lower
                        or any(keyword_lower in place_type for place_type in place_types)
                    ):
                        filtered_places.append(place)
                        matched = True
                        break
                if matched:
                    break
            if not matched:
                unmatched_places.append(place)
        
        # If very few strict matches exist in the city, include remaining city places so SAW scoring can rank them
        if len(filtered_places) < 5 and unmatched_places:
            filtered_places.extend(unmatched_places)
        
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
        Get active (isactive=True) places for a city (supports full Mapbox destination strings).
        """
        city_filter = self._build_city_filter(normalized_city)
        result = await self.db.execute(
            select(Place)
            .options(
                selectinload(Place.place_types).selectinload(PlaceTypes.category)
            )
            .where(city_filter)
            .where(Place.isactive == True)
            .limit(limit)
        )
        return result.scalars().unique().all()

    async def search_active_places_by_city_and_text(
        self,
        normalized_city: str,
        search_query: str,
        limit: int = 100,
    ) -> List[Place]:
        """
        Search active places in a city by free text, without preference filters.
        """
        query = (search_query or "").strip().lower()
        if not query:
            return []

        city_filter = self._build_city_filter(normalized_city)
        result = await self.db.execute(
            select(Place)
            .options(
                selectinload(Place.place_types).selectinload(PlaceTypes.category)
            )
            .where(city_filter)
            .where(Place.isactive == True)
            .where(
                or_(
                    Place.destination.ilike(f"%{query}%"),
                    Place.address.ilike(f"%{query}%"),
                    Place.place_types.any(
                        PlaceTypes.category.has(Types.category.ilike(f"%{query}%"))
                    ),
                )
            )
            .limit(limit)
        )
        return result.scalars().unique().all()
    
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
