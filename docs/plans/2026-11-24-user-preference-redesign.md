# Plan: Redesign `/user-preference` Travel Style Onboarding Page

- **Date**: 2026-11-24 | **Status**: Completed

## 1. Goal & Decisions
- Redesign `frontend/src/pages/user_preference.jsx` (`/user-preference`) to align with the Tripana design system (`tripana-frontend-design`), removing multi-colored pastel card fills/borders (`emerald`, `amber`, `rose`, `pink`, `orange`, `violet`, `teal`), all-caps oversized `font-black` blue heading, and ad-hoc inline transition timers.
- **Card Visuals**: Keep existing PNG illustrations (`../assets/*.png`) inside neutral `#FFFFFF` (`bg-white`) cards (`rounded-2xl`) with `#E2E8F0` (`border-slate-200`) default borders, short category sub-labels, and single primary accent `#2563EB` (`blue-600` border/ring, `#EFF6FF` soft tint badge/selection highlight, and `Check` indicator) when selected.
- **Page Shell**: Use a focused onboarding layout on `#F8FAFC` (`bg-slate-50`) without `Sidebar` (`dashboardNav`), featuring a clean top bar with the Tripana brand mark, signed-in user context, and a subtle "Sign out" action (`handleLogout`), plus a responsive action footer with tabular selection counter (`tabular-nums`), "Select all / Clear" helper, and primary `Continue to dashboard` button.

## 2. Files & Checklist
- [x] `frontend/src/pages/user_preference.jsx` — Replace `Sidebar` shell with focused onboarding header + centered container; replace rainbow category palette with neutral white cards (`rounded-2xl`), PNG illustrations in subtle `slate-50` frames (`bg-blue-50/70` when selected), `Nunito` + `Poppins` typography, `framer-motion` entrance (`MotionConfig reducedMotion="user"`), accessible `aria-pressed` toggle cards, error alert banner, and primary `rounded-lg` CTA button.

## 3. Guardrails
- Preserves all 8 category IDs (`nature`, `cultural`, `adventure`, `events`, `food`, `city`, `entertainment`, `wellness`), `authService.savePreferences(selected)`, `setAuthSession(user, true)`, `handleLogout`, and navigation to `/dashboard` / `/login`.
