---
name: tripana-frontend-design
description: Design system, extracted typography and color tokens, revised spacing and card-radius system, Tripana-specific UX rules, and UI anti-patterns for transforming Tripana into a clean, modern frontend. Load this skill before creating or modifying any Tripana page, layout, or UI component.
---

# Tripana Frontend Design Skill

This skill operationalizes [`design.md`](../../../design.md) for all Tripana frontend work. Read both this skill and `design.md` before designing, creating, or modifying any page, layout, or component.

---

## 1. Pre-Implementation Inspection Checklist

Before editing any frontend code:
1. Inspect the target page(s) and shared components (`frontend/src/components/`, `frontend/src/layouts/`).
2. Identify the page's primary user goal, existing functionality, and current visual inconsistencies.
3. Confirm all existing routes (`App.jsx`), guards (`AuthOnlyRoute`, `GuestOnlyRoute`), `TripPlanContext`, `apiClient.js`, services, validators, and RSA/JWT auth flows remain untouched.

---

## 2. Single Design Format Tokens (Summary of `design.md`)

- **Typography**: `'Nunito', sans-serif` (display/headings) + `'Poppins', sans-serif` (body/UI), regular (`400`) & medium (`500`) for most content, semibold (`600`) for important headings, bold (`700`) sparingly, `tabular-nums` for dates/times/durations/ratings/counters. Editorial headlines on landing; scannable density on dashboards.
- **Colors**:
  - Neutrals: `#F8FAFC` (`slate-50`) app canvas, `#F4F5F7`/`#FFFFFF` editorial canvas, `#FFFFFF` elevated surfaces, `#F1F5F9` (`slate-100`) muted surfaces, `#0F172A` (`slate-900`) dark surface & primary ink, `#475569` secondary ink, `#64748B` muted ink, `#E2E8F0` hairline borders.
  - Single Primary Accent: `#2563EB` (`blue-600`, hover `#1D4ED8`, soft tint `#EFF6FF`) strictly for primary actions, selected states, links, focus rings, and key interactive elements.
  - Functional Status Only: Green (`#16A34A`), Amber (`#F59E0B`), Red (`#DC2626`) only when communicating real status, ratings, or destructive actions.
- **Spacing**: Strict 4px/8px rhythm (`4`, `8`, `12`, `16`, `24`, `32`, `48`, `64` px), shared layout grid alignment, purposeful whitespace.
- **Radius**: `rounded-2xl` (primary cards/modals/maps), `rounded-xl` (nested panels/inputs/secondary cards), `rounded-lg` (buttons/selects/rows), `rounded-full` (avatars/status dots/genuine status pills).
- **Borders & Depth**: Subtle `#E2E8F0` borders only where separation helps; prefer spacing, typography, surface contrast, photography, and restrained shadows; use open layouts, dividers, columns, and timelines instead of forcing everything into cards.

---

## 3. Tripana Domain & Component Standards

- **Destination Discovery**: Clear hierarchy for destination name, location, dates, and budget; readable photography without obscuring overlays; avoid identical generic cards for every item.
- **Itinerary Planning**: Chronological day headings and time labels; visually distinguish attractions, travel segments, activities, and breaks; show travel durations/routes when available; thoughtful empty, loading, error, and partial states.
- **Maps & Routes**: Sufficient map space, clear route/location distinction, accessible non-obscuring controls, coordinated with the itinerary.
- **AI Recommendations**: Clearly presented as suggestions distinct from confirmed user choices, with clear accept/edit/regenerate/remove actions where supported; never invent ratings, opening hours, or travel times.
- **Button Hierarchy**: Primary (`blue-600`), Secondary (`white` + `slate-200` border), Tertiary (low-emphasis text/ghost), Destructive (`red-600` + confirmation modal).
- **Section & Viewport Sizing**: On landing or full-screen showcase sections paired with a `fixed` navbar, use `lg:min-h-svh` (rather than `calc(100svh - navbarHeight)`) with `scroll-mt-16` on anchor targets so each section fills the full viewport without the next section peeking in at the bottom, while keeping section content compact enough to fit comfortably within a standard desktop viewport (`1280×720`+).
- **Icons & States**: Consistent `lucide-react` icons (`16px`–`20px`, `strokeWidth={1.75}`–`2`); full hover/focus-visible/active/disabled/loading states; `40px`–`44px` touch targets; keyboard navigation and `prefers-reduced-motion` support.

---

## 4. Landing Page Viewport & Modern Motion Standards

- **Viewport-Fit Landing Sections**:
  - Size each landing page section to fit the user's viewport (`min-h-[100dvh]`, accounting for navbar height on the hero) using flex/grid centering (`flex flex-col justify-center`) so each section presents a focused, full-screen composition.
  - Prefer `min-h-[100dvh]` over rigid `h-screen overflow-hidden` so content never clips on smaller screens or when zoomed, and ensure zero horizontal overflow down to `375px`.
- **On-Scroll Animations & Transitions**:
  - Use `framer-motion` (`whileInView`, `viewport={{ once: true, amount: 0.25 }}`) for clearly perceptible section reveals (`0.75s`–`0.95s` duration, `opacity: 0 -> 1`, `y: 28`–`36px -> 0`) and staggered group entrances (`staggerChildren: 0.14`, `delayChildren: 0.08`) with modern ease-out curves such as `[0.22, 1, 0.36, 1]`. Avoid overly fast `200ms`–`400ms` entrance animations that feel invisible.
  - Support smooth section-to-section scroll transitions (`scroll-smooth`) and scroll-linked visual progression where it clarifies hierarchy without blocking content.
- **On-Hover Animations**:
  - Apply responsive, tactile hover transitions (`transition-all duration-300 ease-out`) on interactive cards, buttons, links, and media: subtle lift (`-translate-y-1` or `translate-x-1` on list items), border/shadow elevation, icon nudges (`group-hover:translate-x-1`, `group-hover:scale-110`), and smooth image zoom (`scale-105 duration-700 ease-out` inside `overflow-hidden`).
- **UI & State Transitions**:
  - Use `AnimatePresence mode="wait"` (`~0.42s` ease-out, `y: 16 -> 0`) and smooth transitions for tabs, category switchers, accordions, drawers, modals, and multi-step flows.
  - Animate GPU-composited properties (`transform`, `opacity`) and always honor `prefers-reduced-motion` (`<MotionConfig reducedMotion="user">`, `motion-reduce:transition-none`).

---

## 5. Prohibited Patterns (Must Remove & Never Introduce)

1. Gradient hero headings or gradient text.
2. Emojis as UI/nav icons, illustrations, or decoration.
3. Bright, colored card outlines or accent-colored borders on static cards.
4. Decorative eyebrow badges or pill labels above every heading.
5. Cursor-following beams, spotlights, glowing cursors, or mouse-tracking effects.
6. Arbitrary spacing, inconsistent padding, or misaligned edges.
7. Em dashes (`—`) anywhere in UI copy, headings, descriptions, or labels.
8. Generic unstyled fonts or oversized/bold-everywhere headings.
9. Flat ungrouped layouts lacking hierarchy or depth.
10. Excessive pill-shaped buttons, oversized rounded containers, or purposeless nested cards.
11. Decorative blobs, floating elements, unnecessary gradients, glassmorphism, or distracting background motion.
12. Repeated 3-card templates when a better composition fits.
13. Fake testimonials, fabricated ratings, invented travel statistics, or placeholder data presented as real.
14. Replacing functional components with static mockups or claiming unimplemented features work.
