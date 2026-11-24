import { apiClient } from "../api/apiClient.js";

const PREFERENCE_TO_KEYWORDS = {
  "Beaches": ["beach", "resort", "swimming", "water sport"],
  "Water Activities": ["water sport", "aquarium", "diving", "snorkeling"],
  "Food Trip": ["restaurant", "cafe", "food court", "street food"],
  "Local Food": ["local restaurant", "market", "food stall"],
  "Hiking": ["hiking trail", "park", "mountain", "nature reserve"],
  "Shopping": ["shopping mall", "market", "boutique", "store"],
  "Nightlife": ["bar", "club", "lounge", "entertainment"],
  "Art": ["art gallery", "museum", "art museum"],
  "Historical Sites": ["historical landmark", "monument", "temple", "archaeological"],
  "Photography": ["scenic viewpoint", "landscape", "park", "monument"],
  "Wildlife": ["wildlife sanctuary", "zoo", "nature reserve", "aquarium"],
  "Camping": ["campground", "outdoor", "nature"],
  "Relaxation": ["spa", "wellness", "resort", "hot spring"],
  "Island Hopping": ["island", "ferry", "beach", "resort"],
};

/**
 * Fetch up to 50 attractions from Google Places API and save to local database.
 * This creates a local backup of attractions for faster future searches.
 * 
 * @param {string} locationCity - City to fetch attractions for
 * @param {string[]} userPreferences - User's selected preference categories
 * @returns {Promise<Object>} Statistics about the fetch operation
 */
export async function fetchAndSavePlaces({
  locationCity,
  userPreferences = [],
}) {
  try {
    if (!locationCity || locationCity.trim().length === 0) {
      throw new Error("Location city is required");
    }

    if (!userPreferences || userPreferences.length === 0) {
      throw new Error("At least one preference is required");
    }

    const params = new URLSearchParams({
      city: locationCity.trim(),
      preferences: userPreferences.join(","),
    });

    const response = await apiClient.post(
      `/api/v1/places/attractions/fetch-and-save?${params.toString()}`
    );

    return response;
  } catch (error) {
    console.error("Error fetching and saving places:", error);
    throw error;
  }
}

export async function getRecommendedPlaces({
  locationCity,
  userPreferences = [],
  budget,
  latitude = null,
  longitude = null,
}) {
  try {
    if (!locationCity || locationCity.trim().length === 0) {
      throw new Error("Location city is required");
    }

    if (!userPreferences || userPreferences.length === 0) {
      throw new Error("At least one preference is required");
    }

    if (!budget) {
      throw new Error("Budget is required");
    }

    // Call the new backend endpoint with smart search logic:
    // 1. Searches local database first (filtered by city and preference types)
    // 2. If no local results, searches Google API
    // 3. Automatically saves fetched results to database (with deduplication)
    const params = new URLSearchParams({
      city: locationCity.trim(),
      preferences: userPreferences.join(","),
      budget: budget,
      limit: "30",
    });

    if (latitude !== null && longitude !== null) {
      params.append("lat", latitude.toString());
      params.append("lng", longitude.toString());
    }

    const response = await apiClient.get(
      `/api/v1/places/attractions/recommendations?${params.toString()}`
    );

    // The backend returns { results: [...] }, so extract the results array
    const attractions = response.data?.results || response.results || [];

    // Format attractions for UI display - tags will be formatted by the page
    return attractions.map((place, index) => ({
      id: place.id || `place_${index}`,
      name: place.name || 'Unknown Place',
      description: place.address || 'No description available',
      types: place.types || [],  // Keep raw types for page to format
      rating: place.rating || 0,
      reviews: place.reviews || 0,
      duration: '2-3 hours',
      photoUrl: place.photoUrl || null,   // preserve for display
      photos: place.photos || null,       // preserve raw photos JSON
      // Store full place data for modal
      address: place.address,
      coordinates: place.coordinates,
      website: place.website,
      price_level: place.price_level,
    }));
  } catch (error) {
    console.error("Error getting recommendations:", error);
    throw error;
  }
}

// Search attractions based on query and optional location parameters
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

    const params = new URLSearchParams({
      q: query.trim(),
      radius: radius.toString(),
      limit: limit.toString(),
    });

    if (latitude !== null && longitude !== null) {
      params.append("lat", latitude.toString());
      params.append("lng", longitude.toString());
    }

    const response = await apiClient.get(`/api/v1/places/attractions/search?${params.toString()}`);
    return response.results || [];
  } catch (error) {
    console.error("Error searching attractions:", error);
    throw error;
  }
}

// Fetch detailed information for a specific attraction by its Google Place ID
export async function getAttractionDetails(placeId) {
  try {
    if (!placeId || placeId.trim().length === 0) {
      throw new Error("Place ID is required");
    }

    const response = await apiClient.get(`/api/v1/places/attractions/details/${placeId}`);
    return response;
  } catch (error) {
    console.error("Error fetching attraction details:", error);
    throw error;
  }
}

// Free text search for places/attractions in a city without preference filter
export async function freeSearchAttractions({ query, city }) {
  try {
    if (!query || query.trim().length === 0) {
      throw new Error("Search query is required");
    }
    if (!city || city.trim().length === 0) {
      throw new Error("City name is required");
    }

    const params = new URLSearchParams({
      query: query.trim(),
      city: city.trim(),
    });

    const response = await apiClient.get(`/api/v1/places/search?${params.toString()}`);
    const results = response.data?.results || response.results || [];
    
    return results;
  } catch (error) {
    console.error("Error in freeSearchAttractions:", error);
    throw error;
  }
}

// Format attraction data for frontend display
export function formatAttractionData(attraction) {
  return {
    id: attraction.id,
    name: attraction.name,
    address: attraction.address,
    coordinates: attraction.coordinates,
    rating: attraction.rating,
    reviews: attraction.user_ratings_total,
    types: attraction.types,
    opening_hours: attraction.opening_hours,
    photos: attraction.photos,
    website: attraction.website,
    price_level: attraction.price_level,
    score: attraction.score,
  };
}
