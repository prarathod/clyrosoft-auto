"""
Full pipeline: scrape all queries from config → sync to Supabase.

Usage:
    python run.py                    # Run all queries in config.py
    python run.py --dry-run          # Preview without saving to DB
    python run.py --query "dentist Mumbai"  # Run single query only
    python run.py --headful          # Watch browser (for debugging)
    python run.py --save leads.json  # Also save raw JSON output
"""

import argparse
import json
import sys
from dataclasses import asdict
from datetime import datetime

from scraper import scrape_query
from sync import sync_leads, print_summary
from config import SEARCH_QUERIES, MAX_RESULTS_PER_QUERY, HEADLESS


def run_pipeline(
    queries: list,
    max_results: int = MAX_RESULTS_PER_QUERY,
    headless: bool = True,
    dry_run: bool = False,
    save_path: str = None,
) -> None:
    start_time = datetime.now()
    all_leads = []

    print("=" * 55)
    print(f"  CLINIQO SCRAPER  |  {start_time.strftime('%Y-%m-%d %H:%M')}")
    print(f"  Queries: {len(queries)} | Max per query: {max_results}")
    print(f"  Mode: {'DRY RUN' if dry_run else 'LIVE'} | Browser: {'visible' if not headless else 'headless'}")
    print("=" * 55)

    # ─── Step 1: Scrape ───────────────────────────────────────────────────────
    for i, query in enumerate(queries, 1):
        print(f"\n[{i}/{len(queries)}] {query}")
        try:
            leads = scrape_query(query, max_results=max_results, headless=headless)
            all_leads.extend(leads)
        except KeyboardInterrupt:
            print("\n⚠️  Interrupted by user. Syncing what was collected...")
            break
        except Exception as e:
            print(f"  ❌ Query failed: {e}")
            continue

    # ─── Step 2: Save raw JSON (optional) ────────────────────────────────────
    if save_path and all_leads:
        with open(save_path, "w") as f:
            json.dump([asdict(l) for l in all_leads], f, indent=2)
        print(f"\n💾 Raw results saved → {save_path}")

    if not all_leads:
        print("\n⚠️  No leads collected. Check your queries or try --headful to debug.")
        sys.exit(0)

    # ─── Step 3: Sync to Supabase ─────────────────────────────────────────────
    print(f"\n{'─'*55}")
    print(f"Total collected: {len(all_leads)} leads across {len(queries)} queries")

    stats = sync_leads(all_leads, dry_run=dry_run)
    print_summary(stats, dry_run=dry_run)

    elapsed = (datetime.now() - start_time).seconds
    print(f"⏱  Completed in {elapsed // 60}m {elapsed % 60}s")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Cliniqo scraper + sync pipeline")
    parser.add_argument("--query", help="Run a single query instead of all from config")
    parser.add_argument("--max", type=int, default=MAX_RESULTS_PER_QUERY)
    parser.add_argument("--headful", action="store_true", help="Show browser")
    parser.add_argument("--dry-run", action="store_true", help="Scrape but don't save to DB")
    parser.add_argument("--save", metavar="FILE", help="Save raw JSON to file")
    args = parser.parse_args()

    queries = [args.query] if args.query else SEARCH_QUERIES

    run_pipeline(
        queries=queries,
        max_results=args.max,
        headless=not args.headful,
        dry_run=args.dry_run,
        save_path=args.save,
    )
