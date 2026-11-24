from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.category import Category
from app.models.userPreference import UserPreference

# Maps frontend UI slugs to the canonical category names stored in the DB.
# The categories table was seeded with these exact strings; this mapping ensures
# short slugs sent from the preference page resolve to the right existing rows
# instead of creating duplicate categories with null IDs.
SLUG_TO_CATEGORY: dict[str, str] = {
    "nature": "Nature",
    "cultural": "Cultural and Historical",
    "adventure": "Adventure",
    "events": "Events",
    "food": "Food",
    "city": "City Exploration",
    "entertainment": "Entertainment",
    "wellness": "Wellness Relaxation",
}


class UserPreferenceRepository:
    """Handles all database operations for the UserPreference model."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(
        self, user_id: int, category_id: int, preferred_categories: str
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

    async def get_or_create_category(self, name: str) -> Category:
        """Look up a category by canonical name; create it if it doesn't exist."""
        result = await self.db.execute(
            select(Category).where(Category.name == name)
        )
        category = result.scalar_one_or_none()
        if category:
            return category

        category = Category(name=name)
        self.db.add(category)
        await self.db.flush()
        # Refresh so the server-generated category_id is populated before use.
        await self.db.refresh(category)
        return category

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
        """Delete old preferences and create new ones (bulk operation).

        Accepts either canonical category names or frontend slugs (e.g. "city",
        "nature"). Slugs are resolved to canonical DB names via SLUG_TO_CATEGORY
        before the database lookup so that the pre-seeded categories table rows
        are always reused, preventing duplicate rows and null category_id errors.
        """

        def resolve_category(raw: str) -> tuple[str, str]:
            """Return the stored slug and canonical DB name for a preference."""
            stripped = raw.strip()
            slug = stripped.lower()
            return slug, SLUG_TO_CATEGORY.get(slug, stripped)

        # Deduplicate while preserving order, after slug resolution.
        seen: set[str] = set()
        resolved: list[tuple[str, str]] = []
        for category in categories:
            if not category or not category.strip():
                continue
            slug, canonical_name = resolve_category(category)
            if slug not in seen:
                seen.add(slug)
                resolved.append((slug, canonical_name))

        # Delete existing preferences for this user.
        await self.delete_by_user_id(user_id)

        # Create new preferences using canonical category names.
        new_preferences = []
        for stored_name, canonical_name in resolved:
            category = await self.get_or_create_category(canonical_name)
            preference = await self.create(
                user_id=user_id,
                category_id=category.category_id,
                preferred_categories=stored_name,
            )
            new_preferences.append(preference)

        return new_preferences
