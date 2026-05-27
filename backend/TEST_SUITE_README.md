# Attraction Flow Test Suite

## Overview

This comprehensive test suite validates the entire attraction search flow from Trip Plan through Summary. It detects infinite loops, API quota waste, and transaction failures before they impact your actual Google API quota.

## Test Files Created

### 1. **test_attraction_flow.py** (`backend/tests/test_attraction_flow.py`)
Main test suite with 10 comprehensive tests:

```
TEST 1: Validate Trip Plan Data
  - Validates destination, dates, time, max attractions
  - Ensures all required fields are present

TEST 2: Validate Preferences Data  
  - Validates pace level (1-3)
  - Ensures at least one interest selected
  - Validates budget (budget-friendly, balanced, luxury)

TEST 3: Check Local Database (Empty)
  - Confirms database is empty for new location
  - No redundant data exists

TEST 4: Simulate Google API (50 places)
  - Creates mock 50 place results
  - Saves to database
  - **MONITORS FOR INFINITE LOOPS** during save

TEST 5: Verify Local Database Cache
  - Confirms all 50 places saved successfully
  - Validates place data structure

TEST 6: Local Database Search
  - Queries local cache (NO GOOGLE API CALL)
  - Returns up to 30 results
  - Proves cache is working

TEST 7: Validate Breaks Data
  - Validates meal selections
  - Checks at least one break selected

TEST 8: Generate Summary
  - Aggregates all collected data
  - Formats for display
  - Ready for itinerary generation

TEST 9: Infinite Loop Detection
  - Verifies error handling patterns
  - Confirms no retry loops
  - Validates transaction isolation

TEST 10: Full Flow Summary
  - Reports overall test results
  - Shows data transformation flow
```

### 2. **loop_detector.py** (`backend/app/utils/loop_detector.py`)
Real-time monitoring utility with three main components:

#### LoopDetector
```python
- Tracks API/DB calls per second
- Detects spam patterns (>10 calls/sec = suspicious)
- Monitors iteration counts
- Max iterations: 50 (configurable)
```

#### TransactionMonitor
```python
- Tracks each database transaction
- Records commits vs rollbacks
- Identifies failed transaction patterns
```

#### APICallCounter
```python
- Counts API calls by service
- Prevents quota exhaustion
- Triggers cache usage at >30 calls
- Warning threshold: 50 calls
```

### 3. **safe_attraction_service.py** (`backend/app/services/safe_attraction_service.py`)
Production-ready wrapper with circuit breaker:

```python
SafeLocalAttractionSearchService
- Wraps the main service
- Monitors all operations
- Stops execution if loops detected
- Provides monitoring reports
```

### 4. **run_tests.py** (`backend/run_tests.py`)
Quick test runner script

---

## How to Run Tests

### Option 1: Run Full Test Suite

```bash
cd backend
python -m pytest tests/test_attraction_flow.py -v -s
```

### Option 2: Run Specific Test

```bash
# Test only local database behavior
python -m pytest tests/test_attraction_flow.py::test_05_local_database_has_cached_data -v -s

# Test only for infinite loops
python -m pytest tests/test_attraction_flow.py::test_09_check_no_infinite_loops -v -s
```

### Option 3: Run with Test Runner Script

```bash
cd backend
python run_tests.py
```

---

## What to Look For

### ✅ Good Signs (Tests Pass)

```
✅ TEST 1: Trip Plan Data Valid
✅ TEST 2: Preferences Valid  
✅ TEST 3: Local Database: 0 places (expected)
✅ TEST 4: Successfully saved 50/50 places
✅ TEST 5: Local Database State: 50 places found
✅ TEST 6: Found 30 places from local database (No API calls made)
✅ TEST 7: Breaks Valid
✅ TEST 8: Summary Generated
✅ TEST 9: No infinite loop patterns detected
✅ ALL TESTS PASSED ✅
```

### ❌ Red Flags (Tests Fail)

Look for these patterns that indicate problems:

#### 1. **Infinite Loop Pattern**
```
🚨 LOOP DETECTED: search_zambales called 15 times in 10 seconds!
❌ FAILED: Too many API calls - possible infinite loop!
```
**Fix**: Check the _save_places_to_database loop for transaction issues

#### 2. **Transaction Failures**
```
Error saving places to database: current transaction is aborted
❌ FAILED: Expected 50 saved places, got 5
```
**Fix**: Check that each place saves in its own transaction

#### 3. **API Quota Waste**
```
Total API calls: 150
❌ Exceeded warning threshold of 50!
```
**Fix**: Verify local database is being checked first

#### 4. **No Local Cache Usage**
```
Found 0 places from local database (TEST 6 FAILED)
❌ Should use cache for second query
```
**Fix**: Local database search not returning cached results

---

## Database Schema Validation

The tests verify these Place fields are saved correctly:

```python
{
  "googleplaceid": "ChIJ...",     # Unique Google Place ID
  "destination": "Place Name",     # Place name
  "address": "Full address",       # Complete address
  "city": "Zambales",              # City filter
  "latitude": 15.7995,             # For mapping
  "longitude": 120.3045,           # For mapping
  "rating": 4.5,                   # Quality indicator
  "userratinqtotal": 250,          # Popularity indicator
  "types": ["tourist_attraction"], # Google place types
  "opening_hours": "9AM-5PM",      # Hours
  "website": "https://...",        # Contact info
  "price_level": 2,                # Budget (1-4)
  "photos": "[{...}]",             # Photo references
}
```

---

## Expected API Call Count

### TEST 4 (Save Places)
- **Expected**: 50 calls (one per place to check exists_by_google_place_id)
- **Acceptable range**: 50-60 calls (some overhead OK)
- **Red flag**: >100 calls = infinite loop

### TEST 6 (Local Search)
- **Expected**: 1 database query (NO Google API calls)
- **Red flag**: Any Google API calls = cache not being used

### Full Flow
- **Expected total**: ~51 calls (1 Google search + 50 dedup checks)
- **Maximum acceptable**: 70 calls (some retry overhead)
- **Critical threshold**: 150+ calls = STOP IMMEDIATELY

---

## Monitoring in Production

To use safe monitoring in your actual code:

```python
from app.services.safe_attraction_service import SafeLocalAttractionSearchService

# Replace regular service with safe wrapper
service = SafeLocalAttractionSearchService(db)

# Use it the same way
results = await service.search_attractions_safe(
    location_city="Zambales",
    user_preferences=["Photography", "Local Food"],
    budget="balanced"
)

# Check monitoring stats
stats = service.get_monitoring_report()
print(f"API calls made: {stats['total_api_calls']}")
if stats['total_api_calls'] > 50:
    logger.error("API quota warning!")
```

---

## Quick Checklist

Before running tests:

- [ ] Backend virtual environment activated
- [ ] pytest installed: `pip install pytest pytest-asyncio`
- [ ] Database migrations run
- [ ] Test file exists: `backend/tests/test_attraction_flow.py`

After running tests:

- [ ] All 10 tests pass
- [ ] No "LOOP DETECTED" warnings
- [ ] API calls < 70 total
- [ ] Transaction report shows 0 failures
- [ ] Summary shows all flow steps completed

---

## Troubleshooting

### "Module not found" errors
```bash
cd backend
pip install -e .
```

### "pytest not found"
```bash
pip install pytest pytest-asyncio
```

### Tests timeout
- Increase timeout in test file: `@pytest.fixture(timeout=60)`
- Check database connection string in test_db fixture

### Database locked errors
- Kill any existing database connections
- Use in-memory SQLite (default in tests)

---

## Summary

This test suite provides:
- ✅ **Validation**: Every step from Trip Plan to Summary
- ✅ **Safety**: Detects infinite loops before they waste quota
- ✅ **Monitoring**: Real-time API call tracking
- ✅ **Reporting**: Detailed failure analysis
- ✅ **Protection**: Circuit breaker for production use

Run this **before** testing with real data to save your Google API quota!
