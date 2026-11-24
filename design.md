# Tripana Unified Design Format (`design.md`)

This document is the single source of truth for Tripana's visual design system. Every page, layout, modal, and UI component must follow this format without exception.

---

## 1. Typography (Extracted & Standardized)

- **Extracted Font Stack**: `'Nunito', sans-serif` for display/headings and `'Poppins', sans-serif` (fallback: `system-ui, -apple-system, sans-serif`) for body, forms, navigation, and controls.
- **Weight Discipline**: Use regular (`400`) and medium (`500`) weights for most content, semibold (`600`) for important headings, and bold (`700`) sparingly. Avoid making every heading oversized or bold.
- **Page Density**: Landing pages may use larger editorial headlines; dashboard and planning pages must prioritize efficient scanning and readable information density.
- **Numeric Alignment**: Apply `tabular-nums` (`font-variant-numeric: tabular-nums`) on dates, times, durations, ratings, prices, and counters.
- **No Gradient Text**: Never use gradient-colored hero headings or gradient text to create emphasis.

### Type Scale
| Token | Size / Line-Height | Weight | Tracking | Usage |
| --- | --- | --- | --- | --- |
| `display` | `clamp(2.25rem, 4vw, 3.25rem)` / `1.12` | `700` | `-0.025em` | Landing hero headline only (solid ink) |
| `page-title` | `1.5rem`–`1.875rem` (`text-2xl` / `text-3xl`) / `1.2` | `600`–`700` | `-0.02em` | Top-level route heading |
| `section-title` | `1.25rem` (`text-xl`) / `1.3` | `600` | `-0.015em` | Section headers, modal titles |
| `card-title` | `1rem`–`1.125rem` (`text-base` / `text-lg`) / `1.35` | `600` | `-0.01em` | Card headers, itinerary day titles |
| `body` | `0.9375rem`–`1rem` (`text-[15px]` / `text-base`) / `1.6` | `400` | `0` | Body copy, form labels |
| `meta` | `0.8125rem`–`0.875rem` (`text-xs` / `text-sm`) / `1.45` | `400`–`500` | `0` | Subtitles, addresses, timestamps |
| `micro` | `0.75rem` (`text-xs`) / `1.3` | `500` | `0.02em` | Table headers, genuine status chips |

---

## 2. Color Palette (Extracted Neutrals + One Primary Accent)

### Neutral Surfaces & Ink
| Role | Hex / Tailwind Token | Usage |
| --- | --- | --- |
| **App Canvas** | `#F8FAFC` (`slate-50`) | Authenticated app page backgrounds |
| **Editorial Canvas** | `#F4F5F7` or `#FFFFFF` | Landing and informational pages |
| **Elevated Surface** | `#FFFFFF` (`white`) | Cards, modals, navbars, drawers |
| **Muted Surface** | `#F1F5F9` (`slate-100`) | Inputs, inactive tabs, secondary grouping |
| **Dark Surface** | `#0F172A` (`slate-900`) | Footers and high-contrast sections |
| **Primary Ink** | `#0F172A` (`slate-900`) / `#1A1F36` | Headings and primary copy |
| **Secondary Ink** | `#475569` (`slate-600`) | Descriptions and supporting text |
| **Muted Ink** | `#64748B` (`slate-500`) | Metadata, captions, placeholders (maintain WCAG AA contrast) |
| **Hairline Border** | `#E2E8F0` (`slate-200`) | Subtle neutral borders when separation is needed |
| **Hover Border** | `#CBD5E1` (`slate-300`) | Interactive neutral hover borders |

### Single Primary Accent
- **Primary Accent**: `#2563EB` (`blue-600`) — use strictly for primary actions, selected states, links, focus indicators, and key interactive elements. Do not use it on every card, heading, icon, or decorative element.
- **Primary Hover**: `#1D4ED8` (`blue-700`).
- **Soft Accent Tint**: `#EFF6FF` (`blue-50`) with `#1D4ED8` text for selected chips and active navigation states.
- **Functional Status Colors**: Green (`#16A34A`) for success/visited, Amber (`#F59E0B`) for warnings/star ratings, Red (`#DC2626`) for errors and destructive actions. These communicate actual meaning and are not additional brand accents.
- **Consolidation**: Retire competing decorative accents (orange `#F97316` / `#F5820A`, indigo `#2B2D8E`, purple, pink) from cards, headings, and borders.

---

## 3. Spacing, Radius, Borders & Depth

### Spacing System (4px / 8px Rhythm)
- **Allowed Scale**: `4px` (`1`), `8px` (`2`), `12px` (`3`), `16px` (`4`), `24px` (`6`), `32px` (`8`), `48px` (`12`), `64px` (`16`). Never use arbitrary values.
- **Layout Grid Alignment**: Align headings, descriptions, forms, cards, and primary actions to a shared layout grid (`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8` for main app views; `max-w-3xl` / `max-w-4xl` for wizard steps and legal pages).
- **Whitespace**: Use whitespace to establish hierarchy. Do not add empty space merely to look luxurious, and do not compress content until it feels crowded.
- **Card Padding**: `p-5` (`20px`) for compact cards; `p-6` (`24px`) for standard cards and modals.
- **Gaps**: `gap-3` (`12px`) for inline controls; `gap-4` or `gap-6` (`16px`–`24px`) for grids; `space-y-6` or `space-y-8` between sections.

### Card Round-Edging System
Use the same radius token for components serving the same purpose. Avoid rounding every container excessively or overusing pill-shaped buttons.
| Component Tier | Radius Token | Pixel Value |
| --- | --- | --- |
| Primary cards, modals, map containers | `rounded-2xl` | `16px` |
| Nested panels, form inputs, secondary cards | `rounded-xl` | `12px` |
| Buttons, selects, compact list rows | `rounded-lg` | `8px` |
| Avatars, status dots, genuine status pills | `rounded-full` | `9999px` |

### Borders & Depth
- Use subtle neutral borders (`#E2E8F0`) only when they improve separation or clarify interaction.
- Prefer hierarchy through spacing, typography, surface contrast (`#F8FAFC` canvas vs `#FFFFFF` surfaces), photography, and restrained shadows (`shadow-xs` / `shadow-sm`).
- Avoid bright colored borders, heavy outlines, excessive drop shadows, decorative card frames, and nested cards without a clear purpose.
- Do not force every piece of content into a card. Use open layouts, dividers, columns, timelines, and grouped sections when they communicate more clearly.

---

## 4. Layout & Composition

- Give every page a clear visual hierarchy, deliberate composition, consistent content width/gutter, and shared edge alignment.
- Use responsive grids based on available space; prevent horizontal overflow and content clipping at all breakpoints (down to `375px`).
- Ensure every section fits its content naturally; avoid fixed heights that cut off dynamic content.
- Keep related information visually grouped and separate unrelated content with whitespace.
- Tailor layouts to page purpose: landing pages, trip dashboards, itinerary editors, discovery pages, authentication screens, and profile settings each have distinct structural needs rather than one repeated template.

---

## 5. Tripana-Specific Design Direction

Tripana is a travel planning application. Its interface should communicate exploration, clarity, confidence, and practical usefulness:

- **Destination Discovery**: Use high-quality destination photography when it adds value; give destination names and details (location, dates, budget) clear hierarchy; avoid unreadable decorative overlays and avoid turning every destination into an identical generic card.
- **Itinerary Planning**: Prioritize chronological readability with clear day headings and time labels; visually distinguish attractions, travel segments, activities, and breaks; show travel durations and route info when available; make editing, rearranging, and reviewing intuitive via timelines, grouped lists, and maps; handle empty, loading, error, and partially generated states thoughtfully.
- **Maps and Routes**: Give maps sufficient space to be useful; keep clear distinctions between selected locations, route lines, and surrounding info; keep map controls accessible without obscuring content; coordinate the map with the itinerary rather than treating it as decoration.
- **AI-Generated Recommendations**: Present recommendations as helpful suggestions rather than unquestionable facts; distinguish suggested content from confirmed user choices; provide clear actions for accepting, editing, regenerating, or removing suggestions when supported; never invent ratings, opening hours, travel times, or other factual travel data.

---

## 6. Components, Interactions & Motion

### Shared Components & Button Hierarchy
Reuse existing components in `frontend/src/components/` and `frontend/src/layouts/` rather than duplicating slightly different implementations across pages.
- **Button Hierarchy**:
  - **Primary**: One clear, high-priority action (`bg-blue-600 text-white hover:bg-blue-700`).
  - **Secondary**: Supporting action (`bg-white border border-slate-200 text-slate-800 hover:bg-slate-50`).
  - **Tertiary**: Low-emphasis action (`text-slate-600 hover:text-slate-900 hover:bg-slate-100`).
  - **Destructive**: Clearly communicates consequences (`bg-red-600 text-white hover:bg-red-700` or confirmation via `ConfirmDeleteModal`).
- **Icons**: Use `lucide-react` with consistent sizing (`16px`–`20px`) and stroke weight (`1.75`–`2`). Never use emojis as interface icons.
- **Interactive States**: Every interactive element must provide clear hover, focus (`focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2`), active, disabled, and loading states where applicable, with `40px`–`44px` minimum touch targets.

### Motion & Effects
- Motion must communicate a meaningful state change using subtle opacity or small positional transitions (`150ms`–`250ms` ease-out).
- Avoid cursor-following beams/spotlights, constantly moving decorative backgrounds/blobs, unnecessary parallax, large entrance animations on every component, excessive blur, glassmorphism, glow, spring effects, or animations that delay access to content.
- Respect `prefers-reduced-motion` and keep the interface polished when animations are disabled.

---

## 7. Writing & Content

- Use clear, concise, natural language and action-oriented button labels.
- **Never use em dashes (`—`)** in interface copy, headings, descriptions, or labels. Rewrite using periods, commas, colons, or `·`.
- Avoid marketing jargon, repetitive descriptions, generic feature claims, and excessive labels.
- Use badges only when they convey genuine status or meaningful classification. Do not add an eyebrow label above every page heading.
- Never include fake testimonials, fabricated ratings, invented travel statistics, or placeholder data presented as real data. Clearly distinguish demonstration data if used.

---

## 8. Strictly Prohibited Patterns Checklist

Do not introduce or retain any of the following unless explicitly requested by the user:
1. Gradient-colored hero headings or gradient text.
2. Emojis used as interface icons, navigation icons, section illustrations, or decorative elements.
3. Cards with bright, colored outlines or accent-colored borders.
4. Small decorative badges, eyebrow labels, or pill-shaped labels above every heading.
5. Cursor-following beams, spotlight effects, glowing cursors, and mouse-tracking animations.
6. Arbitrary spacing, inconsistent padding, and misaligned content.
7. Em dashes (`—`) in interface copy, headings, descriptions, and labels.
8. Generic unstyled typography and default-looking component combinations.
9. Flat layouts lacking visual hierarchy, depth, or meaningful grouping.
10. Excessive pill-shaped buttons, oversized rounded containers, and purposeless nested cards.
11. Decorative blobs, floating elements, unnecessary gradients, glassmorphism, and distracting background effects.
12. Repeated three-card layouts, identical feature sections, and predictable landing templates when a better composition fits.
13. Fake testimonials, fabricated ratings, invented travel statistics, and placeholder content presented as real data.

---

## 9. Implementation Rules

### Before Making Changes
1. Inspect the existing project structure, framework, styling system, component library, installed fonts, and design tokens.
2. Inspect the actual page and shared components to improve, identifying the primary user goal, existing functionality, and visual inconsistencies.
3. Reuse existing architecture and dependencies whenever practical, defining/reusing design tokens before introducing new styling.

### While Implementing
1. Improve the actual interface structure and hierarchy, not just CSS colors.
2. Preserve existing features, routes, API integrations, data structures, authentication, validation, and business logic.
3. Keep components reusable and maintainable; improve shared components only when needed and avoid redesigning unrelated pages unless consistency requires it.
4. Remove obsolete styles and unused decorative effects when safe.
5. Never replace functional components with static mockups, and never claim a feature works unless it is actually implemented.
