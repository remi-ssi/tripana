# Tripana Workflow & Design Enforcement Rules

1. **Plan Before Implementing**: For any non-trivial feature, refactor, or UI change, use the `tripana-plan` skill to draft a clear implementation plan and **ask the user to review and approve the plan before modifying any source code**.
2. **Build to the Approved Plan**: Use the `tripana-build` skill to implement only what was approved in the plan, preserving all existing Tripana architecture, routes, auth/security flows, and API contracts.
3. **One Design Format Only**: All frontend pages, layouts, and components must strictly follow [`design.md`](../../design.md) and [`.agents/skills/tripana-frontend-design/SKILL.md`](../skills/tripana-frontend-design/SKILL.md). Never introduce hero gradient text, emojis, colored card borders, eyebrow badges above headers, cursor-following beams, inconsistent spacing, em dashes (`—`), generic fonts, or flat ungrouped layouts.
4. **Review Against the Plan**: After building, use the `tripana-review` skill to verify that the actual diff matches the approved plan, obeys `design.md`, and passes lint/build/tests.
5. **Systematic Debugging**: Whenever an error, test failure, or runtime bug occurs, use the `tripana-debug` skill to diagnose the root cause and verify the fix cleanly.
