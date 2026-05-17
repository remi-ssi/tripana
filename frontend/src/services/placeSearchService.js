// for place searching via mapbox (proxied through backend)
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

/**
 * Search for places via backend proxy (Mapbox Geocoding)
 * @param {string} query - Search text
 * @param {object} options - Search options
 * @returns {Promise<Array>} Array of place results
 */
export async function searchPlaces(query, options = {}) {
  const { country = 'ph', limit = 5, types = 'poi,address,place' } = options

  if (!query || query.trim().length < 2) return []

  const params = new URLSearchParams({
    q: query.trim(),
    country,
    limit: String(limit),
    types,
  })

  const response = await fetch(`${API_BASE}/api/v1/places/search?${params}`, {
    credentials: 'include',
  })

  if (!response.ok) throw new Error('Failed to search places')

  return await response.json()
}

/**
 * Fetch the Mapbox token from backend (for map rendering)
 * @returns {Promise<string>} Mapbox access token
 */
export async function getMapboxToken() {
  const response = await fetch(`${API_BASE}/api/v1/places/mapbox-token`, {
    credentials: 'include',
  })

  if (!response.ok) throw new Error('Failed to get Mapbox token')

  const data = await response.json()
  return data.token
}