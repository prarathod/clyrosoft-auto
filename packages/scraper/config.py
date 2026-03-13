"""
Scraper configuration.
Edit PROFESSIONS and CITY_AREAS to control what gets scraped.
Queries are auto-generated as "{profession} {area}".
"""

# ─── Professions to scrape ────────────────────────────────────────────────────
PROFESSIONS = [
    "dental clinic",
    "eye clinic",
    "physiotherapy clinic",
    "skin clinic",
    "child specialist clinic",
]

# ─── Bangalore — every major area ─────────────────────────────────────────────
BANGALORE_AREAS = [
    # South
    "Koramangala", "BTM Layout", "JP Nagar", "Jayanagar",
    "Banashankari", "Basavanagudi", "HSR Layout", "Bellandur",
    "Sarjapur Road", "Electronic City", "Bommanahalli",
    # North
    "Yelahanka", "Hebbal", "Sahakarnagar", "Vidyaranyapura",
    "Nagawara", "HBR Layout", "Thanisandra", "Jakkur",
    "RT Nagar", "Jalahalli",
    # East
    "Indiranagar", "Domlur", "HAL", "Whitefield", "Marathahalli",
    "KR Puram", "Mahadevapura", "Brookefield", "Varthur",
    "Hoodi", "Thubarahalli",
    # West
    "Rajajinagar", "Vijayanagar", "Malleswaram", "Yeshwanthpur",
    "Peenya", "Tumkur Road", "Nagarbhavi",
    # Central
    "MG Road", "Shivajinagar", "Frazer Town", "Cox Town",
    "Richmond Town", "Vasanth Nagar",
    # Outer
    "Kengeri", "Uttarahalli", "Gottigere", "Begur",
    "Hosa Road", "Chandapura", "Anekal",
]

# ─── Other cities (broad sweep) ───────────────────────────────────────────────
OTHER_CITIES = [
    "Mysore", "Hubli", "Mangalore", "Tumkur", "Belgaum",
    "Davangere", "Shimoga", "Hassan", "Udupi",        # Karnataka tier-2
    "Pune", "Nashik", "Aurangabad", "Nagpur",          # Maharashtra
    "Hyderabad", "Warangal", "Vizag",                  # Telangana/AP
    "Chennai", "Coimbatore", "Madurai",                # Tamil Nadu
]

# ─── Auto-generate all queries ────────────────────────────────────────────────
def get_all_queries(city: str = "Bangalore") -> list:
    """Returns all queries for a city. Defaults to full Bangalore sweep."""
    if city.lower() == "bangalore":
        queries = []
        for profession in PROFESSIONS:
            for area in BANGALORE_AREAS:
                queries.append(f"{profession} {area} Bangalore")
        return queries
    else:
        return [f"{p} {city}" for p in PROFESSIONS]

# Default queries used when running without --city flag
SEARCH_QUERIES = [
    "dental clinic Koramangala Bangalore",
    "dental clinic Indiranagar Bangalore",
]

# ─── Filtering thresholds ─────────────────────────────────────────────────────
MIN_RATING = 3.5
MIN_REVIEWS = 5

# ─── Bad website domains (clinics here still need a real site) ────────────────
BAD_WEBSITE_DOMAINS = [
    "justdial.com", "sulekha.com", "wixsite.com", "weebly.com",
    "wordpress.com", "blogspot.com", "indiamart.com",
    "practo.com", "lybrate.com", "1mg.com",
    "clinicspots.com", "drlogy.com", "zocdoc.com", "healthgrades.com",
    "facebook.com", "instagram.com", "linktr.ee",
    # Booking/appointment aggregators — not real websites
    "makeo.app", "zoca.com", "click4appointment.com",
    "bookmydoctor.com", "sehat.com", "credihealth.com",
    "apollo247.com", "tata1mg.com",
]

# ─── Scraper behaviour ────────────────────────────────────────────────────────
MAX_RESULTS_PER_QUERY = 20
SCROLL_COUNT = 6
CLICK_DELAY_MS = 2500
HEADLESS = True
