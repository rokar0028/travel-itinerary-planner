from app.prompts.templates import build_itinerary_prompt


def test_build_itinerary_prompt():
    prompt = build_itinerary_prompt(
        destination="Jaipur",
        start_date="2026-11-10",
        end_date="2026-11-13",
        travel_style="Cultural immersion",
        interests=["Historical sites", "Food & street eats"],
        group_size=2,
        pace="moderate",
        budget_per_day=3500.0,
        dietary_restrictions=["Vegetarian"],
        mobility_concerns="Minimal stairs",
    )
    assert "Jaipur" in prompt
    assert "2026-11-10" in prompt
    assert "Cultural immersion" in prompt
    assert "Historical sites" in prompt
    assert "Dietary restrictions: Vegetarian" in prompt
    assert "Mobility considerations: Minimal stairs" in prompt
    assert "Route and time optimization rules:" in prompt
