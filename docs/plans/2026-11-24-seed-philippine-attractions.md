# Plan: Seed 225+ Philippine Attractions & Resilient Local DB Fallback

- **Date**: 2026-11-24 | **Status**: Completed

## 1. Goal & Decisions
- Insert **225 real Philippine attractions** across 15 major tourist hubs (Manila/NCR, Cebu, Baguio, Boracay/Aklan, Palawan, Bohol, Siargao, Davao, Iloilo, Vigan/Ilocos, Tagaytay/Batangas, Batanes, Bicol/Albay, Pampanga, and Zambales) covering all 14 `/preference` interest tags (`Beaches`, `Water Activities`, `Food Trip`, `Local Food`, `Hiking`, `Shopping`, `Nightlife`, `Art`, `Historical Sites`, `Photography`, `Wildlife`, `Camping`, `Relaxation`, `Island Hopping`), all 8 onboarding travel styles, and price levels `1–4` (`budget-friendly`, `balanced`, `luxury`), with real coordinates (`latitude`, `longitude`), ratings, review counts, and `photos=None` (relying on `frontend/src/utils/imageUrl.js` category fallback images + fixing the broken `aa64e87c3duncan` typo URL in `imageUrl.js`).
- Seed via **both** an idempotent seed module (`backend/app/seeds/philippine_attractions.py`, auto-invoked on FastAPI startup in `main.py` and runnable as a CLI script) **and** an Alembic migration (`backend/alembic/versions/20261124_seed_philippine_attractions.py`).
- Make local DB search resilient to Mapbox full destination strings (e.g., `"Baguio, Benguet, Philippines"` or `"El Nido, Palawan, Philippines"` matching `"baguio"` / `"palawan"` in `Place.city` or `Place.address`) and gracefully skip Google Places API calls when `GOOGLE_PLACES_API_KEY` is unconfigured instead of raising HTTP 500.

## 2. Files & Checklist
- [x] `backend/app/seeds/__init__.py` & `backend/app/seeds/philippine_attractions.py` — Define 225 curated Philippine attractions (15 hubs × 15 attractions) with deterministic `googleplaceid` (`ph_seed_<slug>`), real lat/lng coordinates, ratings (`4.1–4.9`), review counts, price levels (`1–4`), opening hours, `photos=None`, and mapped `types` entries matching `PREFERENCE_TO_KEYWORDS` and `CATEGORY_TO_GOOGLE_TYPES`. Include async `seed_philippine_attractions(db)` + CLI `__main__` entrypoint.
- [x] `backend/alembic/versions/20261124_seed_philippine_attractions.py` — Alembic data migration (`down_revision = '69f7ce56810f'`) that idempotently inserts the types, 225 places, and `placetypes` links on `upgrade()` and removes `ph_seed_%` rows on `downgrade()`.
- [x] `backend/app/main.py` — Call `seed_philippine_attractions` inside `lifespan` after `Base.metadata.create_all` so the database is automatically populated on startup if not yet seeded.
- [x] `backend/app/utils/city_utils.py` & `backend/app/repositories/place_repository.py` — Add helper to extract candidate city/province tokens from full Mapbox place strings (e.g. `"Baguio City, Benguet, Philippines"` -> `["baguio city", "baguio", "benguet"]`) and update `search_by_city_and_preferences`, `get_active_places_by_city`, and `search_active_places_by_city_and_text` to match against `Place.city` or `Place.address`.
- [x] `backend/app/services/local_attraction_search_service.py` & `backend/app/services/place_search_service.py` — When `settings.GOOGLE_PLACES_API_KEY` is empty/unconfigured, skip `_search_google_api` / `search_google_attractions` and return local database results cleanly without throwing an HTTP 500.
- [x] `frontend/src/utils/imageUrl.js` — Fix the corrupted Unsplash URL (`photo-1469022563149-aa64e87c3duncan` -> valid Unsplash nature image URL) so `photos=None` fallback images load cleanly for every category.
- [x] `backend/tests/test_seed_and_local_search.py` — Unit tests verifying dataset count (>=200), preference coverage across all 14 categories, Mapbox city string tokenization, and fallback search when `GOOGLE_PLACES_API_KEY` is empty.

## 3. Guardrails
- Preserves existing routes, auth, `TripPlanContext`, `apiClient.js`, and API response shapes while keeping `GOOGLE_PLACES_API_KEY` optional when using the local database fallback.
