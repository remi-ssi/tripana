import { searchPlaces } from '../services/placeSearchService'

// Search for city suggestions (Philippines only) via Mapbox
export const getCitySuggestions = async (query) => {
  const results = await searchPlaces(query, { types: 'place,locality', limit: 5 })
  return results.map((r) => ({ name: r.fullAddress, coordinates: r.coordinates }))
}

// Search for place/hotel suggestions via Mapbox Geocoding
export const getPlaceSuggestions = async (query, options) => {
  return await searchPlaces(query, options)
}