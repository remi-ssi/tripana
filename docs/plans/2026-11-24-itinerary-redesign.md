# Plan: Itinerary Pages Redesign (`/itinerary/:itineraryId` & `/itineraryPage`)

- **Date**: 2026-11-24 | **Status**: Completed

## 1. Goal & Decisions
- Unslop and align both the Itinerary Detail & Schedule Editor (`/itinerary`, `/itinerary/:itineraryId`) and the My Itineraries list view (`/itineraryPage` + `ItineraryCard`) with `Dashboard.jsx` and `tripana-frontend-design`.
- Use a two-column workspace on `/itinerary/:itineraryId`: chronological day-by-day timeline with day tabs/sections on the left, and a sticky Route Map + Trip Summary sidebar on the right.
- Remove all emojis (`📍`), colored top borders (`borderTop: 3px solid orange/blue`), gradient headers, hardcoded `min-w-[950px]` search bars, and non-standard colors (`#EEF3FA`, `#BFDBFE`), replacing them with `Nunito` + `Poppins`, `tabular-nums`, `slate` neutrals, and single `#2563EB` (`blue-600`) primary accent.

## 2. Files & Checklist
- [x] `frontend/src/pages/itinerary.jsx` — Replace `bg-blue-700` header with a clean `bg-white border-b border-slate-200` workspace header (breadcrumb back button, trip type pill, `Nunito` title, destination/accommodation subtitle, Edit/Save/Cancel & Delete actions, and 5-metric `tabular-nums` summary bar); organize main content into a 12-column grid (`lg:col-span-7` day-by-day timeline with refined `TimelineItem` cards for attractions/breaks/departures; `lg:col-span-5` sticky Route Map card with day/all filter + Trip Summary card).
- [x] `frontend/src/pages/itineraryPage.jsx` — Replace `#EEF3FA` background, gradient top bar, and broken `min-w-[950px]` search row with a `ml-16 min-h-screen bg-slate-50` workspace layout (`max-w-7xl`), clean page header with "Plan a Trip" CTA, 3-card `tabular-nums` stats row, responsive search + filter toolbar (`rounded-xl`), clean empty/no-match states, and accessible `tabular-nums` pagination.
- [x] `frontend/src/components/itineraryCard.jsx` — Remove `📍` emoji, orange/blue `borderTop`, and inline hover styles; redesign as a clean `rounded-2xl border border-slate-200 bg-white p-5` card with `lucide-react` icons (`MapPin`, `CalendarDays`, `Clock`, `ArrowUpRight`), `tabular-nums` date range and stop count, and tactile Tailwind hover lift.

## 3. Guardrails
- Preserves existing routes (`/itinerary`, `/itinerary/:itineraryId`, `/itineraryPage`, `/saved`), `itineraryService` calls (`list`, `get`, `updateSchedule`, `delete`), `ConfirmDeleteModal`, `ConfirmSaveModal`, `TripTypeModal`, `MapWidget`, and `Sidebar` (`dashboardNav`).
