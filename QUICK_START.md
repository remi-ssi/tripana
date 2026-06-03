# Quick Start Guide - Place Search & Caching

## What This Is

A complete place searching and caching system for your travel app with intelligent staleness detection, preference-based Google API queries, and multi-factor scoring.

## ⚡ Quick Start (5 minutes)

### 1. Verify Installation
```bash
cd backend

# Check Python environment
python --version

# Run unit tests
python tests/test_place_search_service.py
```

Expected: All 8 tests pass ✅

### 2. Start Backend
```bash
# From backend directory
python -m uvicorn app.main:app --reload
```

Expected: Server starts at `http://localhost:8000`

### 3. Test the Endpoint
```bash
# Basic search
curl "http://localhost:8000/api/v1/places/search-with-caching?city=Manila"

# With preferences
curl "http://localhost:8000/api/v1/places/search-with-caching?city=Cebu&preferences=Beaches,Food%20Trip&budget=balanced"
```

Expected: Returns JSON with place results and scores

## 📝 Basic Usage

### Endpoint
```
GET /api/v1/places/search-with-caching
```

### Required Parameters
| Parameter | Example |
|-----------|---------|
| `city` | `Manila` |

### Optional Parameters
| Parameter | Example | Options |
|-----------|---------|---------|
| `preferences` | `Beaches,Food Trip` | See categories below |
| `budget` | `balanced` | budget-friendly, balanced, luxury |
| `price_level` | `2` | 1, 2, 3, 4 |
| `open_now` | `true` | true, false |
| `lat` | `14.5995` | Any latitude |
| `lng` | `120.9842` | Any longitude |

### Available Preferences (Categories)
- Beaches
- Water Activities
- Food Trip
- Local Food
- Hiking
- Shopping
- Nightlife
- Art
- Historical Sites
- Photography
- Wildlife
- Camping
- Relaxation
- Island Hopping

## 🎯 Example Requests

### Find Beaches in Boracay
```bash
curl "http://localhost:8000/api/v1/places/search-with-caching?city=Boracay&preferences=Beaches&budget=balanced"
```

### Find Restaurants in Manila
```bash
curl "http://localhost:8000/api/v1/places/search-with-caching?city=Manila&preferences=Food%20Trip&budget=budget-friendly"
```

### Find Museums near Coordinates
```bash
curl "http://localhost:8000/api/v1/places/search-with-caching?city=Davao&preferences=Art,Historical%20Sites&lat=7.0731&lng=125.6121"
```

### Find Open Places Now
```bash
curl "http://localhost:8000/api/v1/places/search-with-caching?city=Cebu&open_now=true"
```

## 📊 Response Format

```json
{
  "results": [
    {
      "placeid": 123,
      "name": "Place Name",
      "city": "city name",
      "address": "Street Address",
      "rating": 4.5,
      "score": 0.8234,
      "types": ["beach", "park"],
      "photos": "[{\"photo_reference\": \"...\"}]",
      "photoUrl": "https://maps.googleapis.com/...",
      "is_open_now": true,
      "price_level": 2,
      "user_ratings_total": 500,
      "website": "https://example.com",
      "latitude": 10.3157,
      "longitude": 123.5854,
      "phone_number": "+63...",
      "opening_hours": "9am-5pm"
    }
  ],
  "count": 47,
  "city": "city name",
  "preferences": ["Beaches"],
  "budget": "balanced"
}
```

## 🧮 How Scoring Works

Each place gets a **score from 0 to 1** based on:

| Factor | Weight | What It Measures |
|--------|--------|------------------|
| Relevance | 35% | How well it matches your preferences |
| Rating | 30% | User star rating (1-5) |
| Popularity | 25% | Number of reviews (log scale) |
| Price | 10% | How close to your budget |

**Example:**
- Place with all preferences matching, 4.5 stars, 1000 reviews → ~0.85 score
- Place with few matches, 3 stars, 50 reviews → ~0.45 score

## 💾 How Caching Works

1. **First search for a city:**
   - Fetches ~50 places from Google API
   - Saves to database with timestamp
   - Returns ranked results

2. **Subsequent searches (within 30 days):**
   - Uses cached database
   - Fast response (< 500ms)
   - No Google API call

3. **After 30 days (if >50% of places are old):**
   - Re-fetches fresh data from Google
   - Updates database
   - Returns new ranked results

## ⚙️ Implementation Files

| What | File |
|------|------|
| Main search logic | `app/services/place_search_service.py` |
| Database operations | `app/repositories/place_repository.py` |
| API endpoint | `app/controllers/places_controller.py` |
| City normalization | `app/utils/city_utils.py` |
| Unit tests | `tests/test_place_search_service.py` |

## 🧪 Testing

### Run All Tests
```bash
cd backend
python tests/test_place_search_service.py
```

### Run with Pytest
```bash
pytest backend/tests/test_place_search_service.py -v
```

### Expected Output
```
✓ City normalization tests passed
✓ Staleness detection tests passed
✓ Preference mapping tests passed
✓ Scoring calculation tests passed
✓ Price level scoring tests passed
✓ Response format tests passed
✓ ALL TESTS PASSED
```

## 🐛 Troubleshooting

### No Results?
1. Check city name spelling
2. Verify Google Places API key is set (`GOOGLE_PLACES_API_KEY` in `.env`)
3. Check database has place data for that city

### Scoring Seems Off?
1. Ensure preferences exactly match category names
2. Check place ratings and review counts aren't zero
3. Verify price_level is 1-4 if specified

### Server Won't Start?
1. Check Python version (3.8+)
2. Verify all dependencies: `pip install -r requirements.txt`
3. Check database connection in `.env`

### Getting Rate Limited?
- Google Places API has quotas
- Check `GOOGLE_PLACES_API_KEY` has sufficient quota
- Wait a moment and try again

## 📖 Full Documentation

For more details, see:
- **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** - Complete overview
- **[PLACE_SEARCH_IMPLEMENTATION.md](PLACE_SEARCH_IMPLEMENTATION.md)** - Technical details
- **[FRONTEND_INTEGRATION_GUIDE.md](FRONTEND_INTEGRATION_GUIDE.md)** - Frontend examples
- **[VERIFICATION_CHECKLIST.md](VERIFICATION_CHECKLIST.md)** - Testing guide

## 🚀 Integration Steps

### For Frontend Developers

1. **Call the endpoint:**
   ```javascript
   const response = await fetch(
     '/api/v1/places/search-with-caching?city=Manila&preferences=Beaches'
   );
   const data = await response.json();
   ```

2. **Display results:**
   - Show loading spinner while fetching
   - Display all results (sorted by score)
   - Use photoUrl for images
   - Format score as percentage (score × 100)

3. **See FRONTEND_INTEGRATION_GUIDE.md for:**
   - React component examples
   - PlaceCard component code
   - Error handling patterns
   - Performance tips

### For Backend Developers

1. **Database:**
   - Ensure `places` table exists (auto-created by migrations)
   - Check indexes on `city` and `googleplaceid` columns

2. **Environment:**
   - Set `GOOGLE_PLACES_API_KEY` in `.env`
   - Verify database connection string

3. **Testing:**
   - Run unit tests: `python tests/test_place_search_service.py`
   - Run verification tests: See VERIFICATION_CHECKLIST.md

## 💡 Key Concepts

### City Normalization
All city names are automatically converted to lowercase with whitespace stripped:
- "Manila" → "manila"
- "Iloilo City" → "iloilo city"
- "  CEBU  " → "cebu"

### Staleness Threshold
Cache is considered "stale" when **>50% of places are older than 30 days**

### Preference Mapping
User preferences like "Beaches" are automatically mapped to Google Place types:
- "Beaches" → beach, tourist_attraction, park, campground
- "Food Trip" → restaurant, cafe, bar
- etc.

### Soft Delete
Old places aren't permanently deleted, just marked as inactive:
- Preserves history
- Allows recovery if needed
- Data never lost

## ✅ Success Checklist

- [ ] Backend starts without errors
- [ ] Unit tests all pass
- [ ] Basic city search works
- [ ] Preferences filter works
- [ ] Results are ranked by score
- [ ] Photos load successfully
- [ ] Response includes all required fields
- [ ] Frontend can display results

## 📞 Support

**Something not working?**

1. Check backend logs for errors
2. Verify environment variables are set
3. Run unit tests to isolate issue
4. Check VERIFICATION_CHECKLIST.md for specific tests
5. Review PLACE_SEARCH_IMPLEMENTATION.md for architecture

**Still stuck?**

- Check database connection
- Verify Google API key is valid
- Check API quota isn't exceeded
- Review error messages carefully

---

## Next Steps

1. **Start the backend** (above)
2. **Run the tests** to verify everything works
3. **Make sample requests** to understand the data
4. **Build the frontend** using FRONTEND_INTEGRATION_GUIDE.md
5. **Deploy** when ready

Happy building! 🚀
