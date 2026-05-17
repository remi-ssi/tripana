# place/ city related endpoints — proxies Mapbox API to keep token server-side
import httpx
from fastapi import APIRouter, Query, HTTPException

from app.config import settings
from app.services.mapbox_usage_service import track_geocoding, track_map_load, get_usage

router = APIRouter()

MAPBOX_GEOCODE_URL = "https://api.mapbox.com/geocoding/v5/mapbox.places"


@router.get("/search")
async def search_places(
    q: str = Query(..., min_length=2, description="Search query"),
    country: str = Query("ph", description="Country code"),
    limit: int = Query(5, ge=1, le=10),
    types: str = Query("poi,address,place", description="Mapbox place types"),
):
    """Proxy Mapbox Geocoding API — keeps the access token on the server."""
    token = settings.MAPBOX_TOKEN
    if not token:
        raise HTTPException(status_code=500, detail="Mapbox token is not configured")

    # Check usage before making the API call
    if not track_geocoding():
        raise HTTPException(
            status_code=429,
            detail="Mapbox geocoding limit almost reached. Requests blocked to stay on free tier.",
        )

    params = {
        "access_token": token,
        "country": country,
        "limit": limit,
        "types": types,
        "language": "en",
    }

    async with httpx.AsyncClient() as client:
        resp = await client.get(f"{MAPBOX_GEOCODE_URL}/{q}.json", params=params)

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


@router.get("/mapbox-token")
async def get_mapbox_token():
    """Return the Mapbox public token so the frontend can render the map."""
    token = settings.MAPBOX_TOKEN
    if not token:
        raise HTTPException(status_code=500, detail="Mapbox token is not configured")

    # Check usage before handing out the token
    if not track_map_load():
        raise HTTPException(
            status_code=429,
            detail="Mapbox map-load limit almost reached. Requests blocked to stay on free tier.",
        )

    return {"token": token}


@router.get("/usage")
async def mapbox_usage():
    """Check current Mapbox API usage stats for this month."""
    return get_usage()
