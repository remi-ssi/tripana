import { searchPlaces, retrievePlace, reverseGeocode } from '../services/placeSearchService'

// Human-readable labels for Mapbox place types
const PLACE_TYPE_LABELS = {
  place:    'City',
  locality: 'Municipality',
  district: 'Province',
  region:   'Region',
}

// Search for city/municipality/region suggestions (Philippines only) via Mapbox
export const getCitySuggestions = async (query) => {
  const results = await searchPlaces(query, {
    types: 'place,locality,district,region',
    limit: 7,
  })
  return results.map((r) => ({
    name: r.fullAddress || r.name,
    shortName: r.name,
    coordinates: r.coordinates,
    typeLabel: PLACE_TYPE_LABELS[r.placeType] || '',
  }))
}

// Search for place/hotel suggestions via Mapbox Search Box
export const getPlaceSuggestions = async (query, options) => {
  return await searchPlaces(query, options)
}

// Retrieve full place details (with coordinates) by mapbox_id
export const getPlaceDetails = async (mapboxId) => {
  return await retrievePlace(mapboxId)
}

// Reverse geocode: coordinates → place name/address
export const reverseGeocodePlace = async (lng, lat) => {
  return await reverseGeocode(lng, lat)
}