"""
Google Maps scraper for clinic leads.

Usage:
    python scraper.py --query "dental clinic Bangalore" --max 20
    python scraper.py --query "dental clinic Mumbai" --headful
"""

import argparse
import json
import re
from dataclasses import dataclass, asdict
from typing import Optional

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
    photos: list = None

    def __post_init__(self):
        if self.photos is None:
            self.photos = []


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
    # City from last non-generic word in query
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


# ─── Detail extractor ────────────────────────────────────────────────────────

def extract_detail_panel(page: Page, query: str) -> Optional[ClinicLead]:
    try:
        name_el = page.query_selector("h1")
        if not name_el:
            return None
        clinic_name = name_el.inner_text().strip()
        if not clinic_name:
            return None

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
        address = ""
        addr_btn = page.query_selector("button[data-item-id='address']")
        if addr_btn:
            address = addr_btn.inner_text().strip()
        city, area = extract_city_area(address, query)

        # Doctor name
        doctor_name = "Doctor"
        try:
            about_tab = page.query_selector("button[aria-label*='About']")
            if about_tab:
                about_tab.click()
                page.wait_for_timeout(700)
                about_text = page.inner_text("[role='main']") or ""
                dr_match = re.search(r"Dr\.?\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})", about_text)
                if dr_match:
                    doctor_name = dr_match.group(1).strip()
                overview_tab = page.query_selector("button[aria-label*='Overview']")
                if overview_tab:
                    overview_tab.click()
                    page.wait_for_timeout(400)
        except Exception:
            pass

        # Photos — grab up to 5 Google Maps business photos
        photos = []
        try:
            for img in page.query_selector_all("img[src*='googleusercontent.com']"):
                src = img.get_attribute("src") or ""
                if not src or "streetview" in src.lower() or "profile" in src.lower():
                    continue
                # Upgrade URL to a larger size
                src = re.sub(r"=w\d+-h\d+.*$", "=w800-h600-k-no", src)
                if src not in photos:
                    photos.append(src)
                if len(photos) >= 5:
                    break
        except Exception:
            pass

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
    # Keep only clinics with no website OR a bad/directory website
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

                print(f"    ✓ phone={lead.phone or 'N/A'} | rating={lead.rating} | website={'yes' if lead.has_website else 'no'}")
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
    parser.add_argument("--query", required=True, help='Search term, e.g. "dental clinic Bangalore"')
    parser.add_argument("--max", type=int, default=20)
    parser.add_argument("--headful", action="store_true")
    parser.add_argument("--output", help="Save to JSON file")
    args = parser.parse_args()

    results = scrape_query(args.query, max_results=args.max, headless=not args.headful)
    print(f"\nTotal: {len(results)} leads")

    if args.output:
        with open(args.output, "w") as f:
            json.dump([asdict(r) for r in results], f, indent=2)
        print(f"Saved → {args.output}")
    else:
        for r in results:
            print(f"  • {r.clinic_name} | {r.city} | {r.phone}")
