# Plan: Docker Frontend Hot-Reload (HMR) Setup

- **Date**: 2026-11-24 | **Status**: Completed

## 1. Goal & Decisions
- Configure the Docker `frontend` service to run Vite's dev server with live volume bind-mounts and file-watcher polling (required for Windows Docker mounts) so changes in `frontend/src` hot-reload in the browser immediately without rebuilding the container.
- Preserve the production Nginx stage in `frontend/Dockerfile` via multi-stage targets (`dev` vs `prod`).

## 2. Files & Checklist
- [x] `frontend/Dockerfile` — Add a `base` stage (`node:22-alpine`, `npm ci`), a `dev` stage exposing port `5173` and running `npm run dev -- --host 0.0.0.0 --port 5173`, and keep the `build` + `prod` (Nginx) stages intact.
- [x] `frontend/vite.config.js` — Configure `server: { host: '0.0.0.0', port: 5173, strictPort: true, watch: { usePolling: true } }` so Vite detects file edits across Windows-to-Linux Docker bind mounts.
- [x] `compose.yaml` — Target the `dev` stage in `frontend.build`, mount `./frontend:/app` and anonymous `/app/node_modules`, map port `5173:5173`, pass `VITE_API_URL`, and update the `frontend` healthcheck to `http://127.0.0.1:5173`.

## 3. Guardrails
- Preserves existing routes/auth/`TripPlanContext`/API contracts, keeps `http://localhost:5173` and `VITE_API_URL` unchanged, and retains the production Nginx target in `frontend/Dockerfile`.
