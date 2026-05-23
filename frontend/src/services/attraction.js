// Search attractions through backend API (keeps Google Places API key secure)
import { apiClient } from "../api/apiClient.js";

/**
 * Search for attractions using Google Places API
 * The API key is kept secure on the backend - never exposed to the frontend
 * 
 * @param {string} query - Search query (e.g., "restaurants", "museums")
 * @param {number} latitude - Optional latitude for location bias
 * @param {number} longitude - Optional longitude for location bias
 * @param {number} radius - Search radius in meters (default: 5000)
 * @param {number} limit - Maximum results to return (default: 20)
 * @returns {Promise<Array>} Array of attraction objects
 */
export async function searchAttractions({
  query,
  latitude = null,
  longitude = null,
  radius = 5000,
  limit = 20,
}) {
  try {
    if (!query || query.trim().length < 2) {
      throw new Error("Search query must be at least 2 characters");
    }

    // Build query parameters
    const params = new URLSearchParams({
      q: query.trim(),
      radius: radius.toString(),
      limit: limit.toString(),
    });

    // Add location bias if coordinates are provided
    if (latitude !== null && longitude !== null) {
      params.append("lat", latitude.toString());
      params.append("lng", longitude.toString());
    }

    // Call backend endpoint (API key is kept server-side, secure)
    const response = await apiClient.get(
      `/places/attractions/search?${params.toString()}`
    );

    return response.data.results || [];
  } catch (error) {
    console.error("Error searching attractions:", error);
    throw error;
  }
}

/**
 * Get detailed information about a specific attraction
 * 
 * @param {string} placeId - Google Place ID
 * @returns {Promise<Object>} Detailed attraction information
 */
export async function getAttractionDetails(placeId) {
  try {
    if (!placeId || placeId.trim().length === 0) {
      throw new Error("Place ID is required");
    }

    // Call backend endpoint
    const response = await apiClient.get(
      `/places/attractions/details/${placeId}`
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching attraction details:", error);
    throw error;
  }
}

/**
 * Format attraction data for display
 * 
 * @param {Object} attraction - Attraction object from API
 * @returns {Object} Formatted attraction object
 */
export function formatAttractionData(attraction) {
  return {
    id: attraction.id,
    name: attraction.name,
    address: attraction.address,
    coordinates: attraction.coordinates,
    rating: attraction.rating,
    reviewCount: attraction.user_ratings_total,
    types: attraction.types,
    isOpen: attraction.opening_hours,
    photos: attraction.photos,
    website: attraction.website,
    priceLevel: attraction.price_level,
  };
}
