from datetime import date
from typing import Literal

from pydantic import BaseModel, Field


TravelStyle = Literal[
    "Budget backpacker",
    "Balanced",
    "Comfort / mid-range",
    "Luxury",
]


class GenerateItineraryRequest(BaseModel):
    destination: str = Field(min_length=1, max_length=120)
    start_date: date
    days: int = Field(ge=1, le=14)
    budget_inr: int = Field(ge=1000)
    style: TravelStyle = "Balanced"
    interests: list[str] = Field(min_length=1)
    group_size: int = Field(ge=1, le=12)


class DayPlan(BaseModel):
    day: int
    date: date
    morning: str
    afternoon: str
    evening: str
    tips: str


class GenerateItineraryResponse(BaseModel):
    destination: str
    days: int
    style: str
    budget_per_person_per_day_inr: int
    itinerary: list[DayPlan]


class TripSummary(BaseModel):
    id: str
    destination: str
    start_date: date
    days: int
    budget_inr: int
    style: str
    group_size: int
    created_at: str | None = None


class TripDetail(TripSummary):
    interests: list[str]
    itinerary: list[DayPlan]
    budget_per_person_per_day_inr: int
