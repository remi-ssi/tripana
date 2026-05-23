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

// SAW weights — must sum to 1.0
// Rating(0.40), Relevance(0.35), Popularity(0.25)
const SCORING_WEIGHTS = {
  WEIGHT_RATING: 0.40,
  WEIGHT_POPULARITY: 0.25,
  WEIGHT_RELEVANCE: 0.35,
  RATING_MIN: 1,
  RATING_MAX: 5,
  POPULARITY_LOG_MAX: 50000,
  MIN_RATING_THRESHOLD: 3,
};

export async function getRecommendedPlaces({
  locationCity,
  userPreferences = [],
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

    const allKeywords = extractAndCombineKeywords(userPreferences);
    const searchQueries = buildTargetedSearchQueries(locationCity, userPreferences);

    let allResults = [];
    for (const query of searchQueries) {
      const searchParams = { query, radius: 10000, limit: 40 };

      if (latitude !== null && longitude !== null) {
        searchParams.latitude = latitude;
        searchParams.longitude = longitude;
      }

      const results = await searchAttractions(searchParams);
      allResults = allResults.concat(results);
    }

    const uniqueResults = Array.from(
      new Map(allResults.map((place) => [place.id, place])).values()
    );

    const verifiedResults = verifyRelevanceByGoogleTypes(uniqueResults, userPreferences);

    const scoredResults = verifiedResults
      .map((place) => ({ ...place, score: calculatePlaceScore(place, userPreferences) }))
      .filter((place) => place.score > 0)
      .filter((place) => place.rating >= SCORING_WEIGHTS.MIN_RATING_THRESHOLD || allResults.length < 5)
      .sort((a, b) => b.score - a.score);

    return scoredResults.slice(0, 20).map(formatAttractionData);
  } catch (error) {
    console.error("Error getting recommendations:", error);
    throw error;
  }
}

// Extract keywords from preferences and combine into a unique set
function extractAndCombineKeywords(preferences) {
  const keywordSet = new Set();
  preferences.forEach((pref) => {
    const keywords = PREFERENCE_TO_KEYWORDS[pref] || [pref.toLowerCase()];
    keywords.forEach((kw) => keywordSet.add(kw));
  });
  return Array.from(keywordSet);
}

// Build search queries based on user preferences, ensuring we don't exceed Google's keyword limits
function buildTargetedSearchQueries(city, userPreferences) {
  if (userPreferences.length <= 2) {
    const keywords = extractAndCombineKeywords(userPreferences);
    return [`${keywords.slice(0, 4).join(" ")} in ${city}`];
  }

  if (userPreferences.length <= 4) {
    const mid = Math.ceil(userPreferences.length / 2);
    const keywords1 = extractAndCombineKeywords(userPreferences.slice(0, mid));
    const keywords2 = extractAndCombineKeywords(userPreferences.slice(mid));
    return [
      `${keywords1.slice(0, 3).join(" ")} in ${city}`,
      `${keywords2.slice(0, 3).join(" ")} in ${city}`,
    ];
  }

  const third = Math.ceil(userPreferences.length / 3);
  const keywords1 = extractAndCombineKeywords(userPreferences.slice(0, third));
  const keywords2 = extractAndCombineKeywords(userPreferences.slice(third, third * 2));
  const keywords3 = extractAndCombineKeywords(userPreferences.slice(third * 2));
  return [
    `${keywords1.slice(0, 3).join(" ")} in ${city}`,
    `${keywords2.slice(0, 3).join(" ")} in ${city}`,
    `${keywords3.slice(0, 3).join(" ")} in ${city}`,
  ];
}

// SAW scoring: Score = (0.40 × RatingScore) + (0.25 × PopularityScore) + (0.35 × RelevanceScore)
// RatingScore     — min-max normalization over 1–5 scale
// PopularityScore — log10 normalization (power law distribution)
// RelevanceScore  — matched preferences / total preferences
function calculatePlaceScore(place, userPreferences) {
  const rating = place.rating || 0;
  const ratingScore = rating > 0
    ? ((rating - SCORING_WEIGHTS.RATING_MIN) / (SCORING_WEIGHTS.RATING_MAX - SCORING_WEIGHTS.RATING_MIN)) * 100
    : 0;

  const reviewCount = place.user_ratings_total || 0;
  const popularityScore = reviewCount > 0
    ? Math.min((Math.log10(reviewCount) / Math.log10(SCORING_WEIGHTS.POPULARITY_LOG_MAX)) * 100, 100)
    : 0;

  const matchedPreferences = countPreferenceMatches(place, userPreferences);
  const relevanceScore = (matchedPreferences / userPreferences.length) * 100;

  if (relevanceScore === 0) return 0;

  return (
    SCORING_WEIGHTS.WEIGHT_RATING * ratingScore +
    SCORING_WEIGHTS.WEIGHT_POPULARITY * popularityScore +
    SCORING_WEIGHTS.WEIGHT_RELEVANCE * relevanceScore
  );
}

// Count how many user preferences match the place's Google types
function countPreferenceMatches(place, userPreferences) {
  const placeTypes = (place.types || []).map((t) => t.toLowerCase());
  let matchCount = 0;

  userPreferences.forEach((pref) => {
    const prefKeywords = PREFERENCE_TO_KEYWORDS[pref] || [];
    const hasMatch = prefKeywords.some((keyword) =>
      placeTypes.some((type) => type.includes(keyword))
    );
    if (hasMatch) matchCount++;
  });

  return matchCount;
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

// Verify relevance of places by checking if their Google types match the user's preferences
function verifyRelevanceByGoogleTypes(results, userPreferences) {
  return results.filter((place) => {
    const placeTypes = (place.types || []).map((t) => t.toLowerCase());
    return userPreferences.some((pref) => {
      const prefKeywords = PREFERENCE_TO_KEYWORDS[pref] || [];
      return prefKeywords.some((keyword) =>
        placeTypes.some((type) => type.includes(keyword))
      );
    });
  });
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
  };
}
