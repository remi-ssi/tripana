# Google Places API Usage Tracking Service
# This service tracks the number of API requests made to Google Places API

import json
import logging
from datetime import datetime
from app.config import settings

logger = logging.getLogger("google_places_usage")

# Default to 10,000 requests/month (safe for pay-as-you-go plans)
MONTHLY_QUOTA = getattr(settings, "GOOGLE_PLACES_MONTHLY_QUOTA", 10_000)

WARN_PCT = 0.80   # warn at 80%
BLOCK_PCT = 0.80  # block at 80%

# Persist counts outside the source tree.
_USAGE_FILE = settings.USAGE_DATA_DIR / "google_places_usage.json"


def _current_month() -> str:
    return datetime.utcnow().strftime("%Y-%m")

# load usage data on module import (will reset if new month)
def _load() -> dict:
    # Load usage data from file, or initialize if missing/corrupt/new month.
    if _USAGE_FILE.exists():
        try:
            data = json.loads(_USAGE_FILE.read_text())
            if data.get("month") == _current_month():
                return data
        except (json.JSONDecodeError, KeyError):
            pass
    # New month or missing/corrupt file → reset
    return {"month": _current_month(), "api_requests": 0}

# Save usage data on module import (to create file if missing)
def _save(data: dict) -> None:
    """Save usage data to file."""
    _USAGE_FILE.parent.mkdir(parents=True, exist_ok=True)
    _USAGE_FILE.write_text(json.dumps(data, indent=2))

# Internal function to check limits and increment count
def _check_and_increment(data: dict) -> bool:
    current = data["api_requests"]
    pct = current / MONTHLY_QUOTA

    # Block check — do NOT increment if blocked
    if pct >= BLOCK_PCT:
        logger.error(
            "GOOGLE PLACES API BLOCKED — %d / %d (%.1f%%). "
            "Reached 80%% of monthly quota. Request denied to prevent charges.",
            current,
            MONTHLY_QUOTA,
            pct * 100,
        )
        print(
            f"GOOGLE PLACES API BLOCKED — {current}/{MONTHLY_QUOTA} "
            f"({pct*100:.1f}%). Reached 80%% of monthly quota. "
            f"Request denied to prevent charges."
        )
        return False

    # Allowed — increment and save
    data["api_requests"] = current + 1
    _save(data)

    # Warn check (after incrementing)
    new_pct = data["api_requests"] / MONTHLY_QUOTA
    if new_pct >= WARN_PCT:
        logger.warning(
            "⚠️  GOOGLE PLACES API WARNING — %d / %d (%.1f%%). "
            "Nearing monthly quota limit!",
            data["api_requests"],
            MONTHLY_QUOTA,
            new_pct * 100,
        )
        print(
            f"⚠️  GOOGLE PLACES API WARNING — {data['api_requests']}/{MONTHLY_QUOTA} "
            f"({new_pct*100:.1f}%). Nearing monthly quota limit!"
        )

    return True

# Public function to be called before making a Google Places API request
def track_api_request() -> bool:
   # Check if we can make an API request (not blocked) and increment usage count.
    data = _load()
    return _check_and_increment(data)

# Public function to get current usage stats (for status endpoint or debugging)
def get_usage() -> dict:
    """Return current usage stats for debugging / status endpoint."""
    data = _load()
    used = data["api_requests"]
    remaining = max(0, MONTHLY_QUOTA - used)
    pct = round(used / MONTHLY_QUOTA * 100, 2)
    
    return {
        "month": data["month"],
        "api_requests": {
            "used": used,
            "remaining": remaining,
            "limit": MONTHLY_QUOTA,
            "percentage": pct,
            "status": "BLOCKED" if pct >= 80 else "WARNING" if pct >= 80 else "OK",
        },
    }

# Public function to reset usage (for testing or manual reset)
def reset_usage() -> dict:
    data = {"month": _current_month(), "api_requests": 0}
    _save(data)
    return data
