"""
Service to fetch attractions from Google Places API and save them to local database.
Includes deduplication via google_place_id to prevent duplicates.
"""

from typing import List, Dict, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.place import Place
from app.repositories.place_repository import PlaceRepository
from app.services.google_places_service import search_attractions
from app.utils.location_extractor import extract_city_from_address


async def fetch_and_save_attractions(
    db: AsyncSession,
    city: str,
    preferences: List[str],
    preference_keywords: Dict[str, List[str]],
    limit: int = 50
) -> Dict:
    """
    Fetch attractions from Google Places API and save to local database.
    
    Strategy:
    1. For each preference, search Google Places API
    2. Collect all results
    3. Deduplicate by google_place_id (only save if not already in DB)
    4. Extract city from formatted_address to verify it matches the requested city
    5. Save only places that match the requested city
    
    Args:
        db: AsyncSession for database operations
        city: The city to fetch places for
        preferences: List of user preference categories
        preference_keywords: Mapping of preferences to keywords for searching
        limit: Maximum number of places to fetch per preference (default 50)
    
    Returns:
        Dictionary with stats: saved_count, skipped_duplicates, wrong_city_count, errors
    """
    repo = PlaceRepository(db)
    stats = {
        "saved_count": 0,
        "skipped_duplicates": 0,
        "wrong_city_count": 0,
        "errors": []
    }
    
    # Collect all place IDs we've already seen in this fetch to avoid duplicates
    # (in case multiple preferences return the same place)
    fetched_place_ids = set()
    
    # Iterate through each preference and fetch attractions
    for preference in preferences:
        keywords = preference_keywords.get(preference, [preference.lower()])
        
        for keyword in keywords:
            try:
                # Search Google Places API for this keyword in the city
                search_query = f"{keyword} in {city}"
                google_results = await search_attractions(
                    query=search_query,
                    location=None,  # No coordinate bias for broad search
                    radius=50000,  # 50km radius
                    limit=limit
                )
                
                for google_place in google_results:
                    google_place_id = google_place.get("id")
                    
                    # Skip if we've already processed this in this fetch
                    if google_place_id in fetched_place_ids:
                        stats["skipped_duplicates"] += 1
                        continue
                    
                    fetched_place_ids.add(google_place_id)
                    
                    # Check if place already exists in database
                    existing = await repo.get_by_google_place_id(google_place_id)
                    if existing:
                        stats["skipped_duplicates"] += 1
                        continue
                    
                    # Extract city from the formatted address
                    address = google_place.get("address", "")
                    extracted_city = extract_city_from_address(address)
                    
                    # Verify the place is in the requested city
                    if not extracted_city or not _city_matches(city, extracted_city):
                        stats["wrong_city_count"] += 1
                        continue
                    
                    # Save to database
                    try:
                        coords = google_place.get("coordinates", {})
                        await repo.create(
                            google_place_id=google_place_id,
                            name=google_place.get("name", ""),
                            address=address,
                            city=extracted_city,
                            latitude=coords.get("lat", 0.0),
                            longitude=coords.get("lng", 0.0),
                            rating=google_place.get("rating"),
                            user_ratings_total=google_place.get("user_ratings_total"),
                            types=google_place.get("types", []),
                            opening_hours=str(google_place.get("opening_hours")) if google_place.get("opening_hours") else None,
                            photos=google_place.get("photos", []),
                            website=google_place.get("website"),
                            price_level=google_place.get("price_level")
                        )
                        stats["saved_count"] += 1
                    except Exception as e:
                        stats["errors"].append({
                            "place_id": google_place_id,
                            "error": str(e)
                        })
                
            except Exception as e:
                stats["errors"].append({
                    "preference": preference,
                    "keyword": keyword,
                    "error": str(e)
                })
    
    # Commit all changes to database
    try:
        await db.commit()
    except Exception as e:
        await db.rollback()
        stats["errors"].append({"commit_error": str(e)})
    
    return stats


def _city_matches(requested_city: str, extracted_city: str) -> bool:
    """
    Check if two city names match (case-insensitive, partial match allowed).
    """
    req = requested_city.lower().strip()
    ext = extracted_city.lower().strip()
    
    # Exact match
    if req == ext:
        return True
    
    # Partial match (one contains the other)
    if req in ext or ext in req:
        return True
    
    # Handle common variations (e.g., "Manila City" vs "Manila")
    if req.replace(" city", "") == ext.replace(" city", ""):
        return True
    
    return False
