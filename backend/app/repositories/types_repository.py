"""
Types Repository - handles database operations for types/categories
"""

from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.types import Types


class TypesRepository:
    """Repository for Types model operations."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def get_or_create_by_category(self, category: str) -> Types:
        """
        Get a type by category name, or create it if it doesn't exist.
        
        Args:
            category: The category name (e.g., "restaurant", "tourist_attraction")
        
        Returns:
            The Types object (newly created or existing)
        """
        # Try to get existing type
        result = await self.db.execute(
            select(Types).where(Types.category == category)
        )
        existing_type = result.scalars().first()
        
        if existing_type:
            return existing_type
        
        # Create new type
        new_type = Types(category=category)
        self.db.add(new_type)
        await self.db.flush()
        return new_type
    
    async def get_by_category(self, category: str) -> Optional[Types]:
        """Get a type by category name."""
        result = await self.db.execute(
            select(Types).where(Types.category == category)
        )
        return result.scalars().first()
    
    async def get_by_id(self, categoryid: int) -> Optional[Types]:
        """Get a type by ID."""
        result = await self.db.execute(
            select(Types).where(Types.categoryid == categoryid)
        )
        return result.scalars().first()
    
    async def get_all(self, limit: int = 100, offset: int = 0) -> List[Types]:
        """Get all types with pagination."""
        result = await self.db.execute(
            select(Types).offset(offset).limit(limit)
        )
        return result.scalars().all()
    
    async def create(self, category: str) -> Types:
        """Create a new type."""
        type_obj = Types(category=category)
        self.db.add(type_obj)
        await self.db.flush()
        return type_obj
