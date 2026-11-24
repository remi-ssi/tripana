---
name: tripana-plan
description: >-
  Token-efficient planning skill for Tripana. Always use FIRST before any feature, UI change, or refactor. Inspects only target files, asks focused clarifying questions via ask_question when decisions exist, writes a concise Markdown plan to docs/plans/YYYY-MM-DD-<slug>.md, and stops for user approval.
---

# Tripana Planning Skill (`tripana-plan`)

Use this skill **before** implementing any feature, UI change, refactor, or multi-file edit.

> **Hard Constraint**: Do not modify any application source files (`frontend/src/**`, `backend/app/**`) during planning. Only create or update `docs/plans/YYYY-MM-DD-<slug>.md`.

## Token-Efficiency Rules

- **No Double-Reading**: `AGENTS.md` is already in your system prompt—never call `read_file` on `AGENTS.md`. For frontend tasks, read `.agents/skills/tripana-frontend-design/SKILL.md` (which already summarizes `design.md`); only read `design.md` if you need a detail not in the skill.
- **Read Only Target Files**: Read only the exact files being changed (batch all reads in one parallel turn). Do not scan the whole repository.
- **Keep Plans Compact**: Write a tight, actionable `.md` plan (under 60 lines). Do not copy-paste boilerplate design rules into the plan file.

---

## Procedure

### 1. Inspect Target Files (1 Turn)
- Batch-read the specific target files (`frontend/src/pages/...`, `backend/app/...`) and `.agents/skills/tripana-frontend-design/SKILL.md` (if UI work) in a single parallel turn.

### 2. Clarify Open Decisions (`ask_question`)
- If inspecting the target code reveals genuine UX, layout, scope, or behavior choices (or if the user's request is ambiguous), call `ask_question` with 1–3 concise multiple-choice questions (recommended option first, prefixed with `(Recommended)`), **and stop your turn** to wait for the answer.
- If the request is already 100% specific and unambiguous, skip `ask_question` and write the `.md` plan file directly so you don't waste an extra round-trip turn.

### 3. Write Concise Markdown Plan (`docs/plans/YYYY-MM-DD-<slug>.md`)
Call `write_file` to create `docs/plans/YYYY-MM-DD-<slug>.md` using this compact template:

```markdown
# Plan: <Title>

- **Date**: YYYY-MM-DD | **Status**: Draft

## 1. Goal & Decisions
- 1–3 bullets summarizing the change and any user-confirmed decisions.

## 2. Files & Checklist
- [ ] `path/to/file` — concise list of edits
- [ ] `path/to/file2` — concise list of edits

## 3. Guardrails
- Preserves existing routes/auth/`TripPlanContext`/API contracts and follows `tripana-frontend-design`.
```

### 4. Gate on User Approval
- Reply in 2–3 lines with a clickable link to `docs/plans/YYYY-MM-DD-<slug>.md` and ask: *"Ready to build?"*
- **STOP.** Do not repeat the plan contents in chat, and do not edit application code until the user approves.
