from datetime import date, timedelta
from typing import TypedDict

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

KNOWN_DESTINATIONS = frozenset({"goa", "jaipur"})


class SlotPlan(TypedDict):
    morning: str
    afternoon: str
    evening: str


# Curated day skeletons — interest/style layers applied in build_itinerary
GOA_DAYS: list[SlotPlan] = [
    {
        "morning": "North Goa beaches — arrive at Baga or Calangute for a swim and fresh coconut water before the crowds peak.",
        "afternoon": "Fontainhas heritage walk in Panaji — colourful lanes, cafés, and Portuguese-era balconies.",
        "evening": "Sunset at Fort Aguada viewpoint, then seafood at a beach shack (try prawn balchão or fish thali).",
    },
    {
        "morning": "Old Goa — Sé Cathedral and Basilica of Bom Jesus (UNESCO); go early for quiet courtyards.",
        "afternoon": "Anjuna flea market (Wed) or Mapusa market — spices, cashews, and bargain souvenirs.",
        "evening": "Candolim or Sinquerim coast — relaxed dinner and optional live music at a shack.",
    },
    {
        "morning": "Palolem or Agonda — calm south Goa beach, kayak or short coastal walk.",
        "afternoon": "Spice plantation tour (Ponda) with lunch — learn curry leaf, pepper, and vanilla on the vine.",
        "evening": "Return north; quiet sundowner on your favourite beach from day one.",
    },
    {
        "morning": "Water sports slot at Calangute — parasailing or jet ski (book on-site; go before noon).",
        "afternoon": "Museum of Goa (MOG) or a Panaji gallery hop for contemporary Goan art.",
        "evening": "Night out — Tito's Lane (Baga) or a seasonal Silent Noise headphone party (check dates).",
    },
    {
        "morning": "Dudhsagar Falls day trip — jeep + short trek; pack snacks and leave early.",
        "afternoon": "Rest or pool time — you've earned it after the falls trek.",
        "evening": "Revisit a favourite shack or try Goan sausage pão at a local tinto bar.",
    },
]

JAIPUR_DAYS: list[SlotPlan] = [
    {
        "morning": "Amber Fort — elephant or jeep up the ramparts; mirror palace and city views (arrive by 8:30).",
        "afternoon": "City Palace and Jantar Mantar — royal courtyards and giant sundials; hire an audio guide if curious.",
        "evening": "Hawa Mahal photo stop at golden hour, then dal baati churma or laal maas at an old-city rooftop.",
    },
    {
        "morning": "Albert Hall Museum and Ram Niwas Garden — cool marble galleries before midday heat.",
        "afternoon": "Johari Bazaar and Bapu Bazaar — jewellery, textiles, and block-print scarves (bargain politely).",
        "evening": "Nahargarh Fort sunset — wide views over the Pink City; café on the ramparts for chai.",
    },
    {
        "morning": "Jal Mahal from the roadside viewpoint; short stop at Amer stepwell (Panna Meena ka Kund).",
        "afternoon": "Hand-block printing workshop in Sanganer or bagru — see indigo vats and take home a scarf.",
        "evening": "Chokhi Dhani ethnic village — folk dance, puppet show, and Rajasthani thali (book dinner slot).",
    },
    {
        "morning": "Jaigarh Fort and Jaivana cannon — fewer crowds than Amber, great for history buffs.",
        "afternoon": "Lassi and kachori crawl — Rawat Mishtan Bhandar and nearby sweet shops.",
        "evening": "C-Scheme rooftop dinner — folk music café or heritage hotel bar for a slower night.",
    },
    {
        "morning": "Optional hot-air balloon (seasonal) or Galtaji (Monkey Temple) hike at sunrise.",
        "afternoon": "Spa or pool at your hotel — Jaipur afternoons are hot; plan indoor comfort.",
        "evening": "Light shopping at MI Road, then early night before an optional day-trip tomorrow.",
    },
]

CURATED: dict[str, list[SlotPlan]] = {
    "goa": GOA_DAYS,
    "jaipur": JAIPUR_DAYS,
}

INTEREST_EVENING: dict[str, str] = {
    "Food & street eats": "Street-food lane — follow the busiest stall (usually a good sign).",
    "History & culture": "Heritage walk or monument lit up at night if open.",
    "Nature & outdoors": "Sunset viewpoint or quiet park stroll.",
    "Shopping": "Night bazaar or artisan market for last-minute gifts.",
    "Nightlife": "Live music bar or club district — pace yourself for tomorrow.",
    "Art & museums": "Evening gallery opening or cultural centre performance.",
    "Adventure sports": "Early night — tomorrow may be physical.",
    "Relaxation / beaches": "Beach sundowner or spa treatment.",
}

INTEREST_MORNING: dict[str, str] = {
    "Food & street eats": "Breakfast crawl — local bakery, chai stall, and one signature dish.",
    "History & culture": "Flagship monument or old-town walk while sites open.",
    "Nature & outdoors": "Park, viewpoint, or easy hike in cooler morning air.",
    "Shopping": "Wholesale or craft market before afternoon heat.",
    "Nightlife": "Slow morning — brunch when you're ready.",
    "Art & museums": "Museum or gallery when doors open.",
    "Adventure sports": "Book morning slot for sports or guided activity.",
    "Relaxation / beaches": "Beach or pool morning with minimal schedule.",
}

INTEREST_AFTERNOON: dict[str, str] = {
    "Food & street eats": "Market lunch — thali, regional specialty, or food court exploration.",
    "History & culture": "Second heritage site or guided old-city lane tour.",
    "Nature & outdoors": "Garden, lake, or scenic drive with photo stops.",
    "Shopping": "Bazaar deep-dive or artisan workshop visit.",
    "Nightlife": "Café hop and people-watching in a lively district.",
    "Art & museums": "Second museum or craft village.",
    "Adventure sports": "Afternoon activity block (trek, water sports, or safari).",
    "Relaxation / beaches": "Spa, siesta, or shaded café time.",
}

STYLE_DINNER: dict[str, str] = {
    "Budget backpacker": "thali or street plates — aim for busy local joints",
    "Balanced": "mid-range restaurant with one regional signature dish",
    "Comfort / mid-range": "sit-down dinner with AC and reservations if weekend",
    "Luxury": "fine-dining or heritage hotel restaurant — dress smart-casual",
}

STYLE_TRANSPORT: dict[str, str] = {
    "Budget backpacker": "Use metro/bus where available; share autos for short hops.",
    "Balanced": "Mix app cabs and walking; pre-book day trips.",
    "Comfort / mid-range": "Private cab for full-day outings; buffer 30 min traffic.",
    "Luxury": "Chauffeur or premium cab; confirm hotel concierge pickups.",
}


def _destination_key(destination: str) -> str:
    return destination.strip().lower()


def _daily_budget(budget: int, days: int, group_size: int) -> int:
    return max(500, int(budget / max(days, 1) / max(group_size, 1)))


def _tips(
    destination: str,
    style: str,
    group_size: int,
    daily_budget: int,
    interests: list[str],
) -> str:
    transport = STYLE_TRANSPORT.get(style, STYLE_TRANSPORT["Balanced"])
    interest_hint = interests[0] if interests else "sightseeing"
    return (
        f"Group of {group_size} · ~₹{daily_budget:,}/person today · "
        f"{transport} · lean into {interest_hint.lower()}."
    )


def _apply_interest_evening(base_evening: str, interests: list[str], day_index: int) -> str:
    if not interests:
        return base_evening
    extra = INTEREST_EVENING.get(interests[day_index % len(interests)])
    if extra and day_index % 2 == 1:
        return f"{base_evening} Alternate idea: {extra}"
    return base_evening


def _build_curated(
    key: str,
    destination: str,
    start: date,
    days: int,
    budget: int,
    style: str,
    interests: list[str],
    group_size: int,
) -> list[dict]:
    templates = CURATED[key]
    dinner = STYLE_DINNER.get(style, STYLE_DINNER["Balanced"])
    days_out: list[dict] = []
    for i in range(days):
        d = start + timedelta(days=i)
        slot = templates[i % len(templates)]
        daily_budget = _daily_budget(budget, days, group_size)
        evening = _apply_interest_evening(slot["evening"], interests, i)
        if i == 0 and "Food & street eats" in interests:
            morning = slot["morning"] + " Grab a quick breakfast at a local favourite en route."
        else:
            morning = slot["morning"]
        days_out.append(
            {
                "day": i + 1,
                "date": d,
                "morning": morning,
                "afternoon": slot["afternoon"],
                "evening": f"{evening} · Dinner: {dinner} (~₹{daily_budget}/person).",
                "tips": _tips(destination, style, group_size, daily_budget, interests),
            }
        )
    return days_out


def _build_template(
    destination: str,
    start: date,
    days: int,
    budget: int,
    style: str,
    interests: list[str],
    group_size: int,
) -> list[dict]:
    dest = destination.strip() or "your destination"
    dinner = STYLE_DINNER.get(style, STYLE_DINNER["Balanced"])
    days_out: list[dict] = []
    for i in range(days):
        d = start + timedelta(days=i)
        daily_budget = _daily_budget(budget, days, group_size)
        m_key = interests[i % len(interests)]
        a_key = interests[(i + 1) % len(interests)]
        e_key = interests[(i + 2) % len(interests)]
        morning = INTEREST_MORNING.get(
            m_key,
            f"Morning: explore a headline sight in {dest}",
        ).replace("Breakfast crawl", f"Breakfast crawl in {dest}")
        afternoon = INTEREST_AFTERNOON.get(
            a_key,
            f"Afternoon: neighbourhood walk and local lunch in {dest}",
        )
        evening_base = INTEREST_EVENING.get(
            e_key,
            f"Evening: unwind at a popular district in {dest}",
        )
        if i == 0:
            morning = (
                f"Get oriented — stroll the main landmark area of {dest} "
                f"and note transport options for the week. {morning}"
            )
        days_out.append(
            {
                "day": i + 1,
                "date": d,
                "morning": morning,
                "afternoon": afternoon,
                "evening": f"{evening_base} · Dinner: {dinner} (~₹{daily_budget}/person).",
                "tips": _tips(dest, style, group_size, daily_budget, interests),
            }
        )
    return days_out


def build_itinerary(
    destination: str,
    start: date,
    days: int,
    budget: int,
    style: str,
    interests: list[str],
    group_size: int,
) -> list[dict]:
    key = _destination_key(destination)
    if key in CURATED:
        return _build_curated(
            key, destination, start, days, budget, style, interests, group_size
        )
    return _build_template(
        destination, start, days, budget, style, interests, group_size
    )
