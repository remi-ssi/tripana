"""
Service to fetch attractions from Google Places API and save them to local database.
Includes deduplication via google_place_id to prevent duplicates.
"""

from typing import List, Dict, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.place import Place
from app.repositories.place_repository import PlaceRepository
from app.services.google_places_service import search_attractions


async def fetch_and_save_attractions(
    db: AsyncSession,
    city: str,
    preferences: List[str],
    preference_keywords: Dict[str, List[str]],
    limit: int = 50
) -> Dict:
    # Initialize repository and stats
    repo = PlaceRepository(db)
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
                    existing = await repo.get_by_google_place_id(google_place_id)
                    if existing:
                        stats["skipped_duplicates"] += 1
                        continue
                    
                    # Get address
                    address = google_place.get("address", "")
                    
                    # Save to database with city field
                    try:
                        coords = google_place.get("coordinates", {})
                        await repo.create(
                            googleplaceid=google_place_id,
                            destination=google_place.get("name", ""),
                            address=address,
                            city=city,
                            latitude=coords.get("lat", 0.0),
                            longitude=coords.get("lng", 0.0),
                            rating=google_place.get("rating"),
                            userratingtotal=google_place.get("user_ratings_total"),
                            openinghours=str(google_place.get("opening_hours")) if google_place.get("opening_hours") else None,
                            is_open_now=google_place.get("is_open_now"),
                            photos=google_place.get("photos"),
                            website=google_place.get("website"),
                            pricelevel=google_place.get("price_level"),
                            phonenumber=google_place.get("phone_number")
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
