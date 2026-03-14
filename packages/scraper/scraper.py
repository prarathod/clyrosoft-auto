"""
Google Maps scraper for clinic leads.

Usage:
    python scraper.py --query "dental clinic Bangalore" --max 20
    python scraper.py --query "dental clinic Mumbai" --headful
"""

import argparse
import json
import re
from dataclasses import dataclass, field, asdict
from typing import Optional, List

from playwright.sync_api import sync_playwright, Page

from config import (
    BAD_WEBSITE_DOMAINS, MIN_RATING, MIN_REVIEWS,
    SCROLL_COUNT, CLICK_DELAY_MS, HEADLESS,
)


@dataclass
class ClinicLead:
    clinic_name: str
    doctor_name: str
    phone: str
    area: str
    city: str
    rating: float
    review_count: int
    has_website: bool
    website_url: str
    query: str
    photos: List[str] = field(default_factory=list)
    # Extended fields for richer templates
    qualification: str = ""           # e.g. "BDS, MDS - Orthodontics"
    doctor_bio: str = ""              # About / business description
    services: List[str] = field(default_factory=list)      # e.g. ["Root Canal", "Braces"]
    testimonials: List[dict] = field(default_factory=list) # [{name, text, rating}]
    google_maps_url: str = ""         # full Maps URL for embed link
    category: str = ""                # primary category e.g. "Dental clinic"
    tagline: str = ""                 # business tagline if listed, else auto-generated
    email: str = ""                   # email if found on listing or About
    full_address: str = ""            # complete address string
    opening_hours: List[str] = field(default_factory=list) # e.g. ["Mon-Sat: 9am - 7pm"]


# ─── Helpers ─────────────────────────────────────────────────────────────────

def clean_phone(raw: str) -> str:
    digits = re.sub(r"\D", "", raw)
    if digits.startswith("91") and len(digits) >= 12:
        digits = digits[2:]
    if digits.startswith("0"):
        digits = digits[1:]
    return digits if len(digits) >= 7 else ""


def parse_rating(text: str) -> float:
    m = re.search(r"(\d+\.?\d*)", text or "")
    return float(m.group(1)) if m else 0.0


def parse_review_count(text: str) -> int:
    clean = re.sub(r"\s", "", text or "")
    m = re.search(r"[\d,]+", clean)
    return int(m.group().replace(",", "")) if m else 0


def is_bad_website(url: str) -> bool:
    if not url:
        return True
    url_lower = url.lower()
    return any(domain in url_lower for domain in BAD_WEBSITE_DOMAINS)


def extract_city_area(address: str, query: str) -> tuple:
    words = query.lower().split()
    city = ""
    skip = {"clinic", "dental", "dentist", "doctor", "in", "near", "the", "best"}
    for word in reversed(words):
        if word not in skip and len(word) > 2:
            city = word.title()
            break
    parts = [p.strip() for p in (address or "").split(",") if p.strip()]
    area = parts[0] if parts else ""
    return city, area


GENERIC_NAMES = {"results", "search results", "google maps", "maps", "places", "nearby", ""}

# Medical degree patterns for qualification extraction
DEGREE_RE = re.compile(
    r"((?:BDS|MDS|MBBS|MD|MS|DNB|FCPS|MPhil|PhD|FRCS|MCh|DM|DLO|DO|BPT|MPT"
    r"|BAMS|BHMS|BUMS|DHMS|DCH|DGO|DOMS|DOrth|DMRD|DA|DNB)[^,\n]{0,40})",
    re.IGNORECASE,
)


def _safe_inner_text(page: Page, selector: str, default: str = "") -> str:
    try:
        el = page.query_selector(selector)
        return el.inner_text().strip() if el else default
    except Exception:
        return default


# ─── Photo extraction ─────────────────────────────────────────────────────────

def _extract_photos(page: Page, max_photos: int = 12) -> List[str]:
    """Try to get photos from the listing — first overview thumbnails, then full gallery."""
    photos = []

    def _add(src: str):
        if not src or "streetview" in src.lower() or "profile" in src.lower():
            return
        src = re.sub(r"=w\d+-h\d+.*$", "=w1200-h900-k-no", src)
        if src not in photos:
            photos.append(src)

    # Step 1: grab thumbnails already visible in the overview panel
    try:
        for img in page.query_selector_all("img[src*='googleusercontent.com']"):
            src = img.get_attribute("src") or ""
            _add(src)
            if len(photos) >= max_photos:
                return photos
    except Exception:
        pass

    if len(photos) >= max_photos:
        return photos

    # Step 2: try to open the Photos tab / thumbnail strip for more
    try:
        photo_btn = None
        for sel in [
            "button[aria-label*='Photo' i]",
            "button[jsaction*='photo' i]",
            "div.RZ66Rb button",
        ]:
            photo_btn = page.query_selector(sel)
            if photo_btn:
                break

        if photo_btn:
            photo_btn.click()
            page.wait_for_timeout(900)   # reduced from 1500
            for img in page.query_selector_all("img[src*='googleusercontent.com']"):
                src = img.get_attribute("src") or ""
                _add(src)
                if len(photos) >= max_photos:
                    break
            # Navigate back to Overview
            overview_btn = page.query_selector("button[aria-label*='Overview' i]")
            if overview_btn:
                overview_btn.click()
                page.wait_for_timeout(300)   # reduced from 500
    except Exception:
        pass

    return photos[:max_photos]


# ─── Reviews / testimonials ───────────────────────────────────────────────────

def _extract_reviews(page: Page, max_reviews: int = 3) -> List[dict]:
    """Click Reviews tab and extract up to max_reviews snippets."""
    reviews = []
    try:
        reviews_btn = page.query_selector("button[aria-label*='Reviews' i]")
        if not reviews_btn:
            return reviews
        reviews_btn.click()
        page.wait_for_timeout(700)   # reduced from 1200

        # Each review block varies by Maps version — try common selectors
        blocks = page.query_selector_all("div[data-review-id], div.jftiEf, div.MyEned")
        if not blocks:
            blocks = page.query_selector_all("[class*='review']")

        for block in blocks[:max_reviews * 2]:  # grab extra in case some are empty
            try:
                # Reviewer name
                name = ""
                for sel in ["div.d4r55", "span.X43Kjb", "div[class*='reviewer']"]:
                    el = block.query_selector(sel)
                    if el:
                        name = el.inner_text().strip()
                        break

                # Review text — expand "More" if truncated
                text = ""
                more_btn = block.query_selector("button[aria-label*='More' i], button[jsaction*='expand']")
                if more_btn:
                    try:
                        more_btn.click()
                        page.wait_for_timeout(300)
                    except Exception:
                        pass
                for sel in ["span.wiI7pd", "div.Jtu6Td", "div[class*='review-full']", "span[class*='review']"]:
                    el = block.query_selector(sel)
                    if el:
                        text = el.inner_text().strip()
                        break

                # Star rating
                stars = 5
                rating_el = block.query_selector("span[aria-label*='star' i]")
                if rating_el:
                    stars = int(parse_rating(rating_el.get_attribute("aria-label") or "5"))

                if name and text and len(text) > 15:
                    reviews.append({"name": name, "text": text[:200], "rating": stars})
                    if len(reviews) >= max_reviews:
                        break
            except Exception:
                continue

        # Go back to Overview
        overview_btn = page.query_selector("button[aria-label*='Overview' i]")
        if overview_btn:
            overview_btn.click()
            page.wait_for_timeout(250)
    except Exception:
        pass

    return reviews


# ─── Email extraction ─────────────────────────────────────────────────────────

EMAIL_RE = re.compile(r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}")

def _extract_email(page: Page) -> str:
    """Try to find an email address on the listing page."""
    # 1. mailto: links
    try:
        for a in page.query_selector_all("a[href^='mailto:']"):
            href = a.get_attribute("href") or ""
            email = href.replace("mailto:", "").split("?")[0].strip()
            if EMAIL_RE.match(email):
                return email
    except Exception:
        pass

    # 2. Scan visible text in the main panel
    try:
        text = page.inner_text("[role='main']") or ""
        m = EMAIL_RE.search(text)
        if m:
            return m.group(0)
    except Exception:
        pass

    return ""


# ─── Opening hours ─────────────────────────────────────────────────────────────

def _extract_hours(page: Page) -> List[str]:
    """Extract opening hours from the listing overview."""
    hours = []
    try:
        # Click the hours button/dropdown to expand
        hours_btn = page.query_selector("button[data-item-id*='hour'], div[aria-label*='hour' i] button")
        if hours_btn:
            hours_btn.click()
            page.wait_for_timeout(500)

        # Try structured hour rows
        rows = page.query_selector_all("tr.y0skZc, div.t39EBf, li[class*='hour']")
        for row in rows:
            text = row.inner_text().strip().replace("\n", " ").replace("\t", " ")
            text = re.sub(r"\s{2,}", " ", text)
            if text and len(text) > 3:
                hours.append(text)

        # Fallback: scan text for day patterns
        if not hours:
            text = page.inner_text("[role='main']") or ""
            day_pattern = re.compile(
                r"(Mon(?:day)?|Tue(?:sday)?|Wed(?:nesday)?|Thu(?:rsday)?|Fri(?:day)?|Sat(?:urday)?|Sun(?:day)?)"
                r"[^\n]{3,40}",
                re.IGNORECASE,
            )
            seen_days = set()
            for m in day_pattern.finditer(text):
                line = m.group(0).strip()
                day = m.group(1).lower()
                if day not in seen_days and len(line) > 5:
                    hours.append(line)
                    seen_days.add(day)
                    if len(hours) >= 7:
                        break
    except Exception:
        pass

    return hours[:7]


# ─── About tab — qualification, bio, services, tagline, email ────────────────

def _extract_about(page: Page) -> dict:
    """Click About tab and extract qualification, bio, services, category, tagline, email."""
    result = {
        "doctor_name": "",
        "qualification": "",
        "doctor_bio": "",
        "services": [],
        "category": "",
        "tagline": "",
        "email": "",
    }
    try:
        about_btn = page.query_selector("button[aria-label*='About' i]")
        if not about_btn:
            return result
        about_btn.click()
        page.wait_for_timeout(500)   # reduced from 800

        main_text = page.inner_text("[role='main']") or ""

        # Email (check here too — sometimes only shown in About)
        m = EMAIL_RE.search(main_text)
        if m:
            result["email"] = m.group(0)

        # Doctor name
        dr_match = re.search(r"Dr\.?\s+([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+){0,2})", main_text)
        if dr_match:
            result["doctor_name"] = dr_match.group(1).strip()

        # Qualification — look for medical degrees
        qual_matches = DEGREE_RE.findall(main_text)
        if qual_matches:
            quals = [q.strip().rstrip(",; ") for q in qual_matches[:2]]
            result["qualification"] = ", ".join(quals)

        # Tagline — Google sometimes shows a short business tagline/slogan
        # Look for short punchy lines that are not the clinic name or address
        for sel in ["div.PYvSYb", "div.iP2t7d", "p.HlvEHd", "span.HlvEHd"]:
            el = page.query_selector(sel)
            if el:
                t = el.inner_text().strip()
                # Good tagline: 10-100 chars, not just an address or phone
                if 10 < len(t) < 120 and not re.search(r"\d{6}|\d{10}", t):
                    result["tagline"] = t
                    break

        # Doctor bio — look for a description block
        for sel in ["div.PYvSYb", "div[class*='description']", "div.iP2t7d", "div.uxOu7d", "div.HlvEHd"]:
            el = page.query_selector(sel)
            if el:
                bio = el.inner_text().strip()
                if len(bio) > 40:
                    result["doctor_bio"] = bio[:500]
                    break

        # Fallback bio from meaningful sentences in About text
        if not result["doctor_bio"]:
            sentences = [s.strip() for s in re.split(r"[.\n]", main_text) if len(s.strip()) > 40]
            for s in sentences[:6]:
                if any(w in s.lower() for w in ["speciali", "treat", "care", "years", "experience", "clinic", "provide", "expert"]):
                    result["doctor_bio"] = s.strip()[:300]
                    break

        # Services — from bullet/comma lists in About
        service_section = re.search(
            r"(?:Services?|Specialt|Treatment|Offers?|Procedures?)[:\s]+([^\n]{10,400})",
            main_text, re.IGNORECASE,
        )
        if service_section:
            raw = service_section.group(1)
            services = [s.strip() for s in re.split(r"[,\n•·]", raw) if len(s.strip()) > 3]
            result["services"] = [s[:50] for s in services[:12]]

        # Category chip
        for sel in ["button.DkEaL", "span.DkEaL", "button[jsaction*='category']", "div.skqShb span"]:
            els = page.query_selector_all(sel)
            for el in els:
                cat = el.inner_text().strip()
                if cat and len(cat) > 3 and "review" not in cat.lower():
                    result["category"] = cat
                    break
            if result["category"]:
                break

        # Go back to Overview
        overview_btn = page.query_selector("button[aria-label*='Overview' i]")
        if overview_btn:
            overview_btn.click()
            page.wait_for_timeout(250)

    except Exception:
        pass
    return result


# ─── Category from overview ───────────────────────────────────────────────────

def _extract_category(page: Page) -> str:
    """Get primary category label from the overview panel (e.g. 'Dental clinic')."""
    for sel in [
        "button.DkEaL",
        "span.DkEaL",
        "div[aria-label*='Category' i]",
        "span[jsaction*='category']",
        "button[jsaction*='category']",
    ]:
        try:
            els = page.query_selector_all(sel)
            for el in els:
                text = el.inner_text().strip()
                if text and 2 < len(text) < 60 and "review" not in text.lower():
                    return text
        except Exception:
            pass
    return ""


# ─── Detail extractor (two-phase) ───────────────────────────────────────────
#
# Phase 1 (fast, ~1s): name, phone, rating, website, address — enough to decide
#                      whether this listing is worth keeping at all.
# Phase 2 (slow, ~4s): About tab, Reviews tab, Photos tab — only run if Phase 1
#                      passes the filter. This avoids wasting 4s per filtered listing.

def extract_detail_panel(page: Page, query: str) -> Optional[ClinicLead]:
    try:
        page.wait_for_timeout(300)   # reduced from 500

        # ══ PHASE 1 — fast basics ════════════════════════════════════════════

        # Clinic name
        clinic_name = ""
        for sel in ["h1.DUwDvf", "h1.fontHeadlineLarge", "h1"]:
            el = page.query_selector(sel)
            if el:
                text = el.inner_text().strip()
                if text and text.lower() not in GENERIC_NAMES and len(text) > 2:
                    clinic_name = text
                    break
        if not clinic_name:
            return None

        google_maps_url = page.url
        category = _extract_category(page)

        # Rating
        rating = 0.0
        review_count = 0
        rating_el = page.query_selector("span[aria-label*='star']")
        if rating_el:
            rating = parse_rating(rating_el.get_attribute("aria-label") or "")
        if rating == 0.0:
            for sel in ["div.fontDisplayLarge", "span.ceNzKf", "span.MW4etd"]:
                el = page.query_selector(sel)
                if el:
                    v = parse_rating(el.inner_text())
                    if v > 0:
                        rating = v
                        break

        review_el = page.query_selector("span[aria-label*='review']")
        if review_el:
            review_count = parse_review_count(review_el.get_attribute("aria-label") or "")
        if review_count == 0:
            try:
                panel_text = page.inner_text("[role='main']") or ""
                m = re.search(r"\((\d[\d,]*)\)", panel_text)
                if m:
                    review_count = int(m.group(1).replace(",", ""))
            except Exception:
                pass

        # Phone
        phone = ""
        phone_btn = page.query_selector("button[data-item-id^='phone']")
        if phone_btn:
            item_id = phone_btn.get_attribute("data-item-id") or ""
            raw = item_id.replace("phone:tel:", "").replace("+", "")
            phone = clean_phone(raw)
        if not phone:
            tel = page.query_selector("a[href^='tel:']")
            if tel:
                phone = clean_phone((tel.get_attribute("href") or "").replace("tel:", ""))

        # Website
        website_url = ""
        has_website = False
        for sel in [
            "a[data-tooltip='Open website']",
            "a[aria-label*='website' i]",
            "a[data-item-id='authority']",
        ]:
            el = page.query_selector(sel)
            if el:
                website_url = el.get_attribute("href") or ""
                has_website = bool(website_url)
                break
        if not has_website:
            for a in page.query_selector_all("a[href^='http']"):
                href = a.get_attribute("href") or ""
                if "google.com" not in href and "goo.gl" not in href and href.startswith("http"):
                    website_url = href
                    has_website = True
                    break

        # Address
        full_address = ""
        addr_btn = page.query_selector("button[data-item-id='address']")
        if addr_btn:
            full_address = addr_btn.inner_text().strip()
        city, area = extract_city_area(full_address, query)

        # ── Early filter check — skip Phase 2 if this listing won't be kept ──
        # Inline the filter logic here to avoid importing it circularly
        will_filter = (
            (review_count > 0 and rating < MIN_RATING)
            or (review_count > 0 and review_count < MIN_REVIEWS)
            or (has_website and not is_bad_website(website_url))
            or not phone  # no phone = useless lead
        )
        if will_filter:
            # Return a minimal lead — the caller's should_keep() will drop it
            return ClinicLead(
                clinic_name=clinic_name, doctor_name="Doctor", phone=phone,
                area=area, city=city, rating=rating, review_count=review_count,
                has_website=has_website, website_url=website_url, query=query,
            )

        # ══ PHASE 2 — rich data (only for leads we'll actually keep) ════════

        opening_hours  = _extract_hours(page)
        email_overview = _extract_email(page)
        photos         = _extract_photos(page, max_photos=12)
        about          = _extract_about(page)

        doctor_name   = about["doctor_name"] or "Doctor"
        qualification = about["qualification"]
        doctor_bio    = about["doctor_bio"]
        services      = about["services"]
        email         = about["email"] or email_overview

        if not about["category"] and category:
            about["category"] = category

        testimonials = []
        if review_count >= 5:
            testimonials = _extract_reviews(page, max_reviews=3)

        cat_label = about["category"] or category or "Clinic"
        tagline = (
            about["tagline"]
            or (f"Expert {cat_label} in {area}, {city}" if area and city else f"Expert {cat_label}")
        )

        return ClinicLead(
            clinic_name=clinic_name,
            doctor_name=doctor_name,
            phone=phone,
            area=area,
            city=city,
            rating=rating,
            review_count=review_count,
            has_website=has_website,
            website_url=website_url,
            query=query,
            photos=photos,
            qualification=qualification,
            doctor_bio=doctor_bio,
            services=services,
            testimonials=testimonials,
            google_maps_url=google_maps_url,
            category=about["category"] or category,
            tagline=tagline,
            email=email,
            full_address=full_address,
            opening_hours=opening_hours,
        )

    except Exception as e:
        print(f"    [extract error] {e}")
        return None


# ─── Filter ───────────────────────────────────────────────────────────────────

def should_keep(lead: ClinicLead) -> bool:
    if lead.review_count > 0 and lead.rating < MIN_RATING:
        return False
    if lead.review_count > 0 and lead.review_count < MIN_REVIEWS:
        return False
    if lead.has_website and not is_bad_website(lead.website_url):
        return False
    return True


# ─── Core scrape function ─────────────────────────────────────────────────────

def scrape_query(query: str, max_results: int = 20, headless: bool = True) -> list:
    print(f"\n🔍 Searching: '{query}'")
    leads = []
    seen: set = set()

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=headless)
        context = browser.new_context(
            user_agent=(
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/120.0.0.0 Safari/537.36"
            ),
            viewport={"width": 1280, "height": 900},
            locale="en-IN",
        )
        page = context.new_page()
        url = "https://www.google.com/maps/search/" + query.replace(" ", "+")
        page.goto(url, wait_until="networkidle", timeout=30000)
        page.wait_for_timeout(3000)

        # Dismiss consent dialogs
        for btn_text in ["Accept all", "Reject all", "I agree"]:
            try:
                page.get_by_role("button", name=btn_text).click(timeout=2000)
                page.wait_for_timeout(1000)
                break
            except Exception:
                pass

        # Scroll to load results
        feed = page.query_selector('[role="feed"]')
        if feed:
            for _ in range(SCROLL_COUNT):
                feed.evaluate("el => el.scrollBy(0, 900)")
                page.wait_for_timeout(1200)

        result_links = page.query_selector_all("a.hfpxzc")
        total = min(len(result_links), max_results)
        print(f"  Found {len(result_links)} listings → processing {total}")

        for i, link in enumerate(result_links[:max_results]):
            try:
                label = (link.get_attribute("aria-label") or "").strip()
                if label in seen:
                    continue
                seen.add(label)

                print(f"  [{i+1}/{total}] {label[:55]}")
                link.click()
                page.wait_for_timeout(CLICK_DELAY_MS)

                lead = extract_detail_panel(page, query)
                if not lead:
                    print("    → skipped (no data)")
                    continue

                if not should_keep(lead):
                    reason = f"rating={lead.rating}, reviews={lead.review_count}"
                    if lead.has_website and not is_bad_website(lead.website_url):
                        reason = f"good website ({lead.website_url[:40]})"
                    print(f"    → filtered ({reason})")
                    continue

                extra = []
                if lead.qualification:
                    extra.append(lead.qualification[:30])
                if lead.services:
                    extra.append(f"{len(lead.services)} services")
                if lead.testimonials:
                    extra.append(f"{len(lead.testimonials)} reviews")
                if lead.photos:
                    extra.append(f"{len(lead.photos)} photos")

                print(f"    ✓ phone={lead.phone or 'N/A'} | {' | '.join(extra) if extra else 'basic'}")
                leads.append(lead)

            except Exception as e:
                print(f"    → error: {e}")
                continue

        browser.close()

    print(f"  → Kept {len(leads)} leads")
    return leads


# ─── CLI entry ────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--query", required=True, help='e.g. "dental clinic Bangalore"')
    parser.add_argument("--max", type=int, default=20)
    parser.add_argument("--headful", action="store_true")
    parser.add_argument("--output", help="Save to JSON file")
    args = parser.parse_args()

    results = scrape_query(args.query, max_results=args.max, headless=not args.headful)
    print(f"\nTotal: {len(results)} leads")

    if args.output:
        with open(args.output, "w") as f:
            json.dump([asdict(r) for r in results], f, indent=2, ensure_ascii=False)
        print(f"Saved → {args.output}")
    else:
        for r in results:
            print(f"  • {r.clinic_name} | {r.city} | {r.phone} | qual={r.qualification or 'N/A'} | {len(r.photos)}📷 {len(r.testimonials)}⭐")
