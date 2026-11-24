# Plan: Unslop Trip Plan Page (`/trip-plan`) & Wizard Shell

- **Date**: 2026-11-24 | **Status**: Completed

## 1. Goal & Decisions
- Polish `/trip-plan` (`TripPlanPage.jsx`) and its shared wizard shell (`PageLayout.jsx`, `ProgressBar.jsx`, `HotelMapModal.jsx`) to align with `tripana-frontend-design`.
- Use an elevated white form card (`rounded-2xl`, `border-slate-200`, `bg-white`, `shadow-sm`) on a `slate-50` canvas with unified white inputs (`rounded-xl`), leading Lucide icons (`MapPin`, `Building2`, `Calendar`, `Clock`, `Compass`), `tabular-nums` for dates/times/counters, and a clear secondary "Pin on Map" button.
- Remove all prohibited patterns: em dashes (`—`), decorative emojis (`📍`, `🗺️`, `✓`), mixed gray/white input fills, and ad-hoc green buttons in the map modal.

## 2. Files & Checklist
- [x] `frontend/src/pages/TripPlanPage.jsx` — Wrap form in an elevated white card (`rounded-2xl border-slate-200 p-6 sm:p-8`); unify all inputs (`bg-white border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15`, leading `lucide-react` icons, `tabular-nums`); replace em dash in empty hotel state; style city/hotel suggestion dropdowns cleanly; add labeled secondary "Pin on Map" button; replace raw info badge with accessible `Info` tooltip; update primary CTA (`bg-blue-600 hover:bg-blue-700 rounded-xl`).
- [x] `frontend/src/pages/PageLayout.jsx` — Upgrade canvas to `bg-slate-50`; refine top bar ("Back to Dashboard" with `ArrowLeft` icon), display header (`Nunito` heading, `slate-600` subtitle), and exit confirmation modal (`rounded-2xl`, `border-slate-200`, destructive `red-600` confirm action).
- [x] `frontend/src/components/ProgressBar.jsx` — Replace raw inline SVGs with crisp `lucide-react` icons (`MapPin`, `SlidersHorizontal`, `Compass`, `Clock`, `FileText`, `Check` for completed steps); refine step circles (`w-10 h-10`), `tabular-nums` step indicators, active ring (`bg-blue-600 text-white ring-4 ring-blue-50`), and `slate-200`/`blue-600` connectors.
- [x] `frontend/src/components/map/HotelMapModal.jsx` — Remove emojis (`📍`, `🗺️`, `✓`); replace green "Use Current Location" & confirm buttons with Tripana hierarchy (secondary `slate-200` button with `LocateFixed` icon for current location; primary `blue-600` button with `Check` icon for confirming location); add clean modal header bar with title and `X` close button; apply `tabular-nums` to coordinates.

## 3. Guardrails
- Preserves existing routes (`/trip-plan`, `/preference`, `/dashboard`), `TripPlanContext` state (`formData`, `updateFormData`, `hotelCoords`), `useFormHandler`, `useHotelSearch`, `useCitySuggestions`, `useMapModal`, and Mapbox functionality.
