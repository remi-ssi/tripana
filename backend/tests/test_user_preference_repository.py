import asyncio
import os
import sys
from unittest.mock import AsyncMock, MagicMock

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.repositories.user_preference_repository import UserPreferenceRepository


def test_save_preferences_uses_category_foreign_keys():
    asyncio.run(_assert_save_preferences_uses_category_foreign_keys())


async def _assert_save_preferences_uses_category_foreign_keys():
    repository = UserPreferenceRepository(MagicMock())
    repository.delete_by_user_id = AsyncMock()
    repository.get_or_create_category = AsyncMock(
        side_effect=[
            MagicMock(category_id=10),
            MagicMock(category_id=11),
        ]
    )
    repository.create = AsyncMock(side_effect=lambda **kwargs: MagicMock(**kwargs))

    preferences = await repository.save_user_preferences(
        5,
        [" Nature ", "nature", "FOOD"],
    )

    assert repository.get_or_create_category.await_count == 2
    assert repository.create.await_count == 2
    assert [item.category_id for item in preferences] == [10, 11]
    assert [item.preferred_categories for item in preferences] == ["nature", "food"]
