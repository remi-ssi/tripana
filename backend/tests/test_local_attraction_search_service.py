import asyncio
import os
import sys
from unittest.mock import AsyncMock, MagicMock

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.services.local_attraction_search_service import LocalAttractionSearchService


def test_score_places_accepts_missing_rating():
    service = LocalAttractionSearchService(MagicMock())
    places = [
        {
            "id": "place-1",
            "name": "City Art Museum",
            "address": "Main Street",
            "types": ["museum"],
            "rating": None,
            "user_ratings_total": None,
            "price_level": None,
        }
    ]

    results = service._score_places(places, ["Art"], "balanced")

    assert len(results) == 1
    assert results[0]["id"] == "place-1"


def test_save_places_uses_normalized_type_tables():
    asyncio.run(_assert_save_places_uses_normalized_type_tables())


async def _assert_save_places_uses_normalized_type_tables():
    db = MagicMock()
    db.commit = AsyncMock()
    db.rollback = AsyncMock()
    service = LocalAttractionSearchService(db)

    saved_place = MagicMock(placeid=42)
    saved_type = MagicMock(categoryid=7)
    service.place_repo.exists_by_google_place_id = AsyncMock(return_value=False)
    service.place_repo.create = AsyncMock(return_value=saved_place)
    service.types_repo.get_or_create_by_category = AsyncMock(return_value=saved_type)
    service.placetypes_repo.exists = AsyncMock(return_value=False)
    service.placetypes_repo.create = AsyncMock()

    saved_count = await service._save_places_to_database(
        "Cebu",
        [
            {
                "id": "google-place-1",
                "name": "Sample Beach",
                "address": "Cebu",
                "coordinates": {"lat": 10.3, "lng": 123.9},
                "types": ["beach", "tourist_attraction"],
            }
        ],
    )

    assert saved_count == 1
    assert service.place_repo.create.await_count == 1
    assert service.types_repo.get_or_create_by_category.await_count == 2
    assert service.placetypes_repo.create.await_count == 2
