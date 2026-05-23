// Search attractions through backend API (keeps Google Places API key secure)
import { apiClient } from "../api/apiClient.js";

// ════════════════════════════════════════════════════════════════════════════════
// PREFERENCE TO SEARCH KEYWORD MAPPING
// Maps user interests/preferences to Google Places search keywords
// Minimizes API calls by grouping related preferences
// ════════════════════════════════════════════════════════════════════════════════

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

// Scoring weights for the recommendation algorithm
const SCORING_WEIGHTS = {
  BASE_RATING: 20, // rating * 20 (0-100)
  HIGH_REVIEW_BOOST: 50, // if reviews > 1000
  VERY_HIGH_REVIEW_BOOST: 100, // if reviews > 5000
  PREFERENCE_MATCH: 25, // exact type match with user preference
  REVIEW_COUNT_THRESHOLD_HIGH: 1000,
  REVIEW_COUNT_THRESHOLD_VERY_HIGH: 5000,
  MIN_RATING_THRESHOLD: 3.5, // minimum acceptable rating
};

/**
 * CORE ALGORITHM: Get recommended places based on user preferences and trip location
 * 
 * Strategy:
 * 1. Map user preferences to search keywords (groups similar interests)
 * 2. Make ONE optimized API call with primary search query
 * 3. Score results based on: rating, review count, preference matching
 * 4. Filter low-rated places (< 3.5 stars unless no results)
 * 5. Return top 20 ranked by score
 * 
 * This minimizes API calls to prevent unexpected charges on pay-as-you-go plans
 * 
 * @param {string} locationCity - City name (from trip plan)
 * @param {Array<string>} userPreferences - User's selected interests/preferences
 * @param {number} latitude - Optional latitude for location bias (unused if city is provided)
 * @param {number} longitude - Optional longitude for location bias (unused if city is provided)
 * @returns {Promise<Array>} Array of recommended places, max 20 results
 */
export async function getRecommendedPlaces({
  locationCity,
  userPreferences = [],
  latitude = null,
  longitude = null,
}) {
  try {
    // Validate inputs
    if (!locationCity || locationCity.trim().length === 0) {
      throw new Error("Location city is required");
    }

    if (!userPreferences || userPreferences.length === 0) {
      throw new Error("At least one preference is required");
    }

    console.log("🔍 Getting recommendations for:", { locationCity, userPreferences });

    // ── STEP 1: Map preferences to search keywords ──────────────────────
    const allKeywords = extractAndCombineKeywords(userPreferences);
    console.log("📝 Search keywords generated:", allKeywords);

    // ── STEP 2: Determine primary search query (most representative) ──────
    // Use the first preference as primary, add secondary keywords if space permits
    const primaryQuery = buildPrimarySearchQuery(locationCity, allKeywords);
    console.log("🎯 Primary search query:", primaryQuery);

    // ── STEP 3: Make ONE API call (minimize costs) ────────────────────────
    const searchParams = {
      query: primaryQuery,
      radius: 10000, // 10km radius for broader search
      limit: 50, // Fetch more results to filter and score
    };

    // Add location coordinates if provided
    if (latitude !== null && longitude !== null) {
      searchParams.latitude = latitude;
      searchParams.longitude = longitude;
    }

    console.log("📡 Calling API with params:", searchParams);
    const rawResults = await searchAttractions(searchParams);
    console.log(`📦 API returned ${rawResults.length} results`);

    // ── STEP 4: Score and rank results ────────────────────────────────────
    const scoredResults = rawResults
      .map((place) => ({
        ...place,
        score: calculatePlaceScore(place, userPreferences),
      }))
      .filter((place) => place.score > 0) // Keep only places that match at least one preference
      .filter((place) => place.rating >= SCORING_WEIGHTS.MIN_RATING_THRESHOLD || rawResults.length < 5) // Filter low-rated unless few results
      .sort((a, b) => b.score - a.score); // Sort by score descending

    console.log(`✅ Scored ${scoredResults.length} valid results`);

    // ── STEP 5: Return top 20 ────────────────────────────────────────────
    const topResults = scoredResults.slice(0, 20).map(formatAttractionData);

    console.log(`🎯 Returning top ${topResults.length} recommendations`);
    return topResults;
  } catch (error) {
    console.error("❌ Error getting recommendations:", error);
    throw error;
  }
}

/**
 * Extract relevant keywords from user preferences
 * Deduplicates and combines all keywords
 */
function extractAndCombineKeywords(preferences) {
  const keywordSet = new Set();

  preferences.forEach((pref) => {
    const keywords = PREFERENCE_TO_KEYWORDS[pref] || [pref.toLowerCase()];
    keywords.forEach((kw) => keywordSet.add(kw));
  });

  return Array.from(keywordSet);
}

/**
 * Build optimized search query for primary API call
 * Combines location with most relevant keywords
 */
function buildPrimarySearchQuery(city, keywords) {
  // Select top 3-4 most representative keywords to keep query concise
  const topKeywords = keywords.slice(0, 3);
  const keywordString = topKeywords.join(" ");
  return `${keywordString} in ${city}`;
}

/**
 * Calculate recommendation score for each place
 * 
 * Score = (rating * 20) + reviewBoost + preferenceMatchBoost
 * 
 * Max possible score: ~150+
 * Min acceptable score: depends on matches
 */
function calculatePlaceScore(place, userPreferences) {
  let score = 0;

  // Base score from rating (0-100)
  const baseScore = (place.rating || 0) * SCORING_WEIGHTS.BASE_RATING;
  score += baseScore;

  // Boost for review count (popularity)
  const reviewCount = place.user_ratings_total || 0;
  if (reviewCount >= SCORING_WEIGHTS.REVIEW_COUNT_THRESHOLD_VERY_HIGH) {
    score += SCORING_WEIGHTS.VERY_HIGH_REVIEW_BOOST;
  } else if (reviewCount >= SCORING_WEIGHTS.REVIEW_COUNT_THRESHOLD_HIGH) {
    score += SCORING_WEIGHTS.HIGH_REVIEW_BOOST;
  }

  // Bonus for matching user preferences
  const preferenceMatchCount = countPreferenceMatches(place, userPreferences);
  score += preferenceMatchCount * SCORING_WEIGHTS.PREFERENCE_MATCH;

  return score;
}

/**
 * Count how many user preferences match this place's types/categories
 * Returns count of matching preferences
 */
function countPreferenceMatches(place, userPreferences) {
  const placeTypes = (place.types || []).map((t) => t.toLowerCase());
  const placeKeywords = (
    place.name.toLowerCase() +
    " " +
    place.address.toLowerCase()
  ).split(" ");

  let matchCount = 0;

  userPreferences.forEach((pref) => {
    const keywords = PREFERENCE_TO_KEYWORDS[pref] || [];
    const hasMatch = keywords.some(
      (kw) =>
        placeTypes.some((t) => t.includes(kw)) ||
        placeKeywords.some((pk) => pk.includes(kw))
    );
    if (hasMatch) {
      matchCount++;
    }
  });

  return matchCount;
}

/**
 * Search for attractions using Google Places API
 * The API key is kept secure on the backend - never exposed to the frontend
 * 
 * @param {Object} params - Search parameters
 * @param {string} params.query - Search query (e.g., "restaurants in Bangkok")
 * @param {number} params.latitude - Optional latitude for location bias
 * @param {number} params.longitude - Optional longitude for location bias
 * @param {number} params.radius - Search radius in meters (default: 5000)
 * @param {number} params.limit - Maximum results to return (default: 20)
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
      `/api/v1/places/attractions/search?${params.toString()}`
    );

    return response.results || [];
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
      `/api/v1/places/attractions/details/${placeId}`
    );

    return response;
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
    reviews: attraction.user_ratings_total,
    types: attraction.types,
    opening_hours: attraction.opening_hours,
    photos: attraction.photos,
    website: attraction.website,
    price_level: attraction.price_level,
  };
}
