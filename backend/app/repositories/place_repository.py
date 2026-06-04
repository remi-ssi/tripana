"""
Place Repository - handles database operations for places/attractions
"""

from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.models.place import Place
from app.models.types import Types
from app.models.placeTypes import PlaceTypes
from datetime import datetime
import json


class PlaceRepository:
    """Repository for Place model operations."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def create(self, *args, **kwargs) -> Place:
        """Create a new place record with associated types.
        
        Supports both positional and keyword argument formats:
        - create(db, place_data: dict, types: list[str])
        - create(googleplaceid=..., destination=..., types=...)
        """
        db = self.db
        place_data = {}
        types = []

        if len(args) >= 2:
            if hasattr(args[0], "execute"):
                db = args[0]
                place_data = args[1]
                types = args[2] if len(args) > 2 else []
            else:
                place_data = args[0]
                types = args[1] if len(args) > 1 else []
        elif len(args) == 1:
            if isinstance(args[0], dict):
                place_data = args[0]
            elif hasattr(args[0], "execute"):
                db = args[0]
                
        if "place_data" in kwargs:
            place_data = kwargs["place_data"]
            types = kwargs.get("types", [])

        if not place_data and kwargs:
            types_arg = kwargs.pop("types", [])
            if isinstance(types_arg, str):
                try:
                    types = json.loads(types_arg)
                except Exception:
                    types = [types_arg] if types_arg else []
            elif isinstance(types_arg, list):
                types = types_arg

            final_googleplaceid = kwargs.get("googleplaceid") or kwargs.get("google_place_id")
            final_destination = kwargs.get("destination") or kwargs.get("name")
            final_openinghours = kwargs.get("openinghours") or kwargs.get("opening_hours")
            final_userratingtotal = kwargs.get("userratingtotal") or kwargs.get("user_ratings_total")
            final_pricelevel = kwargs.get("pricelevel") or kwargs.get("price_level")
            
            coords = kwargs.get("coordinates") or {}
            latitude = kwargs.get("latitude") or coords.get("lat")
            longitude = kwargs.get("longitude") or coords.get("lng")

            place_data = {
                "googleplaceid": final_googleplaceid,
                "destination": final_destination,
                "address": kwargs.get("address"),
                "city": kwargs.get("city"),
                "latitude": latitude,
                "longitude": longitude,
                "rating": kwargs.get("rating"),
                "userratingtotal": final_userratingtotal,
                "pricelevel": final_pricelevel,
                "openinghours": final_openinghours,
                "is_open_now": kwargs.get("is_open_now"),
                "website": kwargs.get("website"),
                "phonenumber": kwargs.get("phonenumber") or kwargs.get("phone_number"),
                "photos": kwargs.get("photos"),
            }

        # Step 1: Save place without types
        place = Place(
            googleplaceid=place_data.get("googleplaceid"),
            destination=place_data.get("destination"),
            address=place_data.get("address"),
            city=place_data.get("city"),
            latitude=place_data.get("latitude"),
            longitude=place_data.get("longitude"),
            rating=place_data.get("rating"),
            userratingtotal=place_data.get("userratingtotal"),
            pricelevel=place_data.get("pricelevel"),
            openinghours=place_data.get("openinghours"),
            is_open_now=place_data.get("is_open_now"),
            website=place_data.get("website"),
            phonenumber=place_data.get("phonenumber"),
            photos=place_data.get("photos"),
            datefetched=datetime.utcnow(),
            isactive=True
        )
        db.add(place)
        await db.flush()  # get the placeid without full commit

        # Step 2 + 3: Save types and junction rows
        for type_name in types:
            if not type_name:
                continue
            # Get or create the type
            result = await db.execute(
                select(Types).where(Types.category == type_name)
            )
            db_type = result.scalar_one_or_none()
            if not db_type:
                db_type = Types(category=type_name)
                db.add(db_type)
                await db.flush()

            # Check if junction row already exists
            existing = await db.execute(
                select(PlaceTypes).where(
                    PlaceTypes.placeid == place.placeid,
                    PlaceTypes.categoryid == db_type.categoryid
                )
            )
            if not existing.scalar_one_or_none():
                db.add(PlaceTypes(
                    placeid=place.placeid,
                    categoryid=db_type.categoryid
                ))

        await db.commit()
        await db.refresh(place)
        return place
    
    async def get_by_google_place_id(self, google_place_id: str) -> Optional[Place]:
        """Get a place by its Google Place ID."""
        result = await self.db.execute(
            select(Place)
            .where(Place.googleplaceid == google_place_id)
            .options(selectinload(Place.place_types).selectinload(PlaceTypes.category))
        )
        place = result.scalars().first()
        if place:
            result_types = await self.db.execute(
                select(Types.category)
                .join(PlaceTypes, PlaceTypes.categoryid == Types.categoryid)
                .where(PlaceTypes.placeid == place.placeid)
            )
            place.types = result_types.scalars().all()
        return place
    
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
            .options(selectinload(Place.place_types).selectinload(PlaceTypes.category))
            .limit(limit)
        )
        places = result.scalars().all()
        for place in places:
            result_types = await self.db.execute(
                select(Types.category)
                .join(PlaceTypes, PlaceTypes.categoryid == Types.categoryid)
                .where(PlaceTypes.placeid == place.placeid)
            )
            place.types = result_types.scalars().all()
        return places
    
    async def search_by_city(self, city: str, limit: int = 100) -> List[Place]:
        """Search for places by city (exact match)."""
        result = await self.db.execute(
            select(Place)
            .where(Place.city == city)
            .options(selectinload(Place.place_types).selectinload(PlaceTypes.category))
            .limit(limit)
        )
        places = result.scalars().all()
        for place in places:
            result_types = await self.db.execute(
                select(Types.category)
                .join(PlaceTypes, PlaceTypes.categoryid == Types.categoryid)
                .where(PlaceTypes.placeid == place.placeid)
            )
            place.types = result_types.scalars().all()
        return places
    
    async def search_by_city_and_preferences(
        self, 
        city: str, 
        user_preferences: List[str],
        preference_to_keywords: dict,
        limit: int = 100
    ) -> List[Place]:
        """Search for places by city and user preferences."""
        # Get all places in the city first (case-insensitive search)
        result = await self.db.execute(
            select(Place)
            .where(Place.city.ilike(city))
            .options(selectinload(Place.place_types).selectinload(PlaceTypes.category))
            .limit(limit * 2)  # Get extra results to filter by preferences
        )
        all_places = result.scalars().all()
        
        if not all_places:
            return []
        
        # Filter by preferences if any keywords match
        filtered_places = []
        for place in all_places:
            result_types = await self.db.execute(
                select(Types.category)
                .join(PlaceTypes, PlaceTypes.categoryid == Types.categoryid)
                .where(PlaceTypes.placeid == place.placeid)
            )
            place.types = result_types.scalars().all()
            
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
            select(Place)
            .options(selectinload(Place.place_types).selectinload(PlaceTypes.category))
            .offset(offset)
            .limit(limit)
        )
        places = result.scalars().all()
        for place in places:
            result_types = await self.db.execute(
                select(Types.category)
                .join(PlaceTypes, PlaceTypes.categoryid == Types.categoryid)
                .where(PlaceTypes.placeid == place.placeid)
            )
            place.types = result_types.scalars().all()
        return places
    
    async def update(self, place_id: int, types: Optional[List[str]] = None, **kwargs) -> Optional[Place]:
        """Update a place record and its associated types."""
        place = await self.db.get(Place, place_id)
        if not place:
            return None
            
        # Update place fields WITHOUT types
        for key, value in kwargs.items():
            if key != "types" and hasattr(place, key):
                setattr(place, key, value)
        await self.db.flush()
        
        # Parse types if it's a JSON string
        if isinstance(types, str):
            try:
                types = json.loads(types)
            except Exception:
                types = [types] if types else []

        # If types is provided, update junction rows
        if types is not None:
            # Delete existing junction rows
            from sqlalchemy import delete
            await self.db.execute(
                delete(PlaceTypes).where(PlaceTypes.placeid == place_id)
            )
            await self.db.flush()
            
            # Re-insert fresh types and junction rows
            for type_name in types:
                if not type_name:
                    continue
                # Get or create the type
                result = await self.db.execute(
                    select(Types).where(Types.category == type_name)
                )
                db_type = result.scalar_one_or_none()
                if not db_type:
                    db_type = Types(category=type_name)
                    self.db.add(db_type)
                    await self.db.flush()

                # Add junction row
                self.db.add(PlaceTypes(
                    placeid=place.placeid,
                    categoryid=db_type.categoryid
                ))
            
            await self.db.flush()
            
        await self.db.commit()
        await self.db.refresh(place)
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
        """Search for places by normalized city (exact match on lowercase city)."""
        # First try exact normalized match
        result = await self.db.execute(
            select(Place)
            .where(Place.city == normalized_city)
            .options(selectinload(Place.place_types).selectinload(PlaceTypes.category))
            .limit(limit)
        )
        places = result.scalars().all()
        
        # If no exact match, try fuzzy matching
        if not places:
            result = await self.db.execute(
                select(Place)
                .where(Place.city.ilike(f"%{normalized_city}%"))
                .options(selectinload(Place.place_types).selectinload(PlaceTypes.category))
                .limit(limit)
            )
            places = result.scalars().all()
            
        for place in places:
            result_types = await self.db.execute(
                select(Types.category)
                .join(PlaceTypes, PlaceTypes.categoryid == Types.categoryid)
                .where(PlaceTypes.placeid == place.placeid)
            )
            place.types = result_types.scalars().all()
            
        return places
    
    async def get_active_places_by_city(self, normalized_city: str, limit: int = 100) -> List[Place]:
        """Get active (isactive=True) places for a city."""
        result = await self.db.execute(
            select(Place)
            .where(Place.city == normalized_city)
            .where(Place.isactive == True)
            .options(selectinload(Place.place_types).selectinload(PlaceTypes.category))
            .limit(limit)
        )
        places = result.scalars().all()
        for place in places:
            result_types = await self.db.execute(
                select(Types.category)
                .join(PlaceTypes, PlaceTypes.categoryid == Types.categoryid)
                .where(PlaceTypes.placeid == place.placeid)
            )
            place.types = result_types.scalars().all()
        return places
    
    async def upsert_place(self, google_place_id: str, place_data: dict) -> Place:
        """Upsert a place (update if exists, insert if not)."""
        existing_place = await self.get_by_google_place_id(google_place_id)
        
        if existing_place:
            for key, value in place_data.items():
                if hasattr(existing_place, key):
                    setattr(existing_place, key, value)
            existing_place.isactive = True
            await self.db.flush()
            return existing_place
        else:
            place_data['googleplaceid'] = google_place_id
            place = Place(**place_data)
            self.db.add(place)
            await self.db.flush()
            return place
    
    async def mark_inactive_places(self, normalized_city: str, active_google_ids: set) -> int:
        """Mark places as inactive if they're no longer in the active set from Google API."""
        result = await self.db.execute(
            select(Place)
            .where(Place.city == normalized_city)
            .where(Place.isactive == True)
        )
        current_places = result.scalars().all()
        
        marked_count = 0
        for place in current_places:
            if place.googleplaceid not in active_google_ids:
                place.isactive = False
                marked_count += 1
        
        if marked_count > 0:
            await self.db.flush()
        
        return marked_count
