"""Optional Groq/OpenAI itinerary generation for cities without curated content."""

import json
import os
import re
from datetime import date

import httpx

from app.services.itinerary import KNOWN_DESTINATIONS, build_itinerary


def _llm_configured() -> tuple[str, str] | None:
    groq = os.getenv("GROQ_API_KEY", "").strip()
    if groq:
        return ("groq", groq)
    openai = os.getenv("OPENAI_API_KEY", "").strip()
    if openai:
        return ("openai", openai)
    return None


def _extract_json_array(text: str) -> list[dict]:
    text = text.strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*", "", text)
        text = re.sub(r"\s*```$", "", text)
    data = json.loads(text)
    if isinstance(data, dict) and "itinerary" in data:
        data = data["itinerary"]
    if not isinstance(data, list):
        raise ValueError("LLM response is not a JSON array")
    return data


def _call_llm(
    provider: str,
    api_key: str,
    destination: str,
    start: date,
    days: int,
    budget: int,
    style: str,
    interests: list[str],
    group_size: int,
) -> list[dict]:
    system = (
        "You are a travel planner for India and worldwide cities. "
        "Return ONLY valid JSON: an array of day objects with keys "
        "morning, afternoon, evening, tips (strings). No markdown."
    )
    user = json.dumps(
        {
            "destination": destination,
            "start_date": start.isoformat(),
            "days": days,
            "budget_inr_total": budget,
            "style": style,
            "interests": interests,
            "group_size": group_size,
            "instructions": (
                "Each day needs distinct morning/afternoon/evening activities. "
                "Tips should mention budget per person and transport. "
                f"Number exactly {days} days; day numbers are assigned server-side."
            ),
        }
    )
    if provider == "groq":
        url = "https://api.groq.com/openai/v1/chat/completions"
        model = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
    else:
        url = "https://api.openai.com/v1/chat/completions"
        model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

    payload = {
        "model": model,
        "temperature": 0.6,
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
    }
    with httpx.Client(timeout=45.0) as client:
        res = client.post(
            url,
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json=payload,
        )
        res.raise_for_status()
        content = res.json()["choices"][0]["message"]["content"]

    raw_days = _extract_json_array(content)
    if len(raw_days) < days:
        raise ValueError("LLM returned fewer days than requested")

    from datetime import timedelta

    out: list[dict] = []
    for i in range(days):
        row = raw_days[i]
        d = start + timedelta(days=i)
        out.append(
            {
                "day": i + 1,
                "date": d,
                "morning": str(row.get("morning", "")).strip() or f"Explore {destination}",
                "afternoon": str(row.get("afternoon", "")).strip()
                or f"Afternoon in {destination}",
                "evening": str(row.get("evening", "")).strip()
                or f"Evening in {destination}",
                "tips": str(row.get("tips", "")).strip()
                or f"Group of {group_size} · {style}",
            }
        )
    return out


def generate_itinerary_with_fallback(
    destination: str,
    start: date,
    days: int,
    budget: int,
    style: str,
    interests: list[str],
    group_size: int,
) -> tuple[list[dict], str]:
    """
    Returns (days, source) where source is 'curated', 'llm', or 'template'.
    Curated cities always use rule-based content; others try LLM when configured.
    """
    key = destination.strip().lower()
    if key in KNOWN_DESTINATIONS:
        return (
            build_itinerary(
                destination, start, days, budget, style, interests, group_size
            ),
            "curated",
        )

    cfg = _llm_configured()
    if cfg:
        provider, api_key = cfg
        try:
            days_out = _call_llm(
                provider,
                api_key,
                destination,
                start,
                days,
                budget,
                style,
                interests,
                group_size,
            )
            return days_out, "llm"
        except Exception:
            pass

    return (
        build_itinerary(
            destination, start, days, budget, style, interests, group_size
        ),
        "template",
    )
