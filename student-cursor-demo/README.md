# Student Cursor Demo Lab

A tiny CS-style lab repo built to **demo lesser-known Cursor features** with Caltech / CS students.

You implement a mini **course gradebook** and a **meeting scheduler**. The starter code is intentionally imperfect: off-by-ones, missing edge cases, and thin tests — so reviews, `@Branch`, checkpoints, and `/best-of-n` have something real to chew on.

## Quick start

```bash
cd student-cursor-demo
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
pytest -q
```

## What's in the box

| Path | Purpose |
|------|---------|
| `src/gradebook.py` | Weighted averages + letter grades (**has bugs**) |
| `src/scheduler.py` | Find a common free slot (**incomplete / slow path**) |
| `tests/` | Partial coverage — great for “missing tests” demos |
| `.cursor/skills/` | `submit-lab`, `explain-like-ta` |
| `.cursor/rules/` | Python lab style rule |
| `DEMO_SCRIPT.md` | **Presenter walkthrough** — features + exact prompts |

## Assignment brief (what “students” are solving)

1. **Gradebook:** compute a weighted course average and map it to a letter grade. Drop the lowest homework when `drop_lowest_hw=True`. Handle empty categories safely.
2. **Scheduler:** given busy intervals for each person, return the earliest free slot of length `duration_min` within a day window. Prefer O(n log n) over brute force.

## Academic integrity note (say this in the demo)

Use Cursor to **explain, test, review, and iterate** — not to skip the thinking. The planted bugs exist so you can practice verification skills.
