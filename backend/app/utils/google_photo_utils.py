"""
Utility for generating Google Places photo URLs dynamically.
This approach optimizes API quota usage by storing only photo_reference
and generating URLs on-demand rather than downloading full URLs.
"""

from typing import Optional


def generate_google_photo_url(
    photo_reference: str,
    api_key: str,
    max_width: int = 400,
) -> str:
    """
    Generate a Google Places photo URL from a photo_reference.
    
    This is more efficient than storing the full URL because:
    - photo_reference is much smaller than full URLs
    - URLs can expire over time
    - Generating on-demand ensures fresh URLs
    
    Args:
        photo_reference: The photo reference from Google Places API
        api_key: Google Maps API key
        max_width: Maximum width of the image (default 400px)
    
    Returns:
        Full URL to the Google Places photo
    """
    if not photo_reference or not api_key:
        return None
    
    return (
        f"https://maps.googleapis.com/maps/api/place/photo"
        f"?maxwidth={max_width}"
        f"&photo_reference={photo_reference}"
        f"&key={api_key}"
    )


def extract_photo_reference(photo_dict: dict) -> Optional[str]:
    """
    Extract photo_reference from a Google Places photo object.
    
    Args:
        photo_dict: Photo object from Google Places API response
        Example: {"photo_reference": "abc123...", "height": 1000, ...}
    
    Returns:
        The photo_reference string or None if not found
    """
    if not photo_dict:
        return None
    
    return photo_dict.get("photo_reference")


def get_first_photo_reference(photos_list: list) -> Optional[str]:
    """
    Get the first valid photo_reference from a list of photos.
    
    Args:
        photos_list: List of photo objects from Google Places API
    
    Returns:
        The first photo_reference or None if list is empty
    """
    if not photos_list or len(photos_list) == 0:
        return None
    
    return extract_photo_reference(photos_list[0])
