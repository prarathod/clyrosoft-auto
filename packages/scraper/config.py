"""
Scraper configuration.
Edit PROFESSIONS and CITY_AREAS to control what gets scraped.
Queries are auto-generated as "{profession} {area}".
"""

# ─── Professions to scrape ─────────────────────────────────────────────────────
# More professions = more queries = more leads per area
PROFESSIONS = [
    "dental clinic",
    "eye clinic",
    "physiotherapy clinic",
    "skin clinic",
    "child specialist clinic",
    "general physician clinic",
    "ENT clinic",
    "orthopedic clinic",
    "gynecology clinic",
    "homeopathy clinic",
]

# ─── Bangalore — focus on OUTER / residential areas (fewer websites there) ────
BANGALORE_AREAS = [
    # South — residential, high density
    "Koramangala", "BTM Layout", "JP Nagar", "Jayanagar",
    "Banashankari", "Basavanagudi", "HSR Layout", "Bellandur",
    "Sarjapur Road", "Electronic City", "Bommanahalli",
    "Hulimavu", "Arekere", "Gottigere", "Begur", "Hosa Road",
    # North — large residential pockets
    "Yelahanka", "Hebbal", "Sahakarnagar", "Vidyaranyapura",
    "Nagawara", "HBR Layout", "Thanisandra", "Jakkur",
    "RT Nagar", "Jalahalli", "Kogilu", "Kannur", "Bagalur",
    # East
    "Indiranagar", "Domlur", "HAL", "Whitefield", "Marathahalli",
    "KR Puram", "Mahadevapura", "Brookefield", "Varthur",
    "Hoodi", "Thubarahalli", "Kadugodi", "Budigere",
    # West
    "Rajajinagar", "Vijayanagar", "Malleswaram", "Yeshwanthpur",
    "Peenya", "Tumkur Road", "Nagarbhavi", "Kengeri",
    "Uttarahalli", "Rajarajeshwari Nagar", "Mysore Road",
    # Central
    "MG Road", "Shivajinagar", "Frazer Town", "Cox Town",
    "Richmond Town", "Vasanth Nagar", "Gandhinagar", "Seshadripuram",
    # Outer — best yield, fewer clinics have websites
    "Chandapura", "Anekal", "Attibele", "Hebbagodi",
    "Sarjapur", "Dommasandra", "Devanahalli", "Doddaballapura",
    "Nelamangala", "Magadi Road", "Bidadi",
]

# ─── Tier-2 cities — scrape by area for better yield ──────────────────────────
# These cities have many clinics but very few with professional websites
TIER2_CITY_AREAS = {
    "Mysore": [
        "Vijayanagar Mysore", "Kuvempunagar Mysore", "Saraswathipuram Mysore",
        "Gokulam Mysore", "Nazarbad Mysore", "Hebbal Mysore", "Bannimantap Mysore",
    ],
    "Hubli": [
        "Vidyanagar Hubli", "Navanagar Hubli", "Keshwapur Hubli",
        "Deshpande Nagar Hubli", "Gokul Road Hubli",
    ],
    "Mangalore": [
        "Hampankatta Mangalore", "Bejai Mangalore", "Kankanady Mangalore",
        "Attavar Mangalore", "Kadri Mangalore", "Pandeshwar Mangalore",
    ],
    "Tumkur": ["Tumkur city"],
    "Belgaum": [
        "Camp Belgaum", "Tilakwadi Belgaum", "Khanapur Road Belgaum",
    ],
    "Davangere": ["PJ Extension Davangere", "MCC B Block Davangere"],
    "Shimoga": ["Shimoga city"],
    "Hassan": ["Hassan city"],
    "Udupi": ["Udupi city", "Manipal Udupi"],
    # Maharashtra tier-2
    "Nashik": ["Gangapur Road Nashik", "Cidco Nashik", "Satpur Nashik"],
    "Aurangabad": ["Cidco Aurangabad", "Osmanpura Aurangabad"],
    "Nagpur": ["Dharampeth Nagpur", "Sadar Nagpur", "Sitabuldi Nagpur"],
    # Telangana/AP
    "Warangal": ["Warangal city"],
    "Vizag": ["MVP Colony Vizag", "Gajuwaka Vizag", "Rushikonda Vizag"],
    # Tamil Nadu
    "Coimbatore": ["RS Puram Coimbatore", "Gandhipuram Coimbatore", "Peelamedu Coimbatore"],
    "Madurai": ["Anna Nagar Madurai", "KK Nagar Madurai"],
}

# Flat list of other cities for simple single-query sweeps
OTHER_CITIES = list(TIER2_CITY_AREAS.keys())


# ─── Auto-generate all queries ────────────────────────────────────────────────
def get_all_queries(city: str = "Bangalore") -> list:
    """Returns all queries for a city. Defaults to full Bangalore sweep."""
    if city.lower() == "bangalore":
        queries = []
        for profession in PROFESSIONS:
            for area in BANGALORE_AREAS:
                queries.append(f"{profession} {area} Bangalore")
        return queries
    elif city.title() in TIER2_CITY_AREAS:
        queries = []
        for profession in PROFESSIONS:
            for area in TIER2_CITY_AREAS[city.title()]:
                queries.append(f"{profession} {area}")
        return queries
    else:
        return [f"{p} {city}" for p in PROFESSIONS]


# Default queries used when running without --city flag
SEARCH_QUERIES = [
    "dental clinic Koramangala Bangalore",
    "dental clinic Indiranagar Bangalore",
]

# ─── Filtering thresholds ─────────────────────────────────────────────────────
# Lowered: include new clinics with few reviews — they need websites the most
MIN_RATING = 3.0       # was 3.5 — less strict
MIN_REVIEWS = 0        # was 5 — include brand-new clinics too

# ─── Bad website domains (clinics here still need a real site) ────────────────
BAD_WEBSITE_DOMAINS = [
    "justdial.com", "sulekha.com", "wixsite.com", "weebly.com",
    "wordpress.com", "blogspot.com", "indiamart.com",
    "practo.com", "lybrate.com", "1mg.com",
    "clinicspots.com", "drlogy.com", "zocdoc.com", "healthgrades.com",
    "facebook.com", "instagram.com", "linktr.ee",
    "makeo.app", "zoca.com", "click4appointment.com",
    "bookmydoctor.com", "sehat.com", "credihealth.com",
    "apollo247.com", "tata1mg.com", "docprime.com",
]

# ─── Scraper behaviour ────────────────────────────────────────────────────────
MAX_RESULTS_PER_QUERY = 30   # was 20
SCROLL_COUNT = 12            # was 6 — load more results
CLICK_DELAY_MS = 2000        # was 2500 — slightly faster
HEADLESS = True
