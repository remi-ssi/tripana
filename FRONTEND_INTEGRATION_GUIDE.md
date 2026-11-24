# Frontend Integration Guide - Place Search Results Display

## Overview

The backend now returns **all 50 ranked places** from the `/api/v1/places/search-with-caching` endpoint. This guide explains how to display these results on the frontend.

## Key Points

1. **NO PAGINATION on backend** - All results come in one response
2. **SORTED BY SCORE** - Results are already ranked highest score first (descending)
3. **LOADING STATE** - Search and ranking happens server-side, may take a few seconds
4. **NO CAPPING** - Display all results received (typically 20-50)
5. **PHOTO URLS** - Include `photoUrl` field for each place

## Response Structure

```typescript
interface PlaceSearchResponse {
  results: Place[];
  count: number;
  city: string;
  preferences: string[];
  budget: string;
}

interface Place {
  placeid: number;
  name: string;
  city: string;
  address: string;
  rating: number | null;
  score: number;  // 0-1, already ranked
  types: string[];  // Google Place types
  photos: string;  // JSON array with photo_reference
  photoUrl?: string;  // Already generated URL
  is_open_now: boolean | null;
  price_level: number | null;  // 1-4
  user_ratings_total: number | null;
  website: string | null;
  latitude: number | null;
  longitude: number | null;
  phone_number: string | null;
  opening_hours: string | null;
}
```

## Implementation Example

### React Component

```jsx
import React, { useState } from 'react';
import PlaceCard from './PlaceCard';

function PlaceSearchResults({ 
  city, 
  preferences, 
  budget,
  latitude,
  longitude 
}) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        city: city,
        ...(preferences && preferences.length > 0 && { 
          preferences: preferences.join(',') 
        }),
        ...(budget && { budget: budget }),
        ...(latitude && { lat: latitude }),
        ...(longitude && { lng: longitude }),
      });

      const response = await fetch(
        `/api/v1/places/search-with-caching?${params}`
      );

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }

      const data = await response.json();
      setResults(data.results);
    } catch (err) {
      setError(err.message);
      console.error('Error searching places:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">
            Searching for places in {city}...
          </p>
          <p className="text-sm text-gray-500">
            (Checking cache and ranking results)
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="font-semibold text-red-800">Search Failed</h3>
        <p className="text-red-700">{error}</p>
        <button 
          onClick={handleSearch}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">
          No places found for "{city}"
        </p>
        <button 
          onClick={handleSearch}
          className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
        >
          Search Again
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header with result count and filters */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">
          Results for {city}
        </h2>
        <p className="text-gray-600 mb-4">
          Found {results.length} place{results.length !== 1 ? 's' : ''} 
          {preferences && ` matching ${preferences.join(', ')}`}
        </p>
        
        {/* Score legend */}
        <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm mb-4">
          <p className="font-semibold text-blue-900 mb-2">Score Breakdown:</p>
          <ul className="text-blue-800 space-y-1">
            <li>• <strong>Relevance (35%):</strong> How well the place matches your preferences</li>
            <li>• <strong>Rating (30%):</strong> User ratings (1-5 stars)</li>
            <li>• <strong>Popularity (25%):</strong> Number of reviews (log scale)</li>
            <li>• <strong>Price Level (10%):</strong> Closeness to your budget</li>
          </ul>
        </div>
      </div>

      {/* Results grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.map((place) => (
          <PlaceCard 
            key={place.placeid} 
            place={place}
            rank={results.indexOf(place) + 1}
            totalCount={results.length}
          />
        ))}
      </div>
    </div>
  );
}

export default PlaceSearchResults;
```

### PlaceCard Component

```jsx
function PlaceCard({ place, rank, totalCount }) {
  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden">
      {/* Image */}
      <div className="relative h-48 bg-gray-200 overflow-hidden">
        {place.photoUrl ? (
          <img 
            src={place.photoUrl} 
            alt={place.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = '/placeholder-image.png';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-300">
            <span className="text-gray-500">No image</span>
          </div>
        )}
        
        {/* Rank badge */}
        <div className="absolute top-2 left-2 bg-primary text-white px-3 py-1 rounded-full text-sm font-semibold">
          #{rank}/{totalCount}
        </div>
        
        {/* Score badge */}
        <div className="absolute top-2 right-2 bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-sm font-bold">
          Score: {(place.score * 100).toFixed(1)}%
        </div>

        {/* Open now indicator */}
        {place.is_open_now !== null && (
          <div className={`absolute bottom-2 right-2 px-2 py-1 rounded text-xs font-semibold ${
            place.is_open_now 
              ? 'bg-green-500 text-white' 
              : 'bg-red-500 text-white'
          }`}>
            {place.is_open_now ? 'Open Now' : 'Closed'}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="text-lg font-bold mb-1 line-clamp-2">
          {place.name}
        </h3>

        {/* Rating */}
        {place.rating !== null && (
          <div className="flex items-center mb-2">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-lg">
                  {i < Math.round(place.rating) ? '★' : '☆'}
                </span>
              ))}
            </div>
            <span className="ml-2 text-sm text-gray-600">
              {place.rating.toFixed(1)} 
              {place.user_ratings_total && (
                <span> ({place.user_ratings_total.toLocaleString()} reviews)</span>
              )}
            </span>
          </div>
        )}

        {/* Address */}
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          📍 {place.address}
        </p>

        {/* Types */}
        {place.types && place.types.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1">
            {place.types.slice(0, 3).map((type, i) => (
              <span 
                key={i} 
                className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
              >
                {type.replace(/_/g, ' ')}
              </span>
            ))}
            {place.types.length > 3 && (
              <span className="text-xs text-gray-500 px-2 py-1">
                +{place.types.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Details */}
        <div className="grid grid-cols-2 gap-2 text-sm mb-3">
          {place.price_level && (
            <div className="flex items-center">
              <span className="text-lg">💰</span>
              <span className="ml-1 text-gray-600">
                {'$'.repeat(place.price_level)}
              </span>
            </div>
          )}
          {place.website && (
            <div>
              <a 
                href={place.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline text-xs"
              >
                Visit Website →
              </a>
            </div>
          )}
        </div>

        {/* Phone & Hours */}
        {place.phone_number && (
          <p className="text-sm text-gray-600 mb-2">
            📞 {place.phone_number}
          </p>
        )}
        {place.opening_hours && (
          <p className="text-xs text-gray-500 mb-3">
            ⏰ {place.opening_hours}
          </p>
        )}

        {/* Action buttons */}
        <div className="flex gap-2">
          <button className="flex-1 px-3 py-2 bg-primary text-white rounded text-sm hover:bg-primary-dark">
            View Details
          </button>
          {place.latitude && place.longitude && (
            <button className="flex-1 px-3 py-2 border border-primary text-primary rounded text-sm hover:bg-primary hover:text-white">
              Map
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default PlaceCard;
```

## Key Display Features

### 1. Loading State
- Show spinner while results are being fetched and ranked
- Display message: "Searching for places in [city]... (Checking cache and ranking results)"
- No results shown until complete

### 2. Result Count
- Display total number of places found
- Show search criteria (city, preferences, budget)

### 3. Score Display
- Show score as percentage (0-100%) 
- Include score breakdown legend showing weights
- Rank badge (#X of Y places)

### 4. Photo Handling
- Use `photoUrl` if provided
- Fallback to placeholder or category-based image
- Handle image load errors gracefully

### 5. Result Organization
- Display all results (no pagination)
- Sort already done by backend (descending by score)
- Use grid layout (1-3 columns depending on screen size)

### 6. Empty State
- Show appropriate message if no results found
- Provide option to search again or modify criteria

## Performance Tips

1. **Lazy load images** - Use `loading="lazy"` on img tags
2. **Virtualization** - If displaying 50+ results, use `react-window` or similar
3. **Debounce search** - Prevent multiple rapid API calls
4. **Cache results** - Store search results client-side
5. **Background fetch** - Pre-fetch next city's results while user browses

## Accessibility

- Use semantic HTML (`<article>`, `<nav>`, etc.)
- Add `alt` text to images
- Ensure color contrast meets WCAG standards
- Provide keyboard navigation through results
- Use `aria-label` for interactive elements

## Error Handling

```javascript
// Handle different error scenarios
const handleSearchError = (error, context) => {
  if (error.response?.status === 400) {
    return 'Invalid search parameters. Please check your input.';
  } else if (error.response?.status === 429) {
    return 'Rate limit exceeded. Please wait a moment and try again.';
  } else if (error.response?.status === 500) {
    return 'Server error. Please try again later.';
  } else {
    return `Search failed: ${error.message}`;
  }
};
```

## Testing the Frontend

1. Start backend server
2. Make test request:
   ```bash
   curl "http://localhost:8000/api/v1/places/search-with-caching?city=Manila&preferences=Food%20Trip,Shopping"
   ```
3. Verify response includes all 50 fields per place
4. Test with different cities, preferences, and filters
5. Check photo URLs are generated correctly
