# Plan: Dashboard Page Revision (`/dashboard`)

- **Date**: 2026-11-24 | **Status**: Completed

## 1. Goal & Decisions
- Revise `frontend/src/pages/Dashboard.jsx` to align with the `tripana-frontend-design` system (`Nunito` + `Poppins`, `#2563EB` single primary accent, strict 4px/8px spacing, `tabular-nums`, and accessible contrast/states).
- **Hero Header**: Retain the rotating photo banner (`pic1`–`pic7`), refined with balanced overlay gradient, proper responsive layout (replacing arbitrary `pt-25`/`mt-25`), and a high-contrast primary `Plan a Trip` CTA (`rounded-lg`, `#2563EB` / crisp surface hierarchy without off-palette orange icons).
- **Interactive Schedule & Live-Synced Route Map**: Add an inline trip switcher (or click-to-preview from Saved Trips) plus interactive Day 1..N tabs on the Featured Schedule timeline, with the Route Map synced to the selected trip/day and quick links to `/itinerary/:id` and `/map?itinerary=:id`.

## 2. Files & Checklist
- [x] `frontend/src/pages/Dashboard.jsx` —
  - Refine the rotating hero slideshow banner with clean typography, date badge (`tabular-nums`), `prefers-reduced-motion` support, and primary `Plan a Trip` button (`rounded-lg`).
  - Redesign the 3 summary metric cards (`Total Trips`, `Upcoming`, `Places Visited`) using scannable `tabular-nums` counters, subtle `#E2E8F0` (`slate-200`) borders, and `#2563EB` (`blue-600`) accent tokens (removing off-palette orange icon treatments and heavy full-card blue hover fills).
  - Upgrade **Featured Schedule** with a trip selector dropdown/switcher, horizontal Day tabs (`Day 1`, `Day 2`, ...), structured chronological timeline rows (distinguishing attractions, breaks, and visited status), and an inline loading state when switching trips.
  - Upgrade **Route Map** & **Saved Trips** so the map previews the active trip/day stops (`allStops` / selected day filter toggle) with a taller, clear frame and `Saved Trips` rows allow either previewing on the dashboard or opening `/itinerary/:id` directly.

## 3. Guardrails
- Preserves existing routes (`/dashboard`, `/itinerary/:id`, `/itineraryPage`, `/map`), `Sidebar`, `Footer`, `TripTypeModal`, `EarthLoader`, `useAuth`, `authService.logout`, and `itineraryService.list`/`get` contracts, and follows `tripana-frontend-design`.
