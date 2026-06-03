# SafeAttractionService: A protective wrapper around LocalAttractionSearchService

import logging
from typing import List, Optional, Dict
from app.services.local_attraction_search_service import LocalAttractionSearchService
from app.utils.loop_detector import loop_detector, api_call_counter, transaction_monitor

logger = logging.getLogger(__name__)


class SafeLocalAttractionSearchService:
    # This service wraps the LocalAttractionSearchService with additional safety checks to prevent infinite loops and excessive API calls.
    def __init__(self, db):
        self.service = LocalAttractionSearchService(db)
        self.db = db
        self.operation_count = 0
    
    async def search_attractions_safe(
        self,
        location_city: str,
        user_preferences: List[str],
        budget: str,
        latitude: Optional[float] = None,
        longitude: Optional[float] = None,
        radius: int = 10000,
        limit: int = 30,
    ) -> List[Dict]:
        # Safe wrapper for searching attractions with loop and API call monitoring
        operation_id = f"search_{location_city}"
        self.operation_count += 1
        
        try:
            loop_detector.start_operation(operation_id)
            logger.info(f"🔍 Starting attraction search for {location_city}")
            
            # Protection: Check for too many operations
            if self.operation_count > 10:
                logger.error(f"🚨 Too many search operations ({self.operation_count})!")
                raise Exception("Too many consecutive search operations - possible infinite loop")
            
            # Check iteration limit
            if not loop_detector.record_call(f"{operation_id}_start"):
                raise Exception("⚠️  Loop detector triggered - infinite loop protection activated")
            
            # Call the service
            results = await self.service.search_attractions(
                location_city=location_city,
                user_preferences=user_preferences,
                budget=budget,
                latitude=latitude,
                longitude=longitude,
                radius=radius,
                limit=limit,
            )
            
            logger.info(f"✅ Found {len(results)} attractions for {location_city}")
            self.operation_count = 0  # Reset on success
            return results
            
        except Exception as e:
            logger.error(f"❌ Error searching attractions: {str(e)}")
            
            # Generate report before failing
            loop_detector.report()
            
            raise
        
        finally:
            loop_detector.end_operation(operation_id)
    
    async def save_places_safe(
        self,
        location_city: str,
        places: List[Dict],
    ) -> int:
        """
        Safe wrapper for saving places with transaction monitoring
        
        Each place saved in its own transaction to prevent transaction abort cascades
        """
        
        operation_id = f"save_places_{location_city}"
        
        try:
            loop_detector.start_operation(operation_id)
            logger.info(f"💾 Saving {len(places)} places to database")
            
            saved_count = 0
            
            for idx, place in enumerate(places):
                google_place_id = place.get("id")
                tx_id = f"{operation_id}_{idx}"
                
                # Check loop
                if not loop_detector.record_call(tx_id, "db_write"):
                    raise Exception(f"Loop detected while saving place {idx}")
                
                try:
                    transaction_monitor.begin_transaction(tx_id, f"save_place_{google_place_id}")
                    
                    # Try to save
                    await self.service._save_places_to_database(location_city, [place])
                    
                    transaction_monitor.commit_transaction(tx_id)
                    saved_count += 1
                    
                except Exception as e:
                    logger.warning(f"Failed to save place {idx}: {str(e)}")
                    transaction_monitor.rollback_transaction(tx_id, str(e))
                    continue
            
            logger.info(f"✅ Saved {saved_count}/{len(places)} places")
            return saved_count
            
        finally:
            loop_detector.end_operation(operation_id)
    
    def get_monitoring_report(self) -> Dict:
        """Get current monitoring stats"""
        return {
            "operation_count": self.operation_count,
            "loop_detector_stats": loop_detector.get_stats(),
            "failed_transactions": transaction_monitor.get_failed_count(),
            "total_api_calls": sum(api_call_counter.call_count.values()),
        }
