#!/bin/bash
# 🛡️ TRIPANA API QUOTA PROTECTION - VERIFICATION CHECKLIST
# Run this to verify everything is set up correctly

echo "
╔════════════════════════════════════════════════════════════╗
║     TRIPANA TEST SUITE VERIFICATION CHECKLIST              ║
╚════════════════════════════════════════════════════════════╝
"

# Counter for checks
PASSED=0
TOTAL=0

# Function to check condition
check() {
    TOTAL=$((TOTAL + 1))
    if eval "$1"; then
        echo "✅ Check $TOTAL: $2"
        PASSED=$((PASSED + 1))
        return 0
    else
        echo "❌ Check $TOTAL: $2"
        return 1
    fi
}

echo ""
echo "📋 CHECKING TEST SETUP..."
echo "════════════════════════════════════════════════════════════"

# File existence checks
check "[ -f 'backend/tests/test_frontend_integration.py' ]" "Frontend integration test exists"
check "[ -f 'backend/tests/test_attraction_flow.py' ]" "Attraction flow test exists"
check "[ -f 'backend/app/utils/loop_detector.py' ]" "Loop detector utility exists"
check "[ -f 'backend/app/services/safe_attraction_service.py' ]" "Safe service wrapper exists"
check "[ -f 'backend/run_tests.py' ]" "Test runner script exists"
check "[ -f 'TESTING_GUIDE.md' ]" "Testing guide exists"
check "[ -f 'TESTING_SUMMARY.md' ]" "Testing summary exists"

echo ""
echo "📦 CHECKING DEPENDENCIES..."
echo "════════════════════════════════════════════════════════════"

# Check if pytest is installed
check "python -c 'import pytest' 2>/dev/null" "pytest installed"
check "python -c 'import pytest_asyncio' 2>/dev/null" "pytest-asyncio installed"
check "python -c 'from sqlalchemy.ext.asyncio import AsyncSession' 2>/dev/null" "SQLAlchemy async installed"

echo ""
echo "📝 CHECKING CODE FIXES..."
echo "════════════════════════════════════════════════════════════"

# Check if fixes were applied
check "grep -q 'await self.db.commit()' backend/app/services/local_attraction_search_service.py" "Transaction fix applied (commit per place)"
check "grep -q 'await self.db.rollback()' backend/app/services/local_attraction_search_service.py" "Error recovery fix applied (rollback per iteration)"
check "grep -q 'except Exception as e:' backend/app/repositories/place_repository.py" "Error handling in place_repository"

echo ""
echo "🧪 TEST FILES CONTENT CHECK..."
echo "════════════════════════════════════════════════════════════"

# Check test file content
check "grep -q 'test_frontend_integration' backend/tests/test_frontend_integration.py" "Frontend test file valid"
check "grep -q 'test_attraction_flow' backend/tests/test_attraction_flow.py" "Attraction test file valid"
check "grep -q 'LoopDetector' backend/app/utils/loop_detector.py" "Loop detector valid"
check "grep -q 'MockTripPlanData' backend/tests/test_frontend_integration.py" "Mock data available"

echo ""
echo "📊 RESULTS SUMMARY"
echo "════════════════════════════════════════════════════════════"

echo "Checks passed: $PASSED/$TOTAL"

if [ $PASSED -eq $TOTAL ]; then
    echo "✅ ALL CHECKS PASSED!"
    echo ""
    echo "🚀 READY TO RUN TESTS"
    echo "════════════════════════════════════════════════════════════"
    echo ""
    echo "Run the tests with:"
    echo "  cd backend"
    echo "  python -m pytest tests/ -v -s"
    echo ""
    echo "Or use the quick runner:"
    echo "  python run_tests.py"
    echo ""
else
    FAILED=$((TOTAL - PASSED))
    echo "❌ $FAILED checks failed"
    echo ""
    echo "TROUBLESHOOTING:"
    echo "────────────────────────────────────────────────────────────"
    echo ""
    if ! python -c 'import pytest' 2>/dev/null; then
        echo "❗ pytest not installed. Run:"
        echo "   pip install pytest pytest-asyncio"
        echo ""
    fi
    
    if [ ! -f 'backend/tests/test_frontend_integration.py' ]; then
        echo "❗ Test files missing. Make sure you're in the right directory:"
        echo "   pwd  # Should show: .../BSIT 3-1/ADET/tripana"
        echo ""
    fi
    
    if ! grep -q 'await self.db.commit()' backend/app/services/local_attraction_search_service.py 2>/dev/null; then
        echo "❗ Code fixes not applied. Make sure local_attraction_search_service.py was updated"
        echo ""
    fi
fi

echo ""
echo "════════════════════════════════════════════════════════════"
echo "For detailed information, see:"
echo "  - TESTING_GUIDE.md"
echo "  - TESTING_SUMMARY.md"
echo "  - backend/TEST_SUITE_README.md"
echo "════════════════════════════════════════════════════════════"
