---
name: tripana-review
description: Verification and diff-review skill for Tripana. Audits implemented changes against the approved plan, design.md, and repository guardrails.
---

# Tripana Review Skill

Use this skill after `tripana-build` completes to verify that the implementation matches the approved plan and adheres to Tripana's single design format.

## Review Checklist

1. **Plan Conformance**
   - Inspect `git status` and `git diff` across all modified/created files.
   - Verify every item in the approved plan was implemented completely.
   - Flag any unplanned edits, missing requirements, or broken contracts (routes, `TripPlanContext`, `apiClient.js`, auth flows).

2. **Design Format Audit (`design.md`)**
   - Verify `Nunito` + `Poppins` typography scale and `tabular-nums` on numeric metadata.
   - Verify neutral surface hierarchy (`#F8FAFC` canvas, `#FFFFFF` elevated cards, `#E2E8F0` hairline borders) and single `#2563EB` primary accent.
   - Verify 4px/8px spacing rhythm and consistent `rounded-2xl` / `rounded-xl` / `rounded-lg` / `rounded-full` radii.
   - Scan modified UI files for any prohibited patterns:
     - Hero gradient text (`bg-clip-text text-transparent`)
     - Decorative emojis
     - Colored borders on static cards
     - Eyebrow badges above headings
     - Cursor-following beams or spotlights
     - Em dashes (`—`) in UI copy
     - Flat ungrouped layouts

3. **Build & Test Verification**
   - Confirm `cd frontend && npm run lint && npm run build` (and `cd backend && pytest` if backend changed) ran after the final edit and passed cleanly.

4. **Report Findings**
   - Summarize: (a) Plan items verified, (b) Any discrepancies or remaining issues, and (c) Observed check results.
