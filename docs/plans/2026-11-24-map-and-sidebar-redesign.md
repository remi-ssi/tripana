# Plan: Map Page (`/map`) & Sidebar (`dashboardNav.jsx`) Redesign

- **Date**: 2026-11-24 | **Status**: Completed

## 1. Goal & Decisions
- Unslop and align the global app sidebar (`dashboardNav.jsx` + `confirmLogout.jsx`) and the `/map` route (`MapPage.jsx`) with the Tripana design system (`tripana-frontend-design`).
- **Sidebar Theme**: Clean White (`bg-white`) collapsible rail (`w-16` collapsed, `w-60` expanded on hover/focus) with a `border-r border-slate-200`, grouped primary & legal navigation links, `bg-blue-50 text-blue-600` active states, and a refined user profile + logout confirmation modal.
- **Map Page Layout**: Workspace split view (`bg-slate-50`) with a clean white header, day filter pills (`All Days`, `Day 1..N`), `tabular-nums` stop status counters (`Total`, `Planned`, `Visited`), interactive stop list cards alongside the map canvas, and direct action to open the selected itinerary.

## 2. Files & Checklist
- [x] `frontend/src/components/dashboardNav.jsx` — Replace `bg-blue-700 shadow-2xl` with a clean `bg-white border-r border-slate-200` collapsible rail; separate primary workspace links (`Dashboard`, `Map`, `Itinerary`) from secondary legal/info links (`About Us`, `Terms`, `Privacy`); style active state with `bg-blue-50 text-blue-600 font-medium` and a left indicator bar; refine profile menu and avatar (`bg-blue-50 text-blue-700 border-blue-200`).
- [x] `frontend/src/components/confirmLogout.jsx` — Replace `bg-gray-100` and `bg-red-800` modal with a clean `rounded-2xl border border-slate-200 bg-white p-6 shadow-xl` confirmation dialog using `Nunito` heading, `slate-600` copy, secondary cancel button, and `bg-red-600 hover:bg-red-700` destructive confirm action.
- [x] `frontend/src/pages/MapPage.jsx` — Replace `bg-blue-700` top bar with a clean `bg-white border-b border-slate-200` workspace header (title, subtitle, quick `tabular-nums` stop summary badges, and "Open Itinerary" / "Plan a Trip" CTA); upgrade the left control panel (`lg:grid-cols-[360px_1fr]`) with itinerary selector, day filter pills when a specific trip is active, stop status legend (`Planned` vs `Visited`), scannable `tabular-nums` stop cards, and refined empty/loading/error states alongside `MapWidget`.

## 3. Guardrails
- Preserves existing routes (`/map`, `/dashboard`, `/itineraryPage`, `/itinerary/:itineraryId`, `/profile`, `/about`, `/terms`, `/privacy`), URL search params (`?itinerary=`), `itineraryService` calls (`list`, `get`), `MapWidget` props (`stops`, `interactive`, `showRoute`), and `authService.logout` flow.
