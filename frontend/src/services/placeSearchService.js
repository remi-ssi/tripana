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