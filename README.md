# Tripana

A web-based AI-powered itinerary planning system that optimizes travel schedules using multi-objective decision-making and route optimization algorithms. Features user authentication, personalized preferences, and email-based OTP verification.

---

## Tech Stack

| Layer     | Technology                                    |
|-----------|-----------------------------------------------|
| Backend   | Python · FastAPI · Uvicorn                    |
| Frontend  | React 19 · Vite · Tailwind CSS · Framer Motion |
| Database  | PostgreSQL                                    |
| ORM       | SQLAlchemy (async)                            |
| Migrations| Alembic                                       |
| Auth      | JWT (python-jose) · Bcrypt · Email OTP       |
| API Client| Axios / Fetch                                 |

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
│   │   │   ├── user.py             # User model
│   │   │   ├── otp.py              # One-Time Password model
│   │   │   ├── category.py         # Category model
│   │   │   └── userPreference.py   # User Preference model
│   │   │
│   │   ├── schemas/                # Pydantic request / response schemas
│   │   │   └── __init__.py
│   │   │
│   │   ├── controllers/            # (C) FastAPI routers / route handlers
│   │   │   ├── __init__.py
│   │   │   ├── user_controller.py
│   │   │   └── itinerary_controller.py
│   │   │
│   │   ├── services/               # (S) Business logic layer
│   │   │   ├── __init__.py
│   │   │   ├── user_service.py
│   │   │   ├── auth_service.py     # Auth & JWT logic
│   │   │   ├── email_service.py    # Email & OTP services
│   │   │   └── itinerary_service.py
│   │   │
│   │   ├── repositories/           # Data-access layer (SQL queries)
│   │   │   └── __init__.py
│   │   │
│   │   ├── routes/                 # API route definitions
│   │   │   └── __init__.py
│   │   │
│   │   ├── middleware/             # Request/Response middleware
│   │   │   └── __init__.py
│   │   │
│   │   └── utils/                  # Shared helpers (hashing, JWT, …)
│   │       └── __init__.py
│   │
│   ├── alembic/                    # Database migrations
│   │   ├── env.py
│   │   ├── script.py.mako
│   │   └── versions/
│   │
│   ├── tests/                      # pytest test suite
│   │   └── __init__.py
│   │
│   ├── alembic.ini
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/                       # React.js frontend (Vite)
│   ├── public/                     # Static assets
│   ├── src/
│   │   ├── main.jsx                # React DOM entry-point
│   │   ├── App.jsx                 # Root component
│   │   ├── index.css               # Global styles
│   │   │
│   │   ├── pages/                  # (V) Full-page view components
│   │   │   ├── auth.jsx            # Authentication pages
│   │   │   ├── Dashboard.jsx       # Dashboard page
│   │   │   └── user_preference.jsx # User preferences page
│   │   │
│   │   ├── components/             # Reusable UI components
│   │   │   └── common/             # Shared component primitives
│   │   │
│   │   ├── layouts/                # Layout wrappers
│   │   │   └── __init__.js
│   │   │
│   │   ├── routes/                 # Route definitions
│   │   │   └── __init__.js
│   │   │
│   │   ├── api/                    # API integration layer
│   │   │   └── __init__.js
│   │   │
│   │   ├── hooks/                  # Custom React hooks
│   │   │   └── __init__.js
│   │   │
│   │   ├── validators/             # Form & data validators
│   │   │   └── __init__.js
│   │   │
│   │   ├── utils/                  # Pure utility functions
│   │   │   └── __init__.js
│   │   │
│   │   └── assets/                 # Images, fonts, SVGs
│   │
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── eslint.config.js
│   ├── package.json
│   └── .env.example
│
├── .gitignore
└── README.md
```

---

## Getting Started

### Prerequisites

- **Python 3.11+** (for backend)
- **Node.js 18+** (for frontend)
- **PostgreSQL 13+** (database)

### Run Locally

**Backend Setup**

```bash
cd backend

# Create virtual environment
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Setup environment
cp .env.example .env
# Edit .env with your PostgreSQL connection details

# Run migrations
alembic upgrade head

# Start development server
uvicorn app.main:app --reload
```

**Frontend Setup**

```bash
cd frontend

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with VITE_API_BASE_URL (e.g., http://localhost:8000)

# Start development server
npm run dev
```

**Access the Application**

| Service  | URL                          |
|----------|------------------------------|
| Frontend | http://localhost:5173        |
| Backend  | http://localhost:8000        |
| API docs | http://localhost:8000/docs   |

## Database Migrations

```bash
cd backend

# Create a new migration after changing models
alembic revision --autogenerate -m "describe your changes"

# Apply all pending migrations
alembic upgrade head

# Rollback one migration
alembic downgrade -1

# View migration history
alembic current
```

---

## Running Tests

```bash
cd backend

# Run all tests with coverage
pytest --cov=app tests/

# Run specific test file
pytest tests/test_auth.py -v

# Run in watch mode (requires pytest-watch)
ptw
```

---

## API Documentation

Once the backend is running, visit [http://localhost:8000/docs](http://localhost:8000/docs) for interactive Swagger UI documentation.

---

## Architecture Overview

### Backend (MVC)

```
HTTP Request
  │
  ▼ (CORS/Middleware)
Controller  ──────┐
(FastAPI router)  │
  │                │
  ▼                ▼
Service Layer ◄── Middleware (Auth, Validation)
(business logic)   
  │                │
  ▼                ▼
Repository ◄────── Auth Service (JWT/OTP/Email)
(SQL queries)       
  │
  ▼
PostgreSQL Database
  │
  ▼ (Response)
Pydantic Schema
  │
  ▼
HTTP Response
```

### Frontend Architecture

```
Pages (auth, Dashboard, user_preference)
  │
  ▼
Components (reusable UI elements)
  │
  ▼
Hooks (custom logic, state management)
  │
  ▼
API Layer (async requests to backend)
  │
  ▼
Utils/Validators (data processing, form validation)
```

---

## Key Features

- **User Authentication**: JWT-based auth with refresh tokens
- **Email OTP Verification**: Secure email verification during signup
- **User Preferences**: Store and retrieve personalized user settings
- **Async Database**: AsyncPG + SQLAlchemy for high-performance queries
- **Form Validation**: Client-side & server-side validation
- **Responsive UI**: Tailwind CSS + Framer Motion animations
- **Type Safety**: Pydantic models + TypeScript-ready frontend

---
