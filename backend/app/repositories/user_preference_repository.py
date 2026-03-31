from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.userPreference import UserPreference


class UserPreferenceRepository:
    """Handles all database operations for the UserPreference model."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(
        self, user_id: int, category_id: int | None, preferred_categories: str
    ) -> UserPreference:
        """Create a new user preference and save to database."""
        preference = UserPreference(
            user_id=user_id,
            category_id=category_id,
            preferred_categories=preferred_categories,
        )
        self.db.add(preference)
        await self.db.flush()
        await self.db.refresh(preference)
        return preference

    async def get_by_user_id(self, user_id: int) -> list[UserPreference]:
        """Get all preferences for a specific user."""
        result = await self.db.execute(
            select(UserPreference).where(UserPreference.user_id == user_id)
        )
        return result.scalars().all()

    async def delete_by_user_id(self, user_id: int) -> int:
        """Delete all preferences for a user and return count deleted."""
        result = await self.db.execute(
            select(UserPreference).where(UserPreference.user_id == user_id)
        )
        preferences = result.scalars().all()
        
        for preference in preferences:
            await self.db.delete(preference)
        
        await self.db.flush()
        return len(preferences)

    async def save_user_preferences(
        self, user_id: int, categories: list[str]
    ) -> list[UserPreference]:
        """Delete old preferences and create new ones (bulk operation)."""
        # Delete existing
        await self.delete_by_user_id(user_id)
        
        # Create new preferences
        new_preferences = []
        for category in categories:
            preference = await self.create(
                user_id=user_id,
                category_id=None,
                preferred_categories=category,
            )
            new_preferences.append(preference)
        
        return new_preferences
