// Search attractions through backend API (keeps Google Places API key secure)
import { apiClient } from "../api/apiClient.js";

// PREFERENCE TO SEARCH KEYWORD MAPPING
// Maps user interests/preferences to Google Places search keywords
// Minimizes API calls by grouping related preferences

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

    // ── STEP 2: Build targeted search queries (grouped for relevance) ────
    // Instead of combining all keywords into one vague query,
    // split into 2-3 targeted searches for better relevance
    const searchQueries = buildTargetedSearchQueries(locationCity, userPreferences);
    console.log(`🎯 Built ${searchQueries.length} targeted search queries:`, searchQueries);

    // ── STEP 3: Execute multiple targeted searches ─────────────────────── 
    let allResults = [];
    for (const query of searchQueries) {
      const searchParams = {
        query: query,
        radius: 10000,
        limit: 40, // Fetch 40 per query instead of 50 for one vague query
      };

      if (latitude !== null && longitude !== null) {
        searchParams.latitude = latitude;
        searchParams.longitude = longitude;
      }

      const results = await searchAttractions(searchParams);
      allResults = allResults.concat(results);
      console.log(`  → Query "${query}": ${results.length} results`);
    }

    // Deduplicate by place ID
    const uniqueResults = Array.from(
      new Map(allResults.map((place) => [place.id, place])).values()
    );
    console.log(`📦 Total ${allResults.length} results → ${uniqueResults.length} unique after deduplication`);

    // ── STEP 4: Verify relevance using Google Places types ──────────────
    const verifiedResults = verifyRelevanceByGoogleTypes(uniqueResults, userPreferences);
    console.log(`🏷️ ${verifiedResults.length}/${uniqueResults.length} match user preferences (by Google types)`);

    // ── STEP 5: Score and rank results ────────────────────────────────────
    const scoredResults = verifiedResults
      .map((place) => ({
        ...place,
        score: calculatePlaceScore(place, userPreferences),
      }))
      .filter((place) => place.score > 0) // Keep only places that match at least one preference
      .filter((place) => place.rating >= SCORING_WEIGHTS.MIN_RATING_THRESHOLD || allResults.length < 5) // Filter low-rated unless few results
      .sort((a, b) => b.score - a.score); // Sort by score descending

    console.log(`✅ Scored ${scoredResults.length} valid results`);

    // ── STEP 6: Return top 20 ────────────────────────────────────────────
    const topResults = scoredResults.slice(0, 20).map(formatAttractionData);

    console.log(`🎯 Returning top ${topResults.length} recommendations`);
    return topResults;
  } catch (error) {
    console.error("Error getting recommendations:", error);
    throw error;
  }
}

 //Extract relevant keywords from user preferences and Deduplicates and combines all keywords
function extractAndCombineKeywords(preferences) {
  const keywordSet = new Set();

  preferences.forEach((pref) => {
    const keywords = PREFERENCE_TO_KEYWORDS[pref] || [pref.toLowerCase()];
    keywords.forEach((kw) => keywordSet.add(kw));
  });

  return Array.from(keywordSet);
}

/**
 * Build multiple targeted search queries (2-3 queries) instead of one vague query
 * Groups user preferences into logical categories for maximum relevance
 * 
 * Strategy:
 * - 1-2 preferences: 1 query
 * - 3-4 preferences: 2 queries (split logically)
 * - 5+ preferences: 3 queries (split into groups)
 * 
 * Example: User wants [Food, Beach, Nightlife]
 * Query 1: "restaurant food cafe in Bangkok"
 * Query 2: "beach resort swimming bar nightlife in Bangkok"
 * 
 * This ensures better relevance vs combining all into one vague query
 */
function buildTargetedSearchQueries(city, userPreferences) {
  if (userPreferences.length <= 2) {
    // For 1-2 preferences, single focused query
    const keywords = extractAndCombineKeywords(userPreferences);
    const keywordString = keywords.slice(0, 4).join(" ");
    return [`${keywordString} in ${city}`];
  }

  if (userPreferences.length <= 4) {
    // For 3-4 preferences, split into 2 targeted queries
    const mid = Math.ceil(userPreferences.length / 2);
    const group1 = userPreferences.slice(0, mid);
    const group2 = userPreferences.slice(mid);

    const keywords1 = extractAndCombineKeywords(group1);
    const keywords2 = extractAndCombineKeywords(group2);

    const query1 = `${keywords1.slice(0, 3).join(" ")} in ${city}`;
    const query2 = `${keywords2.slice(0, 3).join(" ")} in ${city}`;

    return [query1, query2];
  }

  // For 5+ preferences, split into 3 targeted queries
  const third = Math.ceil(userPreferences.length / 3);
  const group1 = userPreferences.slice(0, third);
  const group2 = userPreferences.slice(third, third * 2);
  const group3 = userPreferences.slice(third * 2);

  const keywords1 = extractAndCombineKeywords(group1);
  const keywords2 = extractAndCombineKeywords(group2);
  const keywords3 = extractAndCombineKeywords(group3);

  const query1 = `${keywords1.slice(0, 3).join(" ")} in ${city}`;
  const query2 = `${keywords2.slice(0, 3).join(" ")} in ${city}`;
  const query3 = `${keywords3.slice(0, 3).join(" ")} in ${city}`;

  return [query1, query2, query3];
}

//Calculate recommendation score for each place
//Score = (rating * 20) + reviewBoost + preferenceMatchBoost
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

//Count how many user preferences match this place's GOOGLE types only
function countPreferenceMatches(place, userPreferences) {
  const placeTypes = (place.types || []).map((t) => t.toLowerCase());

  let matchCount = 0;

  userPreferences.forEach((pref) => {
    const prefKeywords = PREFERENCE_TO_KEYWORDS[pref] || [];
    
    // Check if any preference keyword matches this place's Google types
    const hasMatch = prefKeywords.some((keyword) =>
      placeTypes.some((type) => type.includes(keyword))
    );
    
    if (hasMatch) {
      matchCount++;
    }
  });

  return matchCount;
}

/**
 * Search for attractions using Google Places API
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
 * Verify that API results actually match user preferences
 * Based on Google Places' official types/categories, NOT business names
 * 
 * This is crucial for Philippine businesses with quirky names
 * Example: "Purple Monkey" with type ["bar", "night_club"] matches Nightlife preference
 * even though the name doesn't indicate what it is.
 * 
 * @param {Array} results - Raw results from Google Places API
 * @param {Array} userPreferences - User's selected preferences
 * @returns {Array} Filtered results that match user preferences by Google types
 */
function verifyRelevanceByGoogleTypes(results, userPreferences) {
  return results.filter((place) => {
    const placeTypes = (place.types || []).map((t) => t.toLowerCase());

    // Check if this place's Google types match ANY user preference
    const hasRelevantType = userPreferences.some((pref) => {
      const prefKeywords = PREFERENCE_TO_KEYWORDS[pref] || [];

      // Does this place have at least 1 type matching this preference?
      return prefKeywords.some((keyword) =>
        placeTypes.some((type) => type.includes(keyword))
      );
    });

    return hasRelevantType;
  });
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
