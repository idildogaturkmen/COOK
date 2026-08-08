"""Meeting scheduler: earliest common free slot.

Given busy intervals for each person on a single day, find the earliest
contiguous free window of length `duration_min` that works for everyone.

Intervals are half-open [start, end) in minutes from midnight (0–1440).
"""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class Interval:
    start: int  # inclusive, minutes from midnight
    end: int  # exclusive


DayWindow = Interval  # alias for the searchable day range


def _merge(intervals: list[Interval]) -> list[Interval]:
    if not intervals:
        return []
    ordered = sorted(intervals, key=lambda i: (i.start, i.end))
    merged = [ordered[0]]
    for cur in ordered[1:]:
        prev = merged[-1]
        if cur.start <= prev.end:
            merged[-1] = Interval(prev.start, max(prev.end, cur.end))
        else:
            merged.append(cur)
    return merged


def earliest_common_slot(
    busy_by_person: list[list[Interval]],
    *,
    duration_min: int,
    day: DayWindow = Interval(9 * 60, 17 * 60),
) -> Interval | None:
    """Return the earliest free slot of `duration_min`, or None.

    Starter implementation is a slow brute-force scan (1-minute steps).
    A strong solution merges everyone's busy intervals and walks gaps once.
    """
    if duration_min <= 0:
        return None
    if day.end - day.start < duration_min:
        return None

    # Brute force — fine for demos /best-of-n "make this O(n log n)".
    for start in range(day.start, day.end - duration_min + 1):
        end = start + duration_min
        conflict = False
        for person_busy in busy_by_person:
            for b in person_busy:
                # overlap of [start, end) and [b.start, b.end)
                if start < b.end and end > b.start:
                    conflict = True
                    break
            if conflict:
                break
        if not conflict:
            return Interval(start, end)
    return None


def format_slot(slot: Interval | None) -> str:
    if slot is None:
        return "no slot"
    def hhmm(m: int) -> str:
        return f"{m // 60:02d}:{m % 60:02d}"
    return f"{hhmm(slot.start)}–{hhmm(slot.end)}"
