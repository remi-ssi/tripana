# Google Places API Integration - Smart Recommendation System

## Overview

This system implements an intelligent recommendation engine for attractions based on user preferences and trip details. It minimizes API calls to prevent unexpected charges on pay-as-you-go plans.

## Architecture

### 📱 Frontend (`attraction.js`)

#### Core Function: `getRecommendedPlaces()`
```javascript
const places = await getRecommendedPlaces({
  locationCity: "Bangkok",
  userPreferences: ["Food Trip", "Nightlife", "Shopping"],
  latitude: 13.7563,  // Optional
  longitude: 100.5018 // Optional
});
```

**Algorithm Flow:**
1. **Input Validation** - Checks city and preferences are provided
2. **Preference Mapping** - Maps user interests to search keywords
3. **Single API Call** - Makes ONE optimized backend call with combined search query
4. **Scoring System** - Ranks results by multiple factors
5. **Filtering** - Removes low-rated places (< 3.5 stars)
6. **Output** - Returns top 20 sorted by score

### 🎯 Scoring Algorithm

Each place receives a score based on:

```
Score = (Rating × 20) + ReviewBoost + PreferenceMatchBoost

Where:
- Rating × 20: Base score (max 100 points)
- ReviewBoost: 
  - 1,000-5,000 reviews: +50 points
  - 5,000+ reviews: +100 points
- PreferenceMatchBoost: +25 points per matching preference

Max Score: ~150+ points
```

**Example:**
- Place A: 4.8 rating, 8,000 reviews, 2 preference matches
  - Score = (4.8 × 20) + 100 + 50 = 196 points ✅ Ranked high

- Place B: 3.6 rating, 500 reviews, 1 preference match
  - Score = (3.6 × 20) + 0 + 25 = 97 points ✅ Ranked lower

### 📍 Preference to Keywords Mapping

```javascript
PREFERENCE_TO_KEYWORDS = {
  "Beaches": ["beach", "resort", "swimming"],
  "Food Trip": ["restaurant", "cafe", "food court"],
  "Nightlife": ["bar", "club", "lounge"],
  "Shopping": ["shopping_mall", "market", "boutique"],
  "Water Activities": ["water_sport", "aquarium", "diving"],
  "Hiking": ["hiking_trail", "park", "mountain"],
  // ... more preferences
}
```

## Backend Integration

### API Endpoints

#### 1. Search Attractions
```
GET /api/v1/places/attractions/search
?q=restaurants%20in%20Bangkok
&lat=13.7563
&lng=100.5018
&radius=10000
&limit=50
```

**Response:**
```json
{
  "results": [
    {
      "id": "place_id",
      "name": "Restaurant Name",
      "address": "123 Main St",
      "coordinates": { "lat": 13.7563, "lng": 100.5018 },
      "rating": 4.8,
      "user_ratings_total": 1250,
      "types": ["restaurant", "food"],
      "photos": ["photo_url"],
      "opening_hours": true,
      "website": "https://...",
      "price_level": 2
    }
  ]
}
```

#### 2. API Usage Quota
```
GET /api/v1/places/attractions/usage
```

**Response:**
```json
{
  "month": "2026-05",
  "api_requests": {
    "used": 8000,
    "remaining": 2000,
    "limit": 10000,
    "percentage": 80.0,
    "status": "BLOCKED"
  }
}
```

## Frontend Integration

### AttractionsPage.jsx

The page automatically:
1. **Fetches recommendations** on mount using trip context data
2. **Shows loading state** while fetching
3. **Displays quota warnings** if usage ≥ 80%
4. **Formats API data** to match existing UI design
5. **Falls back** to sample data if API fails

```javascript
// Usage in components
const attractions = await getRecommendedPlaces({
  locationCity: formData.city,
  userPreferences: formData.interests
});
```

## API Cost Optimization

### ✅ What We Do Right

- **Single API Call** - One search query instead of N queries
- **Fetch 50, Return 20** - Get enough results to score, but return only top 20
- **Quota Blocking at 80%** - Prevents accidental overspend
- **Server-side API Key** - Never exposed in frontend

### Strategy to Minimize Calls

1. **Combine Preferences** - Map multiple interests to one search query
   - Instead of: "restaurants" + "cafes" + "food courts" (3 calls)
   - Use: "restaurants" (1 call)

2. **Location Bias Only** - Use radius parameter instead of multiple queries
   - Broader search = fewer calls needed

3. **Fetch Once, Score Multiple Times** - Cache results on client side
   - Don't refetch if filtering/sorting

4. **Smart Defaults** - 50 result limit provides enough variation

## Usage Example

### Frontend Component

```javascript
import { getRecommendedPlaces } from '@/services/attraction'

export default function AttractionsPage() {
  const { formData } = useTripPlan()
  
  useEffect(() => {
    const fetchAttractions = async () => {
      const recommendations = await getRecommendedPlaces({
        locationCity: formData.city,
        userPreferences: formData.interests
      })
      
      // Format and display
      setAttractions(recommendations.map(formatForDisplay))
    }
    
    fetchAttractions()
  }, [formData])
  
  // ... render UI
}
```

## Configuration

### Backend `.env`

```env
# Google Places API
GOOGLE_PLACES_API_KEY=your_key_here
GOOGLE_PLACES_MONTHLY_QUOTA=10000  # Adjust based on your plan
```

### Environment-Specific Quotas

| Plan | Monthly Limit | Recommended Daily |
|------|---------------|-------------------|
| Starter | 10,000 | ~330 |
| Small | 20,000 | ~660 |
| Medium | 50,000 | ~1,660 |
| Large | 100,000+ | 3,300+ |

## Monitoring & Logging

### Console Output

```javascript
// During recommendation fetch:
🔍 Getting recommendations for: { city: "Bangkok", preferences: [...] }
📝 Search keywords generated: ["beach", "restaurant", "nightlife", ...]
🎯 Primary search query: "beach restaurant nightlife in Bangkok"
📡 Calling API with params: { query: "...", radius: 10000, limit: 50 }
📦 API returned 47 results
✅ Scored 45 valid results
🎯 Returning top 20 recommendations

// When quota reached:
🚫 GOOGLE PLACES API BLOCKED — 8000 / 10000 (80.0%).
   Reached 80% of monthly quota. Request denied to prevent charges.
```

### UI Warnings

The page displays real-time quota warnings:
- **Yellow Warning** (60-79%): "⚠️ API quota at 75%! (7500/10000 requests)"
- **Red Alert** (≥80%): "🚫 API quota at 80%! (8000/10000 requests)"

## Best Practices

✅ **DO:**
- Batch user requests (1 call per page view)
- Use location bias to reduce API scope
- Cache results on client side
- Monitor usage weekly
- Keep API key in `.env` only

❌ **DON'T:**
- Expose API key to frontend
- Make multiple calls per preference
- Fetch without caching
- Ignore quota warnings
- Use high radius values for broad searches

## Future Enhancements

- [ ] Implement client-side caching with TTL
- [ ] Add advanced filtering (price, hours, rating)
- [ ] Support nearby place search (Phone, Distance)
- [ ] Add place photos carousel
- [ ] Implement "More Results" pagination
- [ ] Add favorites/bookmarks system
