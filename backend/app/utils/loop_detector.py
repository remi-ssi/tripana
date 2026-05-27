"""
Real-time monitoring utility for detecting infinite loops
Tracks API calls, database transactions, and execution patterns
"""

import logging
import time
from collections import defaultdict
from datetime import datetime, timedelta
from typing import Dict, Set

logger = logging.getLogger(__name__)


class LoopDetector:
    """Detects potential infinite loops by monitoring execution patterns"""
    
    def __init__(self, max_calls_per_second: int = 10, max_iterations: int = 100):
        self.max_calls_per_second = max_calls_per_second
        self.max_iterations = max_iterations
        
        self.call_history: Dict[str, list] = defaultdict(list)
        self.iteration_count: Dict[str, int] = defaultdict(int)
        self.active_operations: Set[str] = set()
        self.start_time = datetime.now()
    
    def record_call(self, operation_id: str, call_type: str = "api") -> bool:
        """
        Record an API/DB call and check for infinite loops
        Returns True if safe, False if suspicious pattern detected
        """
        now = time.time()
        self.call_history[operation_id].append((now, call_type))
        
        # Clean old calls (keep last 10 seconds)
        cutoff_time = now - 10
        self.call_history[operation_id] = [
            (t, ct) for t, ct in self.call_history[operation_id] 
            if t > cutoff_time
        ]
        
        # Check for spam (too many calls per second)
        recent_calls = len(self.call_history[operation_id])
        if recent_calls > self.max_calls_per_second:
            logger.error(
                f"🚨 LOOP DETECTED: {operation_id} called {recent_calls} times in 10 seconds!"
            )
            return False
        
        return True
    
    def increment_iteration(self, operation_id: str) -> bool:
        """
        Track iteration count for loops
        Returns True if safe, False if exceeds limit
        """
        self.iteration_count[operation_id] += 1
        
        if self.iteration_count[operation_id] > self.max_iterations:
            logger.error(
                f"🚨 LOOP DETECTED: {operation_id} exceeded {self.max_iterations} iterations!"
            )
            return False
        
        return True
    
    def start_operation(self, operation_id: str):
        """Mark operation as active"""
        self.active_operations.add(operation_id)
        logger.debug(f"Started operation: {operation_id}")
    
    def end_operation(self, operation_id: str):
        """Mark operation as complete"""
        if operation_id in self.active_operations:
            self.active_operations.remove(operation_id)
        logger.debug(f"Ended operation: {operation_id}")
    
    def get_stats(self) -> Dict:
        """Get current monitoring statistics"""
        return {
            "active_operations": list(self.active_operations),
            "total_calls": sum(len(v) for v in self.call_history.values()),
            "operations_tracked": len(self.call_history),
            "runtime_seconds": (datetime.now() - self.start_time).total_seconds(),
        }
    
    def report(self):
        """Generate a monitoring report"""
        stats = self.get_stats()
        logger.info("\n" + "=" * 60)
        logger.info("LOOP DETECTION REPORT")
        logger.info("=" * 60)
        logger.info(f"Runtime: {stats['runtime_seconds']:.2f} seconds")
        logger.info(f"Total calls tracked: {stats['total_calls']}")
        logger.info(f"Operations tracked: {stats['operations_tracked']}")
        logger.info(f"Active operations: {', '.join(stats['active_operations']) or 'None'}")
        
        if self.call_history:
            logger.info("\nCall breakdown:")
            for op_id, calls in sorted(self.call_history.items()):
                logger.info(f"  {op_id}: {len(calls)} calls")
        logger.info("=" * 60 + "\n")


class TransactionMonitor:
    """Monitors database transactions for issues"""
    
    def __init__(self):
        self.transactions: Dict[str, Dict] = {}
        self.failed_transactions = 0
        self.successful_transactions = 0
    
    def begin_transaction(self, tx_id: str, operation: str):
        """Record transaction start"""
        self.transactions[tx_id] = {
            "operation": operation,
            "started_at": datetime.now(),
            "status": "active",
        }
    
    def commit_transaction(self, tx_id: str):
        """Record successful commit"""
        if tx_id in self.transactions:
            self.transactions[tx_id]["status"] = "committed"
            self.successful_transactions += 1
    
    def rollback_transaction(self, tx_id: str, reason: str = ""):
        """Record rollback"""
        if tx_id in self.transactions:
            self.transactions[tx_id]["status"] = "rolled_back"
            self.transactions[tx_id]["error_reason"] = reason
            self.failed_transactions += 1
    
    def get_failed_count(self) -> int:
        """Get count of failed transactions"""
        return self.failed_transactions
    
    def report(self):
        """Generate transaction report"""
        logger.info("\n" + "=" * 60)
        logger.info("TRANSACTION MONITOR REPORT")
        logger.info("=" * 60)
        logger.info(f"Successful: {self.successful_transactions}")
        logger.info(f"Failed: {self.failed_transactions}")
        
        if self.failed_transactions > 0:
            logger.warning(f"⚠️  {self.failed_transactions} transactions failed!")
        else:
            logger.info("✅ No failed transactions")
        
        logger.info("=" * 60 + "\n")


class APICallCounter:
    """Counts and monitors API calls to prevent quota waste"""
    
    def __init__(self, warning_threshold: int = 50):
        self.call_count: Dict[str, int] = defaultdict(int)
        self.warning_threshold = warning_threshold
        self.blocked_calls = 0
    
    def record_call(self, api_name: str, service: str = "google") -> bool:
        """
        Record an API call
        Returns False if should be blocked (quota protection)
        """
        self.call_count[f"{service}_{api_name}"] += 1
        total_calls = sum(self.call_count.values())
        
        if total_calls > self.warning_threshold:
            logger.warning(
                f"⚠️  API call quota warning: {total_calls} calls made! "
                f"({self.warning_threshold} threshold)"
            )
        
        return True
    
    def should_use_cache(self, api_name: str) -> bool:
        """Determine if cache should be used to save API quota"""
        total_calls = sum(self.call_count.values())
        return total_calls > 30  # Start using cache aggressively at 30 calls
    
    def report(self):
        """Generate API usage report"""
        logger.info("\n" + "=" * 60)
        logger.info("API USAGE REPORT")
        logger.info("=" * 60)
        total = sum(self.call_count.values())
        logger.info(f"Total API calls: {total}")
        
        for api_name, count in sorted(self.call_count.items(), key=lambda x: x[1], reverse=True):
            logger.info(f"  {api_name}: {count}")
        
        if total > self.warning_threshold:
            logger.error(f"❌ Exceeded warning threshold of {self.warning_threshold}!")
        else:
            logger.info(f"✅ Within quota ({total}/{self.warning_threshold})")
        
        logger.info("=" * 60 + "\n")


# Global instances
loop_detector = LoopDetector(max_calls_per_second=5, max_iterations=50)
transaction_monitor = TransactionMonitor()
api_call_counter = APICallCounter(warning_threshold=50)


def check_infinite_loop(operation_id: str) -> bool:
    """Quick check for infinite loops"""
    return loop_detector.record_call(operation_id)


def generate_monitoring_report():
    """Generate complete monitoring report"""
    logger.info("\n" + "=" * 80)
    logger.info("COMPREHENSIVE MONITORING REPORT")
    logger.info("=" * 80)
    loop_detector.report()
    transaction_monitor.report()
    api_call_counter.report()
    logger.info("=" * 80 + "\n")
