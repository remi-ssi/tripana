#Handles Google Places API requests on the server-side to keep API key hidden from frontend.
import httpx
import json
import logging
import asyncio
from fastapi import HTTPException
from app.config import settings
from app.services.google_places_usage_service import track_api_request

logger = logging.getLogger(__name__)

GOOGLE_PLACES_API_BASE_URL = "https://maps.googleapis.com/maps/api/place"


# Fetch detailed information about a specific place using its Google Place ID.
async def get_place_details(place_id: str) -> dict | None:
    api_key = settings.GOOGLE_PLACES_API_KEY
    if not api_key:
        logger.error("Google Places API key is not configured")
        return None
    
    # Check quota before making request
    if not track_api_request():
        logger.warning("Google Places API quota limit reached. Blocking Place Details request.")
        return None
    
    params = {
        "place_id": place_id,
        "key": api_key,
        "fields": "place_id,name,formatted_address,geometry,rating,user_ratings_total,price_level,types,opening_hours,website,formatted_phone_number,photos,business_status"
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
                logger.error(f"Google Place Details API returned status: {data.get('status', 'Unknown error')} for place_id: {place_id}")
                return None
            
            return data.get("result")
            
    except Exception as e:
        logger.error(f"Error in get_place_details for place_id {place_id}: {str(e)}", exc_info=True)
        return None


# Note: We use the Text Search API for general searches and the Details API for fetching detailed info about a specific place.
async def search_attractions(
    query: str,
    location: tuple[float, float] | None = None,
    radius: int = 5000,
    limit: int = 30,
) -> list[dict]:
    
    # Search for attractions using Google Places API based on a query and optional location bias.
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
                place_id = place.get("place_id")
                
                # Step 2: Call get_place_details to get full details for each place
                details = None
                if place_id:
                    # Delay to avoid rate limiting
                    await asyncio.sleep(0.05)
                    try:
                        details = await get_place_details(place_id)
                    except Exception as e:
                        logger.error(f"Error fetching details for place {place_id}: {str(e)}")
                        details = None
                
                # Merge the basic search result with the full details
                
                # 1. Name/destination
                name = ""
                if details:
                    name = details.get("name")
                if not name:
                    name = place.get("name", "")
                
                # 2. Address: use formatted_address from details instead of vicinity/formatted_address from search
                address = ""
                if details:
                    address = details.get("formatted_address")
                if not address:
                    address = place.get("formatted_address") or place.get("vicinity") or ""
                
                # 3. Rating & user_ratings_total
                rating = None
                if details:
                    rating = details.get("rating")
                if rating is None:
                    rating = place.get("rating")
                
                user_ratings_total = None
                if details:
                    user_ratings_total = details.get("user_ratings_total")
                if user_ratings_total is None:
                    user_ratings_total = place.get("user_ratings_total")
                
                # 4. Price level
                price_level = None
                if details:
                    price_level = details.get("price_level")
                if price_level is None:
                    price_level = place.get("price_level")
                
                # 5. Types
                types = None
                if details:
                    types = details.get("types")
                if not types:
                    types = place.get("types") or []
                
                # 6. Website & phone number
                website = None
                phone_number = None
                if details:
                    website = details.get("website")
                    phone_number = details.get("formatted_phone_number")
                
                # 7. Opening hours: use weekday_text from details, open_now from details/search
                is_open_now = None
                opening_hours_json = None
                
                if details and details.get("opening_hours"):
                    oh = details.get("opening_hours", {})
                    is_open_now = oh.get("open_now")
                    weekday_text = oh.get("weekday_text")
                    if weekday_text:
                        opening_hours_json = json.dumps(weekday_text)
                else:
                    oh_search = place.get("opening_hours", {})
                    if oh_search:
                        is_open_now = oh_search.get("open_now")
                
                # 8. Photos: Take photos array from details, fallback to search, and build full photo URLs
                photos_array = None
                if details:
                    photos_array = details.get("photos")
                if not photos_array:
                    photos_array = place.get("photos")
                
                photos_json = None
                if photos_array and isinstance(photos_array, list):
                    photo_urls = []
                    for p in photos_array:
                        photo_ref = p.get("photo_reference")
                        if photo_ref:
                            photo_url = f"https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference={photo_ref}&key={api_key}"
                            photo_urls.append(photo_url)
                    if photo_urls:
                        photos_json = json.dumps(photo_urls)
                
                # 9. Coordinates (geometry)
                coordinates = {
                    "lat": place.get("geometry", {}).get("location", {}).get("lat"),
                    "lng": place.get("geometry", {}).get("location", {}).get("lng"),
                }
                if details and details.get("geometry"):
                    loc = details.get("geometry", {}).get("location", {})
                    if loc.get("lat") is not None and loc.get("lng") is not None:
                        coordinates = {
                            "lat": loc.get("lat"),
                            "lng": loc.get("lng")
                        }
                
                formatted_place = {
                    "id": place_id,
                    "name": name,
                    "address": address,
                    "coordinates": coordinates,
                    "rating": rating,
                    "user_ratings_total": user_ratings_total,
                    "types": types,
                    "is_open_now": is_open_now,
                    "opening_hours": opening_hours_json,
                    "photos": photos_json,
                    "website": website,
                    "price_level": price_level,
                    "phone_number": phone_number,
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
