"""
City normalization utilities for consistent city name handling.
"""


def normalize_city(city: str) -> str:
    """
    Normalize a city name by stripping whitespace and converting to lowercase.
    
    Args:
        city: The city name to normalize
    
    Returns:
        Normalized city name (lowercase, whitespace stripped)
    """
    if not city:
        return ""
    return city.strip().lower()
