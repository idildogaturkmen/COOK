---
name: submit-lab
description: Prepare a CS lab submission — run tests, flag TODOs/debug prints, summarize the diff. Use only when the user runs /submit-lab.
disable-model-invocation: true
---

# Submit lab

Run this checklist for `student-cursor-demo` before a student submits:

1. From `student-cursor-demo/`, run `pytest -q` and report pass/fail counts.
2. Search the lab for `TODO`, `FIXME`, `print(`, and `breakpoint(`.
3. List files changed vs `main` (or the assignment starter) with a short summary of each.
4. Call out missing tests mentioned in comments under `tests/`.
5. Do **not** invent grade guesses. Do **not** rewrite the solution unless asked — only report readiness.

## Output format

- Tests: …
- Flags: …
- Diff summary: …
- Submit? Yes / Not yet (why)
