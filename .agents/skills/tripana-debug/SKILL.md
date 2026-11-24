---
name: tripana-debug
description: >-
  Token-efficient debugging skill for Tripana. Use ONLY when an actual build, lint, test, or runtime error occurs. Diagnoses root cause and verifies with a single targeted command.
---

# Tripana Debugging Skill (`tripana-debug`)

Use this skill only when an error or failing check occurs.

## Procedure

1. **Pinpoint Root Cause From Existing Output**:
   - Read the exact file and line number from the error output already in context. Do not run extra exploratory commands if the stack trace or lint output already names the file and line.
2. **Read & Fix in Minimal Turns**:
   - Read the failing line range and apply a targeted fix that preserves routes, `TripPlanContext`, `apiClient.js`, auth flows, and `design.md` tokens.
   - Never print `.env` secrets or silence errors with empty catch blocks.
3. **Verify Once**:
   - Re-run only the specific command or test file that failed. Once it passes, stop—do not re-run unrelated test suites.
