"""
Google Maps scraper for clinic leads.
Uses google-maps-scraper (playwright-based, no API key needed).

Install:  pip install -r requirements.txt
Run:      python scraper.py --profession dental --city "Mumbai" --area "Bandra"
"""

import argparse
import json
import re
import requests
import time
from pathlib import Path
from playwright.sync_api import sync_playwright

API_URL = "http://localhost:3000/api/clients"   # Change to your deployed URL


def slugify(text: str) -> str:
    return re.sub(r"[^a-z0-9]", "", text.lower())[:30]


def scrape_google_maps(profession: str, city: str, area: str, max_results: int = 20) -> list[dict]:
    query = f"{profession} clinic in {area} {city}"
    results = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto(f"https://www.google.com/maps/search/{query.replace(' ', '+')}")
        page.wait_for_timeout(3000)

        # Scroll to load more results
        for _ in range(5):
            page.keyboard.press("End")
            page.wait_for_timeout(1000)

        listings = page.query_selector_all("a.hfpxzc")[:max_results]

        for listing in listings:
            try:
                listing.click()
                page.wait_for_timeout(2000)

                name = page.query_selector("h1.DUwDvf")
                phone_el = page.query_selector('button[data-item-id*="phone"]')

                if not name:
                    continue

                clinic_name = name.inner_text().strip()
                phone = ""
                if phone_el:
                    phone = phone_el.get_attribute("data-item-id", "").replace("phone:tel:+91", "").replace("phone:tel:", "").strip()

                results.append({
                    "clinic_name": clinic_name,
                    "doctor_name": f"Doctor",   # Enriched later or via WhatsApp reply
                    "phone": phone,
                    "city": city,
                    "area": area,
                    "profession_type": profession,
                    "subdomain": slugify(clinic_name),
                    "status": "demo",
                    "monthly_amount": 999,
                })
            except Exception as e:
                print(f"  Skip: {e}")
                continue

        browser.close()

    return results


def push_to_api(clients: list[dict]) -> None:
    success, failed = 0, 0
    for client in clients:
        try:
            r = requests.post(API_URL, json=client, timeout=10)
            if r.status_code == 201:
                print(f"  ✓ {client['clinic_name']}")
                success += 1
            else:
                print(f"  ✗ {client['clinic_name']}: {r.json().get('error')}")
                failed += 1
        except Exception as e:
            print(f"  ✗ {client['clinic_name']}: {e}")
            failed += 1
        time.sleep(0.3)   # Be nice to the API

    print(f"\nDone: {success} added, {failed} failed")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--profession", default="dental")
    parser.add_argument("--city", required=True)
    parser.add_argument("--area", required=True)
    parser.add_argument("--max", type=int, default=20)
    parser.add_argument("--dry-run", action="store_true", help="Print without pushing to API")
    args = parser.parse_args()

    print(f"Scraping {args.profession} clinics in {args.area}, {args.city}...")
    clients = scrape_google_maps(args.profession, args.city, args.area, args.max)
    print(f"Found {len(clients)} clinics\n")

    if args.dry_run:
        print(json.dumps(clients, indent=2))
    else:
        push_to_api(clients)
