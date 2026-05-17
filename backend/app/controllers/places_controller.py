# place/ city related endpoints — proxies Mapbox API to keep token server-side
import uuid
import httpx
from fastapi import APIRouter, Query, HTTPException

from app.config import settings
from app.services.mapbox_usage_service import track_geocoding, track_map_load, get_usage

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

    # ── 1) Try Search Box API suggest ──
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
                    # No coordinates yet — call /retrieve/{mapbox_id} on selection
                    "coordinates": None,
                }
                for s in suggestions
            ]

    # ── 2) Fallback to Geocoding v5 ──
    geocode_params = {
        "access_token": token,
        "country": country,
        "limit": limit,
        "types": "poi,address,place",
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
