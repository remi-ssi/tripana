"""
Google Places API Service
Securely handles Google Places API requests on the server-side to keep API key hidden from frontend.
"""

import httpx
from fastapi import HTTPException
from app.config import settings
from app.services.google_places_usage_service import track_api_request


GOOGLE_PLACES_API_BASE_URL = "https://maps.googleapis.com/maps/api/place"


async def search_attractions(
    query: str,
    location: tuple[float, float] | None = None,
    radius: int = 5000,
    limit: int = 30,
) -> list[dict]:
    """
    Search for attractions using Google Places API.
    
    Args:
        query: Search query (e.g., "restaurants", "museums")
        location: (latitude, longitude) tuple for location bias
        radius: Search radius in meters (default 5000m = 5km)
        limit: Maximum number of results (default 20)
    
    Returns:
        List of place results with name, address, coordinates, rating, etc.
    
    Raises:
        HTTPException: If API key is not configured or API request fails
    """
    api_key = settings.GOOGLE_PLACES_API_KEY
    if not api_key:
        raise HTTPException(
            status_code=500,
            detail="Google Places API key is not configured"
        )
    
    # Check quota before making request
    if not track_api_request():
        raise HTTPException(
            status_code=429,
            detail="Google Places API quota limit reached (80% threshold). "
                   "Please contact the administrator. Requests are blocked to prevent unexpected charges."
        )
    
    # Use Text Search API for general search
    params = {
        "query": query,
        "key": api_key,
    }
    
    # Add location bias if provided
    if location:
        lat, lng = location
        params["location"] = f"{lat},{lng}"
        params["radius"] = radius
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                f"{GOOGLE_PLACES_API_BASE_URL}/textsearch/json",
                params=params
            )
            response.raise_for_status()
            
            data = response.json()
            
            if data.get("status") != "OK":
                raise HTTPException(
                    status_code=400,
                    detail=f"Google Places API error: {data.get('status', 'Unknown error')}"
                )
            
            results = data.get("results", [])
            
            # Format results to return only necessary data
            formatted_results = []
            for place in results[:limit]:
                formatted_place = {
                    "id": place.get("place_id"),
                    "name": place.get("name", ""),
                    "address": place.get("formatted_address", ""),
                    "coordinates": {
                        "lat": place.get("geometry", {}).get("location", {}).get("lat"),
                        "lng": place.get("geometry", {}).get("location", {}).get("lng"),
                    },
                    "rating": place.get("rating"),
                    "user_ratings_total": place.get("user_ratings_total"),
                    "types": place.get("types", []),
                    "opening_hours": place.get("opening_hours", {}).get("open_now"),
                    "photos": place.get("photos", []),
                    "website": place.get("website"),
                    "price_level": place.get("price_level"),
                }
                formatted_results.append(formatted_place)
            
            return formatted_results
    
    except httpx.HTTPError as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to connect to Google Places API: {str(e)}"
        )
    except Exception as e:
        import traceback
        print(f"Error in search_attractions: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=500,
            detail=f"Error searching attractions: {str(e)}"
        )


async def get_place_details(place_id: str) -> dict:
    """
    Get detailed information about a specific place.
    
    Args:
        place_id: Google Place ID
    
    Returns:
        Detailed place information
    
    Raises:
        HTTPException: If API key is not configured or API request fails
    """
    api_key = settings.GOOGLE_PLACES_API_KEY
    if not api_key:
        raise HTTPException(
            status_code=500,
            detail="Google Places API key is not configured"
        )
    
    # Check quota before making request
    if not track_api_request():
        raise HTTPException(
            status_code=429,
            detail="Google Places API quota limit reached (80% threshold). "
                   "Please contact the administrator. Requests are blocked to prevent unexpected charges."
        )
    
    params = {
        "place_id": place_id,
        "key": api_key,
        "fields": "name,rating,formatted_address,photos,website,opening_hours,reviews,geometry,types,formatted_phone_number,url"
    }
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                f"{GOOGLE_PLACES_API_BASE_URL}/details/json",
                params=params
            )
            response.raise_for_status()
            
            data = response.json()
            
            if data.get("status") != "OK":
                raise HTTPException(
                    status_code=400,
                    detail=f"Google Places API error: {data.get('status', 'Unknown error')}"
                )
            
            result = data.get("result", {})
            
            return {
                "id": place_id,
                "name": result.get("name", ""),
                "address": result.get("formatted_address", ""),
                "coordinates": {
                    "lat": result.get("geometry", {}).get("location", {}).get("lat"),
                    "lng": result.get("geometry", {}).get("location", {}).get("lng"),
                },
                "rating": result.get("rating"),
                "user_ratings_total": result.get("user_ratings_total"),
                "types": result.get("types", []),
                "opening_hours": result.get("opening_hours", {}).get("weekday_text"),
                "photos": result.get("photos", []),
                "website": result.get("website"),
                "phone": result.get("formatted_phone_number"),
                "url": result.get("url"),
                "reviews": result.get("reviews", []),
            }
    
    except httpx.HTTPError as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to connect to Google Places API: {str(e)}"
        )
    except Exception as e:
        import traceback
        print(f"Error in get_place_details: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=500,
            detail=f"Error getting place details: {str(e)}"
        )
