"""
Quick test runner script for the attraction flow
Run this to test Trip Plan -> Preferences -> Attractions -> Breaks -> Summary
"""

import subprocess
import sys
import os

# Change to backend directory
os.chdir(os.path.dirname(os.path.abspath(__file__)))

print("\n" + "=" * 80)
print("TRIPANA ATTRACTION FLOW TEST SUITE")
print("=" * 80)
print("\nThis test validates the entire flow from Trip Plan to Summary")
print("It will check for infinite loops and API quota waste\n")

test_file = "tests/test_attraction_flow.py"

if not os.path.exists(test_file):
    print(f"❌ Test file not found: {test_file}")
    sys.exit(1)

print(f"🧪 Running tests from {test_file}...\n")

try:
    # Run pytest with verbose output
    result = subprocess.run(
        [sys.executable, "-m", "pytest", test_file, "-v", "-s", "--tb=short"],
        capture_output=False,
        text=True
    )
    
    if result.returncode == 0:
        print("\n" + "=" * 80)
        print("✅ ALL TESTS PASSED!")
        print("=" * 80)
        print("\nThe attraction flow is working correctly:")
        print("  ✅ Trip Plan validation")
        print("  ✅ Preferences validation")
        print("  ✅ Local database caching")
        print("  ✅ Google API integration (50 places)")
        print("  ✅ Breaks configuration")
        print("  ✅ Summary generation")
        print("  ✅ No infinite loops detected")
        print("=" * 80 + "\n")
    else:
        print("\n" + "=" * 80)
        print("❌ TESTS FAILED!")
        print("=" * 80)
        print("\nPlease review the output above for details\n")
        sys.exit(1)

except FileNotFoundError:
    print("❌ pytest not found. Install with: pip install pytest pytest-asyncio")
    sys.exit(1)
except Exception as e:
    print(f"❌ Error running tests: {str(e)}")
    sys.exit(1)
