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

3. **Draft the Implementation Plan**
   Present a clear, concise plan covering:
   - **Files to Modify / Create**: Exact paths and what changes in each.
   - **Design Alignment** (if frontend): Which `design.md` tokens (typography, `#2563EB` single accent, 4px/8px spacing, `rounded-2xl`/`xl`/`lg` radii, surface hierarchy) apply and which prohibited patterns are being removed.
   - **Preservation Checks**: Confirmation that auth (RSA/JWT/OTP/OAuth), routes, `TripPlanContext`, and API contracts remain intact.
   - **Verification Steps**: Exact commands to run after building (`npm run lint && npm run build`, `pytest`, etc.).

4. **Gate on User Review**
   - **Stop and ask the user to review and approve the plan** before editing any source files.
   - Do not start writing application code until the user confirms or adjusts the plan.
