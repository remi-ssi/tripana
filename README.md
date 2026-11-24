# Tripana

Tripana is a travel planning, place-discovery, and itinerary-management web application built with a React/Vite frontend, a FastAPI backend, and a PostgreSQL database. It guides travelers end-to-end from travel-style onboarding and preference-weighted attraction discovery to multi-day trip scheduling, break planning, and interactive map visualization.

> [!NOTE]
> The `main` branch currently contains only the initial repository files. The full application source code (`backend/`, `frontend/`, `compose.yaml`, and `.env.example`) resides on the `feat/revision-3` branch. Check out that branch before running the setup commands below:
>
> ```sh
> git checkout feat/revision-3
> ```

---

## Features

- **Authentication, Account & Security**
  - Email/password registration, login, and password recovery with OTP email verification (`/register`, `/verify-otp`, `/verify-login-otp`, `/forgot-password`, `/verify-forgot-otp`, `/reset-password`).
  - RSA-encrypted credential payloads (`GET /public-key` paired with `JSEncrypt` on the frontend) and JWT sessions stored in HTTP-only cookies.
  - Optional Google OAuth 2.0 sign-in (`/google/login`, `/callback`).
  - Profile management, password updates (`/change-password`), and account deletion (`/account`).

- **Travel Style & Preference Onboarding**
  - First-time travel-style onboarding (`/user-preference`) and trip-level preference tuning (`/preference`), enforced by frontend route guards (`AuthOnlyRoute` with `requirePreferences`).
  - Supports 14 interest categories (Beaches, Water Activities, Food Trip, Local Food, Hiking, Shopping, Nightlife, Art, Historical Sites, Photography, Wildlife, Camping, Relaxation, Island Hopping) and budget tiers (`budget-friendly`, `balanced`, `luxury`).

- **Smart Place & Attraction Discovery**
  - City-based place search and personalized attraction recommendations (`/api/v1/places/search-with-caching`, `/attractions/search`, `/attractions/recommendations`, `/attractions/details/{place_id}`).
  - PostgreSQL caching with automatic city-name normalization, 30-day staleness detection (re-fetching when >50% of cached places are stale), and Google Places API fallback.
  - Multi-factor Simple Additive Weighting (SAW) ranking across Relevance (35%), Rating (30%), Popularity (25%), and Price alignment (10%).
  - Mapbox geocoding, reverse geocoding, and place retrieval (`/search`, `/reverse`, `/retrieve/{mapbox_id}`), plus built-in usage/quota tracking for Google Places and Mapbox.

- **Multi-Day Trip & Itinerary Management**
  - Guided planning workflow covering trip setup (`/trip-plan`), attraction selection (`/attractions`), preferences (`/preference`), break scheduling (`/break`), and pre-generation summary review (`/summary`).
  - Automated itinerary generation (`POST /api/v1/itineraries/generate`), day-by-day schedule editing (`PUT /api/v1/itineraries/{itinerary_id}/schedule`), saved itinerary browsing with search and filters (`/dashboard`, `/itineraryPage`), detailed itinerary views (`/itinerary/:itineraryId`), and deletion (`DELETE /api/v1/itineraries/{itinerary_id}`).

- **Interactive Map Visualization**
  - Dedicated Mapbox GL JS map view (`/map`) for exploring places and deduplicated itinerary stops across trips.

---

## Tech Stack

| Layer | Technologies |
| --- | --- |
| **Frontend** | React 19, Vite 8, React Router 7, Tailwind CSS 4, Mapbox GL JS, Framer Motion, Lucide React, JSEncrypt (served via Nginx in Docker) |
| **Backend** | FastAPI, Uvicorn, Python 3.12, SQLAlchemy 2 (`asyncpg`), Alembic, Pydantic Settings, Authlib, `python-jose`, `passlib` |
| **Database** | PostgreSQL 17 |
| **External APIs** | Google Places API, Mapbox, Google OAuth, SMTP (optional) |

---

## Project Structure

```text
tripana-2/
├── backend/
│   ├── alembic/                 # Database migrations
│   ├── app/
│   │   ├── api/routes/          # FastAPI route definitions (/api/v1, /auth)
│   │   ├── controllers/         # Request handlers
│   │   ├── middleware/          # CORS & error handling
│   │   ├── models/              # SQLAlchemy ORM models
│   │   ├── repositories/        # Data access layer
│   │   ├── schemas/             # Pydantic schemas
│   │   ├── services/            # Business logic (places, itinerary, auth, etc.)
│   │   ├── utils/               # Crypto, city normalization, helpers
│   │   ├── config.py            # Environment settings
│   │   ├── database.py          # Async SQLAlchemy engine/session
│   │   └── main.py              # FastAPI app entrypoint & /health
│   ├── tests/                   # Pytest unit tests
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api/                 # API client configuration
│   │   ├── components/          # Reusable UI components
│   │   ├── contexts/            # React context providers
│   │   ├── pages/               # App pages (Dashboard, TripPlan, Map, Itinerary, etc.)
│   │   ├── routes/              # Auth & guest route guards
│   │   └── App.jsx              # Router configuration
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── compose.yaml                 # Docker Compose stack (db, backend, frontend)
├── .env.example                 # Environment variable template
└── QUICK_START.md               # Place search & caching quick-start guide
```

---

## Docker Quick Start

Configuration is read from a root `.env` file, which must remain ignored by Git.

1. Copy `.env.example` to `.env` and replace the development credentials (`SECRET_KEY`, `POSTGRES_PASSWORD`, `DATABASE_URL`) as needed:

   ```sh
   cp .env.example .env
   ```

2. Add any optional provider credentials to `.env`:
   `GOOGLE_PLACES_API_KEY`, `MAPBOX_TOKEN`, Google OAuth (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`), and SMTP email settings (`MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_FROM`).

3. Build and start the stack:

   ```sh
   docker compose up --build
   ```

4. Open the services:
   - **Frontend**: http://localhost:5173
   - **Backend API**: http://localhost:8000
   - **API Docs (Swagger UI)**: http://localhost:8000/docs
   - **Health Check**: http://localhost:8000/health

PostgreSQL data is persisted in the `postgres_data` Docker volume. On first use, the backend automatically generates its RSA encryption key pair under its runtime directory (`/app/runtime/keys` in Docker); private keys are never stored in Git.

Stop the stack with:

```sh
docker compose down
```

To also remove the local database volume:

```sh
docker compose down --volumes
```

---

## Running Without Docker

### Prerequisites

- Python 3.12+
- Node.js 22+
- PostgreSQL 17

### 1. Environment Setup

Copy `.env.example` to `.env` at the repository root and update `DATABASE_URL` and `SECRET_KEY` to match your local PostgreSQL instance.

### 2. Backend

From the `backend/` directory:

```sh
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`.

### 3. Frontend

From the `frontend/` directory:

```sh
npm ci
npm run dev
```

The Vite dev server will be available at `http://localhost:5173`.

---

## Environment Variables

See [`.env.example`](.env.example) for the complete template:

| Group | Variables | Notes |
| --- | --- | --- |
| **Application** | `APP_NAME`, `APP_ENV`, `APP_DEBUG`, `APP_PORT`, `SECRET_KEY` | Core FastAPI settings (`APP_PORT` defaults to `8000`) |
| **URLs** | `FRONTEND_ORIGIN`, `BACKEND_BASE_URL`, `VITE_API_URL` | Host URLs for CORS and frontend API requests |
| **PostgreSQL** | `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `DATABASE_URL` | Async SQLAlchemy connection (`postgresql+asyncpg://...`) |
| **Auth & JWT** | `ALGORITHM`, `ACCESS_TOKEN_EXPIRE_MINUTES`, `AUTH_COOKIE_NAME`, `AUTH_COOKIE_SECURE`, `AUTH_COOKIE_SAMESITE` | JWT signing and cookie configuration |
| **Email (Optional)** | `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_FROM` | Required for OTP email delivery |
| **Google OAuth (Optional)** | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_PATH` | Required for Google sign-in |
| **Places & Maps (Optional)** | `MAPBOX_TOKEN`, `GOOGLE_PLACES_API_KEY`, `GOOGLE_PLACES_MONTHLY_QUOTA` | Required for live place search and map tiles |
| **Runtime** | `RSA_PRIVATE_KEY_PATH`, `RSA_PUBLIC_KEY_PATH`, `USAGE_DATA_DIR`, `OTP_CLEANUP_INTERVAL_SECONDS` | Runtime key and usage tracking paths |

---

## Testing & Linting

### Backend Tests

From the `backend/` directory:

```sh
pytest
```

### Frontend Lint & Build

From the `frontend/` directory:

```sh
npm run lint
npm run build
```
