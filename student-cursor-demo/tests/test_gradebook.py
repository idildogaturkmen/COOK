import sys
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from src.gradebook import Category, course_average, drop_lowest, letter_grade


def test_letter_grade_basic():
    assert letter_grade(93) == "A"
    assert letter_grade(80) == "B"
    assert letter_grade(42) == "F"


def test_drop_lowest_removes_one():
    assert drop_lowest((50.0, 80.0, 90.0)) == (80.0, 90.0)


@pytest.mark.xfail(reason="starter bug: single-score category should keep the score")
def test_drop_lowest_keeps_singleton():
    assert drop_lowest((88.0,)) == (88.0,)


def test_course_average_simple_no_drop():
    cats = [
        Category("homework", 0.5, (80.0, 80.0)),
        Category("final", 0.5, (80.0,)),
    ]
    # Correct answer is 80. Starter category_average is buggy, so this may fail
    # until students fix it — useful for Debug Mode + /review demos.
    assert course_average(cats) == pytest.approx(80.0)


# Missing on purpose for the @Branch / missing-tests demo:
# - weights that do not sum to 1.0
# - empty categories list
# - drop_lowest_hw=True with multiple homework scores
# - boundary letter grades (89.9 vs 90)
