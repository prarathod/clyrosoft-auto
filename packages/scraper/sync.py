"""
Supabase sync — inserts scraped leads via REST API directly.
No supabase Python package needed — uses requests + Supabase REST API.
Skips duplicates by checking phone number before inserting.
"""

import json
import os
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


def sync_leads(leads: list, dry_run: bool = False) -> dict:
    scraped = len(leads)
    inserted = 0
    skipped = 0
    failed = 0

    print(f"\n📡 Connecting to Supabase...")
    existing_phones = get_existing_phones()
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
                print(f"  ✅ {clinic_name[:40]} | {row['city']} | {phone}")
                inserted += 1
                existing_phones.add(phone)
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
