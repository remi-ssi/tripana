// Nominatim service - OpenStreetMap city/place search with Philippines filter
const NOMINATIM_API = 'https://nominatim.openstreetmap.org/search'

// Search for cities in the Philippines only
export const searchCitiesPH = async (query) => {
  if (!query || query.trim().length < 2) return []

  try {
    const params = new URLSearchParams({
      q: `${query}, Philippines`, // Filter to PH only
      countrycodes: 'ph', // Country code for Philippines
      format: 'json',
      limit: 8, // Limit suggestions to 8
      featuretype: 'city',
      addresstype: 'city',
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

    // Extract city names from response
    return data.map((item) => ({
      name: item.name,
      displayName: item.display_name,
      lat: item.lat,
      lon: item.lon,
    }))
  } catch (error) {
    console.error('Error searching cities:', error)
    return []
  }
}
