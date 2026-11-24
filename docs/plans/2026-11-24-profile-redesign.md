# Plan: Profile Page & Deactivate Modal Redesign (`/profile`)

- **Date**: 2026-11-24 | **Status**: Completed

## 1. Goal & Decisions
- Unslop `/profile` (`frontend/src/pages/profile.jsx`) and the Delete Account confirmation modal (`frontend/src/components/deleteAccount.jsx`) to align with `Dashboard.jsx`, `itineraryPage.jsx`, and `tripana-frontend-design`.
- Use a responsive two-column workspace layout inside `ml-16 min-h-screen bg-slate-50` (`max-w-7xl`): Profile Identity, Travel Stats (`tabular-nums`), and Trip Preferences on the left (`lg:col-span-5`), and the Personal Info editor + Account Security & Danger Zone on the right (`lg:col-span-7`).
- Remove all legacy hardcoded hex colors (`#EEF3FA`, `#1E3A5F`, `#2B6CB0`, `#F6821F`, `#D93025`), decorative floating banner blobs, rainbow tag pills, `alert()` calls, em dashes (`—`), and emoji modal icons (`⚠️`, `🗂️`, `🔒`, `🗑️`), replacing them with `Nunito` + `Poppins`, `slate` neutrals, `#2563EB` (`blue-600`) primary accent, `#DC2626` (`red-600`) destructive states, and `lucide-react` icons.

## 2. Files & Checklist
- [x] `frontend/src/pages/profile.jsx` — Replace legacy navy/orange banner and centered narrow stack with a clean `bg-white border-b border-slate-200` workspace header and a 12-column grid (`lg:col-span-5` profile overview card with `rounded-full` avatar initials, member-since metadata, 2-card `tabular-nums` stats for Itineraries & Places, and Trip Preferences card with neutral/blue pills + Edit link to `/user-preference`; `lg:col-span-7` Personal Info form card with inline error/success banner feedback and `refreshUser` sync, plus Account Security card for Change Password and Danger Zone card for Delete Account).
- [x] `frontend/src/components/deleteAccount.jsx` — Replace 4 emoji icons (`⚠️`, `🗂️`, `🔒`, `🗑️`), inline `style` colors (`#1E3A5F`, `#DBEAFE`), and em-dash comments with `lucide-react` icons (`AlertTriangle`, `Database`, `Lock`, `Trash2`), accessible `rounded-2xl border border-slate-200 bg-white` modal styling, `tabular-nums` step progress indicator, and inline error/loading handling.

## 3. Guardrails
- Preserves existing `/profile`, `/user-preference`, `/change-password`, and `/login` routes, `useAuth` (`user`, `clearUser`, `refreshUser`), `authService` (`getPreferenceStatus`, `updateProfile`, `deleteAccount`, `logout`), `itineraryService.list()`, and `Sidebar` (`dashboardNav`).
