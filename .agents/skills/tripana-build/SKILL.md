---
name: tripana-build
description: >-
  Token-efficient implementation skill for Tripana. Use AFTER the user approves docs/plans/YYYY-MM-DD-<slug>.md. Applies planned edits in parallel batches while obeying tripana-frontend-design and AGENTS.md preservation rules, runs only the single relevant verification check once at the end, and marks the plan completed.
---

# Tripana Build Skill (`tripana-build`)

Use this skill **only after** the user approves `docs/plans/YYYY-MM-DD-<slug>.md`.

## Token-Efficiency Rules

- **Never Re-Read Known Files**: Do not re-read files (`AGENTS.md`, `design.md`, target source files, or the plan file) that are already in your conversation context.
- **Batch Edits**: Apply all independent file edits in parallel in a single turn.
- **One Plan Update Only**: Do not edit the `.md` plan file multiple times during the build (`In Progress` -> `Built` -> `Completed`). Update it **once** at the very end when marking items `- [x]` and setting `Status: Completed`.
- **No Redundant Verifications**:
  - Do **not** run lint or build after every individual file edit—only once after all code edits are finished.
  - Run **only** the check that matches what changed:
    - CSS / UI / copy / minor JSX tweak: `cd frontend && npm run lint` (only add `&& npm run build` if imports, routes, dependencies, or Vite/build configs changed).
    - Backend Python edit: `cd backend && pytest <target_test_file>` (only run the full test suite if shared core/auth/models changed).
  - Do **not** launch a separate `tripana-review` phase or run `git diff` shell commands after building unless the user explicitly asks for an audit.

---

## Procedure

1. **Pre-Flight Check**: Confirm `docs/plans/YYYY-MM-DD-<slug>.md` exists and was approved by the user. (If not, run `tripana-plan` first.)
2. **Implement Planned Changes**:
   - Execute the items in `docs/plans/YYYY-MM-DD-<slug>.md` cleanly.
   - Follow `.agents/skills/tripana-frontend-design/SKILL.md` (`Nunito` + `Poppins`, `tabular-nums`, `#F8FAFC`/`#FFFFFF` surfaces, `#E2E8F0` borders, `#2563EB` single primary accent, 4px/8px spacing, `rounded-2xl`/`xl`/`lg`/`full`, zero prohibited patterns).
   - Preserve existing routes, guards, `TripPlanContext`, `apiClient.js`, auth flows, and backend contracts.
3. **Single Scoped Verification**:
   - Run the minimal verification command once after your final code edit. If it fails, use `tripana-debug` to fix the root cause.
4. **Finalize Plan**:
   - In one `edit_file` call, check off `- [x]` in `docs/plans/YYYY-MM-DD-<slug>.md` and set `Status: Completed`.
   - Report completion concisely to the user.
