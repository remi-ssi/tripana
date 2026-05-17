"""
Mapbox API usage tracker — prevents exceeding the free tier.

Free limits (per month):
  • Geocoding requests : 100 000
  • Map loads (token fetches) :  50 000

Thresholds:
  80 % → console WARNING
  80 % → requests are BLOCKED (extra safe — stops well before any charges)
"""

import json
import logging
from datetime import datetime
from pathlib import Path

logger = logging.getLogger("mapbox_usage")

# ── Limits ──────────────────────────────────────────────
GEOCODING_LIMIT = 100_000
MAP_LOAD_LIMIT = 50_000

WARN_PCT = 0.80   # warn at 80 %
BLOCK_PCT = 0.80  # block at 80 %

# Persist counts in a small JSON file next to the .env
_USAGE_FILE = Path(__file__).resolve().parents[2] / "mapbox_usage.json"


def _current_month() -> str:
    return datetime.utcnow().strftime("%Y-%m")


def _load() -> dict:
    if _USAGE_FILE.exists():
        try:
            data = json.loads(_USAGE_FILE.read_text())
            if data.get("month") == _current_month():
                return data
        except (json.JSONDecodeError, KeyError):
            pass
    # New month or missing/corrupt file → reset
    return {"month": _current_month(), "geocoding": 0, "map_loads": 0}


def _save(data: dict) -> None:
    _USAGE_FILE.write_text(json.dumps(data, indent=2))


def _check_and_increment(data: dict, key: str, limit: int, label: str) -> bool:
    """
    Check FIRST, then increment only if allowed.
    Returns True if the request should proceed, False if blocked.
    """
    current = data[key]
    pct = current / limit

    # Block check — do NOT increment if blocked
    if pct >= BLOCK_PCT:
        logger.error(
            "🚫 MAPBOX %s BLOCKED — %d / %d (%.1f%%). "
            "Staying on free tier! Request denied.",
            label, current, limit, pct * 100,
        )
        print(
            f"🚫 MAPBOX {label} BLOCKED — {current}/{limit} "
            f"({pct*100:.1f}%). Staying on free tier! Request denied."
        )
        return False

    # Allowed — increment and save
    data[key] = current + 1
    _save(data)

    # Warn check (after incrementing)
    new_pct = data[key] / limit
    if new_pct >= WARN_PCT:
        logger.warning(
            "⚠️  MAPBOX %s WARNING — %d / %d (%.1f%%). "
            "Nearing free-tier limit!",
            label, data[key], limit, new_pct * 100,
        )
        print(
            f"⚠️  MAPBOX {label} WARNING — {data[key]}/{limit} "
            f"({new_pct*100:.1f}%). Nearing free-tier limit!"
        )

    return True


# ── Public API ──────────────────────────────────────────

def track_geocoding() -> bool:
    """Check limit, then increment geocoding counter. Returns False if blocked."""
    data = _load()
    return _check_and_increment(data, "geocoding", GEOCODING_LIMIT, "GEOCODING")


def track_map_load() -> bool:
    """Check limit, then increment map-load counter. Returns False if blocked."""
    data = _load()
    return _check_and_increment(data, "map_loads", MAP_LOAD_LIMIT, "MAP LOAD")


def get_usage() -> dict:
    """Return current usage stats for debugging / a status endpoint."""
    data = _load()
    return {
        "month": data["month"],
        "geocoding": {
            "used": data["geocoding"],
            "limit": GEOCODING_LIMIT,
            "pct": round(data["geocoding"] / GEOCODING_LIMIT * 100, 2),
        },
        "map_loads": {
            "used": data["map_loads"],
            "limit": MAP_LOAD_LIMIT,
            "pct": round(data["map_loads"] / MAP_LOAD_LIMIT * 100, 2),
        },
    }
