"""
Service to fetch attractions from Google Places API and save them to local database.
Includes deduplication via google_place_id to prevent duplicates.
Properly handles types via the types table and placetypes junction table.
"""

import logging
from typing import List, Dict, Optional
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.place import Place
from app.repositories.place_repository import PlaceRepository
from app.repositories.types_repository import TypesRepository
from app.repositories.placetypes_repository import PlaceTypesRepository
from app.services.google_places_service import search_attractions

logger = logging.getLogger(__name__)


async def fetch_and_save_attractions(
    db: AsyncSession,
    city: str,
    preferences: List[str],
    preference_keywords: Dict[str, List[str]],
    limit: int = 50
) -> Dict:
    """
    Fetch attractions from Google Places API and save to local database.
    
    For each place:
    1. Check if it already exists (by google_place_id)
    2. If not, save the place record to the places table
    3. For each type in the place's types list:
       - Get or create the type in the types table
       - Create an entry in the placetypes junction table
    4. Each place is wrapped in try/except so one failure doesn't block the batch
    5. Only commit after all saves succeed
    
    Args:
        db: SQLAlchemy async session
        city: City name to fetch attractions for
        preferences: List of user preference categories
        preference_keywords: Mapping of preferences to keywords
        limit: Maximum results per query (default 50)
    
    Returns:
        Stats dict with saved_count, skipped_duplicates, and errors list
    """
    # Initialize repositories and stats
    place_repo = PlaceRepository(db)
    types_repo = TypesRepository(db)
    placetypes_repo = PlaceTypesRepository(db)
    
    stats = {
        "saved_count": 0,
        "skipped_duplicates": 0,
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
                    existing = await place_repo.get_by_google_place_id(google_place_id)
                    if existing:
                        stats["skipped_duplicates"] += 1
                        continue
                    
                    # Wrap individual place save in try/except so one failure doesn't block the batch
                    try:
                        await _save_place_with_types(
                            place_repo=place_repo,
                            types_repo=types_repo,
                            placetypes_repo=placetypes_repo,
                            google_place=google_place,
                            city=city
                        )
                        stats["saved_count"] += 1
                    except Exception as e:
                        error_msg = f"Error saving place {google_place_id}: {str(e)}"
                        logger.error(error_msg)
                        stats["errors"].append({
                            "place_id": google_place_id,
                            "place_name": google_place.get("name", ""),
                            "error": str(e)
                        })
                
            except Exception as e:
                error_msg = f"Error fetching from Google API for {preference}/{keyword} in {city}: {str(e)}"
                logger.error(error_msg)
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
        error_msg = f"Error committing place saves: {str(e)}"
        logger.error(error_msg)
        stats["errors"].append({"commit_error": str(e)})
    
    return stats


async def _save_place_with_types(
    place_repo: PlaceRepository,
    types_repo: TypesRepository,
    placetypes_repo: PlaceTypesRepository,
    google_place: Dict,
    city: str
) -> Place:
    """
    Save a single place from Google API with its types.
    
    Steps:
    1. Save the place to the places table
    2. For each type string from Google, get or create the type
    3. Create entries in the placetypes junction table
    
    Args:
        place_repo: PlaceRepository instance
        types_repo: TypesRepository instance
        placetypes_repo: PlaceTypesRepository instance
        google_place: Place dict from Google API
        city: City name
    
    Returns:
        The saved Place object
        
    Raises:
        Exception: If any step fails, the error is logged and re-raised
    """
    google_place_id = google_place.get("id")
    
    try:
        # Step 1: Save the place to the places table (without types)
        coords = google_place.get("coordinates", {})
        place = await place_repo.create(
            googleplaceid=google_place_id,
            destination=google_place.get("name", ""),
            address=google_place.get("address", ""),
            city=city,
            latitude=coords.get("lat"),
            longitude=coords.get("lng"),
            rating=google_place.get("rating"),
            userratingtotal=google_place.get("user_ratings_total"),
            openinghours=str(google_place.get("opening_hours")) if google_place.get("opening_hours") else None,
            is_open_now=google_place.get("is_open_now"),
            photos=google_place.get("photos"),
            website=google_place.get("website"),
            pricelevel=google_place.get("price_level"),
            phonenumber=google_place.get("phone_number")
        )
        
        # Step 2 & 3: Save types and create placetypes entries
        place_types = google_place.get("types", [])
        if place_types:
            for type_str in place_types:
                try:
                    # Get or create the type in the types table
                    type_obj = await types_repo.get_or_create_by_category(type_str)
                    
                    # Check if this association already exists (shouldn't, but safety check)
                    exists = await placetypes_repo.exists(place.placeid, type_obj.categoryid)
                    if not exists:
                        # Create the placetypes entry
                        await placetypes_repo.create(place.placeid, type_obj.categoryid)
                except Exception as e:
                    logger.warning(f"Error saving type '{type_str}' for place {google_place_id}: {str(e)}")
                    # Continue with other types even if one fails
                    continue
        
        return place
        
    except Exception as e:
        logger.error(f"Error in _save_place_with_types for {google_place_id}: {str(e)}")
        raise

