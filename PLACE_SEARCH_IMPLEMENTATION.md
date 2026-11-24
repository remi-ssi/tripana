# Place Search & Caching Service - Implementation Guide

## Overview

This document describes the place searching and caching logic implemented for the travel app. The system provides city-based place caching with automatic staleness detection, preference-based Google Places API queries, and multi-factor scoring.

## Key Features

### 1. City Normalization
All city names are automatically normalized before any DB operations:
- Whitespace is stripped
- Converted to lowercase
- Applied consistently everywhere

**Implementation:** `backend/app/utils/city_utils.py::normalize_city()`

### 2. Staleness Detection
Cache is considered stale if **more than 50% of places are older than 30 days**.

**How it works:**
- On each search, the system checks all existing places for the city
- Calculates how many have `datefetched` older than 30 days
- If percentage > 50%, triggers a re-fetch from Google API
- Fresh data is marked with current timestamp

**Staleness threshold:** 30 days (configurable via `STALENESS_DAYS` constant)

### 3. Place Search Flow

```
Search city in DB (normalized match)
├── Check staleness
│   ├── Stale or no results
│   │   ├── Fetch from Google (preference-filtered queries)
│   │   ├── Save 50 places to DB
│   │   ├── Mark places not in results as inactive (soft delete)
│   │   └── Rank by preference
│   └── Fresh results
│       ├── Score places
│       ├── Check if enough good matches (score >= 0.5, minimum 10)
│       │   ├── Yes: Return all ranked
│       │   └── No: Fetch from Google, merge, re-rank, return all
```

### 4. Google Places API Query Strategy

When fetching from Google API, preferences are built into the query **before** hitting the API, not after. This means:

- User preferences are mapped to Google Place types
- Separate API calls are made per category type
- Results are automatically filtered by Google
- Requests are merged and deduplicated by `googleplaceid`

**Preference to Google Type Mapping:**
```python
CATEGORY_TO_GOOGLE_TYPES = {
    "Beaches": ["beach", "tourist_attraction", "park", "campground"],
    "Food Trip": ["restaurant", "cafe", "bar"],
    "Historical Sites": ["church", "mosque", "temple", "tourist_attraction", "museum"],
    # ... etc (14 total categories)
}
```

### 5. Multi-Factor Scoring System

Each place is scored using Weighted Average (SAW) with these factors:

| Factor | Weight | Calculation |
|--------|--------|-------------|
| **Relevance** | 35% | How many user preferences match the place types |
| **Rating** | 30% | Normalized 1-5 rating to 0-1 scale |
| **Popularity** | 25% | Log scale of review count (capped at 1000) |
| **Price Level** | 10% | Closeness to user's preferred price level (1-4) |

**Formula:**
```
Score = (0.35 × Relevance) + (0.30 × Rating) + (0.25 × Popularity) + (0.10 × PriceLevel)
```

All components are normalized to 0-1 before weighting.

### 6. Soft Delete Strategy

Places that are no longer returned by Google API are marked as `isactive = False` instead of being deleted. This:
- Preserves historical data
- Allows recovery if a place becomes relevant again
- Prevents data loss

When new data is fetched, old places are deactivated and new ones are activated.

### 7. Response Format

The endpoint returns **ALL ranked places** (up to 50), not paginated or truncated:

```json
{
  "results": [
    {
      "placeid": 123,
      "name": "Miagao Church",
      "city": "iloilo city",
      "address": "Jaro, Iloilo, Philippines",
      "rating": 4.5,
      "score": 0.8234,
      "types": ["church", "tourist_attraction"],
      "photos": "[{\"photo_reference\": \"...\"}, ...]",
      "photoUrl": "https://maps.googleapis.com/maps/api/place/photo?...",
      "is_open_now": true,
      "price_level": 1,
      "user_ratings_total": 542,
      "website": "https://example.com",
      "latitude": 10.3157,
      "longitude": 123.5854,
      "phone_number": "+63917234567",
      "opening_hours": "9am-5pm daily"
    },
    // ... up to 50 results, sorted by score descending
  ],
  "count": 47,
  "city": "iloilo city",
  "preferences": ["Historical Sites", "Photography"],
  "budget": "balanced"
}
```

## API Endpoint

### GET `/api/v1/places/search-with-caching`

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `city` | string | ✓ | — | City name (will be normalized) |
| `preferences` | string | ✗ | — | Comma-separated preferences (e.g., "Beaches,Food Trip,Shopping") |
| `budget` | string | ✗ | — | Budget tier: `budget-friendly`, `balanced`, or `luxury` |
| `price_level` | int (1-4) | ✗ | — | Preferred price level |
| `open_now` | boolean | ✗ | false | If true, only return currently open places |
| `lat` | float | ✗ | — | Latitude for location bias |
| `lng` | float | ✗ | — | Longitude for location bias |

**Example Requests:**

```bash
# Basic search by city
curl "http://localhost:8000/api/v1/places/search-with-caching?city=Manila"

# With preferences and budget
curl "http://localhost:8000/api/v1/places/search-with-caching?city=Cebu&preferences=Beaches,Food%20Trip&budget=balanced"

# With location bias and open now filter
curl "http://localhost:8000/api/v1/places/search-with-caching?city=Iloilo&preferences=Historical%20Sites&lat=10.3157&lng=123.5854&open_now=true"

# With specific price level preference
curl "http://localhost:8000/api/v1/places/search-with-caching?city=Davao&preferences=Shopping,Nightlife&price_level=2"
```

## Database Schema

Uses existing `places` table with columns:

```python
placeid (int, primary key)
googleplaceid (str, unique, indexed)
destination (str)                    # Place name
address (str)
city (str, indexed)                  # NORMALIZED: lowercase, stripped
latitude, longitude (float, nullable)
rating (float, nullable)
userratingtotal (int, nullable)
pricelevel (int, nullable)
openinghours (text, nullable)
is_open_now (bool, nullable)
website (str, nullable)
phonenumber (str, nullable)
photos (text, nullable)              # JSON array with photo_reference
types (text, nullable)               # JSON array of Google Place types
datefetched (datetime, nullable)     # When fetched from Google API
lastupdate (datetime, nullable)      # Last DB update
isactive (bool)                      # Soft delete flag
```

**No migration needed** - all columns already exist.

## Implementation Files

| File | Purpose |
|------|---------|
| `backend/app/utils/city_utils.py` | City normalization utility |
| `backend/app/services/place_search_service.py` | Core search service with staleness checking, scoring, and merging |
| `backend/app/repositories/place_repository.py` | New methods: `search_by_normalized_city()`, `upsert_place()`, `mark_inactive_places()` |
| `backend/app/controllers/places_controller.py` | New endpoint: `GET /places/search-with-caching` |
| `backend/tests/test_place_search_service.py` | Unit tests for all components |

## Usage Example

### Frontend Integration

```javascript
// Example: Search for places in Manila with preferences
const searchPlaces = async (city, preferences, budget) => {
  const params = new URLSearchParams({
    city: city,
    preferences: preferences.join(','),
    budget: budget,
  });
  
  const response = await fetch(
    `/api/v1/places/search-with-caching?${params}`,
    { method: 'GET' }
  );
  
  const data = await response.json();
  
  // Display loading state while search happens
  console.log(`Found ${data.count} places for ${data.city}`);
  
  // Display all results (not paginated)
  data.results.forEach(place => {
    console.log(`${place.name} - Score: ${place.score}`);
  });
  
  return data.results;
};

// Usage
const results = await searchPlaces('Iloilo City', ['Beaches', 'Food Trip'], 'balanced');
```

### Backend Testing

```python
# Run unit tests
python backend/tests/test_place_search_service.py

# Or with pytest
pytest backend/tests/test_place_search_service.py -v
```

## Performance Considerations

### Caching Benefits
- **Reduces API calls:** Stale data in DB used until staleness detected
- **Staleness window:** Re-fetch only when >50% of places are older than 30 days
- **Soft delete:** Inactive places kept for history, not re-fetched

### API Usage Optimization
- **Preference-based queries:** Only fetch relevant types from Google
- **Deduplication:** Separate calls per type merged by `googleplaceid`
- **Batch limits:** 50 places per fetch, saved atomically

### Scoring Performance
- **O(n) complexity:** Each place scored once
- **No external calls:** All scoring local (already fetched data)
- **Quick ranking:** Sorted list returned immediately

## Testing Checklist

- [x] City normalization works for all cases
- [x] Staleness detection correctly identifies >50% old
- [x] Preference mapping covers all categories
- [x] Scoring calculations are within 0-1 range
- [x] Price level scoring works with/without preferences
- [x] Response format includes all required fields
- [x] Google types coverage for all 14 categories

## Future Enhancements

1. **Caching TTL Configuration:** Make 30-day threshold configurable
2. **Analytics:** Track which categories are searched most
3. **User Feedback:** Save user ratings for places to improve scoring
4. **Personalization:** Track user search history for recommendations
5. **Batch Operations:** Cache multiple cities simultaneously
6. **Export:** Allow users to download place lists as CSV/PDF

## Troubleshooting

### No Results Returned
1. Check if city name is spelled correctly
2. Verify Google Places API quota is not exceeded
3. Ensure at least one place exists for the city in DB
4. Check API logs for Google API errors

### Staleness Not Triggering
1. Verify `datefetched` timestamp is being set correctly
2. Check database query is filtering by city properly
3. Ensure at least one place has `datefetched` within 30 days

### Scoring Issues
1. Verify preference names match `CATEGORY_TO_GOOGLE_TYPES` keys
2. Check that place types are stored as JSON array strings
3. Ensure ratings and review counts are reasonable values

### Performance Issues
1. Check DB indexes on `city` and `googleplaceid`
2. Monitor Google API response times
3. Consider pagination at frontend if showing 50+ results
