#utility function to extract city name from a formatted address string

def extract_city_from_address(address: str) -> str:
    # Extract the city name from a formatted address string.
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
