import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from src.scheduler import Interval, earliest_common_slot, format_slot


def test_simple_morning_slot():
    busy = [
        [Interval(9 * 60, 10 * 60)],  # A busy 09:00–10:00
        [Interval(10 * 60, 11 * 60)],  # B busy 10:00–11:00
    ]
    slot = earliest_common_slot(busy, duration_min=60)
    assert slot == Interval(11 * 60, 12 * 60)
    assert format_slot(slot) == "11:00–12:00"


def test_no_slot():
    busy = [
        [Interval(9 * 60, 17 * 60)],
        [],
    ]
    assert earliest_common_slot(busy, duration_min=30) is None


# Missing on purpose:
# - overlapping busy intervals for the same person (needs merge)
# - duration longer than the day window
# - slot that must start at day.start
# - performance test for many intervals (motivates /best-of-n rewrite)
