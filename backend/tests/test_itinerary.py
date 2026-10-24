from datetime import date

from app.services.itinerary import build_itinerary


def test_goa_has_three_slots_per_day():
    days = build_itinerary(
        "Goa",
        date(2026, 1, 10),
        3,
        15000,
        "Balanced",
        ["Food & street eats", "History & culture"],
        2,
    )
    assert len(days) == 3
    for row in days:
        assert len(row["morning"]) > 20
        assert len(row["afternoon"]) > 20
        assert len(row["evening"]) > 20


def test_jaipur_curated_copy():
    days = build_itinerary(
        "jaipur",
        date(2026, 2, 1),
        2,
        20000,
        "Luxury",
        ["History & culture"],
        2,
    )
    assert "Amber" in days[0]["morning"] or "Fort" in days[0]["morning"]


def test_unknown_city_template():
    days = build_itinerary(
        "Mumbai",
        date(2026, 3, 1),
        2,
        12000,
        "Budget backpacker",
        ["Food & street eats", "Shopping"],
        1,
    )
    assert len(days) == 2
    assert all(d["tips"] for d in days)
