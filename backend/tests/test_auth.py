import pytest
from fastapi.testclient import TestClient

from app.config import get_settings
from app.main import app

client = TestClient(app)

_TRIP_BODY = {
    "destination": "Goa",
    "start_date": "2026-11-01",
    "days": 2,
    "budget_inr": 15000,
    "style": "Balanced",
    "interests": ["Food & street eats"],
    "group_size": 2,
}


def test_trips_missing_authorization():
    res = client.post("/api/trips", json=_TRIP_BODY)
    assert res.status_code == 401
    assert "Authorization" in res.json()["detail"]


@pytest.mark.skipif(
    not get_settings().supabase_anon_key,
    reason="SUPABASE_ANON_KEY required to verify JWT handling",
)
def test_trips_invalid_jwt_returns_401():
    res = client.post(
        "/api/trips",
        json=_TRIP_BODY,
        headers={"Authorization": "Bearer not-a-valid-jwt"},
    )
    assert res.status_code == 401
    assert "session" in res.json()["detail"].lower()
