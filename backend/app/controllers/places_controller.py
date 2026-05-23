# place/ city related endpoints — proxies Mapbox API to keep token server-side
import uuid
import httpx
from fastapi import APIRouter, Query, Path, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.services.mapbox_usage_service import track_geocoding, track_map_load, get_usage
from app.services.google_places_service import search_attractions, get_place_details
from app.services.google_places_usage_service import get_usage as get_google_places_usage
from app.services.local_attraction_search_service import LocalAttractionSearchService, PREFERENCE_TO_KEYWORDS
from app.services.fetch_and_save_places_service import fetch_and_save_attractions

router = APIRouter()

# Mapbox Search Box API v1 (better POI/hotel results)
MAPBOX_SUGGEST_URL = "https://api.mapbox.com/search/searchbox/v1/suggest"
MAPBOX_RETRIEVE_URL = "https://api.mapbox.com/search/searchbox/v1/retrieve"

# Fallback: Geocoding v5 for general location search
MAPBOX_GEOCODE_URL = "https://api.mapbox.com/geocoding/v5/mapbox.places"


@router.get("/search")
async def search_places(
    q: str = Query(..., min_length=2, description="Search query"),
    country: str = Query("ph", description="Country code"),
    limit: int = Query(5, ge=1, le=10),
    types: str = Query("poi", description="Comma-separated Mapbox feature types"),
):
    """
    Search for places using Mapbox Search Box API (suggest).
    Returns suggestions with mapbox_id — call /retrieve to get coordinates.
    Falls back to Geocoding v5 if Search Box returns no results.
    """
    token = settings.MAPBOX_TOKEN
    if not token:
        raise HTTPException(status_code=500, detail="Mapbox token is not configured")

    if not track_geocoding():
        raise HTTPException(
            status_code=429,
            detail="Mapbox limit almost reached. Blocked to stay on free tier.",
        )

    session_token = str(uuid.uuid4())

    # ── 1) Search Box API — only for POI searches ──────────────────
    # The Search Box suggest API only returns business/POI results,
    # so bypass it entirely for place/locality/district/region searches.
    if types.strip() == "poi":
        suggest_params = {
            "q": q,
            "access_token": token,
            "session_token": session_token,
            "country": country.upper(),
            "language": "en",
            "limit": limit,
            "types": "poi",
        }

        async with httpx.AsyncClient() as client:
            resp = await client.get(MAPBOX_SUGGEST_URL, params=suggest_params)

        if resp.status_code == 200:
            suggestions = resp.json().get("suggestions", [])
            if suggestions:
                return [
                    {
                        "id": s.get("mapbox_id", ""),
                        "name": s.get("name", ""),
                        "fullAddress": s.get("full_address", s.get("place_formatted", "")),
                        "category": ", ".join(s.get("poi_category", [])),
                        "coordinates": None,
                    }
                    for s in suggestions
                ]

    # ── 2) Geocoding v5 — for place/locality/district/region AND as fallback ──
    geocode_type_map = {
        "poi": "poi,address",
        "place": "place",
        "locality": "locality",
        "district": "district",
        "region": "region",
    }
    geocode_types = ",".join(
        geocode_type_map.get(t.strip(), t.strip()) for t in types.split(",")
    )
    geocode_params = {
        "access_token": token,
        "country": country,
        "limit": limit,
        "types": geocode_types,
        "language": "en",
    }

    async with httpx.AsyncClient() as client:
        resp = await client.get(f"{MAPBOX_GEOCODE_URL}/{q}.json", params=geocode_params)

    if resp.status_code != 200:
        raise HTTPException(status_code=502, detail="Mapbox API request failed")

    data = resp.json()
    return [
        {
            "id": f["id"],
            "name": f["text"],
            "fullAddress": f["place_name"],
            "coordinates": {"lng": f["center"][0], "lat": f["center"][1]},
            "category": f.get("properties", {}).get("category", ""),
            "placeType": f.get("place_type", [""])[0],  # e.g. "place", "region", "locality"
        }
        for f in data.get("features", [])
    ]


@router.get("/retrieve/{mapbox_id:path}")
async def retrieve_place(mapbox_id: str):
    """Retrieve full place details (with coordinates) for a given mapbox_id."""
    token = settings.MAPBOX_TOKEN
    if not token:
        raise HTTPException(status_code=500, detail="Mapbox token is not configured")

    if not track_geocoding():
        raise HTTPException(
            status_code=429,
            detail="Mapbox limit almost reached. Blocked to stay on free tier.",
        )

    session_token = str(uuid.uuid4())
    params = {"access_token": token, "session_token": session_token}

    async with httpx.AsyncClient() as client:
        resp = await client.get(f"{MAPBOX_RETRIEVE_URL}/{mapbox_id}", params=params)

    if resp.status_code != 200:
        raise HTTPException(status_code=502, detail="Failed to retrieve place details")

    features = resp.json().get("features", [])
    if not features:
        raise HTTPException(status_code=404, detail="Place not found")

    f = features[0]
    coords = f.get("geometry", {}).get("coordinates", [0, 0])
    props = f.get("properties", {})

    return {
        "id": mapbox_id,
        "name": props.get("name", ""),
        "fullAddress": props.get("full_address", ""),
        "coordinates": {"lng": coords[0], "lat": coords[1]},
        "category": ", ".join(props.get("poi_category", [])),
    }


@router.get("/reverse")
async def reverse_geocode(
    lng: float = Query(..., description="Longitude"),
    lat: float = Query(..., description="Latitude"),
):
    """Reverse geocode: coordinates → place name / address."""
    token = settings.MAPBOX_TOKEN
    if not token:
        raise HTTPException(status_code=500, detail="Mapbox token is not configured")

    if not track_geocoding():
        raise HTTPException(
            status_code=429,
            detail="Mapbox geocoding limit almost reached. Blocked to stay on free tier.",
        )

    params = {"access_token": token, "language": "en", "limit": 1}

    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{MAPBOX_GEOCODE_URL}/{lng},{lat}.json", params=params
        )

    if resp.status_code != 200:
        raise HTTPException(status_code=502, detail="Reverse geocoding failed")

    features = resp.json().get("features", [])
    if not features:
        return {"name": "Pinned Location", "fullAddress": f"{lat:.5f}, {lng:.5f}"}

    f = features[0]
    return {
        "name": f.get("text", "Pinned Location"),
        "fullAddress": f.get("place_name", f"{lat:.5f}, {lng:.5f}"),
    }


@router.get("/mapbox-token")
async def get_mapbox_token():
    """Return the Mapbox public token so the frontend can render the map."""
    token = settings.MAPBOX_TOKEN
    if not token:
        raise HTTPException(status_code=500, detail="Mapbox token is not configured")

    if not track_map_load():
        raise HTTPException(
            status_code=429,
            detail="Mapbox map-load limit almost reached. Blocked to stay on free tier.",
        )

    return {"token": token}


@router.get("/usage")
async def mapbox_usage():
    """Check current Mapbox API usage stats for this month."""
    return get_usage()


# ── Google Places API Endpoints ──────────────────────────────────
# These endpoints keep the Google Places API key secure on the server-side
# The frontend can call these endpoints without exposing the API key


@router.get("/attractions/search")
async def search_google_attractions(
    q: str = Query(..., min_length=2, description="Search query for attractions (e.g., 'restaurants', 'museums')"),
    lat: float | None = Query(None, description="Latitude for location bias"),
    lng: float | None = Query(None, description="Longitude for location bias"),
    radius: int = Query(5000, ge=1000, le=50000, description="Search radius in meters"),
    limit: int = Query(20, ge=1, le=50, description="Maximum number of results"),
):
    """
    Search for attractions using Google Places API.
    
    The API key is kept on the server-side and never exposed to the client.
    This ensures your API key remains secure and prevents unauthorized usage.
    
    Args:
        q: Search query (e.g., "restaurants", "museums", "hotels")
        lat: Latitude for location bias (optional)
        lng: Longitude for location bias (optional)
        radius: Search radius in meters (default 5000m = 5km)
        limit: Maximum results to return (default 20, max 50)
    
    Returns:
        List of attractions with details: name, address, coordinates, rating, etc.
    """
    location = None
    if lat is not None and lng is not None:
        location = (lat, lng)
    
    results = await search_attractions(
        query=q,
        location=location,
        radius=radius,
        limit=limit
    )
    
    return {"results": results}


@router.get("/attractions/recommendations")
async def get_recommended_places(
    city: str = Query(..., min_length=2, description="City name for attraction search"),
    preferences: str = Query(..., description="Comma-separated list of user preferences (e.g., 'Beaches,Food Trip,Shopping')"),
    lat: float | None = Query(None, description="Latitude for location bias"),
    lng: float | None = Query(None, description="Longitude for location bias"),
    radius: int = Query(10000, ge=1000, le=50000, description="Search radius in meters"),
    limit: int = Query(20, ge=1, le=50, description="Maximum number of results"),
    db: AsyncSession = Depends(get_db),
):
    """
    Get recommended attractions based on user preferences.
    
    Implementation:
    1. Searches local database first (filtered by city and user preference types)
    2. If no results found, searches Google Places API
    3. Automatically saves fetched results to local database (deduplication via Google Place ID)
    4. Returns top-scored results using SAW (Simple Additive Weighting) scoring
    
    Scoring factors:
    - Rating: 40%
    - Popularity (review count): 25%
    - Preference relevance: 35%
    
    Local DB search optimization:
    - First checks if address city matches requested city
    - Then checks if attraction types match user preferences
    - Only retrieves and displays places matching both criteria
    
    Args:
        city: City name to search in
        preferences: Comma-separated preference list
        lat: Latitude for location bias (optional)
        lng: Longitude for location bias (optional)
        radius: Search radius in meters (default 10000m)
        limit: Maximum results (default 20, max 50)
    
    Returns:
        List of recommended attractions with scores and all details
    """
    try:
        # Parse preferences
        user_preferences = [pref.strip() for pref in preferences.split(",") if pref.strip()]
        
        if not user_preferences:
            raise HTTPException(
                status_code=400,
                detail="At least one preference is required"
            )
        
        # Initialize local search service
        search_service = LocalAttractionSearchService(db)
        
        # Search with local DB first, then Google API
        location = None
        if lat is not None and lng is not None:
            location = (lat, lng)
        
        results = await search_service.search_attractions(
            location_city=city,
            user_preferences=user_preferences,
            latitude=lat if lat is not None else None,
            longitude=lng if lng is not None else None,
            radius=radius,
            limit=limit,
        )
        
        return {"results": results}
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching recommendations: {str(e)}")


@router.get("/attractions/details/{place_id}")
async def get_attraction_details(
    place_id: str = Path(..., description="Google Place ID")
):
    """
    Get detailed information about a specific attraction.
    
    Args:
        place_id: Google Place ID
    
    Returns:
        Detailed information including reviews, opening hours, photos, etc.
    """
    details = await get_place_details(place_id)
    return details


@router.post("/attractions/fetch-and-save")
async def fetch_and_save_places_endpoint(
    city: str = Query(..., min_length=2, description="City name to fetch attractions for"),
    preferences: str = Query(..., description="Comma-separated list of user preferences"),
    db: AsyncSession = Depends(get_db),
):
    """
    Fetch up to 50 attractions from Google Places API and save to local database.
    
    Features:
    - Fetches attractions for each user preference (keyword-based search)
    - Deduplicates by Google Place ID to avoid duplicates in database
    - Verifies each place belongs to the requested city
    - Automatically saves to local database for future offline access
    - Returns statistics: saved count, skipped duplicates, wrong city count, errors
    
    Args:
        city: City name to search in
        preferences: Comma-separated preference list (e.g., 'Beaches,Food Trip,Shopping')
    
    Returns:
        Dictionary with:
        - saved_count: Number of new places saved to database
        - skipped_duplicates: Number of places already in database
        - wrong_city_count: Number of places not matching requested city
        - errors: List of any errors encountered
    """
    try:
        # Parse preferences
        user_preferences = [pref.strip() for pref in preferences.split(",") if pref.strip()]
        
        if not user_preferences:
            raise HTTPException(
                status_code=400,
                detail="At least one preference is required"
            )
        
        # Fetch and save attractions from Google API
        stats = await fetch_and_save_attractions(
            db=db,
            city=city,
            preferences=user_preferences,
            preference_keywords=PREFERENCE_TO_KEYWORDS,
            limit=50  # Fetch up to 50 per preference
        )
        
        return stats
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching and saving attractions: {str(e)}")


@router.get("/attractions/usage")
async def google_places_usage():
    """
    Check current Google Places API usage stats and quota remaining.
    
    Returns:
        Current usage, remaining quota, percentage used, and quota status
    """
    return get_google_places_usage()


