#!/bin/bash
# Quick Test Runner - Copy & Paste Commands

# =====================================================
# STEP 1: Setup (One time)
# =====================================================
cd backend
pip install pytest pytest-asyncio

# =====================================================
# STEP 2a: SAFE TEST (Mock data only - No APIs)
# =====================================================
echo "🧪 Running SAFE Frontend Integration Test..."
python -m pytest tests/test_frontend_integration.py -v -s

# Expected output:
# ✅ test_01_trip_plan_validation
# ✅ test_02_preferences_validation
# ✅ test_03_attractions_loading
# ✅ test_04_attractions_selection
# ✅ test_05_breaks_configuration
# ✅ test_06_summary_generation
# ✅ test_07_no_api_calls_made
# ✅ test_08_ready_for_itinerary
# 
# Result: 8 passed in X.XXs
# API calls made: 0 ✅

# =====================================================
# STEP 2b: BACKEND TEST (Local DB mock - No real APIs)
# =====================================================
echo "🧪 Running Backend Attraction Flow Test..."
python -m pytest tests/test_attraction_flow.py -v -s

# Expected output:
# ✅ test_01_validate_trip_plan_data
# ✅ test_02_validate_preferences_data
# ✅ test_03_local_database_empty_on_first_call
# ✅ test_04_simulate_google_api_results_and_save
#    Saved: 50/50 places ✅
# ✅ test_05_local_database_has_cached_data
# ✅ test_06_search_uses_local_database_first
# ✅ test_07_validate_breaks_data
# ✅ test_08_generate_summary
# ✅ test_09_check_no_infinite_loops
# ✅ test_10_full_flow_summary
#
# Result: 10 passed in X.XXs
# Transactions: 50 committed, 0 failed ✅
# No infinite loops detected ✅

# =====================================================
# STEP 2c: RUN BOTH TESTS (Recommended)
# =====================================================
echo "🧪 Running FULL Test Suite..."
python -m pytest tests/test_frontend_integration.py tests/test_attraction_flow.py -v -s

# =====================================================
# STEP 3: Check Results
# =====================================================
# Look for:
# ✅ All tests passed
# ❌ NO "LOOP DETECTED" messages
# ❌ NO transaction failures
# ❌ NO API calls (should be 0)
# 
# If you see ANY of these:
# - "LOOP DETECTED"
# - "current transaction is aborted"
# - "Total API calls: >50"
# 
# STOP - DO NOT PROCEED TO REAL TESTING

# =====================================================
# STEP 4: After Tests Pass - Real Testing
# =====================================================
# 1. Start backend:
#    python -m uvicorn app.main:app --reload
#
# 2. Test the UI flow:
#    - Go to Trip Plan page
#    - Fill in data → Continue
#    - Go to Preferences
#    - Select preferences → Continue
#    - Go to Attractions
#    - Should see ~50 places (from mock or DB)
#    - Select 3+ attractions → Continue
#    - Go to Breaks
#    - Select 2+ meals → Continue
#    - Go to Summary
#    - Should see all data summarized
#    - Click "Generate Itinerary"
#
# 3. Monitor Google API dashboard:
#    - Should see ONLY 1-2 API calls
#    - NOT 50+ calls
#    - NOT hundreds of calls
#
# 4. Check backend logs:
#    - "Searching local database for..."
#    - "Found X local results"
#    - "Saving X results to database"
#    - NO "Error saving places" messages
#    - NO "current transaction is aborted" errors

# =====================================================
# QUICK REFERENCE - Expected Behavior
# =====================================================
# First visit to Zambales (empty DB):
# ├─ Check local DB → 0 results
# ├─ Call Google API → 50 results
# ├─ Save to DB → All 50 saved
# └─ Return to user → 50 attractions displayed
#
# Second visit to Zambales (cached):
# ├─ Check local DB → 50 results
# ├─ Return to user → 50 attractions displayed
# └─ NO Google API call ✅
#
# API quota usage:
# ├─ First visit: ~1 API call (search) + ~50 dedup checks
# ├─ Subsequent visits: 0 API calls (use cache)
# └─ Total for 100 visits: ~1 call (not 5000+)

# =====================================================
# STOP IF YOU SEE:
# =====================================================
# ❌ "🚨 LOOP DETECTED"
#    → Infinite loop in code - DO NOT PROCEED
#
# ❌ "current transaction is aborted"
#    → Transaction error - DO NOT PROCEED
#
# ❌ "Total API calls: >50"
#    → API quota waste - DO NOT PROCEED
#
# ❌ "Expected 50 saved places, got X"
#    → Data loss - DO NOT PROCEED
#
# ✅ If you see ANY of above, EMAIL ME with the error

# =====================================================
# MONITORING STATS YOU'LL SEE
# =====================================================
# LOOP DETECTION REPORT
# Runtime: 5.2 seconds
# Total calls tracked: 50
# Active operations: None
# ✅ No infinite loop patterns detected
#
# TRANSACTION MONITOR REPORT
# Successful: 50
# Failed: 0
# ✅ No failed transactions
#
# API USAGE REPORT
# Total API calls: 0 (mocked in tests)
# ✅ Within quota
#
# Expected in real usage:
# Total API calls: 1-2 (not 50+)
# Database writes: 50 (first visit)
# Database reads: 50 (first visit) or 0 (cached)

echo "✅ All tests reference: TESTING_GUIDE.md in root directory"
echo "📊 Detailed docs: backend/TEST_SUITE_README.md"
echo "🧪 Test files: backend/tests/test_*.py"
