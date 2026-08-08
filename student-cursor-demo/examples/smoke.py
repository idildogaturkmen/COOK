"""Tiny manual smoke check (not pytest)."""

from src.gradebook import Category, course_average, letter_grade
from src.scheduler import Interval, earliest_common_slot, format_slot


def main() -> None:
    cats = [
        Category("homework", 0.4, (70.0, 90.0, 80.0)),
        Category("midterm", 0.3, (85.0,)),
        Category("final", 0.3, (88.0,)),
    ]
    avg = course_average(cats, drop_lowest_hw=True)
    print(f"average={avg:.2f} letter={letter_grade(avg)}")

    busy = [
        [Interval(9 * 60, 10 * 60 + 30), Interval(13 * 60, 14 * 60)],
        [Interval(10 * 60, 11 * 60), Interval(15 * 60, 16 * 60)],
        [Interval(12 * 60, 13 * 60 + 30)],
    ]
    slot = earliest_common_slot(busy, duration_min=45)
    print(f"slot={format_slot(slot)}")


if __name__ == "__main__":
    main()
