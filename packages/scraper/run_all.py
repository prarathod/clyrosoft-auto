"""
run_all.py — Full city sweep.
Loops through every area + profession combo so no clinic is missed.
Syncs to Supabase after EACH query for real-time visibility.

Usage:
    python run_all.py                           # Full Bangalore sweep (10 professions x 57 areas)
    python run_all.py --city Mysore             # All professions in Mysore (area-level)
    python run_all.py --city all-tier2          # Sweep ALL tier-2 cities
    python run_all.py --profession "dental clinic"   # One profession, all Bangalore areas
    python run_all.py --dry-run                 # Preview without saving
"""

import argparse
import time
from datetime import datetime
from typing import Optional

from config import get_all_queries, PROFESSIONS, BANGALORE_AREAS, TIER2_CITY_AREAS
from scraper import scrape_query
from sync import sync_leads, print_summary


def run_full_sweep(city: str, profession: Optional[str], max_per_query: int, dry_run: bool, headful: bool):
    if city.lower() == "all-tier2":
        queries = []
        for c, areas in TIER2_CITY_AREAS.items():
            for p in PROFESSIONS:
                for area in areas:
                    queries.append(f"{p} {area}")
    elif profession:
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

    total_inserted = 0
    total_skipped = 0
    failed_queries = []

    for i, query in enumerate(queries, 1):
        print(f"\n[{i}/{total_queries}] {query}")
        try:
            leads = scrape_query(query, max_results=max_per_query, headless=not headful)
            kept = len(leads)
            print(f"  → Found {kept} lead{'s' if kept != 1 else ''}")

            if leads:
                stats = sync_leads(leads, dry_run=dry_run)
                total_inserted += stats.get("inserted", 0)
                total_skipped += stats.get("skipped", 0)
                print(f"  ✓ +{stats.get('inserted', 0)} new  |  total so far: {total_inserted}")

            if i < total_queries:
                time.sleep(2)
        except Exception as e:
            print(f"  ✗ Failed: {e}")
            failed_queries.append(query)

    print(f"\n{'═'*60}")
    print(f"  SWEEP COMPLETE")
    print(f"{'─'*60}")
    print(f"  Queries run:   {total_queries - len(failed_queries)}/{total_queries}")
    print(f"  ✅ Inserted:   {total_inserted} new leads")
    print(f"  ⏭  Skipped:    {total_skipped} duplicates")
    if failed_queries:
        print(f"  ❌ Failed queries ({len(failed_queries)}):")
        for q in failed_queries:
            print(f"     • {q}")
    print(f"{'═'*60}\n")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Full city clinic sweep")
    parser.add_argument("--city", default="Bangalore",
                        help='City to sweep. Use "all-tier2" to sweep all tier-2 cities. (default: Bangalore)')
    parser.add_argument("--profession", default=None, help='One profession e.g. "dental clinic"')
    parser.add_argument("--max", type=int, default=30, help="Max results per query (default: 30)")
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
