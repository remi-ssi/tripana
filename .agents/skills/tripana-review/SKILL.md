---
name: tripana-review
description: >-
  On-demand diff-review skill for Tripana. Use ONLY when the user explicitly asks to review or audit existing changes against a plan file in docs/plans/YYYY-MM-DD-<slug>.md and design.md. Do not run automatically after normal builds.
---

# Tripana Review Skill (`tripana-review`)

> **Token-Efficiency Note**: Do **not** invoke this skill automatically at the end of `tripana-build`. Only use it when the user explicitly asks for a code review or design audit.

## Procedure (Single Turn)

1. **Inspect Changes Once**:
   - If the modified files are not already in your context, run `git status --short` and inspect only the changed lines. Do not re-read unmodified files or run redundant builds if verification already passed.
2. **Check Against Plan & Design Rules**:
   - Verify all checklist items in `docs/plans/YYYY-MM-DD-<slug>.md` are complete and no contracts (routes, `TripPlanContext`, `apiClient.js`, auth) were broken.
   - Check modified UI code for prohibited patterns (gradient hero text, emojis, colored card borders, eyebrow badges, cursor beams, em dashes `—`, flat ungrouped layouts).
3. **Report Concisely**:
   - Output a short bulleted summary of findings without running extra shell commands unless a test hasn't been run yet.
