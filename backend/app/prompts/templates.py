"""Prompt templates for itinerary generation with accurate timing and route optimization."""

from typing import Optional


def build_itinerary_prompt(
    destination: str,
    start_date: str,
    end_date: str,
    travel_style: str,
    interests: list[str],
    group_size: int,
    pace: str = "moderate",
    budget_per_day: float = 2500.0,
    dietary_restrictions: Optional[list[str]] = None,
    mobility_concerns: Optional[str] = None,
) -> str:
    """Build the user prompt for itinerary generation with route & time constraints."""
    dietary_info = (
        f"Dietary restrictions: {', '.join(dietary_restrictions)}"
        if dietary_restrictions
        else ""
    )
    mobility_info = (
        f"Mobility considerations: {mobility_concerns}"
        if mobility_concerns
        else ""
    )

    interests_str = ", ".join(interests) if interests else "general sightseeing"
    pace_description = {
        "relaxed": "one or two main activities per day with plenty of rest",
        "moderate": "two to three main activities per day with some downtime",
        "fast": "three to four main activities per day, constantly exploring",
    }.get(pace, "moderate pace")

    prompt = f"""Create a detailed {destination} itinerary from {start_date} to {end_date}.
Pacing: {pace} ({pace_description}).
Group size: {group_size}.
Travel style: {travel_style}.
Interests: {interests_str}.
Budget per day: INR {budget_per_day:.2f}.
{dietary_info}
{mobility_info}

Route and time optimization rules:
- Minimize travel time between locations by grouping morning, afternoon, and evening stops geographically.
- Maintain a sensible schedule to prevent backtracking and traveler fatigue.
- Return structured day-by-day plans with distinct time slots (morning, afternoon, evening) and practical transit tips.
"""
    return prompt.strip()
