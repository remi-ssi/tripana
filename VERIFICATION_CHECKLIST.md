# Implementation Verification Checklist

This checklist helps verify that the place searching and caching implementation is working correctly.

## Pre-Flight Checks

### Database
- [ ] `places` table exists with all required columns
- [ ] Columns indexed: `city`, `googleplaceid`
- [ ] Sample data exists in `places` table (optional, but helps testing)

### Environment
- [ ] `GOOGLE_PLACES_API_KEY` is set in backend/.env
- [ ] Backend server can start without errors: `uvicorn app.main:app --reload`
- [ ] Database connection works

### Dependencies
- [ ] `httpx` is installed (for async HTTP calls)
- [ ] `sqlalchemy` with async support is installed

## Unit Tests

Run the test suite to verify core logic:

```bash
cd backend
python tests/test_place_search_service.py
```

Expected output:
```
✓ ALL TESTS PASSED
- City normalization ✓
- Staleness calculation ✓
- Preference mapping ✓
- Scoring calculations ✓
- Response format ✓
```

## Integration Tests

### Test 1: Basic City Search
```bash
curl "http://localhost:8000/api/v1/places/search-with-caching?city=Manila"
```

**Verify:**
- ✓ Returns 200 OK status
- ✓ Response has `results` array
- ✓ Response has `count` field
- ✓ Response has `city`, `preferences`, `budget` fields

### Test 2: Search with Preferences
```bash
curl "http://localhost:8000/api/v1/places/search-with-caching?city=Cebu&preferences=Beaches,Food%20Trip&budget=balanced"
```

**Verify:**
- ✓ Returns results relevant to "Beaches" and "Food Trip"
- ✓ Each result has a `score` between 0 and 1
- ✓ Results are sorted by score (descending)
- ✓ `preferences` field in response shows ["Beaches", "Food Trip"]
- ✓ `budget` field in response shows "balanced"

### Test 3: Location-Based Search
```bash
curl "http://localhost:8000/api/v1/places/search-with-caching?city=Manila&lat=14.5995&lng=120.9842"
```

**Verify:**
- ✓ Results include coordinates (latitude, longitude)
- ✓ Results are biased towards provided location

### Test 4: Open Now Filter
```bash
curl "http://localhost:8000/api/v1/places/search-with-caching?city=Manila&open_now=true"
```

**Verify:**
- ✓ All results have `is_open_now: true`
- ✓ Or results with null `is_open_now` are excluded

### Test 5: Price Level Preference
```bash
curl "http://localhost:8000/api/v1/places/search-with-caching?city=Manila&budget=budget-friendly"
```

**Verify:**
- ✓ Results have `price_level` 1 or 2 (or null)
- ✓ Results with price_level 3+ are excluded

### Test 6: Multiple Preferences
```bash
curl "http://localhost:8000/api/v1/places/search-with-caching?city=Iloilo&preferences=Historical%20Sites,Photography,Art"
```

**Verify:**
- ✓ Results include historical sites, scenic viewpoints, and art galleries
- ✓ Scoring reflects multiple preference matches
- ✓ Places matching more preferences have higher scores

## Response Format Verification

Each place in results should have:

```javascript
{
  placeid: number,           // ✓ Must be present
  name: string,              // ✓ Must be present
  city: string,              // ✓ Must be present and lowercase
  address: string,           // ✓ Must be present
  rating: number|null,       // ✓ Can be null
  score: number,             // ✓ Must be 0-1, rounded to 4 decimals
  types: array,              // ✓ Array of Google Place types
  photos: string|null,       // ✓ JSON string with photo_reference
  photoUrl: string|null,     // ✓ Generated URL or null
  is_open_now: boolean|null, // ✓ Can be null
  price_level: number|null,  // ✓ 1-4 or null
  user_ratings_total: number|null,  // ✓ Can be null
  website: string|null,      // ✓ Can be null
  latitude: number|null,     // ✓ Can be null
  longitude: number|null,    // ✓ Can be null
  phone_number: string|null, // ✓ Can be null
  opening_hours: string|null // ✓ Can be null
}
```

## Functionality Tests

### Test 7: Staleness Detection
**Prerequisites:** Have places in DB with `datefetched` older than 30 days

1. Search for a city with old data:
   ```bash
   curl "http://localhost:8000/api/v1/places/search-with-caching?city=TestCity"
   ```

2. Check backend logs - should show:
   ```
   Cache staleness check: STALE
   Fetching from Google API...
   ```

3. Verify new places have current `datefetched` timestamp

**Verify:**
- ✓ Old places are re-fetched when stale
- ✓ New places saved with current timestamp
- ✓ Old places marked as `isactive = False`

### Test 8: Cache Hit (Fresh Data)
1. Run Test 7
2. Immediately run the same search again:
   ```bash
   curl "http://localhost:8000/api/v1/places/search-with-caching?city=TestCity"
   ```

3. Check backend logs - should show:
   ```
   Cache staleness check: FRESH
   Returning ranked results...
   ```

**Verify:**
- ✓ Uses cached data (no new Google API call)
- ✓ Response is faster than first search
- ✓ Same results as previous search

### Test 9: Scoring Consistency
1. Search the same city twice with same preferences
2. Compare results

**Verify:**
- ✓ Results are identical
- ✓ Order is consistent
- ✓ Scores are the same

### Test 10: No Results Handling
```bash
curl "http://localhost:8000/api/v1/places/search-with-caching?city=NonExistentPlace12345"
```

**Verify:**
- ✓ Returns 200 OK
- ✓ `results` array is empty `[]`
- ✓ `count` is 0
- ✓ No error thrown

### Test 11: Error Handling
```bash
# Missing required parameter
curl "http://localhost:8000/api/v1/places/search-with-caching"

# Invalid preference
curl "http://localhost:8000/api/v1/places/search-with-caching?city=Manila&preferences=InvalidPref"

# Invalid budget
curl "http://localhost:8000/api/v1/places/search-with-caching?city=Manila&budget=invalid"

# Invalid price level (>4)
curl "http://localhost:8000/api/v1/places/search-with-caching?city=Manila&price_level=10"
```

**Verify:**
- ✓ Missing `city` returns 400 Bad Request
- ✓ Other parameters can be invalid without error
- ✓ Invalid parameters are ignored gracefully

## Performance Tests

### Test 12: Response Time
```bash
time curl "http://localhost:8000/api/v1/places/search-with-caching?city=Manila&preferences=Beaches"
```

**Verify:**
- ✓ Fresh cache response: < 500ms
- ✓ Google API fetch: < 5 seconds (depends on API)
- ✓ Frontend can show loading state during search

### Test 13: Batch Request
Make 5 sequential requests with different preferences:

```bash
for pref in "Beaches" "Food Trip" "Shopping" "Art" "Hiking"; do
  echo "Searching: $pref"
  curl "http://localhost:8000/api/v1/places/search-with-caching?city=Manila&preferences=$pref"
  echo ""
done
```

**Verify:**
- ✓ No errors after multiple requests
- ✓ Google API quota tracking works
- ✓ Database handles concurrent writes

## Database Verification

### Test 14: Data Integrity
Connect to database and run:

```sql
-- Check places table structure
DESCRIBE places;

-- Verify city normalization (should be lowercase)
SELECT DISTINCT LOWER(city) FROM places WHERE city IS NOT NULL;

-- Check for inactive places (soft deletes)
SELECT COUNT(*) as total_places, 
       SUM(CASE WHEN isactive = 1 THEN 1 ELSE 0 END) as active_places
FROM places;

-- Verify datefetched timestamps are recent
SELECT COUNT(*) as recent_places
FROM places 
WHERE datefetched > DATE_SUB(NOW(), INTERVAL 1 DAY);

-- Check for types field (should be JSON)
SELECT name, types FROM places LIMIT 1;
```

**Verify:**
- ✓ All places have `city` (normalized lowercase)
- ✓ Some places have `isactive = 0` (soft deleted)
- ✓ Recent places have `datefetched` within 1-30 days
- ✓ `types` field contains JSON array

## Photo URL Verification

### Test 15: Photo URLs
```bash
curl "http://localhost:8000/api/v1/places/search-with-caching?city=Manila" | \
  jq '.results[] | {name, photoUrl}'
```

**Verify:**
- ✓ Some results have `photoUrl` field
- ✓ URL starts with `https://maps.googleapis.com/maps/api/place/photo`
- ✓ URL includes `photo_reference` parameter
- ✓ URL includes `key` parameter (API key)
- ✓ URL has `max_width=400` parameter

## Edge Cases

### Test 16: Special Characters in City Name
```bash
curl "http://localhost:8000/api/v1/places/search-with-caching?city=São%20Paulo"
curl "http://localhost:8000/api/v1/places/search-with-caching?city=Zürich"
```

**Verify:**
- ✓ Handles special characters
- ✓ Normalizes properly (lowercase)

### Test 17: Very Long Preferences List
```bash
curl "http://localhost:8000/api/v1/places/search-with-caching?city=Manila&preferences=Beaches,Food%20Trip,Shopping,Art,Historical%20Sites,Photography,Wildlife,Camping,Relaxation,Island%20Hopping"
```

**Verify:**
- ✓ Handles all 10+ preferences
- ✓ No timeout
- ✓ Scoring still works correctly

### Test 18: Coordinates at Edge of World
```bash
# Near North Pole
curl "http://localhost:8000/api/v1/places/search-with-caching?city=Manila&lat=89&lng=0"

# Near South Pole
curl "http://localhost:8000/api/v1/places/search-with-caching?city=Manila&lat=-89&lng=180"

# Date line
curl "http://localhost:8000/api/v1/places/search-with-caching?city=Manila&lat=0&lng=179.999"
```

**Verify:**
- ✓ Accepts valid coordinates
- ✓ Returns results (or empty results, but no errors)

## Frontend Integration Checklist

- [ ] Endpoint URL is correctly configured in frontend
- [ ] API key from `.env` is not exposed in frontend requests
- [ ] Loading spinner shows during search
- [ ] Results display all 50 places (if available)
- [ ] Results sorted by score descending
- [ ] Photos load with fallback if unavailable
- [ ] Score badge displays as percentage (e.g., "Score: 82.34%")
- [ ] Rank badge shows position (e.g., "#1 of 47")
- [ ] Empty state message if no results
- [ ] Error message if search fails
- [ ] Preference filters work correctly
- [ ] Budget filter works (price level filtering)
- [ ] "Open Now" filter works

## Logging & Monitoring

### Enable Debug Logging
In backend `app/config.py`, set:
```python
APP_DEBUG = True
LOG_LEVEL = "DEBUG"
```

### Check Logs for Expected Messages
```bash
# Should see these in logs during searches
"Searching places for city: [normalized_city]"
"Found N active places in DB"
"Cache staleness check: [FRESH|STALE]"
"Fetching from Google API"
"Saved N places to database"
"Marked N places as inactive"
"Returning X ranked places"
```

## Success Criteria

All tests should pass:
- ✓ All unit tests pass
- ✓ All integration tests return expected results
- ✓ Response format matches specification
- ✓ Database integrity verified
- ✓ Photo URLs generated correctly
- ✓ Performance acceptable (< 5 seconds for Google fetch)
- ✓ Edge cases handled gracefully
- ✓ Frontend integration working

## Rollback Plan

If issues are found:

1. **Revert Place Search Service:**
   - Delete `backend/app/services/place_search_service.py`
   - Revert changes to `backend/app/controllers/places_controller.py`
   - Keep using `LocalAttractionSearchService` for searches

2. **Revert Repository Changes:**
   - Revert `backend/app/repositories/place_repository.py` to original
   - Remove new methods: `search_by_normalized_city()`, `upsert_place()`, `mark_inactive_places()`

3. **Keep Utility:**
   - `backend/app/utils/city_utils.py` can stay (safe, non-breaking)

## Support

For issues:
1. Check backend logs first
2. Verify database connection
3. Check Google API quota
4. Run unit tests to isolate issue
5. Check all environment variables are set
6. Review error messages carefully

## Sign-Off

Once all tests pass:

- [ ] Implementation complete
- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] Database verified
- [ ] Frontend integration guide reviewed
- [ ] Ready for QA testing
