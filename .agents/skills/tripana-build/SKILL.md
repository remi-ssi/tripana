---
name: tripana-build
description: Implementation skill for Tripana. Executes an approved plan step-by-step while strictly following design.md, tripana-frontend-design, and AGENTS.md preservation rules.
---

# Tripana Build Skill

Use this skill only after the user has reviewed and approved the plan.

## Procedure

1. **Follow the Approved Plan**
   - Implement each planned change in order without adding unrequested features or unrelated refactors.
   - If a blocker or missing requirement forces a change to the plan, pause and inform the user before diverging.

2. **Enforce Single Design Format (`design.md`)**
   - Load [`.agents/skills/tripana-frontend-design/SKILL.md`](../tripana-frontend-design/SKILL.md) and [`design.md`](../../../design.md) for all UI edits.
   - Apply the extracted `Nunito` + `Poppins` typography scale, neutral palette + `#2563EB` single accent, 4px/8px spacing system, and `rounded-2xl` / `rounded-xl` / `rounded-lg` / `rounded-full` radius hierarchy.
   - Ensure zero prohibited patterns (no hero gradient text, emojis, colored card borders, eyebrow badges, cursor beams, inconsistent spacing, em dashes `—`, generic fonts, or flat design).

3. **Preserve Existing Architecture**
   - Reuse existing components, services, hooks, validators, and `apiClient.js`.
   - Keep `AuthOnlyRoute`, `GuestOnlyRoute`, `TripPlanContext`, RSA encryption, and backend schemas intact.

4. **Verify Locally**
   - Frontend: `cd frontend && npm run lint && npm run build`
   - Backend: `cd backend && pytest`
   - Fix any lint, build, or test errors (invoking `tripana-debug` if needed) before handing off to `tripana-review`.
