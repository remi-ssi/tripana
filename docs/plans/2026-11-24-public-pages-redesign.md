# Plan: About Us, Terms & Conditions, and Privacy Policy Redesign (`/about`, `/terms`, `/privacy`)

- **Date**: 2026-11-24 | **Status**: Completed

## 1. Goal & Decisions
- Unslop `/about` (`frontend/src/pages/aboutUs.jsx`), `/terms` (`frontend/src/pages/termsAndCondition.jsx`), and `/privacy` (`frontend/src/pages/privacy.jsx`) to align with `landing_page.jsx` and `tripana-frontend-design`.
- **About Us (`/about`)**: Editorial multi-section showcase matching `LandingPage` (`white` / `slate-50` surfaces, `max-w-7xl` layout, `framer-motion` scroll reveals with `MotionConfig reducedMotion="user"`):
  - **Hero**: Editorial headline (`Nunito`), concise mission summary (`Poppins`), primary `blue-600` CTA to start planning (`/trip-plan` or `/login?mode=signup` via `useAuth`) and secondary scroll CTA (`#mission`), replacing the `#EBF2FA` dot-grid, floating ambient blobs, and oversized centered logo splash.
  - **Mission & Story (`#mission`)**: Split layout pairing Tripana's mission copy with an elevated `rounded-2xl border border-slate-200 bg-white` highlight panel (removing the `#1B3A6B` deco-circle card and floating `#F5820A` `"Itinerary Ready ✓"` badge).
  - **Philippines Regions Showcase (`#destinations`)**: Luzon, Visayas, and Mindanao destination cards (`rounded-2xl border border-slate-200 bg-white overflow-hidden`) with smooth hover zoom and a working CTA button to plan a trip across the Philippines.
  - **Responsible AI Commitments (`#commitments`)**: Clean 2x2 grouped capability grid (`rounded-2xl border border-slate-200 bg-white`) with `lucide-react` icons (`ShieldCheck`, `SlidersHorizontal`, `Sparkles`, `Compass`), removing the `#F5820A` `border-l-4` card borders and all em dashes (`—`).
- **Terms (`/terms`) & Privacy (`/privacy`)**: Unify both pages onto a shared, clean editorial legal documentation layout (`bg-slate-50`, `max-w-7xl` container):
  - **Document Header**: Clean `bg-white border-b border-slate-200 pt-24 pb-10` header with `Nunito` display title, plain-language summary, and `tabular-nums` effective/updated metadata (`lucide-react` `Calendar`, `RefreshCw`) — removing decorative uppercase hero eyebrow pills (`"Please Read Carefully"`, `"Your Privacy Matters"`) and the `orange-*` theme from `/terms`.
  - **Navigation & Content Grid**: Responsive horizontal mobile jump bar (`lg:hidden`) + 12-column desktop layout (`lg:col-span-4` sticky table of contents with `IntersectionObserver` scroll-spy and support contact card; `lg:col-span-8` section cards in `rounded-2xl border border-slate-200 bg-white` with `tabular-nums` section numbers, `lucide-react` icons in `bg-blue-50 text-blue-600`, and a clean bottom agreement/contact card). Remove all em dashes (`—`) from copy.

## 2. Files & Checklist
- [x] `frontend/src/pages/aboutUs.jsx` — Replace `#EBF2FA` / `#1B3A6B` / `#F5820A` inline styles, `<style>` keyframes, floating blobs/badges,colored `border-l-4` cards, dead button, and em dashes with a responsive `framer-motion` editorial showcase (`Hero`, `Mission`, `Destinations`, `Commitments`) wired to `useAuth` and `useNavigate`.
- [x] `frontend/src/pages/termsAndCondition.jsx` — Replace `orange-*` accents, inline SVGs, decorative hero pill, and em dashes with `slate` neutrals, `#2563EB` (`blue-600`) active states, `lucide-react` icons, `tabular-nums` section indices, and clean sticky TOC + section cards.
- [x] `frontend/src/pages/privacy.jsx` — Add `IntersectionObserver` scroll-spy to match `/terms`, replace inline SVGs, decorative hero pill, `bg-blue-700` banner, and em dashes with `lucide-react` icons, `slate` neutrals, `blue-600` accents, `tabular-nums` section indices, and unified card structure.

## 3. Guardrails
- Preserves existing `/about`, `/terms`, and `/privacy` routes in `App.jsx`, shared `Navbar` (`landingNavBar.jsx`) and `Footer` (`footer.jsx`), `useAuth` hook integration, and all legal/editorial substance while strictly enforcing `tripana-frontend-design`.
