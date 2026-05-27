#Handles searching local database first, then falling back to Google API
#Implements SAW scoring system and automatic place caching

from typing import List, Optional, Dict
import logging
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.place_repository import PlaceRepository
from app.services.google_places_service import search_attractions as search_google_attractions
from app.services.google_places_service import get_place_details

logger = logging.getLogger(__name__)

# Scoring weights — must sum to 1.0
# Relevance(0.35), Rating(0.30), Popularity(0.25), Price Level(0.10)
SCORING_WEIGHTS = {
    "WEIGHT_RELEVANCE": 0.35,
    "WEIGHT_RATING": 0.30,
    "WEIGHT_POPULARITY": 0.25,
    "WEIGHT_PRICE_LEVEL": 0.10,
    "RATING_MIN": 1,
    "RATING_MAX": 5,
    "POPULARITY_LOG_MAX": 50000,
    "MIN_RATING_THRESHOLD": 3,
    "PRICE_LEVEL_MAX": 4,
}

# Budget to price level mapping
BUDGET_TO_PRICE_LEVEL = {
    "budget-friendly": [1, 2],
    "balanced": [2, 3, 4],
    "luxury": [3, 4],
}

# Preference to keywords mapping
PREFERENCE_TO_KEYWORDS = {
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
}

# Note: This service is designed to be used by the API endpoint handler, which will pass in the database session and user query parameters. The service will handle all logic for searching the local database first, then falling back to Google API if needed, and scoring the results before returning them.
class LocalAttractionSearchService:
    #Service for searching attractions with local database first, then Google API."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.place_repo = PlaceRepository(db)
    
    # Main method to search attractions based on user query parameters.
    async def search_attractions(
        self,
        location_city: str,
        user_preferences: List[str],
        budget: str,
        latitude: Optional[float] = None,
        longitude: Optional[float] = None,
        radius: int = 10000,
        limit: int = 30,
    ) -> List[Dict]:
       # Search for attractions based on user query parameters, with local database caching and Google API fallback.
        try:
            if not location_city or location_city.strip() == "":
                raise ValueError("Location city is required")
            
            if not user_preferences or len(user_preferences) == 0:
                raise ValueError("At least one preference is required")
            
            if not budget:
                raise ValueError("Budget is required")
            
            # Step 1: Try local database search
            logger.info(f"Searching local database for {location_city} with preferences: {user_preferences}")
            local_results = await self._search_local_database(
                location_city, 
                user_preferences
            )
            
            if local_results and len(local_results) > 0:
                logger.info(f"Found {len(local_results)} local results")
                scored_results = self._score_places(local_results, user_preferences, budget)
                return self._format_results(scored_results[:limit])
            
            # Step 2: If no local results, search Google API
            logger.info(f"No local results found. Searching Google API...")
            google_results = await self._search_google_api(
                location_city,
                user_preferences,
                latitude,
                longitude,
                radius,
                50  # Fetch 50 places to get top 30 after scoring
            )
            
            if not google_results:
                logger.warning(f"No results from Google API for {location_city}")
                return []
            
            # Step 3: Save to database with deduplication
            logger.info(f"Saving {len(google_results)} results to database...")
            await self._save_places_to_database(location_city, google_results)
            
            # Step 4: Score and return results
            scored_results = self._score_places(google_results, user_preferences, budget)
            return self._format_results(scored_results[:limit])
        
        except Exception as e:
            logger.error(f"Error in search_attractions: {str(e)}", exc_info=True)
            raise
    
    # Internal method to search local database with filtering logic.
    async def _search_local_database(
        self,
        city: str,
        user_preferences: List[str],
    ) -> List[Dict]:
        # Search local database for places matching the city and user preferences.
        try:
            # Use the repository's city and preference filtering
            places = await self.place_repo.search_by_city_and_preferences(
                city,
                user_preferences,
                PREFERENCE_TO_KEYWORDS
            )
            
            # Convert Place ORM objects to dictionaries
            results = []
            for place in places:
                results.append({
                    "id": place.googleplaceid,
                    "name": place.destination,
                    "address": place.address,
                    "coordinates": {
                        "lat": place.latitude,
                        "lng": place.longitude,
                    },
                    "rating": place.rating,
                    "user_ratings_total": place.userratinqtotal,
                    "opening_hours": place.openinghours,
                    "photos": place.photos,
                    "website": place.website,
                    "price_level": place.pricelevel,
                })
            
            return results
        except Exception as e:
            logger.error(f"Error searching local database: {str(e)}", exc_info=True)
            return []
    
    # Internal method to search Google API with optimized queries based on user preferences.
    async def _search_google_api(
        self,
        location_city: str,
        user_preferences: List[str],
        latitude: Optional[float],
        longitude: Optional[float],
        radius: int,
        limit: int,
    ) -> List[Dict]:
        #Search Google Places API.
        try:
            # Build targeted search queries from user preferences
            search_queries = self._build_search_queries(location_city, user_preferences)
            
            all_results = []
            for query in search_queries:
                search_params = {
                    "query": query,
                    "radius": radius,
                    "limit": limit,
                }
                
                if latitude is not None and longitude is not None:
                    search_params["location"] = (latitude, longitude)
                
                results = await search_google_attractions(**search_params)
                all_results.extend(results)
            
            # Remove duplicates by place ID
            unique_results = {}
            for place in all_results:
                place_id = place.get("id")
                if place_id and place_id not in unique_results:
                    unique_results[place_id] = place
            
            return list(unique_results.values())
        except Exception as e:
            logger.error(f"Error searching Google API: {str(e)}", exc_info=True)
            return []
    
    # Internal method to save places to database with deduplication and error handling.
    async def _save_places_to_database(
        self,
        location_city: str,
        places: List[Dict],
    ) -> int:
        # Save places to database with deduplication. Returns the number of new places saved.
        saved_count = 0
        
        for place in places:
            try:
                google_place_id = place.get("id")
                
                # Check if already exists (deduplication)
                try:
                    if await self.place_repo.exists_by_google_place_id(google_place_id):
                        logger.debug(f"Place {google_place_id} already exists, skipping")
                        continue
                except Exception as e:
                    logger.warning(f"Error checking place existence {google_place_id}: {str(e)}")
                    await self.db.rollback()
                    continue
                
                # Create new place record
                try:
                    await self.place_repo.create(
                        google_place_id=google_place_id,
                        name=place.get("name", ""),
                        address=place.get("address", ""),
                        city=location_city,
                        latitude=place.get("coordinates", {}).get("lat", 0.0),
                        longitude=place.get("coordinates", {}).get("lng", 0.0),
                        rating=place.get("rating"),
                        user_ratings_total=place.get("user_ratings_total"),
                        types=place.get("types", []),
                        opening_hours=place.get("opening_hours"),
                        website=place.get("website"),
                        price_level=place.get("price_level"),
                        photos=place.get("photos"),
                    )
                    await self.db.commit()
                    saved_count += 1
                    logger.debug(f"Saved place: {place.get('name')} ({google_place_id})")
                except Exception as e:
                    logger.warning(f"Failed to save place {google_place_id}: {str(e)}")
                    await self.db.rollback()
                    continue
                    
            except Exception as e:
                logger.error(f"Unexpected error saving place: {str(e)}")
                await self.db.rollback()
                continue
        
        logger.info(f"Successfully saved {saved_count} new places to database")
        return saved_count
    
    # Internal method to build optimized search queries based on user preferences.
    def _build_search_queries(self, city: str, user_preferences: List[str]) -> List[str]:
        # Combines preferences into fewer queries to maximize relevance while minimizing API calls.
        if len(user_preferences) <= 2:
            keywords = self._extract_and_combine_keywords(user_preferences)
            return [f"{' '.join(keywords[:4])} in {city}"]
        
        # For 3-4 preferences, split into two queries
        if len(user_preferences) <= 4:
            mid = (len(user_preferences) + 1) // 2
            keywords1 = self._extract_and_combine_keywords(user_preferences[:mid])
            keywords2 = self._extract_and_combine_keywords(user_preferences[mid:])
            return [
                f"{' '.join(keywords1[:3])} in {city}",
                f"{' '.join(keywords2[:3])} in {city}",
            ]
        
        # Split into thirds
        third = (len(user_preferences) + 2) // 3
        keywords1 = self._extract_and_combine_keywords(user_preferences[:third])
        keywords2 = self._extract_and_combine_keywords(user_preferences[third:2*third])
        keywords3 = self._extract_and_combine_keywords(user_preferences[2*third:])
        return [
            f"{' '.join(keywords1[:3])} in {city}",
            f"{' '.join(keywords2[:3])} in {city}",
            f"{' '.join(keywords3[:3])} in {city}",
        ]
    
    # Internal method to extract and combine keywords from user preferences for search queries.
    def _extract_and_combine_keywords(self, preferences: List[str]) -> List[str]:
        """Extract and combine keywords from preferences."""
        keyword_set = set()
        for pref in preferences:
            keywords = PREFERENCE_TO_KEYWORDS.get(pref, [pref.lower()])
            keyword_set.update(keywords)
        return list(keyword_set)
    
    # Internal method to score places using SAW scoring system with budget filtering.
    def _score_places(self, places: List[Dict], user_preferences: List[str], budget: str) -> List[Dict]:
        """Score places using SAW (Simple Additive Weighting) scoring system with budget filter."""
        allowed_price_levels = BUDGET_TO_PRICE_LEVEL.get(budget, [1, 2, 3, 4])
        scored_places = []
        
        for place in places:
            # Filter by price level if available
            price_level = place.get("price_level")
            if price_level and price_level not in allowed_price_levels:
                continue
                
            score = self._calculate_place_score(place, user_preferences)
            if score > 0:
                scored_places.append({
                    **place,
                    "score": score,
                })
        
        # Filter by minimum rating threshold (unless we have few results)
        filtered = [p for p in scored_places if p.get("rating", 0) >= SCORING_WEIGHTS["MIN_RATING_THRESHOLD"]]
        if len(filtered) == 0:
            filtered = scored_places  # Return all if none meet threshold
        
        # Sort by score descending
        return sorted(filtered, key=lambda x: x["score"], reverse=True)
    
    # Internal method to calculate SAW score for a place based on relevance, rating, popularity, and price level.
    def _calculate_place_score(self, place: Dict, user_preferences: List[str]) -> float:
        #Calculate SAW score for a place:
        #Score = (0.35 × RelevanceScore) + (0.30 × RatingScore) + (0.25 × PopularityScore) + (0.10 × PriceLevelScore)
        
        # Rating score (30%)
        rating = place.get("rating") or 0
        rating_score = (
            ((rating - SCORING_WEIGHTS["RATING_MIN"]) / 
             (SCORING_WEIGHTS["RATING_MAX"] - SCORING_WEIGHTS["RATING_MIN"])) * 100
            if rating > 0 else 0
        )
        
        # Popularity score (25%)
        review_count = place.get("user_ratings_total") or 0
        popularity_score = (
            min(((__import__('math').log10(review_count) / 
                  __import__('math').log10(SCORING_WEIGHTS["POPULARITY_LOG_MAX"])) * 100), 100)
            if review_count > 0 else 0
        )
        
        # Relevance score (35%)
        matched_prefs = self._count_preference_matches(place, user_preferences)
        relevance_score = (matched_prefs / len(user_preferences) * 100) if user_preferences else 0
        
        if relevance_score == 0:
            return 0
        
        # Price level score (10%) — normalized inversely (higher price = lower score)
        price_level = place.get("price_level") or 2  # Default to middle price level
        price_level_score = ((SCORING_WEIGHTS["PRICE_LEVEL_MAX"] - price_level + 1) / SCORING_WEIGHTS["PRICE_LEVEL_MAX"]) * 100
        
        return (
            SCORING_WEIGHTS["WEIGHT_RELEVANCE"] * relevance_score +
            SCORING_WEIGHTS["WEIGHT_RATING"] * rating_score +
            SCORING_WEIGHTS["WEIGHT_POPULARITY"] * popularity_score +
            SCORING_WEIGHTS["WEIGHT_PRICE_LEVEL"] * price_level_score
        )
    
    # Internal method to count how many user preferences match the place's Google types for relevance scoring.
    def _count_preference_matches(self, place: Dict, user_preferences: List[str]) -> int:
        """Count how many user preferences match the place's Google types."""
        place_types = [t.lower() for t in (place.get("types") or [])]
        match_count = 0
        
        for pref in user_preferences:
            pref_keywords = PREFERENCE_TO_KEYWORDS.get(pref, [])
            has_match = any(
                keyword in ptype
                for keyword in pref_keywords
                for ptype in place_types
            )
            if has_match:
                match_count += 1
        
        return match_count
    
    # Internal method to format scored places for API response.
    def _format_results(self, scored_places: List[Dict]) -> List[Dict]:
        """Format results for API response."""
        return [
            {
                "id": place.get("id"),
                "name": place.get("name"),
                "address": place.get("address"),
                "coordinates": place.get("coordinates"),
                "rating": place.get("rating"),
                "reviews": place.get("user_ratings_total"),
                "types": place.get("types"),
                "opening_hours": place.get("opening_hours"),
                "photos": place.get("photos"),
                "website": place.get("website"),
                "price_level": place.get("price_level"),
                "score": place.get("score"),
            }
            for place in scored_places
        ]
