# tripana

A web-based AI-powered itinerary planning system that optimizes travel schedules using multi-objective decision-making and route optimization algorithms.

---

## Tech Stack

| Layer     | Technology            |
|-----------|-----------------------|
| Backend   | Python · FastAPI      |
| Frontend  | React.js · Vite       |
| Database  | PostgreSQL            |
| ORM       | SQLAlchemy (async)    |
| Migrations| Alembic               |
| Container | Docker / Compose      |

---

## Project Structure (MVC)

```
tripana/
├── backend/                        # FastAPI backend
│   ├── app/
│   │   ├── main.py                 # Application entry-point & CORS
│   │   ├── config.py               # Pydantic settings (reads .env)
│   │   ├── database.py             # Async SQLAlchemy engine & session
│   │   │
│   │   ├── models/                 # (M) SQLAlchemy ORM models
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   └── itinerary.py
│   │   │
│   │   ├── schemas/                # Pydantic request / response schemas
│   │   │   ├── __init__.py
│   │   │   ├── user_schema.py
│   │   │   └── itinerary_schema.py
│   │   │
│   │   ├── controllers/            # (C) FastAPI routers / route handlers
│   │   │   ├── __init__.py
│   │   │   ├── user_controller.py
│   │   │   └── itinerary_controller.py
│   │   │
│   │   ├── services/               # Business logic layer
│   │   │   ├── __init__.py
│   │   │   ├── user_service.py
│   │   │   └── itinerary_service.py
│   │   │
│   │   ├── repositories/           # Data-access layer (SQL queries)
│   │   │   ├── __init__.py
│   │   │   ├── user_repository.py
│   │   │   └── itinerary_repository.py
│   │   │
│   │   └── utils/                  # Shared helpers (hashing, JWT, …)
│   │       ├── __init__.py
│   │       └── security.py
│   │
│   ├── alembic/                    # Database migrations
│   │   ├── env.py
│   │   ├── script.py.mako
│   │   └── versions/
│   │
│   ├── tests/                      # pytest test suite
│   │   ├── conftest.py
│   │   └── test_users.py
│   │
│   ├── alembic.ini
│   ├── Dockerfile
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/                       # React.js frontend (Vite)
│   ├── public/                     # Static assets served as-is
│   ├── src/
│   │   ├── main.jsx                # React DOM entry-point
│   │   ├── App.jsx                 # Root component (wraps BrowserRouter)
│   │   ├── routes.jsx              # Centralised route definitions
│   │   │
│   │   ├── pages/                  # (V) Full-page view components
│   │   │   ├── HomePage.jsx
│   │   │   ├── ItineraryPage.jsx
│   │   │   └── NotFoundPage.jsx
│   │   │
│   │   ├── components/             # Reusable UI components
│   │   │   └── common/
│   │   │       └── Button.jsx
│   │   │
│   │   ├── services/               # Axios API service layer
│   │   │   ├── apiClient.js        # Axios instance + interceptors
│   │   │   ├── itineraryService.js
│   │   │   └── userService.js
│   │   │
│   │   ├── store/                  # Global state (React Context / Redux)
│   │   │   └── AuthContext.jsx
│   │   │
│   │   ├── hooks/                  # Custom React hooks
│   │   │   └── useItineraries.js
│   │   │
│   │   ├── models/                 # (M) JS data-type definitions (JSDoc)
│   │   │   └── index.js
│   │   │
│   │   ├── utils/                  # Pure utility functions
│   │   │   └── formatters.js
│   │   │
│   │   └── assets/                 # Images, fonts, SVGs
│   │
│   ├── index.html
│   ├── vite.config.js
│   ├── Dockerfile
│   ├── package.json
│   └── .env.example
│
├── docker-compose.yml              # Orchestrates db + backend + frontend
├── .gitignore
└── README.md
```

---

## Getting Started

### Prerequisites

- [Docker & Docker Compose](https://docs.docker.com/get-docker/) — recommended
- **or** Python 3.12+ and Node.js 20+

### Run with Docker

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

docker compose up --build
```

| Service  | URL                          |
|----------|------------------------------|
| Frontend | http://localhost:5173        |
| Backend  | http://localhost:8000        |
| API docs | http://localhost:8000/docs   |

### Run locally (without Docker)

**Backend**

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # then edit DATABASE_URL etc.
alembic upgrade head
uvicorn app.main:app --reload
```

**Frontend**

```bash
cd frontend
npm install
cp .env.example .env          # then set VITE_API_BASE_URL
npm run dev
```

---

## Database Migrations

```bash
# Create a new migration after changing models
alembic revision --autogenerate -m "add itineraries table"

# Apply all pending migrations
alembic upgrade head

# Roll back one step
alembic downgrade -1
```

---

## Running Tests

```bash
cd backend
pip install -r requirements.txt
pytest --cov=app tests/
```

---

## MVC Architecture Overview

```
Request
  │
  ▼
Controller  ──►  Service  ──►  Repository  ──►  Database
(router)        (logic)        (SQL/ORM)        (PostgreSQL)
  │
  ▼
Response (Pydantic schema)

Frontend (React pages/components) ◄──► services/ (Axios) ◄──► Backend API
```
