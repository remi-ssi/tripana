from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.user_preference_repository import UserPreferenceRepository
from app.models.userPreference import UserPreference


class UserPreferenceService:
    #Service layer for user preference operations.

    def __init__(self, db: AsyncSession):
        self.repo = UserPreferenceRepository(db)

    async def get_preferences(self, user_id: int) -> list[str]:
       #Get all preferred categories for a user.
        preferences = await self.repo.get_by_user_id(user_id)
        return [p.preferred_categories for p in preferences if p.preferred_categories]

    async def save_preferences(
        self, user_id: int, categories: list[str]
    ) -> dict:
       #Save or update user preferences.
        new_preferences = await self.repo.save_user_preferences(user_id, categories)
        return {
            "message": "Preferences saved successfully.",
            "preferred_categories": [p.preferred_categories for p in new_preferences],
        }

    async def has_preferences(self, user_id: int) -> bool:
        #Check if user has any preferences set.
        preferences = await self.repo.get_by_user_id(user_id)
        return len(preferences) > 0
