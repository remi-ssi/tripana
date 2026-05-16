// Nominatim service - OpenStreetMap city/place search with Philippines filter
const NOMINATIM_API = 'https://nominatim.openstreetmap.org/search'

// Search for cities in the Philippines only
export const searchCitiesPH = async (query) => {
  if (!query || query.trim().length < 2) return []

  try {
    const params = new URLSearchParams({
      q: `${query}, Philippines`,
      countrycodes: 'ph',
      format: 'json',
      limit: 10,
    })

    const response = await fetch(`${NOMINATIM_API}?${params}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`)
    }

    const data = await response.json()

    // Map results and remove duplicates
    const seenNames = new Set()
    return data
      .map((item) => ({
        name: item.name,
        displayName: item.display_name,
        lat: item.lat,
        lon: item.lon,
      }))
      .filter((place) => {
        const nameLower = place.name.toLowerCase().trim()
        if (seenNames.has(nameLower)) {
          return false
        }
        seenNames.add(nameLower)
        return true
      })
  } catch (error) {
    console.error('Error searching cities:', error)
    return []
  }
}
