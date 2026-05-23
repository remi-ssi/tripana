"""
Google Places API usage tracker — prevents exceeding pay-as-you-go quota.

This service tracks API requests and blocks them at 80% of the monthly quota
to ensure you never hit unexpected charges.

Example quotas (adjust based on your billing):
  • Starter: 10,000 requests/month
  • Standard: 50,000 requests/month
  • Enterprise: custom limits

Thresholds:
  80% → console WARNING
  80% → requests are BLOCKED (extra safe — stops well before charges)
"""

import json
import logging
from datetime import datetime
from pathlib import Path
from app.config import settings

logger = logging.getLogger("google_places_usage")

# ── Limits ──────────────────────────────────────────────
# This is configurable via GOOGLE_PLACES_MONTHLY_QUOTA in .env
# Default to 10,000 requests/month (safe for pay-as-you-go plans)
MONTHLY_QUOTA = getattr(settings, "GOOGLE_PLACES_MONTHLY_QUOTA", 10_000)

WARN_PCT = 0.80   # warn at 80%
BLOCK_PCT = 0.80  # block at 80%

# Persist counts in a small JSON file in the backend root
_USAGE_FILE = Path(__file__).resolve().parents[2] / "google_places_usage.json"


def _current_month() -> str:
    return datetime.utcnow().strftime("%Y-%m")


def _load() -> dict:
    """Load usage data from file, reset if new month."""
    if _USAGE_FILE.exists():
        try:
            data = json.loads(_USAGE_FILE.read_text())
            if data.get("month") == _current_month():
                return data
        except (json.JSONDecodeError, KeyError):
            pass
    # New month or missing/corrupt file → reset
    return {"month": _current_month(), "api_requests": 0}


def _save(data: dict) -> None:
    """Save usage data to file."""
    _USAGE_FILE.write_text(json.dumps(data, indent=2))


def _check_and_increment(data: dict) -> bool:
    """
    Check FIRST, then increment only if allowed.
    Returns True if the request should proceed, False if blocked.
    """
    current = data["api_requests"]
    pct = current / MONTHLY_QUOTA

    # Block check — do NOT increment if blocked
    if pct >= BLOCK_PCT:
        logger.error(
            "🚫 GOOGLE PLACES API BLOCKED — %d / %d (%.1f%%). "
            "Reached 80%% of monthly quota. Request denied to prevent charges.",
            current,
            MONTHLY_QUOTA,
            pct * 100,
        )
        print(
            f"🚫 GOOGLE PLACES API BLOCKED — {current}/{MONTHLY_QUOTA} "
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


# ── Public API ──────────────────────────────────────────

def track_api_request() -> bool:
    """
    Check limit, then increment API request counter.
    Returns False if blocked (quota exceeded), True if request was allowed.
    
    This should be called BEFORE making a Google Places API request.
    """
    data = _load()
    return _check_and_increment(data)


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


def reset_usage() -> dict:
    """Reset usage counter (for testing or manual reset)."""
    data = {"month": _current_month(), "api_requests": 0}
    _save(data)
    return data
