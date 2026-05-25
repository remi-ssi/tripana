// for place searching via mapbox (proxied through backend)
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

/**
 * Search for places via backend proxy (Mapbox Search Box suggest)
 */
export async function searchPlaces(query, options = {}) {
  const { country = 'ph', limit = 5, types = 'poi' } = options

  if (!query || query.trim().length < 2) return []

  const params = new URLSearchParams({
    q: query.trim(),
    country,
    limit: String(limit),
    types: types,
  })

  const response = await fetch(`${API_BASE}/api/v1/places/search?${params}`, {
    credentials: 'include',
  })

  if (!response.ok) throw new Error('Failed to search places')
  return await response.json()
}

/**
 * Retrieve full place details (with coordinates) for a given mapbox_id
 */
export async function retrievePlace(mapboxId) {
  const response = await fetch(
    `${API_BASE}/api/v1/places/retrieve/${encodeURIComponent(mapboxId)}`,
    { credentials: 'include' }
  )
  if (!response.ok) throw new Error('Failed to retrieve place details')
  return await response.json()
}

/**
 * Reverse geocode: coordinates → place name / address
 */
export async function reverseGeocode(lng, lat) {
  const params = new URLSearchParams({ lng: String(lng), lat: String(lat) })
  const response = await fetch(`${API_BASE}/api/v1/places/reverse?${params}`, {
    credentials: 'include',
  })
  if (!response.ok) throw new Error('Reverse geocoding failed')
  return await response.json()
}

/**
 * Fetch recommended attractions based on trip preferences and budget
 * Handles API call, formatting, and error handling
 * @param {Object} params - Trip parameters
 * @param {string} params.city - City/location name
 * @param {string[]} params.preferences - User preference tags
 * @param {string} params.budget - Budget tier (budget-friendly, balanced, luxury)
 * @returns {Promise<Array>} Formatted attractions array
 */
export async function fetchRecommendedAttractions({ city, preferences, budget }) {
  if (!city || city.trim().length === 0) {
    throw new Error('Location city is required')
  }

  if (!preferences || preferences.length === 0) {
    throw new Error('At least one preference is required')
  }

  if (!budget) {
    throw new Error('Budget is required')
  }

  const { getRecommendedPlaces } = await import('./attraction.js')
  const { formatTypeTag } = await import('../utils/helpers.js')

  // Fetch attractions from API
  const recommendedAttractions = await getRecommendedPlaces({
    locationCity: city,
    userPreferences: preferences,
    budget,
  })

  if (!recommendedAttractions || recommendedAttractions.length === 0) {
    throw new Error('No attractions found matching your preferences. Try adjusting your filters.')
  }

  // Format API response for UI display
  const formattedAttractions = recommendedAttractions.map((place, index) => ({
    id: place.id || `place_${index}`,
    name: place.name || 'Unknown Place',
    description: place.address || 'No description available',
    tags: place.types ? place.types.slice(0, 2).map(t => formatTypeTag(t)) : ['Attraction'],
    rating: place.rating || 0,
    reviews: place.reviews || 0,
    duration: '2-3 hours',
    image:
      place.photos && place.photos.length > 0
        ? place.photos[0]
        : 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=220&fit=crop',
  }))

  return formattedAttractions
}

/**
 * Fetch the Mapbox token from backend (for map rendering)
 */
export async function getMapboxToken() {
  const response = await fetch(`${API_BASE}/api/v1/places/mapbox-token`, {
    credentials: 'include',
  })
  if (!response.ok) throw new Error('Failed to get Mapbox token')
  const data = await response.json()
  return data.token
}

/**
 * Search for hotel/accommodation suggestions
 * @param {string} query - Search query
 * @returns {Promise<Array>} List of place suggestions
 */
export async function searchHotels(query) {
  const { getPlaceSuggestions } = await import('../api/places_api')
  
  if (!query || query.trim().length < 2) {
    return []
  }

  try {
    const results = await getPlaceSuggestions(query)
    return results || []
  } catch (err) {
    console.error('Hotel search failed:', err)
    return []
  }
}

/**
 * Get detailed coordinates for a hotel/place
 * @param {string} placeId - Google Place ID
 * @returns {Promise<Object>} Place details with coordinates
 */
export async function getHotelCoordinates(placeId) {
  const { getPlaceDetails } = await import('../api/places_api')
  
  try {
    const details = await getPlaceDetails(placeId)
    return details
  } catch (err) {
    console.error('Failed to retrieve place details:', err)
    return null
  }
}
