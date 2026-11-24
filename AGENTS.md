# Tripana Project Instructions (`AGENTS.md`)

## 1. Project Context

Tripana is an AI-powered travel itinerary planning application built with a React/Vite frontend, a FastAPI backend, and a PostgreSQL database. It helps users discover attractions, plan trips, organize day-by-day schedules, optimize routes, and balance activities with travel time and fatigue.

All AI coding agents working in this repository must follow these project-wide conventions and guardrails.

---

## 2. Repository Architecture

- **Frontend (`frontend/`)**: React 19, Vite 8, React Router 7, Tailwind CSS 4 (`@import "tailwindcss"` in `frontend/src/index.css`), Framer Motion, Lucide React, Mapbox GL JS, JSEncrypt.
  - `src/api/apiClient.js`: Centralized fetch wrapper (`credentials: 'include'`, `VITE_API_URL` base URL).
  - `src/services/`: Domain API services (`authService.js`, `attraction.js`, `iteneraryService.js`, `placeSearchService.js`, `summaryService.js`).
  - `src/contexts/TripPlanContext.jsx`: Shared state for the multi-step trip planning flow.
  - `src/routes/guards.jsx`: `AuthOnlyRoute` (with `requirePreferences`) and `GuestOnlyRoute`.
  - `src/validators/`: Client-side input validation modules.
  - `src/components/`, `src/layouts/`, `src/pages/`: Shared UI components, page layouts, and route views.
- **Backend (`backend/`)**: FastAPI, Uvicorn, Python 3.12, SQLAlchemy 2 (`asyncpg`), Alembic, Pydantic Settings, Authlib, `python-jose`, `passlib`.
  - `app/api/routes/`: Route definitions (`/api/v1/...`, `/auth/...`, `/health`).
  - `app/controllers/`, `app/services/`, `app/repositories/`, `app/models/`, `app/schemas/`, `app/middleware/`, `app/utils/`.
  - `alembic/`: Database migrations.
  - `tests/`: Pytest unit tests.
- **Infrastructure**: `compose.yaml` (PostgreSQL 17, backend, frontend/Nginx) and root `.env` (never commit secrets).

---

## 3. Frontend Design Requirements

For all frontend creation, redesign, refactoring, and visual polishing tasks, treat [`design.md`](design.md) and the `tripana-frontend-design` skill in [`.agents/skills/tripana-frontend-design/SKILL.md`](.agents/skills/tripana-frontend-design/SKILL.md) as the default standard for all Tripana interfaces.

- Before implementing a frontend change, inspect the relevant page, shared components, and existing styling conventions.
- Maintain a consistent typography scale (`Nunito` + `Poppins`, `tabular-nums`), 4px/8px spacing system, corner radius system (`rounded-2xl` / `rounded-xl` / `rounded-lg` / `rounded-full`), neutral palette, and single primary accent color (`#2563EB` / `blue-600`).
- Design according to the purpose of each page rather than applying one generic layout everywhere.
- Do not introduce gradient hero text, decorative emojis, colored card borders, redundant eyebrow badges, cursor-following visual effects, inconsistent spacing, em dashes (`—`) in interface copy, generic typography, or unnecessary flat layouts.

---

## 4. Workflow & Agent Skills (Token-Efficient Pipeline)

All development follows the lean workflow in [`.agents/rules/workflow-and-design.md`](.agents/rules/workflow-and-design.md). Keep token usage low: never re-read files already in context, read `.agents/skills/tripana-frontend-design/SKILL.md` instead of full `design.md` unless deep detail is needed, and never run redundant verification loops.

1. **Plan (`tripana-plan` — [`.agents/skills/tripana-plan/SKILL.md`](.agents/skills/tripana-plan/SKILL.md))**:
   - **No application code edits during planning.** Inspect only the target files.
   - If genuine UX, layout, or scope ambiguities exist, **call `ask_question`** (1–3 focused questions) and wait for the user's answer.
   - Write a compact Markdown plan (<60 lines) to `docs/plans/YYYY-MM-DD-<slug>.md` using `write_file`.
   - Reply in 2–3 lines with a link to `docs/plans/YYYY-MM-DD-<slug>.md` (do not echo the plan in chat) and **STOP** for user approval.
2. **Build (`tripana-build` — [`.agents/skills/tripana-build/SKILL.md`](.agents/skills/tripana-build/SKILL.md))**:
   - Run only after the user approves `docs/plans/YYYY-MM-DD-<slug>.md`. Batch file edits in parallel without re-reading files already in context.
   - Run **only one scoped verification** at the very end (e.g., `npm run lint` for UI/JSX changes; add `npm run build` only if imports/routes/deps changed; run targeted `pytest` only if backend changed).
   - Update the `.md` plan file once at the end (`Status: Completed`, `- [x]`).
3. **Review (`tripana-review`) & Debug (`tripana-debug`)**:
   - Run `tripana-review` **only when explicitly requested by the user** (do not run an automatic review pass after `tripana-build`).
   - Run `tripana-debug` only when an error occurs.

---

## 5. Engineering & Preservation Requirements

- **Preserve Architecture & Contracts**: Keep existing functionality, routes in `frontend/src/App.jsx` (`/`, `/login`, `/forgot-password`, `/change-password`, `/user-preference`, `/dashboard`, `/trip-plan`, `/attractions`, `/preference`, `/break`, `/summary`, `/profile`, `/itineraryPage`, `/saved`, `/itinerary`, `/itinerary/:itineraryId`, `/map`, `/privacy`, `/terms`, `/about`, `/features`), `AuthOnlyRoute` / `GuestOnlyRoute` guards, `TripPlanContext` state shape, `apiClient.js`, backend endpoints, and RSA/JWT/OTP/Google OAuth authentication intact.
- **Reuse & Scope**: Reuse existing dependencies (`tailwindcss`, `lucide-react`, `framer-motion`, `mapbox-gl`), shared components (`frontend/src/components/`, `frontend/src/layouts/`), services, validators, and utilities (`src/utils/errors.js`, `src/utils/helpers.js`, `src/utils/imageUrl.js`). Avoid unnecessary dependencies and unrelated refactoring.
- **Quality & Accessibility**: Keep the interface responsive and accessible (semantic HTML, keyboard focus, WCAG AA contrast, `prefers-reduced-motion`).
- **No Mock Replacements**: Do not replace functional application behavior with mock data or static demonstrations.
- **Secrets**: Never read, print, or commit `.env`, RSA keys, or credentials.
- **Validation & Honest Reporting**: Validate changes using available project checks and browser testing when possible, and report important implementation decisions, validation results, and any unresolved issues honestly:
  - Frontend: `cd frontend && npm run lint && npm run build`
  - Backend: `cd backend && pytest`

---

## 6. Completion Standard

A frontend change must be visually consistent, responsive, accessible, functional, and aligned with the Tripana design system (`design.md` and `tripana-frontend-design`) before it is considered complete.
