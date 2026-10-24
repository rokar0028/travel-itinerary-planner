from datetime import date, timedelta

INTERESTS = [
    "Food & street eats",
    "History & culture",
    "Nature & outdoors",
    "Shopping",
    "Nightlife",
    "Art & museums",
    "Adventure sports",
    "Relaxation / beaches",
]

STYLES = [
    "Budget backpacker",
    "Balanced",
    "Comfort / mid-range",
    "Luxury",
]

SAMPLE: dict[str, dict[str, list[str]]] = {
    "goa": {
        "Food & street eats": ["Anjuna flea + beach shacks", "Panaji Fontainhas walk + thali"],
        "Nature & outdoors": ["Dudhsagar day trip", "Palolem sunset kayak"],
        "Relaxation / beaches": ["Baga morning swim", "Candolim spa afternoon"],
        "Nightlife": ["Tito's / Club Cubana evening", "Silent Noise party (seasonal)"],
        "History & culture": ["Old Goa churches", "Fort Aguada sunset"],
        "Shopping": ["Mapusa market", "Calangute souvenir lane"],
        "Art & museums": ["Museum of Goa", "Local gallery hop in Panaji"],
        "Adventure sports": ["Water sports at Calangute", "Scuba intro at Grande Island"],
    },
    "jaipur": {
        "History & culture": ["Amber Fort morning", "City Palace + Jantar Mantar"],
        "Food & street eats": ["Lassi + kachori crawl", "Chokhi Dhani evening"],
        "Shopping": ["Johari / Bapu Bazaar", "Block-print workshop"],
        "Art & museums": ["Albert Hall Museum", "Hawa Mahal photo walk"],
        "Nature & outdoors": ["Nahargarh sunset", "Jal Mahal viewpoint"],
        "Adventure sports": ["Hot-air balloon (seasonal)", "Desert jeep safari day trip"],
        "Nightlife": ["Rooftop dinner in C-Scheme", "Folk music café"],
        "Relaxation / beaches": ["Heritage hotel pool day", "Spa in old city"],
    },
}


def build_itinerary(
    destination: str,
    start: date,
    days: int,
    budget: int,
    style: str,
    interests: list[str],
    group_size: int,
) -> list[dict]:
    key = destination.strip().lower()
    pool = SAMPLE.get(key, {})
    picks: list[str] = []
    for interest in interests:
        picks.extend(pool.get(interest, [])[:1])
    if not picks:
        picks = [
            f"Morning: explore main sights in {destination}",
            f"Afternoon: local food walk ({style})",
            f"Evening: free time / café hop",
        ]

    days_out: list[dict] = []
    for i in range(days):
        d = start + timedelta(days=i)
        a = picks[i % len(picks)]
        b = picks[(i + 1) % len(picks)]
        daily_budget = max(500, int(budget / max(days, 1) / max(group_size, 1)))
        days_out.append(
            {
                "day": i + 1,
                "date": d,
                "morning": a if i % 2 == 0 else f"Breakfast + light walk in {destination}",
                "afternoon": b if i % 2 == 1 else f"Main activity: {a}",
                "evening": f"Dinner suited to {style} · ~₹{daily_budget}/person",
                "tips": f"Group of {group_size} · keep buffer for transport",
            }
        )
    return days_out
