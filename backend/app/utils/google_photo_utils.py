# utils google photos
from typing import Optional


def generate_google_photo_url(
    photo_reference: str,
    api_key: str,
    max_width: int = 400,
) -> str:
    # Generate a Google Photo URL using the photo_reference and API key.
    if not photo_reference or not api_key:
        return None
    
    return (
        f"https://maps.googleapis.com/maps/api/place/photo"
        f"?maxwidth={max_width}"
        f"&photo_reference={photo_reference}"
        f"&key={api_key}"
    )


def extract_photo_reference(photo_dict: dict) -> Optional[str]:
    # Extract the photo_reference from a photo dictionary returned by Google Places API.
    if not photo_dict:
        return None
    
    return photo_dict.get("photo_reference")


def get_first_photo_reference(photos_list: list) -> Optional[str]:
    # Get the photo_reference of the first photo in the list, if available.
    if not photos_list or len(photos_list) == 0:
        return None
    
    return extract_photo_reference(photos_list[0])
