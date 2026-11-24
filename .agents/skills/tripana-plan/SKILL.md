---
name: tripana-plan
description: Planning skill for Tripana. Inspects the codebase, designs an explicit step-by-step implementation plan aligned with design.md and AGENTS.md, and asks the user to review and approve the plan before any code is modified.
---

# Tripana Planning Skill

Use this skill before implementing any feature, UI transformation, or multi-file change.

## Procedure

1. **Understand the Goal & Scope**
   - Identify the exact user request, target pages/endpoints, and constraints.
   - Read [`design.md`](../../../design.md) (for any UI work) and [`AGENTS.md`](../../../AGENTS.md) to verify preservation rules.

2. **Inspect the Relevant Code**
   - Locate and read only the relevant files (`frontend/src/pages/`, `frontend/src/components/`, `backend/app/`, etc.).
   - Identify existing shared components, services, validators, and routes to reuse.

3. **Interactive Alignment Interview ("Grill-Me" Check)**
   - Before writing the final plan, resolve any open design, UX, scope, or priority decisions by asking the user focused questions (using `ask_question` for clear multiple-choice decisions, or concise direct questions when open-ended).
   - Cover only genuine ambiguities found during code inspection, such as:
     - Layout direction & primary focal point (e.g., split map+list vs. stacked, dense table vs. timeline).
     - Content or sections to keep, simplify, or remove.
     - Which shared components or flows should remain untouched vs. updated.
     - Edge-case behavior (empty states, mobile layout priority, optional vs. required fields).
   - Do not ask trivial questions whose answers are already fixed by `design.md` or `AGENTS.md`. Wait for the user's answers before finalizing the plan.

4. **Draft the Implementation Plan**
   Present a clear, concise plan aligned with the user's answers covering:
   - **Files to Modify / Create**: Exact paths and what changes in each.
   - **Design Alignment** (if frontend): Which `design.md` tokens (typography, `#2563EB` single accent, 4px/8px spacing, `rounded-2xl`/`xl`/`lg` radii, surface hierarchy) apply and which prohibited patterns are being removed.
   - **Preservation Checks**: Confirmation that auth (RSA/JWT/OTP/OAuth), routes, `TripPlanContext`, and API contracts remain intact.
   - **Verification Steps**: Exact commands to run after building (`npm run lint && npm run build`, `pytest`, etc.).

5. **Gate on User Review**
   - **Stop and ask the user to review and approve the plan** before editing any source files.
   - Do not start writing application code until the user confirms or adjusts the plan.
