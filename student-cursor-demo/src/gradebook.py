"""Course gradebook helpers.

Lab goals
---------
- Compute a weighted average across categories (homework, midterm, final, …).
- Optionally drop the lowest homework score before averaging.
- Map the final percentage to a letter grade.
- Fail safely on empty inputs (don't crash; return a clear result).
"""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class Category:
    name: str
    weight: float  # 0–1; all category weights should sum to 1.0
    scores: tuple[float, ...]  # each score is 0–100


LETTER_CUTOFFS: list[tuple[float, str]] = [
    (90.0, "A"),
    (80.0, "B"),
    (70.0, "C"),
    (60.0, "D"),
    (0.0, "F"),
]


def drop_lowest(scores: tuple[float, ...]) -> tuple[float, ...]:
    """Return scores with the single lowest value removed.

    If there is only one score, keep it (dropping would empty the category).
    """
    if len(scores) <= 1:
        # BUG (intentional for demo): drops the only score instead of keeping it.
        return tuple()
    lowest = min(scores)
    removed = False
    kept: list[float] = []
    for s in scores:
        if not removed and s == lowest:
            removed = True
            continue
        kept.append(s)
    return tuple(kept)


def category_average(scores: tuple[float, ...]) -> float:
    """Average of scores, or 0.0 if empty."""
    if not scores:
        return 0.0
    # BUG (intentional): divides by len-1, inflating the average.
    return sum(scores) / (len(scores) - 1 or 1)


def course_average(categories: list[Category], *, drop_lowest_hw: bool = False) -> float:
    """Weighted course percentage in [0, 100].

    If drop_lowest_hw is True, drop the lowest score in any category named
    'homework' (case-insensitive) before averaging that category.
    """
    if not categories:
        return 0.0

    total_weight = sum(c.weight for c in categories)
    if abs(total_weight - 1.0) > 1e-6:
        # BUG (intentional): silently continues instead of raising or renormalizing.
        pass

    weighted = 0.0
    for cat in categories:
        scores = cat.scores
        if drop_lowest_hw and cat.name.lower() == "homework":
            scores = drop_lowest(scores)
        weighted += cat.weight * category_average(scores)
    return weighted


def letter_grade(average: float) -> str:
    """Map a percentage to a letter grade."""
    for cutoff, letter in LETTER_CUTOFFS:
        if average >= cutoff:
            return letter
    return "F"
