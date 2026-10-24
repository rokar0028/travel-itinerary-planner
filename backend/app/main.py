from fastapi import Depends, FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.models import (
    DayPlan,
    GenerateItineraryRequest,
    GenerateItineraryResponse,
    TripDetail,
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


def bearer_token(authorization: str | None = Header(default=None)) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "Missing or invalid Authorization header")
    return authorization.removeprefix("Bearer ").strip()


def supabase_user_client(token: str = Depends(bearer_token)):
    if not settings.supabase_configured or not settings.supabase_anon_key:
        raise HTTPException(
            503,
            "Supabase anon key required for authenticated trips (set SUPABASE_ANON_KEY).",
        )
    try:
        user_id = supabase_store.verify_access_token(
            settings.supabase_url, settings.supabase_anon_key, token
        )
    except ValueError as e:
        raise HTTPException(401, str(e)) from e
    client = supabase_store.get_user_client(
        settings.supabase_url, settings.supabase_anon_key, token
    )
    return client, user_id


@app.get("/health")
def health():
    return {
        "status": "ok",
        "supabase": settings.supabase_configured,
        "auth_mode": "user_jwt" if settings.supabase_anon_key else "service_role",
    }


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
def save_trip(
    body: GenerateItineraryRequest,
    auth: tuple = Depends(supabase_user_client),
):
    client, user_id = auth
    gen = generate_itinerary(body)
    trip_id = supabase_store.save_trip(client, user_id, body, gen.itinerary)
    return {"trip_id": trip_id, "itinerary": gen.itinerary}


@app.get("/api/trips", response_model=list[TripSummary])
def get_trips(auth: tuple = Depends(supabase_user_client)):
    client, user_id = auth
    return supabase_store.list_trips(client, user_id)


@app.get("/api/trips/{trip_id}", response_model=TripDetail)
def get_trip(trip_id: str, auth: tuple = Depends(supabase_user_client)):
    client, _user_id = auth
    detail = supabase_store.get_trip(client, trip_id)
    if not detail:
        raise HTTPException(404, "Trip not found")
    return detail
