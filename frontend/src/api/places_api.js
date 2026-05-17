import { searchPlaces, retrievePlace } from '../services/placeSearchService'

// Search for city suggestions (Philippines only) via Mapbox
export const getCitySuggestions = async (query) => {
  const results = await searchPlaces(query, { types: 'place,locality', limit: 5 })
  return results.map((r) => ({ name: r.fullAddress || r.name, coordinates: r.coordinates }))
}

// Search for place/hotel suggestions via Mapbox Search Box
export const getPlaceSuggestions = async (query, options) => {
  return await searchPlaces(query, options)
}

// Retrieve full place details (with coordinates) by mapbox_id
export const getPlaceDetails = async (mapboxId) => {
  return await retrievePlace(mapboxId)
}