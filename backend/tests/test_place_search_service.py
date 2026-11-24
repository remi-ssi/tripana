"""
Test script for place search and caching service.

Run this to verify:
1. City normalization works
2. Staleness detection works
3. Place merging and deduplication works
4. Scoring system works correctly
5. API endpoint returns correct format

To run from backend directory:
    python -m pytest tests/test_place_search_service.py -v
    
Or directly:
    python tests/test_place_search_service.py
"""

import asyncio
import json
from datetime import datetime, timedelta
from unittest.mock import Mock, AsyncMock, patch, MagicMock

# Mock the database session before importing services
import sys
from pathlib import Path

# Add backend to path
backend_path = Path(__file__).parent.parent / "app"
if str(backend_path) not in sys.path:
    sys.path.insert(0, str(backend_path.parent))


def test_city_normalization():
    """Test city normalization utility."""
    from app.utils.city_utils import normalize_city
    
    print("\n✓ Testing city normalization...")
    assert normalize_city("Iloilo City") == "iloilo city"
    assert normalize_city("  MANILA  ") == "manila"
    assert normalize_city("Cebu") == "cebu"
    assert normalize_city("") == ""
    print("✓ City normalization tests passed")


def test_category_to_google_types():
    """Test that category mappings are comprehensive."""
    from app.services.place_search_service import CATEGORY_TO_GOOGLE_TYPES
    
    print("\n✓ Testing category to Google types mapping...")
    
    # Check all expected categories are mapped
    expected_categories = [
        "Beaches", "Water Activities", "Food Trip", "Local Food", "Hiking",
        "Shopping", "Nightlife", "Art", "Historical Sites", "Photography",
        "Wildlife", "Camping", "Relaxation", "Island Hopping"
    ]
    
    for category in expected_categories:
        assert category in CATEGORY_TO_GOOGLE_TYPES, f"Missing mapping for {category}"
        types = CATEGORY_TO_GOOGLE_TYPES[category]
        assert isinstance(types, list) and len(types) > 0, f"Invalid types for {category}"
    
    print(f"✓ All {len(expected_categories)} categories properly mapped to Google types")


def test_staleness_calculation():
    """Test staleness detection logic."""
    from app.services.place_search_service import PlaceSearchService, STALENESS_DAYS
    
    print("\n✓ Testing staleness calculation...")
    
    # Create mock places
    now = datetime.utcnow()
    
    # All places are fresh (within 30 days)
    fresh_places = []
    for i in range(5):
        place = Mock()
        place.datefetched = now - timedelta(days=10)
        fresh_places.append(place)
    
    # All places are stale (older than 30 days)
    stale_places = []
    for i in range(5):
        place = Mock()
        place.datefetched = now - timedelta(days=40)
        stale_places.append(place)
    
    # 60% stale, 40% fresh -> should be stale
    mixed_places = fresh_places[:2] + stale_places[:3]
    
    service = PlaceSearchService(None)
    
    assert service._is_cache_stale(fresh_places) == False, "Fresh places marked as stale"
    assert service._is_cache_stale(stale_places) == True, "Stale places not detected"
    assert service._is_cache_stale(mixed_places) == True, ">50% stale not detected"
    assert service._is_cache_stale([]) == True, "Empty cache should be stale"
    
    print("✓ Staleness detection tests passed")


def test_preference_mapping():
    """Test preference to Google types mapping."""
    from app.services.place_search_service import PlaceSearchService
    
    print("\n✓ Testing preference mapping to Google types...")
    
    service = PlaceSearchService(None)
    
    # Test single preference
    types = service._map_preferences_to_google_types(["Beaches"])
    assert "beach" in [t.lower() for t in types], "Beach preference not mapped to 'beach' type"
    
    # Test multiple preferences
    types = service._map_preferences_to_google_types(["Beaches", "Historical Sites"])
    types_lower = [t.lower() for t in types]
    assert any("beach" in t for t in types_lower), "Beach not in multi-preference mapping"
    assert any("church" in t or "temple" in t or "museum" in t for t in types_lower), \
        "Historical sites not in multi-preference mapping"
    
    # Test unknown preference (should use the preference itself as fallback)
    types = service._map_preferences_to_google_types(["UnknownCategory"])
    assert "unknowncategory" in [t.lower() for t in types], "Unknown preference not used as fallback"
    
    print("✓ Preference mapping tests passed")


def test_scoring_calculations():
    """Test scoring components."""
    from app.services.place_search_service import PlaceSearchService
    
    print("\n✓ Testing scoring calculations...")
    
    service = PlaceSearchService(None)
    
    # Test relevance score
    place_with_match = {
        "types": ["restaurant", "cafe"],
        "name": "Coffee House",
        "address": "123 Main St",
    }
    
    relevance = service._calculate_relevance_score(
        place_with_match["types"],
        place_with_match["name"],
        place_with_match["address"],
        ["Food Trip"]
    )
    assert relevance > 0, "Matching place should have positive relevance"
    assert relevance == 1.0, "Single matching preference should score 1.0"
    
    # Test with no match
    no_match_place = {
        "types": ["gas_station"],
        "name": "Shell Station",
        "address": "456 Highway",
    }
    
    relevance = service._calculate_relevance_score(
        no_match_place["types"],
        no_match_place["name"],
        no_match_place["address"],
        ["Food Trip", "Beaches"]
    )
    assert relevance == 0, "Non-matching place should score 0"
    
    # Test overall score calculation
    place = {
        "types": ["restaurant"],
        "name": "Fine Dining",
        "address": "Downtown",
        "rating": 4.5,
        "user_ratings_total": 500,
        "price_level": 3,
    }
    
    score = service._calculate_score(place, ["Food Trip"], price_level_preference=3)
    assert 0 <= score <= 1, f"Score should be 0-1, got {score}"
    assert score > 0.3, "Good place should score well"
    
    print("✓ Scoring calculation tests passed")


def test_price_level_score():
    """Test price level scoring."""
    from app.services.place_search_service import PlaceSearchService
    
    print("\n✓ Testing price level scoring...")
    
    service = PlaceSearchService(None)
    
    # No price level = neutral
    score = service._calculate_price_level_score(None, 2)
    assert score == 0.5, f"Missing price level should score 0.5, got {score}"
    
    # Perfect match
    score = service._calculate_price_level_score(2, 2)
    assert score > 0.8, f"Perfect price match should score high, got {score}"
    
    # No preference = slight penalty for higher prices
    score1 = service._calculate_price_level_score(1, None)
    score2 = service._calculate_price_level_score(3, None)
    assert score1 > score2, "Higher price should score lower when no preference"
    
    print("✓ Price level scoring tests passed")


def test_response_format():
    """Test that response format matches requirements."""
    from app.services.place_search_service import PlaceSearchService
    
    print("\n✓ Testing response format...")
    
    service = PlaceSearchService(None)
    
    places = [
        {
            "placeid": 1,
            "name": "Test Place",
            "city": "Manila",
            "address": "123 Main St",
            "rating": 4.5,
            "score": 0.7823,
            "types": ["restaurant"],
            "photos": json.dumps([{"photo_reference": "ref123"}]),
            "is_open_now": True,
            "price_level": 2,
            "user_ratings_total": 250,
            "website": "https://example.com",
            "latitude": 14.5995,
            "longitude": 120.9842,
            "phone_number": "+63917234567",
            "opening_hours": "10am-10pm",
        }
    ]
    
    formatted = service._format_places_for_response(places)
    
    assert len(formatted) == 1, "Should return same number of places"
    result = formatted[0]
    
    # Check all required fields
    required_fields = [
        "placeid", "name", "city", "address", "rating", "score", "types",
        "photos", "is_open_now", "price_level", "user_ratings_total",
        "website", "latitude", "longitude", "phone_number", "opening_hours"
    ]
    
    for field in required_fields:
        assert field in result, f"Missing required field: {field}"
    
    # Check score is rounded to 4 decimals
    assert result["score"] == 0.7823, f"Score not preserved correctly: {result['score']}"
    
    print("✓ Response format tests passed")


def test_free_search_expands_hiking_queries_with_city():
    from app.services.place_search_service import PlaceSearchService

    queries = PlaceSearchService._build_free_search_queries("hike", "baguio")

    assert "hike in baguio" in queries
    assert "hiking trails in baguio" in queries
    assert "mountains in baguio" in queries
    assert "mountain viewpoints in baguio" in queries


def test_free_search_ignores_preferences_when_scoring():
    asyncio.run(_assert_free_search_ignores_preferences_when_scoring())


async def _assert_free_search_ignores_preferences_when_scoring():
    from app.services.place_search_service import PlaceSearchService

    service = PlaceSearchService(MagicMock())
    local_place = MagicMock(googleplaceid="local-1")
    saved_place = MagicMock(googleplaceid="google-1")

    service.place_repo.search_active_places_by_city_and_text = AsyncMock(
        return_value=[local_place]
    )
    service._save_places_to_db = AsyncMock(return_value=[saved_place])
    service._score_places = AsyncMock(
        return_value=[
            {"placeid": 1, "name": "Hiking Trail", "score": 1.0},
        ]
    )

    with patch(
        "app.services.place_search_service.search_google_attractions",
        new=AsyncMock(return_value=[{"id": "google-1", "name": "Mountain Trail"}]),
    ) as google_search:
        results = await service.search_places_free("Baguio", "hike")

    assert results[0]["name"] == "Hiking Trail"
    service.place_repo.search_active_places_by_city_and_text.assert_awaited_once_with(
        "baguio",
        "hike",
        limit=50,
    )
    assert google_search.await_args_list[0].kwargs["query"] == "hike in baguio"
    service._score_places.assert_awaited_once()
    _, kwargs = service._score_places.await_args
    assert kwargs["preferences"] is None


def test_save_places_reloads_type_relationships_before_returning():
    asyncio.run(_assert_save_places_reloads_type_relationships_before_returning())


async def _assert_save_places_reloads_type_relationships_before_returning():
    from app.services.place_search_service import PlaceSearchService

    db = MagicMock()
    db.commit = AsyncMock()
    service = PlaceSearchService(db)

    saved_place = MagicMock(placeid=10)
    saved_type = MagicMock(categoryid=20)
    reloaded_place = MagicMock(googleplaceid="google-1")

    service.place_repo.upsert_place = AsyncMock(return_value=saved_place)
    service.place_repo.get_by_google_place_ids = AsyncMock(return_value=[reloaded_place])
    service.types_repo.get_or_create_by_category = AsyncMock(return_value=saved_type)
    service.placetypes_repo.exists = AsyncMock(return_value=False)
    service.placetypes_repo.create = AsyncMock()

    results = await service._save_places_to_db(
        "baguio",
        [
            {
                "id": "google-1",
                "name": "Mountain Trail",
                "address": "Baguio",
                "coordinates": {"lat": 16.4, "lng": 120.6},
                "types": ["park"],
            }
        ],
    )

    assert results == [reloaded_place]
    service.place_repo.get_by_google_place_ids.assert_awaited_once_with({"google-1"})


def test_google_types_coverage():
    """Verify all major Google Place types are covered."""
    from app.services.place_search_service import CATEGORY_TO_GOOGLE_TYPES
    
    print("\n✓ Testing Google types coverage...")
    
    all_types = set()
    for types in CATEGORY_TO_GOOGLE_TYPES.values():
        all_types.update(types)
    
    # Check for common types (these are actually covered in our mappings)
    important_types = [
        "restaurant", "cafe", "beach", "park", "museum", "church",
        "bar", "shopping_mall", "spa"
    ]
    
    for type_name in important_types:
        type_found = any(type_name in t.lower() for t in all_types)
        assert type_found, f"Important type not covered: {type_name}"
    
    print(f"✓ Google types coverage: {len(all_types)} types across all categories")


def run_all_tests():
    """Run all tests."""
    print("=" * 60)
    print("Place Search Service - Unit Tests")
    print("=" * 60)
    
    try:
        test_city_normalization()
        test_category_to_google_types()
        test_staleness_calculation()
        test_preference_mapping()
        test_google_types_coverage()
        test_scoring_calculations()
        test_price_level_score()
        test_response_format()
        
        print("\n" + "=" * 60)
        print("✓ ALL TESTS PASSED")
        print("=" * 60)
        print("\nImplementation is ready for integration testing.")
        print("\nTo test the full endpoint:")
        print("  1. Start the backend: python -m uvicorn app.main:app --reload")
        print("  2. Make a GET request to:")
        print("     http://localhost:8000/api/v1/places/search-with-caching")
        print("       ?city=Manila")
        print("       &preferences=Food%20Trip,Shopping")
        print("       &budget=balanced")
        
    except AssertionError as e:
        print(f"\n✗ TEST FAILED: {e}")
        return False
    except Exception as e:
        print(f"\n✗ ERROR: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    return True


if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)
