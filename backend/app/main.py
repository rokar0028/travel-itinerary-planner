from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.models import (
    DayPlan,
    GenerateItineraryRequest,
    GenerateItineraryResponse,
    SaveTripRequest,
    TripSummary,
)
from app.services import itinerary as itinerary_service
from app.services import supabase_store

settings = get_settings()
app = FastAPI(title="Travel Itinerary API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok", "supabase": settings.supabase_configured}


@app.get("/api/meta")
def meta():
    return {
        "interests": itinerary_service.INTERESTS,
        "styles": itinerary_service.STYLES,
    }


@app.post("/api/itinerary/generate", response_model=GenerateItineraryResponse)
def generate_itinerary(body: GenerateItineraryRequest):
    raw = itinerary_service.build_itinerary(
        body.destination,
        body.start_date,
        body.days,
        body.budget_inr,
        body.style,
        body.interests,
        body.group_size,
    )
    per_day = max(1, int(body.budget_inr / body.days / body.group_size))
    return GenerateItineraryResponse(
        destination=body.destination.strip(),
        days=body.days,
        style=body.style,
        budget_per_person_per_day_inr=per_day,
        itinerary=[DayPlan(**d) for d in raw],
    )


@app.post("/api/trips", response_model=dict)
def save_trip(body: SaveTripRequest):
    if not settings.supabase_configured:
        raise HTTPException(503, "Supabase is not configured on the server.")

    gen = generate_itinerary(body)
    client = supabase_store.get_client(settings.supabase_url, settings.supabase_service_key)
    trip_id = supabase_store.save_trip(client, body.user_id, body, gen.itinerary)
    return {"trip_id": trip_id, "itinerary": gen.itinerary}


@app.get("/api/trips", response_model=list[TripSummary])
def get_trips(user_id: str):
    if not settings.supabase_configured:
        raise HTTPException(503, "Supabase is not configured on the server.")
    client = supabase_store.get_client(settings.supabase_url, settings.supabase_service_key)
    return supabase_store.list_trips(client, user_id)
