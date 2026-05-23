"""
Utility functions for location/address handling
"""

def extract_city_from_address(address: str) -> str:
    """
    Extract city name from a formatted address.
    
    Typical format: "Street Address, City, Region/State, Country"
    or "Street Address, City, Country"
    
    Returns the city portion (usually second-to-last part before country).
    """
    if not address:
        return ""
    
    # Split address by comma
    parts = [p.strip() for p in address.split(",")]
    
    # Remove country code if it exists (usually last part and very short)
    if len(parts) > 1 and len(parts[-1]) <= 3:
        parts = parts[:-1]
    
    # City is usually the second-to-last or last part
    # Return the last part after removing country
    if len(parts) >= 2:
        return parts[-1]
    elif len(parts) == 1:
        return parts[0]
    
    return ""
