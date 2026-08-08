# Presenter script — Cursor features on this lab

Open **`student-cursor-demo/`** as the Cursor folder (or open the monorepo and `@` paths under it).  
Audience already knows: models, Plan/Debug/Ask/Agent, and `/create-skill`.  
This script is everything else, tied to **this** repo.

Estimated time: **12–15 minutes**.

---

## Before you present (2 minutes setup)

```bash
cd student-cursor-demo
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
pytest -q
```

You should see **failures / xfail** — that’s intentional.

Stay on branch `cursor/student-demo-lab-7b0a` (or any branch ahead of `main`) so `@Branch` has a diff.

Plant one extra local edit if you want a juicier working-tree story:

```python
# bottom of src/gradebook.py — temporary demo vandalism
def letter_grade(average: float) -> str:
    return "A"  # oops
```

Don’t commit it; leave it dirty for checkpoint / review beats.

---

## Feature map (what to show → exact prompt)

### 1) `@Branch` + missing tests (2 min)

**Why:** Students usually only `@` one file. This reviews the whole lab delta.

```text
@Branch (Diff with Main) Summarize risk areas and missing tests for a CS lab submission.
Focus on student-cursor-demo/: gradebook bugs, scheduler complexity, and gaps called out in tests/*.py comments.
```

**What to point at in the answer:**
- `category_average` divides by `len - 1`
- `drop_lowest` empties a one-score homework category
- Weights ≠ 1.0 are ignored
- Scheduler is O(minutes × intervals) brute force
- Tests file literally lists missing cases

Optional follow-up: click the **context ring** and show Branch/diff tokens.

---

### 2) Tab + Inline Edit → Agent (2 min)

Open `src/scheduler.py`, start typing a helper under `_merge`:

```python
def free_gaps(day: Interval, busy: list[Interval]) -> list[Interval]:
```

- Let **Tab** complete a body that walks merged busy intervals.
- Select a messy bit → **Cmd/Ctrl+K**: `use half-open intervals and match existing style`
- **Cmd/Ctrl+L**: `wire free_gaps into earliest_common_slot and add a test`

---

### 3) Checkpoints (not Git) (1–2 min)

Prompt Agent:

```text
Refactor gradebook.py aggressively — inline everything, rename freely, add caching.
```

When it goes too far: open the chat **checkpoint** timeline → **Restore**.  
Say: “Undo the agent without burning your git history.”

---

### 4) Built-in review skills (2–3 min)

```text
/review-bugbot Review student-cursor-demo/src/gradebook.py for logic bugs and edge cases.
```

```text
/review-security Does this lab code handle untrusted input safely if we later expose course_average over HTTP?
```

Then the lab skill:

```text
/submit-lab
```

(`/submit-lab` is project-local under `.cursor/skills/submit-lab`.)

---

### 5) `/explain-like-ta` (1–2 min) — Caltech-friendly

```text
/explain-like-ta Why might drop_lowest_hw=True produce a 0% homework component for a student who only submitted one assignment?
```

Or without slash (skill may auto-attach):

```text
Explain like a TA: trace earliest_common_slot for the example in examples/office-hours.md. Don't write new code yet.
```

---

### 6) Worktrees + `/best-of-n` (2–3 min)

```text
/best-of-n Rewrite earliest_common_slot to merge all busy intervals and walk gaps in O(n log n). Keep tests green. Compare approaches.
```

If `/best-of-n` isn’t available in your build, substitute:

```text
/worktree Implement gap-walking earliest_common_slot in isolation; don't touch my working tree until I say apply.
```

**Say:** “Try two solutions without trashing the branch you’re presenting from.”

---

### 7) Debug Mode beat (1–2 min) — only if not already covered earlier

Switch to **Debug Mode**:

```text
pytest fails on test_course_average_simple_no_drop — expected ~80 but got something else. Instrument category_average and course_average, I'll re-run pytest.
```

Re-run `pytest -q` in the terminal so it can collect evidence.

---

### 8) Optional closers (pick one)

**Browser / UI** — skip unless you add a tiny frontend; this lab is CLI/pytest.

**GitHub MCP** (if connected):

```text
Open a draft PR description for student-cursor-demo summarizing known bugs and test gaps.
```

**Cloud Agent** (20-second tease):

```text
[Cloud] Fix the gradebook average bug, add regression tests, run pytest, open a PR.
```

---

## Tight 8-minute cut

| Min | Move | Prompt / action |
|-----|------|-----------------|
| 0–2 | `@Branch` risks | prompt in §1 |
| 2–3 | Checkpoint restore | aggressive refactor → restore |
| 3–5 | `/review-bugbot` + `/submit-lab` | prompts in §4 |
| 5–6 | `/explain-like-ta` | drop_lowest singleton |
| 6–8 | `/best-of-n` or `/worktree` | scheduler rewrite |

---

## Planted bugs cheat-sheet (presenter only)

| Location | Bug | Good demo tool |
|----------|-----|----------------|
| `category_average` | `sum / (len - 1)` inflates averages | Debug Mode, failing pytest |
| `drop_lowest` | `len <= 1` → empty tuple | `/explain-like-ta`, `/review-bugbot` |
| `course_average` | weights ≠ 1.0 ignored | `@Branch` missing tests |
| `earliest_common_slot` | minute-by-minute brute force | `/best-of-n` |

---

## Skills included in this lab

| Skill | Invoke | Role |
|-------|--------|------|
| `submit-lab` | `/submit-lab` | Pre-submit checklist (tests, TODOs, diff) |
| `explain-like-ta` | `/explain-like-ta` or auto | Socratic explanation + traces |

Rule: `.cursor/rules/python-lab.mdc` (pytest, type hints, no secrets).

---

## What not to spend time on

- Model picker deep-dive  
- Re-teaching Plan/Ask/Agent  
- Building `/create-skill` from scratch (show `/submit-lab` instead)  
- Automations / environment builds unless someone asks  

---

## Reset between takes

```bash
cd student-cursor-demo
git checkout -- .
git clean -fd
pytest -q
```
