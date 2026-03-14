"""
Supabase sync — inserts scraped leads via REST API directly.
No supabase Python package needed — uses requests + Supabase REST API.
Skips duplicates by checking phone number before inserting.
Also auto-creates a demo client record for each new lead.
"""

import json
import os
import re
import sys
from dataclasses import asdict

import requests
from dotenv import load_dotenv

load_dotenv()


def _headers() -> dict:
    key = os.getenv("SUPABASE_KEY")
    return {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal",
    }


def _base() -> str:
    url = os.getenv("SUPABASE_URL")
    if not url:
        print("❌ Missing SUPABASE_URL in .env")
        sys.exit(1)
    if not os.getenv("SUPABASE_KEY"):
        print("❌ Missing SUPABASE_KEY in .env")
        sys.exit(1)
    return f"{url}/rest/v1"


PROFESSION_MAP = {
    "dental": "dental",
    "dentist": "dental",
    "orthodont": "dental",
    "eye": "eye",
    "ophthalmol": "eye",
    "optometri": "eye",
    "physiotherapy": "physio",
    "physio": "physio",
    "skin": "skin",
    "dermatol": "skin",
    "cosmetol": "skin",
    "child": "general",
    "pediatric": "general",
    "ent": "ent",
    "cardiol": "cardiology",
    "heart": "cardiology",
    "neurol": "neurology",
    "brain": "neurology",
    "orthop": "orthopedic",
    "bone": "orthopedic",
    "spine": "orthopedic",
    "psychiatr": "psychiatry",
    "mental": "psychiatry",
    "ayurved": "ayurveda",
    "fertility": "fertility",
    "ivf": "fertility",
    "gynecol": "gynecology",
    "obstet": "gynecology",
    "gastro": "gastro",
    "oncol": "oncology",
    "cancer": "oncology",
    "urol": "urology",
    "kidney": "nephrology",
    "nephr": "nephrology",
    "pulmonol": "pulmonology",
    "lung": "pulmonology",
    "endocrin": "endocrinology",
    "diabetol": "endocrinology",
    "homeopath": "homeopathy",
    "naturopath": "naturopathy",
    "hair transplant": "hair-transplant",
    "veterinar": "veterinary",
    "animal": "veterinary",
}

def profession_from_query(query: str) -> str:
    q = query.lower()
    for key, val in PROFESSION_MAP.items():
        if key in q:
            return val
    return "general"

def make_subdomain(clinic_name: str) -> str:
    slug = re.sub(r"[^a-z0-9]", "-", clinic_name.lower())
    slug = re.sub(r"-+", "-", slug).strip("-")[:30]
    return slug

def get_existing_subdomains() -> set:
    resp = requests.get(
        f"{_base()}/clients",
        headers={**_headers(), "Prefer": ""},
        params={"select": "subdomain"},
        timeout=15,
    )
    if resp.status_code != 200:
        return set()
    return {row["subdomain"] for row in resp.json() if row.get("subdomain")}

def get_existing_phones() -> set:
    resp = requests.get(
        f"{_base()}/leads",
        headers={**_headers(), "Prefer": ""},
        params={"select": "phone"},
        timeout=15,
    )
    if resp.status_code != 200:
        print(f"⚠️  Could not fetch existing phones: {resp.status_code} {resp.text[:100]}")
        return set()
    return {row["phone"] for row in resp.json() if row.get("phone")}


def _create_demo_client(data: dict, existing_subdomains: set) -> None:
    """Auto-create a demo client record so the site is immediately accessible."""
    clinic_name = data.get("clinic_name", "")
    if not clinic_name:
        return

    # Generate unique subdomain
    base = make_subdomain(clinic_name)
    subdomain = base
    suffix = 1
    while subdomain in existing_subdomains:
        subdomain = f"{base}-{suffix}"
        suffix += 1

    profession = profession_from_query(data.get("query", ""))

    # Convert scraped testimonials {name, text, rating} → DB format {name, text, treatment}
    raw_testimonials = data.get("testimonials") or []
    db_testimonials = [
        {
            "name": t.get("name", "Patient"),
            "text": t.get("text", ""),
            "treatment": "",   # not available from Maps; left blank for now
        }
        for t in raw_testimonials
        if t.get("text")
    ]

    client_row = {
        "clinic_name": clinic_name,
        "doctor_name": data.get("doctor_name", "Doctor"),
        "phone": data.get("phone", ""),
        "email": data.get("email") or None,
        "area": data.get("area", ""),
        "city": data.get("city", ""),
        "subdomain": subdomain,
        "profession_type": profession,
        "status": "demo",
        "monthly_amount": 499,
        # Rich template fields
        "photos": data.get("photos") or [],
        "tagline": data.get("tagline") or "",
        "doctor_bio": data.get("doctor_bio") or "",
        "services": data.get("services") or [],
        "testimonials": db_testimonials or [],
        "google_maps_link": data.get("google_maps_url") or "",
        # New fields
        "full_address": data.get("full_address") or "",
        "opening_hours": data.get("opening_hours") or [],
    }

    try:
        resp = requests.post(
            f"{_base()}/clients",
            headers=_headers(),
            json=client_row,
            timeout=15,
        )
        if resp.status_code in (200, 201):
            existing_subdomains.add(subdomain)
            print(f"    🌐 Demo site: {subdomain}")
        # 409 = subdomain conflict (fine, already exists)
    except Exception:
        pass  # Don't fail the lead sync if demo creation fails


def sync_leads(leads: list, dry_run: bool = False) -> dict:
    scraped = len(leads)
    inserted = 0
    skipped = 0
    failed = 0

    print(f"\n📡 Connecting to Supabase...")
    existing_phones = get_existing_phones()
    existing_subdomains = get_existing_subdomains()
    print(f"  Existing leads in DB: {len(existing_phones)} unique phones")
    print(f"\n📤 Syncing {scraped} leads...")

    for lead in leads:
        if hasattr(lead, "__dataclass_fields__"):
            data = asdict(lead)
        elif isinstance(lead, dict):
            data = lead
        else:
            continue

        phone = data.get("phone", "").strip()
        clinic_name = data.get("clinic_name", "Unknown")

        if phone and phone in existing_phones:
            print(f"  ⏭  {clinic_name[:40]} — duplicate phone ({phone})")
            skipped += 1
            continue

        if not phone:
            print(f"  ⏭  {clinic_name[:40]} — no phone number")
            skipped += 1
            continue

        row = {
            "clinic_name": data.get("clinic_name", ""),
            "doctor_name": data.get("doctor_name", "Doctor"),
            "phone": phone,
            "city": data.get("city", ""),
            "area": data.get("area") or "",
            "email": data.get("email") or None,
            "photos": data.get("photos") or [],
        }

        if dry_run:
            print(f"  [DRY RUN] Would insert: {row['clinic_name']} | {row['city']} | {phone}")
            inserted += 1
            existing_phones.add(phone)
            continue

        try:
            resp = requests.post(
                f"{_base()}/leads",
                headers=_headers(),
                json=row,
                timeout=15,
            )
            if resp.status_code in (200, 201):
                inserted += 1
                existing_phones.add(phone)
                # Auto-create demo client site
                _create_demo_client(data, existing_subdomains)
                print(f"  ✅ {clinic_name[:40]} | {row['city']} | {phone}")
            elif resp.status_code == 409:
                print(f"  ⏭  {clinic_name[:40]} — DB duplicate")
                skipped += 1
            else:
                print(f"  ❌ {clinic_name[:40]} — HTTP {resp.status_code}: {resp.text[:80]}")
                failed += 1
        except Exception as e:
            print(f"  ❌ {clinic_name[:40]} — {str(e)[:60]}")
            failed += 1

    return {"scraped": scraped, "inserted": inserted, "skipped": skipped, "failed": failed}


def print_summary(stats: dict, dry_run: bool = False) -> None:
    tag = " [DRY RUN]" if dry_run else ""
    print(f"\n{'═'*45}")
    print(f"  SYNC SUMMARY{tag}")
    print(f"{'─'*45}")
    print(f"  Scraped total:   {stats['scraped']}")
    print(f"  ✅ Inserted:     {stats['inserted']}")
    print(f"  ⏭  Skipped:      {stats['skipped']}  (duplicates / no phone)")
    print(f"  ❌ Failed:       {stats['failed']}")
    print(f"{'═'*45}\n")


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True, help="JSON file from scraper")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    with open(args.input) as f:
        leads = json.load(f)

    stats = sync_leads(leads, dry_run=args.dry_run)
    print_summary(stats, dry_run=args.dry_run)
