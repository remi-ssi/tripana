"""
Place Search Service - Implements city-based caching with staleness checking
and preference-based Google Places API queries.

Key features:
- City normalization (lowercase, strip whitespace)
- Staleness check (if >50% places older than 30 days, re-fetch)
- Preference-filtered Google Places API queries (not post-filtering)
- Multi-factor scoring system
- Soft-delete for places no longer returned by Google API
"""

from datetime import datetime, timedelta
from typing import List, Optional, Dict
import json
import logging
import math
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.place_repository import PlaceRepository
from app.repositories.types_repository import TypesRepository
from app.repositories.placetypes_repository import PlaceTypesRepository
from app.services.google_places_service import search_attractions as search_google_attractions
from app.utils.city_utils import normalize_city

logger = logging.getLogger(__name__)

# Staleness threshold: 30 days
STALENESS_DAYS = 30

# Scoring weights (must sum to 1.0)
SCORING_WEIGHTS = {
    "WEIGHT_RELEVANCE": 0.35,
    "WEIGHT_RATING": 0.30,
    "WEIGHT_POPULARITY": 0.25,
    "WEIGHT_PRICE_LEVEL": 0.10,
}

# Category to Google Place types mapping
CATEGORY_TO_GOOGLE_TYPES = {
    "Beaches": ["beach", "tourist_attraction", "park", "campground"],
    "Water Activities": ["aquarium", "park", "swimming_pool", "tourist_attraction"],
    "Food Trip": ["restaurant", "cafe", "bar"],
    "Local Food": ["restaurant", "market", "tourist_attraction"],
    "Hiking": ["park", "hiking_area", "tourist_attraction", "natural_feature"],
    "Shopping": ["shopping_mall", "supermarket", "store", "department_store"],
    "Nightlife": ["bar", "night_club", "restaurant"],
    "Art": ["art_gallery", "museum", "library"],
    "Historical Sites": ["church", "mosque", "temple", "tourist_attraction", "museum"],
    "Photography": ["park", "natural_feature", "tourist_attraction", "viewpoint"],
    "Wildlife": ["zoo", "park", "nature_preserve", "aquarium"],
    "Camping": ["campground", "park"],
    "Relaxation": ["spa", "beauty_salon", "lodging"],
    "Island Hopping": ["beach", "island", "resort", "lodging"],
}

# Price level mapping from user budget to Google API price levels (1-4)
BUDGET_TO_PRICE_LEVELS = {
    "budget-friendly": [1, 2],
    "balanced": [2, 3],
    "luxury": [3, 4],
}


class PlaceSearchService:
    """Service for searching and caching places with preference filtering."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.place_repo = PlaceRepository(db)
        self.types_repo = TypesRepository(db)
        self.placetypes_repo = PlaceTypesRepository(db)
    
    async def get_places_for_city(
        self,
        city: str,
        preferences: Optional[List[str]] = None,
        budget: Optional[str] = None,
        price_level_preference: Optional[int] = None,
        open_now_only: bool = False,
        latitude: Optional[float] = None,
        longitude: Optional[float] = None,
    ) -> List[Dict]:
        """
        Get places for a city following the exact search flow:
        1. Search city in DB (normalized match + staleness check)
        2. If no results OR stale → Fetch from Google → Save 50 → Rank → Show all
        3. If has results → Rank by preference
           - Enough good matches (score >= 0.5, minimum 10) → Show all ranked
           - Too few matches → Fetch from Google → Merge + deduplicate → Re-rank → Show all
        
        Args:
            city: City name (will be normalized)
            preferences: List of user preference categories
            budget: Budget level (budget-friendly, balanced, luxury)
            price_level_preference: Specific price level preference (1-4)
            open_now_only: If True, only return places currently open
            latitude: Optional latitude for location bias
            longitude: Optional longitude for location bias
        
        Returns:
            List of all ranked places (up to 50) with scores
        """
        try:
            normalized_city = normalize_city(city)
            
            if not normalized_city:
                raise ValueError("City name is required")
            
            logger.info(f"Searching places for city: {normalized_city}")
            
            # Step 1: Check local database for places and staleness
            db_places = await self.place_repo.get_active_places_by_city(normalized_city, limit=100)
            logger.info(f"Found {len(db_places)} active places in DB for {normalized_city}")
            
            # Check if cache is stale
            is_stale = self._is_cache_stale(db_places)
            logger.info(f"Cache staleness check: {'STALE' if is_stale else 'FRESH'}")
            
            # Step 2a: No results OR stale → Fetch from Google
            if not db_places or is_stale:
                logger.info(f"Fetching from Google API for {normalized_city}")
                google_places = await self._fetch_from_google_api(
                    normalized_city,
                    preferences,
                    price_level_preference,
                    open_now_only,
                    latitude,
                    longitude,
                    limit=50
                )
                
                if google_places:
                    # Save to database and get the saved objects
                    db_places = await self._save_places_to_db(normalized_city, google_places)
                    logger.info(f"Saved {len(db_places)} places to database")
            
            # Step 3: Score and rank
            if not db_places:
                logger.warning(f"No places found for {normalized_city}")
                return []
            
            # Convert ORM objects to dicts with scores
            scored_places = await self._score_places(db_places, preferences, price_level_preference)
            
            # Filter by budget if specified
            if budget:
                price_levels = BUDGET_TO_PRICE_LEVELS.get(budget, [1, 2, 3, 4])
                scored_places = [
                    p for p in scored_places
                    if p.get("price_level") is None or p["price_level"] in price_levels
                ]
            
            # Filter by open_now if requested
            if open_now_only:
                scored_places = [p for p in scored_places if p.get("is_open_now") is True]
            
            # Sort by score descending
            scored_places = sorted(scored_places, key=lambda x: x.get("score", 0), reverse=True)
            
            # Step 4: Check if we have enough good matches
            good_matches = [p for p in scored_places if p.get("score", 0) >= 0.5]
            
            if good_matches and len(good_matches) >= 10:
                logger.info(f"Enough good matches ({len(good_matches)}), returning all ranked results")
                return scored_places
            
            # Too few good matches: fetch from Google, merge, and re-rank
            if len(scored_places) < 10:
                logger.info(f"Too few good matches ({len(good_matches)}), fetching more from Google")
                google_places = await self._fetch_from_google_api(
                    normalized_city,
                    preferences,
                    price_level_preference,
                    open_now_only,
                    latitude,
                    longitude,
                    limit=50
                )
                
                if google_places:
                    # Merge with existing places (deduplicate by googleplaceid)
                    merged_places = await self._merge_places(
                        normalized_city, db_places, google_places
                    )
                    logger.info(f"Merged to {len(merged_places)} places")
                    
                    # Re-score and rank
                    scored_places = await self._score_places(
                        merged_places, preferences, price_level_preference
                    )
                    
                    # Re-apply filters
                    if budget:
                        price_levels = BUDGET_TO_PRICE_LEVELS.get(budget, [1, 2, 3, 4])
                        scored_places = [
                            p for p in scored_places
                            if p.get("price_level") is None or p["price_level"] in price_levels
                        ]
                    
                    if open_now_only:
                        scored_places = [p for p in scored_places if p.get("is_open_now") is True]
                    
                    scored_places = sorted(scored_places, key=lambda x: x.get("score", 0), reverse=True)
            
            # Format and return all ranked results (not capped at 30 or any number)
            result = self._format_places_for_response(scored_places)
            logger.info(f"Returning {len(result)} ranked places")
            return result
            
        except Exception as e:
            logger.error(f"Error in get_places_for_city: {str(e)}", exc_info=True)
            raise
    
    def _is_cache_stale(self, places: List) -> bool:
        """
        Check if cache is stale: if >50% of places are older than 30 days.
        
        Args:
            places: List of Place ORM objects
        
        Returns:
            True if cache is stale, False otherwise
        """
        if not places:
            return True
        
        stale_threshold = datetime.utcnow() - timedelta(days=STALENESS_DAYS)
        stale_count = 0
        
        for place in places:
            # If datefetched is None or before threshold, count as stale
            if not place.datefetched or place.datefetched < stale_threshold:
                stale_count += 1
        
        stale_percentage = stale_count / len(places)
        logger.debug(f"Stale places: {stale_count}/{len(places)} ({stale_percentage * 100:.1f}%)")
        
        # Cache is stale if more than 50% are old
        return stale_percentage > 0.5
    
    async def _fetch_from_google_api(
        self,
        normalized_city: str,
        preferences: Optional[List[str]],
        price_level_preference: Optional[int],
        open_now_only: bool,
        latitude: Optional[float],
        longitude: Optional[float],
        limit: int = 50,
    ) -> List[Dict]:
        """
        Fetch places from Google Places API with preferences built into the query.
        Makes separate API calls per category type and merges results.
        
        Args:
            normalized_city: Normalized city name
            preferences: User preference categories
            price_level_preference: User's preferred price level (1-4)
            open_now_only: If True, only fetch open places
            latitude: Optional latitude for location bias
            longitude: Optional longitude for location bias
            limit: Max places per query (default 50)
        
        Returns:
            List of place dicts from Google API
        """
        all_places = {}
        
        # Build search queries from preferences
        if preferences:
            google_types = self._map_preferences_to_google_types(preferences)
            
            # Make separate API calls per type
            for google_type in google_types:
                query = f"{google_type} in {normalized_city}"
                logger.info(f"Fetching from Google: {query}")
                
                try:
                    search_params = {
                        "query": query,
                        "limit": limit,
                    }
                    
                    if latitude is not None and longitude is not None:
                        search_params["location"] = (latitude, longitude)
                    
                    results = await search_google_attractions(**search_params)
                    
                    # Deduplicate by google place ID
                    for place in results:
                        place_id = place.get("id")
                        if place_id and place_id not in all_places:
                            all_places[place_id] = place
                    
                    logger.info(f"Fetched {len(results)} results for {google_type}")
                
                except Exception as e:
                    logger.warning(f"Error fetching {google_type}: {str(e)}")
                    continue
        else:
            # No preferences: just search the city
            query = f"attractions in {normalized_city}"
            logger.info(f"Fetching from Google: {query} (no preferences)")
            
            try:
                search_params = {
                    "query": query,
                    "limit": limit,
                }
                
                if latitude is not None and longitude is not None:
                    search_params["location"] = (latitude, longitude)
                
                results = await search_google_attractions(**search_params)
                all_places = {place.get("id"): place for place in results if place.get("id")}
            except Exception as e:
                logger.error(f"Error fetching attractions: {str(e)}")
        
        return list(all_places.values())
    
    def _map_preferences_to_google_types(self, preferences: List[str]) -> List[str]:
        """
        Map user preferences to Google Place types for API queries.
        
        Args:
            preferences: List of preference categories
        
        Returns:
            List of unique Google Place types
        """
        google_types = set()
        
        for pref in preferences:
            types = CATEGORY_TO_GOOGLE_TYPES.get(pref, [pref.lower()])
            google_types.update(types)
        
        return list(google_types)
    
    async def _save_places_to_db(
        self,
        normalized_city: str,
        google_places: List[Dict],
    ) -> List:
        """
        Save Google Places to database using upsert logic.
        Properly handles types via the types table and placetypes junction table.
        
        Args:
            normalized_city: Normalized city name
            google_places: List of place dicts from Google API
        
        Returns:
            List of saved Place ORM objects
        """
        saved_places = []
        active_google_ids = set()
        
        for place in google_places[:50]:  # Limit to 50
            try:
                google_place_id = place.get("id")
                if not google_place_id:
                    logger.warning(f"Place has no ID: {place.get('name')}")
                    continue
                
                active_google_ids.add(google_place_id)
                
                # Prepare place data (without types - those go in the junction table)
                place_data = {
                    "destination": place.get("name", ""),
                    "address": place.get("address", ""),
                    "city": normalized_city,
                    "latitude": place.get("coordinates", {}).get("lat"),
                    "longitude": place.get("coordinates", {}).get("lng"),
                    "rating": place.get("rating"),
                    "userratingtotal": place.get("user_ratings_total"),
                    "pricelevel": place.get("price_level"),
                    "is_open_now": place.get("is_open_now"),
                    "openinghours": place.get("opening_hours"),
                    "website": place.get("website"),
                    "phonenumber": place.get("phone_number"),
                    "photos": place.get("photos"),  # Already in JSON format from google_places_service
                    "datefetched": datetime.utcnow(),
                }
                
                # Upsert place
                saved_place = await self.place_repo.upsert_place(google_place_id, place_data)
                saved_places.append(saved_place)
                
                # Save types and create placetypes entries
                place_types = place.get("types", [])
                if place_types:
                    for type_str in place_types:
                        try:
                            # Get or create the type
                            type_obj = await self.types_repo.get_or_create_by_category(type_str)
                            
                            # Create placetypes entry if it doesn't exist
                            exists = await self.placetypes_repo.exists(saved_place.placeid, type_obj.categoryid)
                            if not exists:
                                await self.placetypes_repo.create(saved_place.placeid, type_obj.categoryid)
                        except Exception as e:
                            logger.warning(f"Error saving type '{type_str}' for place {google_place_id}: {str(e)}")
                            continue
                
                logger.debug(f"Saved place: {place.get('name')} ({google_place_id})")
            
            except Exception as e:
                logger.warning(f"Error saving place {place.get('id')}: {str(e)}")
                continue
        
        # Mark places no longer in active set as inactive (soft delete)
        try:
            inactive_count = await self.place_repo.mark_inactive_places(
                normalized_city, active_google_ids
            )
            if inactive_count > 0:
                logger.info(f"Marked {inactive_count} places as inactive")
        except Exception as e:
            logger.warning(f"Error marking places as inactive: {str(e)}")
        
        await self.db.commit()
        return saved_places
    
    async def _merge_places(
        self,
        normalized_city: str,
        existing_places: List,
        google_places: List[Dict],
    ) -> List:
        """
        Merge existing DB places with new Google places, deduplicating by googleplaceid.
        Properly handles types via the types table and placetypes junction table.
        
        Args:
            normalized_city: Normalized city name
            existing_places: Existing Place ORM objects from DB
            google_places: New place dicts from Google API
        
        Returns:
            Combined and deduplicated list of Place ORM objects
        """
        # Create a dict of existing places by google_place_id
        existing_by_id = {place.googleplaceid: place for place in existing_places}
        active_google_ids = set(existing_by_id.keys())
        
        # Add new Google places
        for place in google_places[:50]:
            google_place_id = place.get("id")
            if not google_place_id:
                continue
            
            if google_place_id not in existing_by_id:
                # New place, need to save it
                try:
                    place_data = {
                        "destination": place.get("name", ""),
                        "address": place.get("address", ""),
                        "city": normalized_city,
                        "latitude": place.get("coordinates", {}).get("lat"),
                        "longitude": place.get("coordinates", {}).get("lng"),
                        "rating": place.get("rating"),
                        "userratingtotal": place.get("user_ratings_total"),
                        "pricelevel": place.get("price_level"),
                        "is_open_now": place.get("is_open_now"),
                        "openinghours": place.get("opening_hours"),
                        "website": place.get("website"),
                        "phonenumber": place.get("phone_number"),
                        "photos": place.get("photos"),
                        "datefetched": datetime.utcnow(),
                    }
                    
                    saved_place = await self.place_repo.upsert_place(google_place_id, place_data)
                    
                    # Save types and create placetypes entries
                    place_types = place.get("types", [])
                    if place_types:
                        for type_str in place_types:
                            try:
                                type_obj = await self.types_repo.get_or_create_by_category(type_str)
                                exists = await self.placetypes_repo.exists(saved_place.placeid, type_obj.categoryid)
                                if not exists:
                                    await self.placetypes_repo.create(saved_place.placeid, type_obj.categoryid)
                            except Exception as e:
                                logger.warning(f"Error saving type '{type_str}' for place {google_place_id}: {str(e)}")
                                continue
                    
                    existing_by_id[google_place_id] = saved_place
                except Exception as e:
                    logger.warning(f"Error merging place {google_place_id}: {str(e)}")
            else:
                # Existing place, mark as active
                active_google_ids.add(google_place_id)
        
        # Mark places no longer in active set as inactive
        try:
            inactive_count = await self.place_repo.mark_inactive_places(
                normalized_city, active_google_ids
            )
            if inactive_count > 0:
                logger.info(f"Marked {inactive_count} places as inactive during merge")
        except Exception as e:
            logger.warning(f"Error marking places as inactive during merge: {str(e)}")
        
        await self.db.commit()
        return list(existing_by_id.values())
    
    async def _score_places(
        self,
        places: List,
        preferences: Optional[List[str]],
        price_level_preference: Optional[int],
    ) -> List[Dict]:
        """
        Score and convert Place ORM objects to dicts with scores.
        
        Gets types from the place_types relationship (junction table) instead of a JSON column.
        
        Args:
            places: List of Place ORM objects
            preferences: User preference categories
            price_level_preference: User's preferred price level (1-4)
        
        Returns:
            List of place dicts with scores
        """
        scored_places = []
        
        for place in places:
            # Get types from the place_types relationship (junction table)
            # place.place_types is a list of PlaceTypes objects
            # Each PlaceTypes has a .category relationship that gives the Types object
            types_list = []
            if place.place_types:
                types_list = [pt.category.category for pt in place.place_types if pt.category]
            
            # Calculate score
            score = self._calculate_score(
                {
                    "name": place.destination,
                    "address": place.address,
                    "types": types_list,
                    "rating": place.rating,
                    "user_ratings_total": place.userratingtotal,
                    "price_level": place.pricelevel,
                },
                preferences,
                price_level_preference,
            )
            
            # Convert to dict
            place_dict = {
                "placeid": place.placeid,
                "name": place.destination,
                "city": place.city,
                "address": place.address,
                "rating": place.rating,
                "score": round(score, 4),
                "types": types_list,
                "photos": place.photos,
                "is_open_now": place.is_open_now,
                "price_level": place.pricelevel,
                "user_ratings_total": place.userratingtotal,
                "website": place.website,
                "latitude": place.latitude,
                "longitude": place.longitude,
                "phone_number": place.phonenumber,
                "opening_hours": place.openinghours,
            }
            
            scored_places.append(place_dict)
        
        return scored_places
    
    def _calculate_score(
        self,
        place: Dict,
        preferences: Optional[List[str]],
        price_level_preference: Optional[int],
    ) -> float:
        """
        Calculate SAW score for a place.
        
        Score = (0.35 × RelevanceScore) + (0.30 × RatingScore) + 
                (0.25 × PopularityScore) + (0.10 × PriceLevelScore)
        
        All component scores are normalized to 0-1 range.
        
        Args:
            place: Place dict with name, types, rating, user_ratings_total, price_level
            preferences: User preference categories
            price_level_preference: User's preferred price level
        
        Returns:
            Final score (0-1)
        """
        # Relevance score (0.35)
        relevance_score = self._calculate_relevance_score(
            place.get("types", []),
            place.get("name", ""),
            place.get("address", ""),
            preferences,
        )
        
        # If no relevance, return 0
        if relevance_score == 0:
            return 0.0
        
        # Rating score (0.30) - normalize 1-5 to 0-1
        rating = place.get("rating") or 0
        rating_score = max(0, min((rating - 1.0) / 4.0, 1.0)) if rating > 0 else 0.0
        
        # Popularity score (0.25) - logarithmic scale, capped at 1000 reviews
        review_count = place.get("user_ratings_total") or 0
        if review_count > 0:
            popularity_score = min(math.log10(review_count + 1) / math.log10(1001), 1.0)
        else:
            popularity_score = 0.0
        
        # Price level score (0.10)
        price_level = place.get("price_level")
        price_level_score = self._calculate_price_level_score(
            price_level, price_level_preference
        )
        
        # Weighted sum
        final_score = (
            SCORING_WEIGHTS["WEIGHT_RELEVANCE"] * relevance_score +
            SCORING_WEIGHTS["WEIGHT_RATING"] * rating_score +
            SCORING_WEIGHTS["WEIGHT_POPULARITY"] * popularity_score +
            SCORING_WEIGHTS["WEIGHT_PRICE_LEVEL"] * price_level_score
        )
        
        return final_score
    
    def _calculate_relevance_score(
        self,
        place_types: List[str],
        place_name: str,
        place_address: str,
        preferences: Optional[List[str]],
    ) -> float:
        """
        Calculate relevance score based on how many preferences match the place types.
        
        Args:
            place_types: List of Google Place types for this place
            place_name: Place name
            place_address: Place address
            preferences: User preference categories
        
        Returns:
            Relevance score (0-1)
        """
        if not preferences or len(preferences) == 0:
            return 1.0  # If no preferences, all places are equally relevant
        
        place_types_lower = [t.lower() for t in place_types]
        name_lower = place_name.lower()
        address_lower = place_address.lower()
        
        matched_count = 0
        
        for pref in preferences:
            # Get Google types for this preference
            google_types = CATEGORY_TO_GOOGLE_TYPES.get(pref, [pref.lower()])
            
            # Check if any Google type matches the place types
            for google_type in google_types:
                google_type_lower = google_type.lower()
                if (any(google_type_lower in pt for pt in place_types_lower) or
                    google_type_lower in name_lower or
                    google_type_lower in address_lower):
                    matched_count += 1
                    break
        
        return matched_count / len(preferences)
    
    def _calculate_price_level_score(
        self,
        price_level: Optional[int],
        price_level_preference: Optional[int],
    ) -> float:
        """
        Calculate price level score.
        
        Args:
            price_level: Place's price level (1-4)
            price_level_preference: User's preferred price level (1-4)
        
        Returns:
            Price level score (0-1)
        """
        # If no price level, neutral score
        if price_level is None:
            return 0.5
        
        # If no preference, higher price levels slightly penalized but still acceptable
        if price_level_preference is None:
            return max(1.0 - (price_level - 1) * 0.1, 0.0)
        
        # If preference exists, score based on closeness
        # Same as preference = 1.0, further away = lower score
        difference = abs(price_level - price_level_preference)
        return max(1.0 - (difference * 0.2), 0.0)
    
    def _format_places_for_response(self, scored_places: List[Dict]) -> List[Dict]:
        """
        Format places for API response.
        
        Args:
            scored_places: List of scored place dicts
        
        Returns:
            Formatted list for API response
        """
        return [
            {
                "placeid": place.get("placeid"),
                "name": place.get("name"),
                "city": place.get("city"),
                "address": place.get("address"),
                "rating": place.get("rating"),
                "score": place.get("score"),
                "types": place.get("types"),
                "photos": place.get("photos"),
                "is_open_now": place.get("is_open_now"),
                "price_level": place.get("price_level"),
                "user_ratings_total": place.get("user_ratings_total"),
                "website": place.get("website"),
                "latitude": place.get("latitude"),
                "longitude": place.get("longitude"),
                "phone_number": place.get("phone_number"),
                "opening_hours": place.get("opening_hours"),
            }
            for place in scored_places
        ]
