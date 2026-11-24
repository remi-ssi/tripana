# Plan: Wizard Steps Redesign (`/preference`, `/attractions`, `/break`, `/summary`)

- **Date**: 2026-11-24 | **Status**: Completed

## 1. Goal & Decisions
- Unslop and align the remaining 4 trip-planning wizard steps (`/preference`, `/attractions`, `/break` ["Schedule"], and `/summary`) plus the shared `AttractionModal` with the redesigned `TripPlanPage` and `tripana-frontend-design` standards.
- Replace all decorative emojis, teal/multi-color selection states, pill-shaped primary buttons (`rounded-full`), and arbitrary padding with `Nunito` + `Poppins` typography, `tabular-nums`, `slate` neutrals, and single `#2563EB` (`blue-600`) primary accent.
- Keep `/summary` as a balanced two-column review layout (structured review cards on the left, sticky Trip Snapshot & Generate action panel on the right).

## 2. Files & Checklist
- [x] `frontend/src/pages/PreferencePage.jsx` — Wrap in a clean `rounded-2xl border border-slate-200 bg-white p-6 sm:p-8` card (`max-w-2xl`); remove emojis (`😴`, `🔥`, `💚`, `💼`, `✨`); style pace slider with clear scale labels, selectable interest tags (`rounded-lg`), structured 3-column budget selector cards with `lucide-react` icons, and primary/secondary footer navigation (`rounded-xl`).
- [x] `frontend/src/pages/AttractionsPage.jsx` — Upgrade search input and category select to `rounded-xl border-slate-200` with `lucide-react` `Search` and clear button; add selected counter badge; replace teal borders/badges with `blue-600` selected state and subtle `slate-200` unselected card borders; refine pagination (`tabular-nums`, `rounded-lg`) and bottom navigation bar (`rounded-xl`).
- [x] `frontend/src/components/placeInfo.jsx` (`AttractionModal`) — Replace teal selected state and `rounded-full` CTA with `blue-600` / `slate` tokens, `lucide-react` icons, `tabular-nums` ratings/coordinates, and `rounded-xl` primary action button.
- [x] `frontend/src/pages/BreakPage.jsx` — Wrap in `max-w-2xl` white `rounded-2xl` card; replace emojis (`🕐`, `☀️`, `🌤️`, `🌙`) and teal states with `lucide-react` icons (`Clock`, `Sun`, `Sunset`, `Moon`, `Check`) and `blue-600` active states; style meal rows with clean checkbox toggles and `tabular-nums` time inputs (`rounded-xl`).
- [x] `frontend/src/pages/SummaryPage.jsx` — Remove emojis (`📍`, `⚙️`, `🗺️`, `☕`, `🍽️`, `✨`, `🪄`) and non-standard padding (`px-4.5`, `py-1.75`); use `lucide-react` section icons, scannable `tabular-nums` key-value rows, numbered `blue-600` attraction chips, and a clean right-hand Trip Snapshot card with a `rounded-xl bg-blue-600` Generate CTA and loading spinner.

## 3. Guardrails
- Preserves existing routes, `TripPlanContext` state keys, validators (`preferenceValidator`, `attractionValidator`, `breakValidator`), `summaryService`, `aiService.generateItinerary`, and lazy-loaded image handling while strictly following `tripana-frontend-design`.
