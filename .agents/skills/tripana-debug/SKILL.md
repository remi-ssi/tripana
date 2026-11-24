---
name: tripana-debug
description: Systematic debugging skill for Tripana. Diagnoses frontend, backend, build, lint, API, and database errors from root cause to verified fix.
---

# Tripana Debugging Skill

Use this skill whenever an error, failed build, lint error, test failure, or runtime bug occurs.

## Procedure

1. **Reproduce & Capture Exact Evidence**
   - Read the full error message, stack trace, HTTP status, or lint/build output.
   - Identify the exact file, line number, and failing condition.

2. **Isolate the Root Cause**
   - Inspect the failing code and its immediate callers/dependencies (e.g., `apiClient.js`, `TripPlanContext.jsx`, `guards.jsx`, FastAPI route/service/repository).
   - Form a concrete hypothesis for *why* it fails rather than guessing or applying blind workarounds.
   - Check common Tripana failure points:
     - **Frontend**: Tailwind v4 class syntax, ESLint `no-unused-vars` / `react-hooks` rules, missing `VITE_API_URL`, `credentials: 'include'` cookie issues, or `TripPlanContext` missing state on direct route refresh.
     - **Backend**: Async SQLAlchemy session/await issues, Pydantic schema mismatch, RSA key/decrypt mismatch, or missing `.env` config (never print `.env` secrets).

3. **Apply a Minimal, Targeted Fix**
   - Fix the root cause cleanly without breaking existing contracts, routes, or `design.md` standards.
   - Never silence errors with empty catch blocks or relaxed test assertions.

4. **Verify the Fix**
   - Re-run the exact failing command/test (`npm run lint`, `npm run build`, `pytest`, etc.) and confirm it passes after the final edit.
