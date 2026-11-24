# Tripana Workflow & Token-Efficiency Rules

All feature work, UI redesigns, and refactors follow a lean, token-efficient `Plan -> Approve -> Build` workflow:

1. **Plan First (`tripana-plan`)**:
   - Inspect only the target files being changed (never re-read `AGENTS.md`, which is already in context, and use `.agents/skills/tripana-frontend-design/SKILL.md` instead of reading full `design.md` unless needed).
   - If genuine UX, layout, or scope questions exist, call `ask_question` (1–3 questions) and wait for the user's answer.
   - Write a compact Markdown plan (<60 lines) to `docs/plans/YYYY-MM-DD-<slug>.md` using `write_file`.
   - **Hard Gate**: Link the `.md` plan file in 2–3 lines (do not repeat the plan in chat) and wait for user approval before editing any application code.

2. **Build (`tripana-build`)**:
   - Execute only after `docs/plans/YYYY-MM-DD-<slug>.md` is approved.
   - Do not re-read files already in context. Batch independent edits in parallel.
   - Run **at most one** scoped verification check after all edits finish (e.g., `npm run lint` for UI/JSX edits; only run `npm run build` if imports/routes/deps/config changed; only run targeted `pytest` when backend changed).
   - Update `docs/plans/YYYY-MM-DD-<slug>.md` **once** at the end (`Status: Completed`, `- [x]`).

3. **On-Demand Review & Debug (`tripana-review` / `tripana-debug`)**:
   - Only run `tripana-review` when the user explicitly requests a review/audit—never as an automatic extra pass after building.
   - Only run `tripana-debug` when a command or runtime check actually fails.
