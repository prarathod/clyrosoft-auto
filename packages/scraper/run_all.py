"""
run_all.py — Full city sweep.
Loops through every area + profession combo so no clinic is missed.

Usage:
    python run_all.py                        # Full Bangalore sweep (all 5 professions x 47 areas)
    python run_all.py --city Mysore          # All professions in Mysore
    python run_all.py --city Bangalore --profession "dental clinic"  # One profession, all Bangalore areas
    python run_all.py --dry-run              # Preview without saving
"""

import argparse
import time
from datetime import datetime
from typing import Optional

from config import get_all_queries, PROFESSIONS, BANGALORE_AREAS, OTHER_CITIES
from scraper import scrape_query
from sync import sync_leads, print_summary


def run_full_sweep(city: str, profession: Optional[str], max_per_query: int, dry_run: bool, headful: bool):
    if profession:
        if city.lower() == "bangalore":
            queries = [f"{profession} {area} Bangalore" for area in BANGALORE_AREAS]
        else:
            queries = [f"{profession} {city}"]
    else:
        queries = get_all_queries(city)

    total_queries = len(queries)
    print(f"""
{'='*60}
  CLINIQO FULL SWEEP  |  {datetime.now().strftime('%Y-%m-%d %H:%M')}
  City: {city}  |  Queries: {total_queries}
  Max per query: {max_per_query}  |  Mode: {'DRY RUN' if dry_run else 'LIVE'}
{'='*60}
""")

    all_leads = []
    failed_queries = []

    for i, query in enumerate(queries, 1):
        print(f"\n[{i}/{total_queries}] {query}")
        try:
            leads = scrape_query(query, max_results=max_per_query, headless=not headful)
            all_leads.extend(leads)
            kept = len(leads)
            print(f"  → Kept {kept} lead{'s' if kept != 1 else ''}")
            # Small pause between queries to avoid rate limiting
            if i < total_queries:
                time.sleep(2)
        except Exception as e:
            print(f"  ✗ Failed: {e}")
            failed_queries.append(query)

    print(f"\n{'─'*60}")
    print(f"Sweep complete: {len(all_leads)} total leads from {total_queries - len(failed_queries)}/{total_queries} queries")

    if failed_queries:
        print(f"\nFailed queries ({len(failed_queries)}):")
        for q in failed_queries:
            print(f"  • {q}")

    if not all_leads:
        print("No leads to sync.")
        return

    stats = sync_leads(all_leads, dry_run=dry_run)
    print_summary(stats, dry_run=dry_run)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Full city clinic sweep")
    parser.add_argument("--city", default="Bangalore", help="City to sweep (default: Bangalore)")
    parser.add_argument("--profession", default=None, help='One profession e.g. "dental clinic"')
    parser.add_argument("--max", type=int, default=20, help="Max results per query (default: 20)")
    parser.add_argument("--dry-run", action="store_true", help="Scrape but don't save to Supabase")
    parser.add_argument("--headful", action="store_true", help="Show browser window")
    args = parser.parse_args()

    run_full_sweep(
        city=args.city,
        profession=args.profession,
        max_per_query=args.max,
        dry_run=args.dry_run,
        headful=args.headful,
    )
