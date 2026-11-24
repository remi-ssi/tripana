"""
Unit tests verifying the 225 Philippine attractions seed dataset,
preference & budget coverage, and Mapbox city string tokenization.
Compatible with both pytest and python -m unittest.
"""

import importlib.util
from pathlib import Path
import sys
import unittest

BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from app.seeds.philippine_attractions import PHILIPPINE_ATTRACTIONS

_CITY_UTILS_PATH = BACKEND_ROOT / "app" / "utils" / "city_utils.py"
_city_utils_spec = importlib.util.spec_from_file_location("city_utils", _CITY_UTILS_PATH)
_city_utils = importlib.util.module_from_spec(_city_utils_spec)
_city_utils_spec.loader.exec_module(_city_utils)
extract_city_search_tokens = _city_utils.extract_city_search_tokens

PREFERENCE_TO_KEYWORDS = {
    "Beaches": ["beach", "resort", "swimming", "water sport"],
    "Water Activities": ["water sport", "aquarium", "diving", "snorkeling"],
    "Food Trip": ["restaurant", "cafe", "food court", "street food"],
    "Local Food": ["local restaurant", "market", "food stall"],
    "Hiking": ["hiking trail", "park", "mountain", "nature reserve"],
    "Shopping": ["shopping mall", "market", "boutique", "store"],
    "Nightlife": ["bar", "club", "lounge", "entertainment"],
    "Art": ["art gallery", "museum", "art museum"],
    "Historical Sites": ["historical landmark", "monument", "temple", "archaeological"],
    "Photography": ["scenic viewpoint", "landscape", "park", "monument"],
    "Wildlife": ["wildlife sanctuary", "zoo", "nature reserve", "aquarium"],
    "Camping": ["campground", "outdoor", "nature"],
    "Relaxation": ["spa", "wellness", "resort", "hot spring"],
    "Island Hopping": ["island", "ferry", "beach", "resort"],
}

BUDGET_TO_PRICE_LEVEL = {
    "budget-friendly": [1, 2],
    "balanced": [2, 3, 4],
    "luxury": [3, 4],
}


class TestSeedAndLocalSearch(unittest.TestCase):
    def test_seed_has_at_least_200_unique_attractions(self):
        self.assertGreaterEqual(len(PHILIPPINE_ATTRACTIONS), 200)
        ids = [item["googleplaceid"] for item in PHILIPPINE_ATTRACTIONS]
        self.assertEqual(len(set(ids)), len(PHILIPPINE_ATTRACTIONS))

        cities = {item["city"] for item in PHILIPPINE_ATTRACTIONS}
        self.assertEqual(len(cities), 15)

        for item in PHILIPPINE_ATTRACTIONS:
            self.assertTrue(item["destination"])
            self.assertTrue(item["address"])
            self.assertIsNotNone(item["latitude"])
            self.assertIsNotNone(item["longitude"])
            self.assertGreaterEqual(item["rating"], 4.0)
            self.assertLessEqual(item["rating"], 5.0)
            self.assertGreater(item["userratingtotal"], 0)
            self.assertIn(item["pricelevel"], (1, 2, 3, 4))
            self.assertIsNone(item["photos"])
            self.assertGreaterEqual(len(item["types"]), 2)

    def test_all_14_user_preferences_covered_across_seed(self):
        for pref, keywords in PREFERENCE_TO_KEYWORDS.items():
            matching_places = []
            for item in PHILIPPINE_ATTRACTIONS:
                dest_lower = item["destination"].lower()
                addr_lower = item["address"].lower()
                types_lower = [t.lower() for t in item["types"]]
                if any(
                    kw.lower() in dest_lower
                    or kw.lower() in addr_lower
                    or any(kw.lower() in t for t in types_lower)
                    for kw in keywords
                ):
                    matching_places.append(item)

            self.assertGreaterEqual(
                len(matching_places),
                15,
                f"Expected at least 15 attractions for preference '{pref}', got {len(matching_places)}",
            )

    def test_every_city_covers_all_14_preferences_and_all_budget_tiers(self):
        cities = {item["city"] for item in PHILIPPINE_ATTRACTIONS}
        for city in cities:
            city_items = [item for item in PHILIPPINE_ATTRACTIONS if item["city"] == city]

            # Every city hub should have at least 15 attractions
            self.assertEqual(len(city_items), 15, f"City '{city}' should have 15 attractions")

            # Every city hub should cover all 14 preference categories
            for pref, keywords in PREFERENCE_TO_KEYWORDS.items():
                pref_matches = [
                    item
                    for item in city_items
                    if any(
                        kw.lower() in item["destination"].lower()
                        or kw.lower() in item["address"].lower()
                        or any(kw.lower() in t.lower() for t in item["types"])
                        for kw in keywords
                    )
                ]
                self.assertGreaterEqual(
                    len(pref_matches),
                    1,
                    f"City '{city}' has 0 attractions matching preference '{pref}'",
                )

            # Every city hub should cover all 3 budget tiers
            for budget, allowed_levels in BUDGET_TO_PRICE_LEVEL.items():
                matches = [item for item in city_items if item["pricelevel"] in allowed_levels]
                self.assertGreaterEqual(
                    len(matches),
                    3,
                    f"City '{city}' has fewer than 3 attractions for budget '{budget}'",
                )

    def test_extract_city_search_tokens_handles_mapbox_strings(self):
        self.assertIn("baguio", extract_city_search_tokens("Baguio City, Benguet, Philippines"))
        self.assertIn("palawan", extract_city_search_tokens("El Nido, Palawan, Philippines"))
        self.assertIn("boracay", extract_city_search_tokens("Boracay, Malay, Aklan, Philippines"))
        self.assertIn("manila", extract_city_search_tokens("Metro Manila, Philippines"))
        self.assertIn("ilocos", extract_city_search_tokens("Vigan City, Ilocos Sur, Philippines"))
        self.assertIn("zambales", extract_city_search_tokens("Subic Bay, Olongapo, Zambales, Philippines"))
        self.assertIn("bicol", extract_city_search_tokens("Legazpi City, Albay, Philippines"))


if __name__ == "__main__":
    unittest.main()
