"""
Scraper configuration.
Edit PROFESSIONS and CITY_AREAS to control what gets scraped.
Queries are auto-generated as "{profession} {area}".
"""

# ─── Professions to scrape ─────────────────────────────────────────────────────
# More professions = more queries = more leads per area
PROFESSIONS = [
    # Core / high volume
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

    # Specialist clinics
    "cardiology clinic",
    "neurology clinic",
    "psychiatry clinic",
    "urology clinic",
    "nephrology clinic",
    "gastroenterology clinic",
    "pulmonology clinic",
    "endocrinology clinic",
    "diabetes clinic",
    "oncology clinic",

    # Surgery & diagnostics
    "general surgery clinic",
    "plastic surgery clinic",
    "diagnostic center",
    "pathology lab",
    "radiology center",

    # Alternative medicine
    "ayurveda clinic",
    "unani clinic",
    "naturopathy clinic",
    "acupuncture clinic",

    # Women & children
    "fertility clinic",
    "ivf clinic",
    "maternity clinic",
    "neonatal clinic",

    # Other specialties
    "rheumatology clinic",
    "dermatology clinic",
    "sports medicine clinic",
    "pain management clinic",
    "spine clinic",
    "hair transplant clinic",
    "weight loss clinic",
    "nutrition clinic",
    "speech therapy clinic",
    "occupational therapy clinic",
    "veterinary clinic",
]

# ─── Bangalore — focus on OUTER / residential areas (fewer websites there) ────
BANGALORE_AREAS = [
    # Central Bangalore
    "MG Road","Brigade Road","Church Street","Residency Road",
    "Richmond Town","Richmond Road","Shivajinagar","Vasanth Nagar",
    "Cunningham Road","Race Course Road","Seshadripuram",
    "Gandhinagar","Majestic","Chickpet","KR Market","Cottonpet",
    "Lavelle Road","Infantry Road","St Marks Road","Museum Road",

    # South Bangalore
    "Jayanagar","JP Nagar","Banashankari","Basavanagudi",
    "Uttarahalli","Padmanabhanagar","Kumaraswamy Layout",
    "BTM Layout","HSR Layout","Bommanahalli","Begur",
    "Hulimavu","Arekere","Gottigere","Bannerghatta Road",
    "Bilekahalli","Hongasandra","Madiwala","Wilson Garden",
    "Tilak Nagar","Kanakapura Road","Yelachenahalli",
    "Anjanapura","Subramanyapura","Talaghattapura",
    "Thurahalli","Vajarahalli","Konanakunte","Konanakunte Cross",
    "Sarakki","Jaraganahalli","Puttenahalli","Dollars Colony JP Nagar",

    # Southeast Bangalore
    "Koramangala","Ejipura","Adugodi","Domlur",
    "Indiranagar","HAL","Murugeshpalya","Kodihalli",
    "Jeevanbheemanagar","New Thippasandra","CV Raman Nagar",
    "DRDO Township","GM Palya","Kaggadasapura",
    "Marathahalli","Bellandur","Sarjapur Road",
    "Kasavanahalli","Haralur","Harlur Road",
    "Ambalipura","Panathur","Kadubeesanahalli",
    "Doddakannelli","Kaikondrahalli","Devarabisanahalli",
    "Green Glen Layout","Challaghatta",

    # East Bangalore
    "Whitefield","Brookefield","AECS Layout",
    "Mahadevapura","KR Puram","Hoodi","Kadugodi",
    "Varthur","Thubarahalli","ITPL","Hope Farm",
    "Belathur","Seegehalli","Channasandra",
    "Battarahalli","Ramamurthy Nagar","TC Palya",
    "Kalkere","Banaswadi","Horamavu","Kalyan Nagar",
    "HRBR Layout","Hennur","Hennur Road",
    "Nagawara","Thanisandra","Thanisandra Main Road",
    "Lingarajapuram","Cooke Town","Ulsoor","Cambridge Layout",
    "Victoria Layout","Rustam Bagh Layout","Kodathi",

    # North Bangalore
    "Hebbal","RT Nagar","Sahakarnagar","Kodigehalli",
    "Vidyaranyapura","Yelahanka","Yelahanka New Town",
    "Jakkur","Amrutahalli","Kogilu","Bagalur",
    "Kannur","Byatarayanapura","Kempapura",
    "Nagavara","Ganga Nagar","Mathikere",
    "Sanjay Nagar","RMV Extension","Sadashivanagar",
    "Dollar Colony","Hebbal Kempapura",
    "Cholanayakanahalli","Kattigenahalli","Agrahara Layout",

    # Northwest Bangalore
    "Yeshwanthpur","Malleswaram","Rajajinagar",
    "Mahalakshmi Layout","Nandini Layout",
    "Kurubarahalli","Basaveshwaranagar",
    "Kamakshipalya","Magadi Road","Sunkadakatte",
    "Peenya","Peenya Industrial Area",
    "Jalahalli","Jalahalli West","Jalahalli East",
    "T Dasarahalli","Nagasandra","Hesaraghatta",
    "HMT Layout","BEL Road","Gokula","Dollars Colony RMV",

    # West Bangalore
    "Vijayanagar","Attiguppe","Chandra Layout",
    "Moodalapalya","Nagarbhavi","Nagarbhavi Circle",
    "Kengeri","Kengeri Satellite Town",
    "Rajarajeshwari Nagar","RR Nagar",
    "BEML Layout","Kenchanahalli",
    "Ullal","Mallathahalli","Byadarahalli",
    "Jnana Bharathi","Kumbalgodu Industrial Area",

    # IT Corridor / Outer Ring Road
    "Outer Ring Road","Kadubeesanahalli ORR",
    "Mahadevapura Industrial Area",
    "Doddanekkundi","Doddanekundi Extension",
    "ISRO Layout","HSR Sector 1","HSR Sector 2",
    "HSR Sector 3","HSR Sector 4","HSR Sector 5",
    "HSR Sector 6","HSR Sector 7",

    # Electronic City Region
    "Electronic City Phase 1",
    "Electronic City Phase 2",
    "Electronic City Phase 3",
    "Doddathoguru",
    "Neeladri Nagar",
    "Shikaripalya",
    "Veerasandra",
    "Hebbagodi",
    "Hosa Road",
    "Chandapura",
    "Bommasandra",
    "Bommasandra Industrial Area",
    "Hosur Road",

    # Sarjapur belt
    "Sarjapur","Dommasandra","Muthanallur",
    "Bagalur Sarjapur Road",
    "Yamare","Handenahalli",
    "Chikkakannalli","Kodathi Gate",

    # Airport belt
    "Devanahalli","Kempegowda International Airport",
    "Chikkajala","Bettahalasur",
    "Bagalur Road","Hunasamaranahalli",
    "Yerthiganahalli","Doddajala",

    # Outer towns
    "Nelamangala","Tumkur Road",
    "Makali","Madavara",
    "Doddaballapura","Hoskote",
    "Malur Road","Anekal",
    "Attibele","Ramanagara",
    "Bidadi","Kanakapura",
    "Magadi",

    # Koramangala blocks
    "Koramangala 1st Block","Koramangala 2nd Block",
    "Koramangala 3rd Block","Koramangala 4th Block",
    "Koramangala 5th Block","Koramangala 6th Block",
    "Koramangala 7th Block","Koramangala 8th Block",

    # Jayanagar blocks
    "Jayanagar 1st Block","Jayanagar 2nd Block",
    "Jayanagar 3rd Block","Jayanagar 4th Block",
    "Jayanagar 5th Block","Jayanagar 6th Block",
    "Jayanagar 7th Block","Jayanagar 8th Block",
    "Jayanagar 9th Block",

    # JP Nagar phases
    "JP Nagar 1st Phase","JP Nagar 2nd Phase",
    "JP Nagar 3rd Phase","JP Nagar 4th Phase",
    "JP Nagar 5th Phase","JP Nagar 6th Phase",
    "JP Nagar 7th Phase","JP Nagar 8th Phase",

    # Banashankari stages
    "Banashankari 1st Stage","Banashankari 2nd Stage",
    "Banashankari 3rd Stage","Banashankari 4th Stage",
    "Banashankari 5th Stage","Banashankari 6th Stage"
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
MIN_RATING = 1.0       # was 3.5 — less strict
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
MAX_RESULTS_PER_QUERY = 20   # per query (parallel workers compensate for fewer per query)
SCROLL_COUNT = 6             # fewer scrolls = faster per query
CLICK_DELAY_MS = 1200        # ms to wait after clicking a listing (was 2000)
HEADLESS = True

# ─── Parallel workers ─────────────────────────────────────────────────────────
# Each worker is a separate OS process with its own browser.
# 3 is safe on most machines. Use 5 on a fast multi-core machine.
# Too many workers = Google Maps may rate-limit / CAPTCHA you.
WORKER_COUNT = 3
