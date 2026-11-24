"""
PlaceTypes Repository - handles database operations for place-type associations
"""

from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.placeTypes import PlaceTypes
from app.models.place import Place
from app.models.types import Types


class PlaceTypesRepository:
    """Repository for PlaceTypes junction table operations."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def create(self, placeid: int, categoryid: int) -> PlaceTypes:
        """
        Create a new place-type association.
        
        Args:
            placeid: Place ID
            categoryid: Type/Category ID
        
        Returns:
            The PlaceTypes object
        """
        place_type = PlaceTypes(placeid=placeid, categoryid=categoryid)
        self.db.add(place_type)
        await self.db.flush()
        return place_type
    
    async def exists(self, placeid: int, categoryid: int) -> bool:
        """Check if a place-type association already exists."""
        result = await self.db.execute(
            select(PlaceTypes).where(
                (PlaceTypes.placeid == placeid) and 
                (PlaceTypes.categoryid == categoryid)
            ).limit(1)
        )
        return result.scalars().first() is not None
    
    async def get_types_for_place(self, placeid: int) -> List[Types]:
        """Get all types for a given place."""
        result = await self.db.execute(
            select(Types).join(
                PlaceTypes, PlaceTypes.categoryid == Types.categoryid
            ).where(PlaceTypes.placeid == placeid)
        )
        return result.scalars().all()
    
    async def get_places_by_type(self, categoryid: int, limit: int = 100) -> List[Place]:
        """Get all places with a given type."""
        result = await self.db.execute(
            select(Place).join(
                PlaceTypes, PlaceTypes.placeid == Place.placeid
            ).where(PlaceTypes.categoryid == categoryid).limit(limit)
        )
        return result.scalars().all()
    
    async def delete_for_place(self, placeid: int) -> int:
        """Delete all type associations for a place."""
        result = await self.db.execute(
            select(PlaceTypes).where(PlaceTypes.placeid == placeid)
        )
        place_types = result.scalars().all()
        
        for pt in place_types:
            await self.db.delete(pt)
        
        await self.db.flush()
        return len(place_types)
