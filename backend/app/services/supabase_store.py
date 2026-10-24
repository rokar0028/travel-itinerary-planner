from datetime import date

from supabase import Client, create_client

from app.models import DayPlan, GenerateItineraryRequest, TripDetail, TripSummary


def get_admin_client(url: str, key: str) -> Client:
    return create_client(url, key)


def get_user_client(url: str, anon_key: str, access_token: str) -> Client:
    client = create_client(url, anon_key)
    client.postgrest.auth(access_token)
    return client


def verify_access_token(url: str, anon_key: str, access_token: str) -> str:
    client = create_client(url, anon_key)
    response = client.auth.get_user(access_token)
    if not response or not response.user:
        raise ValueError("Invalid or expired session")
    return str(response.user.id)


def save_trip(
    client: Client,
    user_id: str,
    req: GenerateItineraryRequest,
    itinerary: list[DayPlan],
) -> str:
    trip_row = (
        client.table("trips")
        .insert(
            {
                "user_id": user_id,
                "destination": req.destination.strip(),
                "start_date": req.start_date.isoformat(),
                "days": req.days,
                "budget_inr": req.budget_inr,
                "style": req.style,
                "group_size": req.group_size,
            }
        )
        .execute()
    )
    trip_id = trip_row.data[0]["id"]

    if req.interests:
        client.table("trip_interests").insert(
            [{"trip_id": trip_id, "interest": i} for i in req.interests]
        ).execute()

    client.table("itinerary_days").insert(
        [
            {
                "trip_id": trip_id,
                "day_number": d.day,
                "plan_date": d.date.isoformat(),
                "morning": d.morning,
                "afternoon": d.afternoon,
                "evening": d.evening,
                "tips": d.tips,
            }
            for d in itinerary
        ]
    ).execute()

    return trip_id


def list_trips(client: Client, user_id: str) -> list[TripSummary]:
    rows = (
        client.table("trips")
        .select("id, destination, start_date, days, budget_inr, style, group_size, created_at")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )
    out: list[TripSummary] = []
    for r in rows.data or []:
        out.append(
            TripSummary(
                id=r["id"],
                destination=r["destination"],
                start_date=date.fromisoformat(r["start_date"]),
                days=r["days"],
                budget_inr=r["budget_inr"],
                style=r["style"],
                group_size=r["group_size"],
                created_at=r.get("created_at"),
            )
        )
    return out


def get_trip(client: Client, trip_id: str) -> TripDetail | None:
    trip_res = client.table("trips").select("*").eq("id", trip_id).execute()
    if not trip_res.data:
        return None
    r = trip_res.data[0]

    interest_rows = (
        client.table("trip_interests")
        .select("interest")
        .eq("trip_id", trip_id)
        .execute()
    )
    interests = [row["interest"] for row in interest_rows.data or []]

    day_rows = (
        client.table("itinerary_days")
        .select("day_number, plan_date, morning, afternoon, evening, tips")
        .eq("trip_id", trip_id)
        .order("day_number")
        .execute()
    )
    itinerary = [
        DayPlan(
            day=row["day_number"],
            date=date.fromisoformat(row["plan_date"]),
            morning=row["morning"],
            afternoon=row["afternoon"],
            evening=row["evening"],
            tips=row["tips"],
        )
        for row in day_rows.data or []
    ]

    days = int(r["days"])
    group_size = int(r["group_size"])
    budget_inr = int(r["budget_inr"])
    per_day = max(1, int(budget_inr / max(days, 1) / max(group_size, 1)))

    return TripDetail(
        id=r["id"],
        destination=r["destination"],
        start_date=date.fromisoformat(r["start_date"]),
        days=days,
        budget_inr=budget_inr,
        style=r["style"],
        group_size=group_size,
        created_at=r.get("created_at"),
        interests=interests,
        itinerary=itinerary,
        budget_per_person_per_day_inr=per_day,
    )
